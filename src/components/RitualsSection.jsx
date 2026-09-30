import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { RITUALS } from '../data/content';
import { useScene } from '../context/SceneContext';
import { Clock, Tag, ArrowRight, CheckCircle } from 'lucide-react';

const TAG_COLORS = {
  Cosmetic: 'text-cyan border-cyan/30 bg-cyan/10',
  Restorative: 'text-accent border-accent/30 bg-accent/10',
  Implantology: 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10',
  Orthodontics: 'text-violet-400 border-violet-400/30 bg-violet-400/10',
  Preventative: 'text-teal-400 border-teal-400/30 bg-teal-400/10',
};

export default function RitualsSection() {
  const { openDrawer } = useScene();
  const [treatmentsList, setTreatmentsList] = useState(RITUALS);

  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('active', true)
        .order('sort_order', { ascending: true });

      if (!error && data && data.length > 0) {
        const mapped = data.map((s, idx) => ({
          id: String(idx + 1).padStart(2, '0'),
          dbId: s.id,
          title: s.name,
          subtitle: s.subtitle || '',
          duration: s.duration || '60 min',
          price: Number(s.price) || 0,
          index: s.description || `${s.tag || 'Clinical'} care`,
          tag: s.tag || 'Cosmetic',
        }));
        setTreatmentsList(mapped);
      }
    };

    fetchServices();
    const interval = setInterval(fetchServices, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section id="treatments" className="relative z-20 scroll-mt-24 border-t border-white/10 bg-[#070b18] px-4 sm:px-6 md:px-8 py-24 sm:py-32">
      <div className="mx-auto max-w-6xl">
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-[9px] sm:text-[10px] tracking-widest uppercase text-accent mb-3">
              <span>Treatments</span>
              <span>·</span>
              <span>Transparent Pricing</span>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-alabaster">
              Our Treatments
            </h2>
            <p className="mt-2 max-w-xl text-sm sm:text-base leading-relaxed text-alabaster-muted">
              Every treatment plan is tailored to your specific clinical needs and aesthetic goals. All prices include your consultation, treatment and one follow-up review.
            </p>
          </div>

          <div className="font-mono text-xs text-alabaster-muted">
            <span className="text-accent font-semibold">Finance available</span> from 0% APR
          </div>
        </div>

        {/* TREATMENTS LIST */}
        <div className="space-y-4">
          {treatmentsList.map((r) => (
            <div
              key={r.id}
              className="group relative flex flex-col lg:flex-row lg:items-center justify-between gap-6 rounded-2xl border border-white/10 bg-white/[0.02] p-6 sm:p-7 backdrop-blur-md transition-all duration-300 hover:border-accent/40 hover:bg-accent/[0.03] hover:shadow-[0_8px_30px_rgba(56,139,253,0.1)]"
            >
              {/* LEFT: NUMBER + TITLE */}
              <div className="flex items-start sm:items-center gap-4 sm:gap-6">
                <span className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/40 font-mono text-sm sm:text-base font-bold text-accent group-hover:border-accent/40 transition-colors">
                  {r.id}
                </span>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="font-display text-lg sm:text-xl md:text-2xl font-bold uppercase tracking-tight text-alabaster group-hover:text-accent transition-colors">
                      {r.title}
                    </h3>
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider ${TAG_COLORS[r.tag] || 'text-accent border-accent/30 bg-accent/10'}`}>
                      <Tag size={9} />
                      {r.tag}
                    </span>
                  </div>
                  <p className="font-mono text-[11px] text-accent/80 mb-2">{r.subtitle}</p>
                  <div className="flex flex-wrap items-center gap-3 sm:gap-4 font-mono text-[10px] sm:text-[11px] text-alabaster-muted">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-white/[0.04] px-2.5 py-1 text-alabaster-muted border border-white/5">
                      <Clock size={12} className="text-accent" />
                      {r.duration}
                    </span>
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-emerald-500/10 px-2.5 py-1 text-emerald-400 border border-emerald-500/20">
                      <CheckCircle size={12} />
                      {r.index}
                    </span>
                  </div>
                </div>
              </div>

              {/* RIGHT: PRICE + CTA */}
              <div className="flex items-center justify-between lg:justify-end gap-6 pt-4 lg:pt-0 border-t border-white/5 lg:border-t-0">
                <div className="text-left lg:text-right">
                  <span className="block font-mono text-[9px] uppercase tracking-wider text-alabaster-muted">
                    Starting from
                  </span>
                  <span className="font-mono text-xl sm:text-2xl font-bold text-alabaster group-hover:text-accent transition-colors">
                    £{r.price.toLocaleString()}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => openDrawer(r.id)}
                  className="inline-flex items-center gap-2 rounded-full border border-accent/60 bg-accent/15 px-5 py-2.5 font-mono text-[10px] font-semibold tracking-widest uppercase text-alabaster transition-all hover:bg-accent hover:text-white group-hover:border-accent"
                >
                  <span>Book Now</span>
                  <ArrowRight size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* FINANCE NOTE */}
        <div className="mt-8 rounded-2xl border border-accent/15 bg-accent/[0.03] p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <CheckCircle size={20} className="text-accent shrink-0 mt-0.5 sm:mt-0" />
          <p className="text-sm text-alabaster-muted leading-relaxed">
            <span className="text-alabaster font-semibold">0% Finance Available</span> — spread the cost of your treatment with our interest-free payment plans from 12 to 60 months. Subject to status. We also accept all major dental insurance plans.
          </p>
        </div>
      </div>
    </section>
  );
}
