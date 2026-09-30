import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { STATIONS } from '../data/content';
import { useScene } from '../context/SceneContext';
import { Stethoscope, CheckCircle2, Award, Calendar } from 'lucide-react';

export default function StationsSection() {
  const { activeStation, focusStation, openDrawer } = useScene();
  const [doctorsList, setDoctorsList] = useState(STATIONS);

  useEffect(() => {
    const fetchDoctors = async () => {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        const mapped = data.map((d, idx) => ({
          id: idx + 1,
          dbId: d.id,
          name: d.name,
          role: d.role,
          years: d.years,
          specialty: d.specialty || 'General & Cosmetic Dentistry',
          rotation: STATIONS[idx % STATIONS.length]?.rotation ?? (idx * Math.PI) / 2,
          camera: STATIONS[idx % STATIONS.length]?.camera ?? [0.8, 1.3, 3.8],
        }));
        setDoctorsList(mapped);
      }
    };

    fetchDoctors();
    const interval = setInterval(fetchDoctors, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="team" className="relative z-20 scroll-mt-24 border-t border-white/10 bg-[#060a14] px-4 sm:px-6 md:px-8 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-[9px] sm:text-[10px] tracking-widest uppercase text-accent mb-3">
              <span>Our Clinical Team</span>
              <span>·</span>
              <span>Meet Your Dentist</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-alabaster">
              Expert Clinicians
            </h2>
            <p className="mt-2 max-w-xl text-sm sm:text-base leading-relaxed text-alabaster-muted">
              Our GDC-registered dental team brings together specialists in cosmetics, implantology, orthodontics and periodontics — each dedicated to your long-term oral health.
            </p>
          </div>

          <div className="font-mono text-[11px] text-alabaster-muted flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>GDC REGISTERED · ALL SPECIALTIES</span>
          </div>
        </div>

        {/* TEAM GRID */}
        <div className="grid gap-5 sm:grid-cols-2">
          {doctorsList.map((st) => {
            const active = activeStation === st.id;
            const initials = st.name
              .split(' ')
              .map((n) => n[0])
              .join('')
              .slice(-2);

            return (
              <div
                key={st.id}
                onClick={() => focusStation(st)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && focusStation(st)}
                className={`group relative flex flex-col justify-between rounded-3xl border p-6 sm:p-7 text-left transition-all duration-300 cursor-pointer ${
                  active
                    ? 'border-accent bg-accent/10 shadow-[0_0_40px_rgba(56,139,253,0.18)] ring-1 ring-accent/40'
                    : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase text-alabaster-muted">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      CLINICIAN 0{st.id}
                    </span>
                    {active ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/40 bg-accent/20 px-2.5 py-0.5 font-mono text-[9px] font-semibold uppercase text-accent">
                        <CheckCircle2 size={11} /> 3D View Active
                      </span>
                    ) : (
                      <span className="font-mono text-[9px] uppercase tracking-wider text-alabaster-muted group-hover:text-accent transition-colors">
                        Click to View
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-accent/10 font-mono text-sm font-bold text-accent group-hover:border-accent/40 transition-colors">
                      {initials}
                    </div>
                    <div>
                      <h3 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-alabaster group-hover:text-accent transition-colors">
                        {st.name}
                      </h3>
                      <p className="font-mono text-xs text-accent mt-0.5">{st.role}</p>
                    </div>
                  </div>

                  {/* Specialty tags */}
                  <div className="flex flex-wrap gap-2 mb-4">
                    {st.specialty.split(' · ').map((s) => (
                      <span key={s} className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-alabaster-muted">
                        {s}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-4 pt-3 border-t border-white/10 text-xs text-alabaster-muted">
                    <span className="inline-flex items-center gap-1.5">
                      <Award size={13} className="text-accent" />
                      Experience: <strong className="text-alabaster">{st.years}</strong>
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Stethoscope size={13} className="text-alabaster-muted" />
                      GDC Registered
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex items-center justify-between pt-4 border-t border-white/5 font-mono text-[10px]">
                  <span className="text-alabaster-muted group-hover:text-alabaster-muted/80 transition-colors">
                    {active ? 'Chair view active' : 'Click for 3D chair view'}
                  </span>
                  <span className={`inline-flex items-center gap-1 font-semibold uppercase tracking-wider ${active ? 'text-accent' : 'text-alabaster-muted group-hover:text-accent'} transition-colors`}>
                    {active ? '✓ Focused' : 'Rotate View →'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* BOTTOM ACTION */}
        <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            type="button"
            onClick={openDrawer}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-full border border-accent bg-accent px-8 py-3.5 font-mono text-[11px] font-bold tracking-widest uppercase text-white shadow-[0_0_25px_rgba(56,139,253,0.35)] transition-all hover:bg-accent/90 hover:scale-105 active:scale-95"
          >
            <Calendar size={14} />
            <span>Book Your Consultation</span>
          </button>
          <span className="font-mono text-[10px] text-alabaster-muted">Free 30-min new patient consultation</span>
        </div>
      </div>
    </section>
  );
}
