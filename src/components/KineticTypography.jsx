import { useScene } from '../context/SceneContext';
import { phaseLabel } from '../utils/scrollKinetics';

export default function KineticTypography() {
  const { scrollProgress } = useScene();
  const phase = phaseLabel(scrollProgress);

  // Hero: 0.00 -> 0.20 fade out
  const heroOpacity = scrollProgress < 0.2 ? Math.max(0, 1 - scrollProgress / 0.18) : 0;

  // Chapter 1: 0.22 -> 0.44
  let craftOpacity = 0;
  if (scrollProgress >= 0.22 && scrollProgress < 0.3) {
    craftOpacity = (scrollProgress - 0.22) / 0.08;
  } else if (scrollProgress >= 0.3 && scrollProgress <= 0.4) {
    craftOpacity = 1;
  } else if (scrollProgress > 0.4 && scrollProgress <= 0.45) {
    craftOpacity = 1 - (scrollProgress - 0.4) / 0.05;
  }

  // Chapter 2: 0.47 -> 0.68
  let scanOpacity = 0;
  if (scrollProgress >= 0.47 && scrollProgress < 0.54) {
    scanOpacity = (scrollProgress - 0.47) / 0.07;
  } else if (scrollProgress >= 0.54 && scrollProgress <= 0.63) {
    scanOpacity = 1;
  } else if (scrollProgress > 0.63 && scrollProgress <= 0.69) {
    scanOpacity = 1 - (scrollProgress - 0.63) / 0.06;
  }

  // Chapter 3: 0.71 -> 0.94
  let ergoOpacity = 0;
  if (scrollProgress >= 0.71 && scrollProgress < 0.78) {
    ergoOpacity = (scrollProgress - 0.71) / 0.07;
  } else if (scrollProgress >= 0.78 && scrollProgress <= 0.88) {
    ergoOpacity = 1;
  } else if (scrollProgress > 0.88 && scrollProgress <= 0.95) {
    ergoOpacity = 1 - (scrollProgress - 0.88) / 0.07;
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[3] flex flex-col justify-between overflow-hidden px-4 py-20 sm:px-8 sm:py-24 md:px-12 pointer-events-none">
      {/* HERO HEADING */}
      {heroOpacity > 0.01 && (
        <div
          className="my-auto flex flex-col items-center justify-center text-center transition-opacity duration-300"
          style={{ opacity: heroOpacity }}
        >
          <h1 className="max-w-4xl font-display text-4xl font-extrabold uppercase tracking-tight text-alabaster sm:text-6xl md:text-7xl lg:text-8xl leading-[0.95]">
            <span className="block text-alabaster drop-shadow-[0_4px_24px_rgba(0,0,0,0.8)]">YOUR SMILE.</span>
            <span className="mt-1 block text-transparent bg-clip-text bg-gradient-to-r from-alabaster via-accent-light to-cyan">
              EXPERTLY CRAFTED.
            </span>
          </h1>
        </div>
      )}


      {/* CHAPTER 01: DIGITAL SMILE DESIGN */}
      {craftOpacity > 0.01 && (
        <div
          className="absolute left-4 top-24 sm:left-10 sm:top-28 max-w-sm sm:max-w-md transition-opacity duration-300"
          style={{ opacity: craftOpacity }}
        >
          <div className="rounded-2xl border border-accent/20 bg-black/60 p-5 sm:p-6 backdrop-blur-xl shadow-2xl">
            <span className="font-mono text-[9px] sm:text-[10px] font-medium tracking-widest uppercase text-accent">
              01 // DIGITAL DENTISTRY
            </span>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-alabaster">
              3D Smile Preview
            </h2>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-alabaster-muted">
              Our Digital Smile Design software maps your facial features and lets you approve your new smile before any treatment begins — fully customised to your face.
            </p>
            <div className="mt-3 flex items-center gap-3 pt-3 border-t border-white/10 font-mono text-[9px] text-alabaster-muted">
              <span className="text-accent">✦ iTero® Scanner</span>
              <span>·</span>
              <span>No Physical Impressions</span>
            </div>
          </div>
        </div>
      )}

      {/* CHAPTER 02: PAIN-FREE */}
      {scanOpacity > 0.01 && (
        <div
          className="absolute right-4 top-24 sm:right-10 sm:top-28 max-w-sm sm:max-w-md transition-opacity duration-300"
          style={{ opacity: scanOpacity }}
        >
          <div className="rounded-2xl border border-cyan/20 bg-black/60 p-5 sm:p-6 backdrop-blur-xl shadow-2xl text-left sm:text-right">
            <span className="font-mono text-[9px] sm:text-[10px] font-medium tracking-widest uppercase text-cyan">
              02 // PATIENT COMFORT
            </span>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-alabaster">
              Pain-Free Promise
            </h2>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-alabaster-muted">
              Computer-controlled WAND® anaesthesia and sedation dentistry options ensure a stress-free experience — even for nervous patients.
            </p>
            <div className="mt-3 flex items-center justify-start sm:justify-end gap-3 pt-3 border-t border-white/10 font-mono text-[9px] text-alabaster-muted">
              <span className="text-cyan">✦ WAND® Anaesthesia</span>
              <span>·</span>
              <span>Sedation Available</span>
            </div>
          </div>
        </div>
      )}

      {/* CHAPTER 03: SAME-DAY CROWNS */}
      {ergoOpacity > 0.01 && (
        <div
          className="absolute left-4 bottom-24 sm:left-10 sm:bottom-28 max-w-sm sm:max-w-md transition-opacity duration-300"
          style={{ opacity: ergoOpacity }}
        >
          <div className="rounded-2xl border border-white/10 bg-black/60 p-5 sm:p-6 backdrop-blur-xl shadow-2xl">
            <span className="font-mono text-[9px] sm:text-[10px] font-medium tracking-widest uppercase text-emerald-400">
              03 // CEREC TECHNOLOGY
            </span>
            <h2 className="mt-1 font-display text-2xl sm:text-3xl font-bold uppercase tracking-tight text-alabaster">
              Same-Day Crowns
            </h2>
            <p className="mt-2 text-xs sm:text-sm leading-relaxed text-alabaster-muted">
              Our in-house CEREC® milling unit designs and mills all-ceramic crowns, veneers and inlays in a single visit. No temporaries. No second appointment.
            </p>
            <div className="mt-3 flex items-center gap-3 pt-3 border-t border-white/10 font-mono text-[9px] text-alabaster-muted">
              <span className="text-emerald-400">✦ CEREC® AC Unit</span>
              <span>·</span>
              <span>All-Ceramic Restorations</span>
            </div>
          </div>
        </div>
      )}

      {/* BOTTOM HUD STATUS PILL */}
      {phase.hud && scrollProgress >= 0.2 && scrollProgress <= 0.96 && (
        <div className="pointer-events-auto absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2 rounded-full border border-white/10 bg-black/70 px-4 py-1.5 backdrop-blur-xl shadow-xl transition-all">
          <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
          <span className="font-mono text-[9px] sm:text-[10px] tracking-widest uppercase text-alabaster-muted">
            Phase — <span className="text-alabaster font-semibold">{phase.hud}</span>
          </span>
          <span className="hidden sm:inline font-mono text-[9px] text-alabaster-muted/60">· SCROLL FOR NEXT</span>
        </div>
      )}
    </div>
  );
}
