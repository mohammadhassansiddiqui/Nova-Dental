import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useScene } from '../context/SceneContext';

gsap.registerPlugin(ScrollTrigger);

export function useScrollTimeline() {
  const { setScrollProgress } = useScene();
  const triggerRef = useRef(null);

  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return undefined;

    const st = ScrollTrigger.create({
      trigger: el,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.45,
      onUpdate: (self) => {
        setScrollProgress(self.progress);
      },
    });

    return () => {
      st.kill();
    };
  }, [setScrollProgress]);

  return triggerRef;
}
