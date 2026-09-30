import { useRef, useMemo, useEffect, useCallback } from 'react';
import { useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useScene } from '../../context/SceneContext';

useGLTF.preload('/dental_chair.glb');

// Easing: smooth in-out cubic
function easeInOut(u) {
  return u < 0.5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2;
}

// Lerp a quaternion from identity towards target by ratio t
function lerpQuat(out, target, t) {
  const identity = new THREE.Quaternion(0, 0, 0, 1);
  out.slerpQuaternions(identity, target, t);
}

// Keyframe quaternions from the GLB data
const BACKREST_RECLINED = new THREE.Quaternion(-0.556, 0, 0, 0.831).normalize();
const HEADREST_RECLINED = new THREE.Quaternion(0.174, 0, 0, 0.985).normalize();
const DELIVERY_SWUNG = new THREE.Quaternion(0, 0.380, 0, 0.925).normalize();
const CUSPIDOR_SWUNG = new THREE.Quaternion(0, 0.296, 0, 0.955).normalize();
const IDENTITY_QUAT = new THREE.Quaternion(0, 0, 0, 1);

// Lift heights from GLB
const LIFT_REST = new THREE.Vector3(0, 0.450, -0.080);
const LIFT_RAISED = new THREE.Vector3(0, 0.720, -0.080);

export default function DentalChair() {
  const outerGroup = useRef();
  const modelRef = useRef();
  const nodesRef = useRef({});

  const { scene } = useGLTF('/dental_chair.glb');
  const { scrollProgress, mouseTilt, stationTween } = useScene();

  // Drag state — lives in refs so no re-renders
  const isDragging = useRef(false);
  const dragStart = useRef(0);
  const userRotY = useRef(0);   // cumulative user-drag Y rotation
  const idleRotY = useRef(0);   // continuous idle spin accumulator

  const stationRotRef = useRef(null);
  const stationBlend = useRef(0);

  // Smooth lerp targets (all in refs to avoid re-render churn)
  const curLift = useRef(new THREE.Vector3().copy(LIFT_REST));
  const curBackQ = useRef(new THREE.Quaternion());
  const curHeadQ = useRef(new THREE.Quaternion());
  const curDelQ = useRef(new THREE.Quaternion());
  const curCuspQ = useRef(new THREE.Quaternion());
  const curSeatX = useRef(0);

  const cloned = useMemo(() => {
    const c = scene.clone(true);
    c.traverse((child) => {
      if (child.isMesh) {
        child.castShadow = true;
        child.receiveShadow = true;
        if (child.material) {
          child.material = child.material.clone();
          child.material.envMapIntensity = 1.1;
        }
      }
    });

    // Remove surgical light entirely
    ['Operating_Light_Assembly', 'Lamp_Luminaire_Head', 'Surgical_Light_Head_Gimbal'].forEach(name => {
      const obj = c.getObjectByName(name);
      if (obj) {
        obj.traverse(ch => { if (ch.isMesh) ch.visible = false; });
        obj.visible = false;
        obj.removeFromParent?.();
      }
    });

    return c;
  }, [scene]);

  // Cache node refs once model is mounted
  useEffect(() => {
    if (!modelRef.current) return;
    const get = (name) => modelRef.current.getObjectByName(name);
    nodesRef.current = {
      lift: get('Cantilever_Lift_Assembly'),
      backrest: get('Backrest_Pivot_Assembly'),
      headrest: get('Headrest_Tilt_Joint'),
      delivery: get('Doctor_Delivery_Unit_Mount'),
      cuspidor: get('Cuspidor_Water_Unit'),
      seat: get('Patient_Seat_Assembly'),
    };
  }, [cloned]);

  // Station focus tween
  useEffect(() => {
    if (stationTween) {
      stationRotRef.current = stationTween.rotation;
      stationBlend.current = 1;
    }
  }, [stationTween]);

  // Bounding box for scale/centering
  const { scale, yOffset } = useMemo(() => {
    const box = new THREE.Box3().setFromObject(cloned);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const s = maxDim > 0 ? 2.4 / maxDim : 1;
    const center = new THREE.Vector3();
    box.getCenter(center);
    return { scale: s, yOffset: -center.y * s };
  }, [cloned]);

  // ─── Pointer drag handlers (attached to the canvas div from outside) ───────
  const onPointerDown = useCallback((e) => {
    isDragging.current = true;
    dragStart.current = e.clientX;
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!isDragging.current) return;
    const dx = e.clientX - dragStart.current;
    dragStart.current = e.clientX;
    userRotY.current += dx * 0.012; // ~12° per 100px drag
  }, []);

  const onPointerUp = useCallback(() => {
    isDragging.current = false;
  }, []);

  // Expose drag handlers via a custom data attribute so ChairScene can attach them
  useEffect(() => {
    // Store handlers on the window so ChairScene can pull them
    window.__chairDragHandlers = { onPointerDown, onPointerMove, onPointerUp };
    return () => { delete window.__chairDragHandlers; };
  }, [onPointerDown, onPointerMove, onPointerUp]);

  // ─── Main render loop ──────────────────────────────────────────────────────
  useFrame((_, delta) => {
    if (!outerGroup.current) return;

    // 1. Continuous idle spin (always runs, even when scrolling)
    idleRotY.current += delta * 0.4;

    // 2. Compute target Y rotation
    let targetY = idleRotY.current + userRotY.current;

    // Station snap blend
    if (stationRotRef.current != null && stationBlend.current > 0.01) {
      targetY = THREE.MathUtils.lerp(targetY, stationRotRef.current, stationBlend.current);
      stationBlend.current = THREE.MathUtils.lerp(stationBlend.current, 0, 0.025);
      if (stationBlend.current < 0.02) {
        stationRotRef.current = null;
        idleRotY.current = targetY - userRotY.current;
      }
    }

    // Smooth Y rotation with damping
    outerGroup.current.rotation.y = THREE.MathUtils.lerp(
      outerGroup.current.rotation.y, targetY, 0.1
    );

    // Mouse tilt parallax
    outerGroup.current.rotation.x = THREE.MathUtils.lerp(
      outerGroup.current.rotation.x, mouseTilt.y * 0.07, 0.06
    );
    outerGroup.current.rotation.z = THREE.MathUtils.lerp(
      outerGroup.current.rotation.z, -mouseTilt.x * 0.05, 0.06
    );

    // ── SCROLL-DRIVEN JOINT ANIMATION ─────────────────────────────────────
    // scrollProgress: 0 = top, 1 = bottom
    //
    //  0.00 → 0.50  :  chair ELEVATES + RECLINES  (lift rises, backrest folds, seat tilts)
    //  0.50 → 0.85  :  tool console SWINGS forward (delivery arm + cuspidor)
    //  scroll up    :  everything reverses smoothly

    const sp = scrollProgress;

    // Phase 1: Recline (0 → 0.50)
    const reclineRatio = Math.min(1, Math.max(0, sp / 0.50));
    const reclineEased = easeInOut(reclineRatio);

    // Phase 2: Tools swing (0.50 → 0.85)
    const toolsRatio = Math.min(1, Math.max(0, (sp - 0.50) / 0.35));
    const toolsEased = easeInOut(toolsRatio);

    // Target states
    const targetLift = new THREE.Vector3().lerpVectors(LIFT_REST, LIFT_RAISED, reclineEased);
    const targetBackQ = new THREE.Quaternion().slerpQuaternions(IDENTITY_QUAT, BACKREST_RECLINED, reclineEased);
    const targetHeadQ = new THREE.Quaternion().slerpQuaternions(IDENTITY_QUAT, HEADREST_RECLINED, reclineEased);
    const targetSeatX = -0.22 * reclineEased;  // seat tilts back 12.6° at full recline
    const targetDelQ = new THREE.Quaternion().slerpQuaternions(IDENTITY_QUAT, DELIVERY_SWUNG, toolsEased);
    const targetCuspQ = new THREE.Quaternion().slerpQuaternions(IDENTITY_QUAT, CUSPIDOR_SWUNG, toolsEased);

    // Apply smooth lerp to current values (LERP = 0.09 for snappy but not twitchy)
    const L = 0.09;
    curLift.current.lerp(targetLift, L);
    curBackQ.current.slerp(targetBackQ, L);
    curHeadQ.current.slerp(targetHeadQ, L);
    curSeatX.current = THREE.MathUtils.lerp(curSeatX.current, targetSeatX, L);
    curDelQ.current.slerp(targetDelQ, L);
    curCuspQ.current.slerp(targetCuspQ, L);

    // Write to nodes
    const n = nodesRef.current;
    if (n.lift) n.lift.position.copy(curLift.current);
    if (n.backrest) n.backrest.quaternion.copy(curBackQ.current);
    if (n.headrest) n.headrest.quaternion.copy(curHeadQ.current);
    if (n.seat) n.seat.rotation.x = curSeatX.current;
    if (n.delivery) n.delivery.quaternion.copy(curDelQ.current);
    if (n.cuspidor) n.cuspidor.quaternion.copy(curCuspQ.current);
  });

  return (
    <group ref={outerGroup} position={[0, -0.8 + yOffset * scale, 0]} scale={scale}>
      <primitive ref={modelRef} object={cloned} />
    </group>
  );
}
