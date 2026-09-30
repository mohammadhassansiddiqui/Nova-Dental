import { Suspense, useCallback, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { ContactShadows } from '@react-three/drei';
import DentalChair from './DentalChair';
import CameraRig from './CameraRig';
import AnimatedLights from './AnimatedLights';
import Loader from './Loader';

function SceneContents() {
  return (
    <>
      <color attach="background" args={['#0b0c0e']} />
      <fog attach="fog" args={['#0b0c0e', 8, 22]} />
      <AnimatedLights />
      <DentalChair />
      <ContactShadows
        position={[0, -1.05, 0]}
        opacity={0.5}
        scale={8}
        blur={2.4}
        far={4}
        color="#000000"
      />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.02, 0]} receiveShadow>
        <circleGeometry args={[2.2, 64]} />
        <shadowMaterial transparent opacity={0.25} />
      </mesh>
      <CameraRig />
    </>
  );
}

export default function ChairScene() {
  const wrapperRef = useRef();

  // Forward pointer events to the DentalChair drag handlers
  const getHandlers = () => window.__chairDragHandlers || {};

  const onPointerDown = useCallback((e) => {
    // Only react to direct clicks on the canvas (not UI elements)
    getHandlers().onPointerDown?.(e);
  }, []);

  const onPointerMove = useCallback((e) => {
    getHandlers().onPointerMove?.(e);
  }, []);

  const onPointerUp = useCallback(() => {
    getHandlers().onPointerUp?.();
  }, []);

  return (
    <div
      ref={wrapperRef}
      className="fixed inset-0 z-[2]"
      style={{ cursor: 'grab' }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
      aria-hidden
    >
      <Suspense fallback={<Loader />}>
        <Canvas
          shadows
          dpr={[1, 1.75]}
          gl={{ antialias: true, alpha: true }}
          camera={{ position: [0, 1.2, 4.5], fov: 42, near: 0.1, far: 100 }}
          style={{ pointerEvents: 'none' }}
        >
          <SceneContents />
        </Canvas>
      </Suspense>

      {/* Drag cursor hint label — shown briefly on first scroll enter */}
      <div className="pointer-events-none absolute bottom-16 right-6 hidden lg:flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3 py-1.5 backdrop-blur-md">
        <svg className="h-3 w-3 text-stone-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 2v12M2 8h12" />
        </svg>
        <span className="font-mono text-[9px] tracking-widest uppercase text-stone-400">Drag to Rotate</span>
      </div>
    </div>
  );
}
