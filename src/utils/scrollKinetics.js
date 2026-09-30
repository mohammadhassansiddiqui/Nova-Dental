const DEG = Math.PI / 180;

/** Scroll-driven chair Y rotation (radians) */
export function rotationFromProgress(t) {
  if (t <= 0.25) {
    const u = t / 0.25;
    return (45 + u * (120 - 45)) * DEG;
  }
  if (t <= 0.5) {
    const u = (t - 0.25) / 0.25;
    return (120 + u * (240 - 120)) * DEG;
  }
  if (t <= 0.75) {
    const u = (t - 0.5) / 0.25;
    return (240 + u * (360 - 240)) * DEG;
  }
  const u = (t - 0.75) / 0.25;
  return (360 + u * 45) * DEG;
}

export function cameraFromProgress(t) {
  const hero = { pos: [0, 1.2, 4.5], fov: 42 };
  const craft = { pos: [1.4, 1.35, 3.1], fov: 38 };
  const scan = { pos: [0, 2.4, 3.6], fov: 36 };
  const ergo = { pos: [0, 1.15, 4.35], fov: 42 };

  const lerp3 = (a, b, u) => [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];

  if (t <= 0.25) {
    const u = t / 0.25;
    return { position: lerp3(hero.pos, craft.pos, u * 0.35), fov: hero.fov + (craft.fov - hero.fov) * u * 0.35 };
  }
  if (t <= 0.5) {
    const u = (t - 0.25) / 0.25;
    const start = { position: lerp3(hero.pos, craft.pos, 0.35), fov: hero.fov + (craft.fov - hero.fov) * 0.35 };
    return { position: lerp3(start.position, craft.pos, u), fov: start.fov + (craft.fov - start.fov) * u };
  }
  if (t <= 0.75) {
    const u = (t - 0.5) / 0.25;
    return { position: lerp3(craft.pos, scan.pos, u), fov: craft.fov + (scan.fov - craft.fov) * u };
  }
  const u = (t - 0.75) / 0.25;
  return { position: lerp3(scan.pos, ergo.pos, u), fov: scan.fov + (ergo.fov - scan.fov) * u };
}

export function phaseLabel(t) {
  if (t < 0.25) return { back: 'PRECISION FORM.', front: 'TIMELESS CALM.', hud: null };
  if (t < 0.5) return { back: '01 — SWISS BIOMIMETIC CRAFT', front: null, hud: 'THE CRAFT' };
  if (t < 0.75) return { back: '02 — SUB-MILLIMETER SCANNING', front: null, hud: 'THE SCAN' };
  return { back: '03 — ZERO-GRAVITY CALM', front: null, hud: 'ERGONOMICS' };
}
