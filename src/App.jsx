import { useCallback, useEffect } from 'react';
import { SceneProvider, useScene } from './context/SceneContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Header';
import ChairScene from './components/scene/ChairScene';
import KineticTypography from './components/KineticTypography';
import ScrollChapters from './components/ScrollChapters';
import RitualsSection from './components/RitualsSection';
import StationsSection from './components/StationsSection';
import BookingDrawer from './components/BookingDrawer';
import AuthPage from './components/AuthPage';
import AdminPortal from './components/AdminPortal';
import { useScrollTimeline } from './hooks/useScrollTimeline';

function ScrollDriver() {
  const scrollRef = useScrollTimeline();
  return <div ref={scrollRef} className="pointer-events-auto h-[400vh] w-full touch-pan-y" aria-hidden />;
}

function AppShell() {
  const { setMouseTilt, openDrawer } = useScene();
  const { authModalOpen, closeAuthModal, adminPortalOpen, closeAdminPortal } = useAuth();

  const applyTilt = useCallback(
    (clientX, clientY) => {
      const nx = (clientX / window.innerWidth) * 2 - 1;
      const ny = (clientY / window.innerHeight) * 2 - 1;
      setMouseTilt({ x: nx, y: ny });
    },
    [setMouseTilt],
  );

  useEffect(() => {
    const onMove = (e) => applyTilt(e.clientX, e.clientY);
    const onTouch = (e) => {
      const t = e.touches[0];
      if (t) applyTilt(t.clientX, t.clientY);
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('touchmove', onTouch, { passive: true });
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('touchmove', onTouch);
    };
  }, [applyTilt]);

  return (
    <div className="relative min-h-screen bg-canvas text-alabaster selection:bg-accent/30 selection:text-alabaster font-sans">
      <Header />
      <ChairScene />
      <KineticTypography />

      {/* z-10 scroll layer sits above canvas (z-2) but ScrollDriver captures wheel/touch */}
      <main className="relative z-10 pointer-events-none">
        <ScrollDriver />
        <div className="relative z-20 pointer-events-auto bg-gradient-to-b from-transparent via-[#060a14]/90 to-[#060a14]">
          <ScrollChapters />
          <RitualsSection />
          <StationsSection />

          {/* FOOTER */}
          <footer className="border-t border-white/10 bg-[#04080f] px-6 py-20 sm:px-10 lg:px-16 text-alabaster-muted">
            <div className="mx-auto max-w-6xl">
              <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 pb-16 border-b border-white/10">
                {/* COL 1: BRAND */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-accent text-xs font-mono">
                      ✦
                    </span>
                    <span className="font-display text-lg font-bold tracking-widest uppercase text-alabaster">
                      NOVA DENTAL
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-alabaster-muted">
                    A modern, patient-centred dental practice offering comprehensive NHS and private dental care. From routine check-ups to full smile transformations.
                  </p>
                  <div className="font-mono text-[10px] text-alabaster-muted/60 tracking-wider">
                    MON – FRI: 08:30 – 18:30 · SAT: 09:00 – 14:00
                  </div>
                </div>

                {/* COL 2: LOCATION */}
                <div className="space-y-3 font-mono text-xs">
                  <h4 className="font-display text-sm font-bold uppercase tracking-wider text-alabaster">
                    Our Practice
                  </h4>
                  <p className="text-alabaster-muted">
                    14 Harley Street<br />
                    London, W1G 9PH<br />
                    United Kingdom
                  </p>
                  <p className="text-alabaster-muted/60 pt-1">
                    Nearest tube: Regent's Park<br />
                    Free patient parking available
                  </p>
                </div>

                {/* COL 3: CONTACT */}
                <div className="space-y-3 font-mono text-xs">
                  <h4 className="font-display text-sm font-bold uppercase tracking-wider text-alabaster">
                    Get In Touch
                  </h4>
                  <p className="text-alabaster-muted">
                    020 7946 0821<br />
                    hello@novadental.co.uk
                  </p>
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={openDrawer}
                      className="inline-flex items-center gap-2 rounded-full border border-accent/60 bg-accent/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-widest text-accent hover:bg-accent hover:text-white transition-all"
                    >
                      Book Appointment →
                    </button>
                  </div>
                </div>

                {/* COL 4: ACCREDITATIONS */}
                <div className="space-y-3 font-mono text-xs">
                  <h4 className="font-display text-sm font-bold uppercase tracking-wider text-alabaster">
                    Accreditations
                  </h4>
                  <ul className="space-y-1.5 text-alabaster-muted text-[11px]">
                    <li className="flex items-center gap-1.5">
                      <span className="text-accent">✓</span> GDC Registered Practice
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-accent">✓</span> CQC Regulated & Inspected
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-accent">✓</span> BDA Good Practice Member
                    </li>
                    <li className="flex items-center gap-1.5">
                      <span className="text-accent">✓</span> Invisalign® Diamond Provider
                    </li>
                  </ul>
                </div>
              </div>

              {/* BOTTOM STRIP */}
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4 font-mono text-[10px] text-alabaster-muted/50 tracking-wider">
                <p>© 2024 NOVA DENTAL LTD. ALL RIGHTS RESERVED. COMPANY NO. 08847621</p>
                <div className="flex items-center gap-4">
                  <span className="hover:text-alabaster-muted cursor-pointer">PRIVACY POLICY</span>
                  <span>·</span>
                  <span className="hover:text-alabaster-muted cursor-pointer">COMPLAINTS PROCEDURE</span>
                  <span>·</span>
                  <span className="hover:text-alabaster-muted cursor-pointer">TERMS</span>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </main>

      <BookingDrawer />
      {authModalOpen && <AuthPage onClose={closeAuthModal} />}
      {adminPortalOpen && <AdminPortal onClose={closeAdminPortal} />}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SceneProvider>
        <AppShell />
      </SceneProvider>
    </AuthProvider>
  );
}
