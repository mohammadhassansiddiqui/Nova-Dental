import { useScene } from '../context/SceneContext';
import { useAuth } from '../context/AuthContext';
import { User, LogIn, LogOut, ShieldCheck } from 'lucide-react';

const LINKS = [
  { href: '#services', label: '01 Services' },
  { href: '#treatments', label: '02 Treatments' },
  { href: '#team', label: '03 Our Team' },
];

export default function Header() {
  const { openDrawer } = useScene();
  const { user, profile, isAdmin, signOut, openAuthModal, openAdminPortal } = useAuth();

  return (
    <header className="fixed top-3 sm:top-5 left-0 right-0 z-50 flex justify-center px-3 sm:px-6 pointer-events-none">
      <div className="pointer-events-auto flex w-full max-w-5xl items-center justify-between gap-3 rounded-full border border-accent/20 bg-[#060a14]/85 px-4 py-2 sm:px-6 sm:py-2.5 backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.6)] transition-all">
        {/* BRAND LOGO */}
        <a href="#" className="flex items-center gap-2.5 group">
          <span className="flex h-7 w-7 items-center justify-center rounded-full border border-accent/40 bg-accent/10 text-accent text-xs font-mono group-hover:scale-105 transition-transform">
            ✦
          </span>
          <div className="flex flex-col">
            <span className="font-mono text-[10px] sm:text-xs font-semibold tracking-widest uppercase text-alabaster">
              NOVA DENTAL
            </span>
            <span className="hidden font-mono text-[8px] sm:text-[9px] tracking-wider uppercase text-alabaster-muted sm:block">
              ADVANCED DENTAL CARE
            </span>
          </div>
        </a>

        {/* NAVIGATION LINKS (DESKTOP) */}
        <nav className="hidden items-center gap-6 font-mono text-[10px] tracking-widest uppercase text-alabaster-muted md:flex">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="transition-colors hover:text-accent flex items-center gap-1.5"
            >
              <span className="h-1 w-1 rounded-full bg-accent/50 opacity-60" />
              {link.label}
            </a>
          ))}
        </nav>

        {/* ACTIONS */}
        <div className="flex items-center gap-2.5">
          <span className="hidden items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 font-mono text-[9px] tracking-wider uppercase text-emerald-400 lg:inline-flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_#34D399]" />
            ACCEPTING PATIENTS
          </span>

          {user ? (
            <div className="flex items-center gap-1.5">
              {isAdmin && (
                <button
                  type="button"
                  onClick={openAdminPortal}
                  className="inline-flex items-center gap-1.5 rounded-full border border-amber-500/40 bg-gradient-to-r from-amber-500/20 to-amber-500/10 px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-wider text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:border-amber-400 hover:from-amber-500/30 transition-all"
                >
                  <ShieldCheck size={12} className="text-amber-400" />
                  <span>Portal</span>
                </button>
              )}
              <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 font-mono text-[10px] text-alabaster">
                <User size={12} className="text-accent" />
                <span className="max-w-[100px] truncate">{profile?.full_name || user.email?.split('@')[0]}</span>
              </span>
              <button
                type="button"
                onClick={signOut}
                title="Sign Out"
                className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-alabaster-muted hover:border-red-500/30 hover:bg-red-500/10 hover:text-red-400 transition-all"
              >
                <LogOut size={13} />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={openAuthModal}
              className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 font-mono text-[10px] font-medium uppercase tracking-wider text-alabaster-muted hover:border-white/20 hover:text-alabaster transition-all"
            >
              <LogIn size={12} className="text-accent" />
              <span>Sign In</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => openDrawer()}
            className="group relative inline-flex items-center gap-2 rounded-full border border-accent/60 bg-gradient-to-r from-accent/20 to-accent/10 px-4 py-1.5 sm:px-5 sm:py-2 font-mono text-[10px] sm:text-[11px] font-medium tracking-widest uppercase text-alabaster transition-all hover:border-accent hover:from-accent/30 hover:to-accent/20 hover:shadow-[0_0_20px_rgba(56,139,253,0.3)] active:scale-95"
          >
            <span>Book Appointment</span>
            <span className="text-accent transition-transform group-hover:translate-x-0.5">→</span>
          </button>
        </div>
      </div>
    </header>
  );
}
