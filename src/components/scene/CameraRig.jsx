import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { useScene } from '../../context/SceneContext';
import { cameraFromProgress } from '../../utils/scrollKinetics';

export default function CameraRig() {
  const { camera, size } = useThree();
  const { scrollProgress, stationTween } = useScene();
  const target = useRef(new THREE.Vector3(0, 1.2, 4.5));
  const fovTarget = useRef(42);
  const stationPos = useRef(null);
  const stationBlend = useRef(0);

  useEffect(() => {
    if (stationTween?.camera) {
      stationPos.current = new THREE.Vector3(...stationTween.camera);
      stationBlend.current = 1;
    }
  }, [stationTween]);

  useFrame(() => {
    const { position, fov } = cameraFromProgress(scrollProgress);
    const isMobile = size.width < 768;
    const aspect = size.width / Math.max(1, size.height);

    let px = position[0];
    let py = position[1];
    let pz = position[2];
    let f = fov;

    // Mobile portrait compensation: back up camera slightly so chair fits gracefully
    if (aspect < 1) {
      pz = pz * 1.28;
      py = py + 0.15;
    } else if (isMobile) {
      pz = pz * 1.15;
    }

    if (stationPos.current && stationBlend.current > 0.01) {
      px = THREE.MathUtils.lerp(px, stationPos.current.x, stationBlend.current);
      py = THREE.MathUtils.lerp(py, stationPos.current.y, stationBlend.current);
      pz = THREE.MathUtils.lerp(pz, stationPos.current.z, stationBlend.current);
      stationBlend.current = THREE.MathUtils.lerp(stationBlend.current, 0, 0.025);
      if (stationBlend.current < 0.02) stationPos.current = null;
    }

    target.current.lerp(new THREE.Vector3(px, py, pz), 0.08);
    camera.position.copy(target.current);
    camera.lookAt(0, 0.2, 0);

    fovTarget.current = THREE.MathUtils.lerp(fovTarget.current, f, 0.08);
    if (camera.isPerspectiveCamera) {
      camera.fov = fovTarget.current;
      camera.updateProjectionMatrix();
    }
  });

  return null;
}
