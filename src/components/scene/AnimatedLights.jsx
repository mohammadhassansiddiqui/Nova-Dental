import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScene } from '../../context/SceneContext';

export default function AnimatedLights() {
  const keyRef = useRef();
  const rimRef = useRef();
  const scanRef = useRef();
  const { scrollProgress } = useScene();

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const scanPhase = THREE.MathUtils.smoothstep(scrollProgress, 0.45, 0.75);

    if (keyRef.current) {
      const orbit = t * 0.55;
      const r = 6 + Math.sin(t * 0.3) * 0.8;
      keyRef.current.position.set(
        Math.cos(orbit) * r,
        7.5 + Math.sin(t * 0.4) * 0.6,
        Math.sin(orbit) * r + 2,
      );
      keyRef.current.intensity = 2.2 + Math.sin(t * 0.8) * 0.25;
    }

    if (rimRef.current) {
      rimRef.current.position.set(
        -5 + Math.sin(t * 0.35) * 1.2,
        4 + Math.cos(t * 0.25) * 0.5,
        -4 + scanPhase * 2.5,
      );
      rimRef.current.intensity = 2.5 + scanPhase * 0.8;
    }

    if (scanRef.current) {
      scanRef.current.position.set(
        Math.sin(t * 0.5) * 1.5,
        5.5 - scanPhase * 0.5,
        2 + scanPhase * 3.5,
      );
      scanRef.current.intensity = 0.6 + scanPhase * 1.4;
    }
  });

  return (
    <>
      <ambientLight color="#EDE6D6" intensity={1.0} />
      <directionalLight
        ref={keyRef}
        color="#FFF8E7"
        intensity={2.2}
        position={[5, 8, 5]}
        castShadow
        shadow-mapSize={[1024, 1024]}
      />
      <directionalLight ref={rimRef} color="#C2A87E" intensity={2.5} position={[-5, 4, -4]} />
      <directionalLight ref={scanRef} color="#FFF8E7" intensity={0.8} position={[0, 6, 3]} />
    </>
  );
}
