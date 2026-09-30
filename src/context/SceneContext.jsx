import { createContext, useContext, useMemo, useState, useCallback } from 'react';

const SceneContext = createContext(null);

export function SceneProvider({ children }) {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [mouseTilt, setMouseTilt] = useState({ x: 0, y: 0 });
  const [activeStation, setActiveStation] = useState(null);
  const [stationTween, setStationTween] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedRitualId, setSelectedRitualId] = useState(null);

  const openDrawer = useCallback((ritualId = null) => {
    setSelectedRitualId(ritualId);
    setDrawerOpen(true);
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const focusStation = useCallback((station) => {
    setActiveStation(station.id);
    setStationTween({
      rotation: station.rotation,
      camera: station.camera,
      at: performance.now(),
    });
  }, []);

  const value = useMemo(
    () => ({
      scrollProgress,
      setScrollProgress,
      mouseTilt,
      setMouseTilt,
      activeStation,
      focusStation,
      stationTween,
      drawerOpen,
      selectedRitualId,
      setSelectedRitualId,
      openDrawer,
      closeDrawer,
    }),
    [
      scrollProgress,
      mouseTilt,
      activeStation,
      focusStation,
      stationTween,
      drawerOpen,
      selectedRitualId,
      openDrawer,
      closeDrawer,
    ],
  );

  return <SceneContext.Provider value={value}>{children}</SceneContext.Provider>;
}

export function useScene() {
  const ctx = useContext(SceneContext);
  if (!ctx) throw new Error('useScene must be used within SceneProvider');
  return ctx;
}
