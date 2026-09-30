import { CHAPTERS } from '../data/content';
import { Scan, Smile, Zap } from 'lucide-react';

const ICONS = [Scan, Smile, Zap];
const TAGS = ['Digital Technology', 'Patient Experience', 'In-House Lab'];

export default function ScrollChapters() {
  return (
    <section id="services" className="relative z-20 scroll-mt-24 border-t border-white/10 bg-canvas/95 px-4 sm:px-6 md:px-8 py-24 sm:py-32 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl">
        {/* SECTION HEADER */}
        <div className="mb-14 sm:mb-20 max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-accent/30 bg-accent/10 px-3 py-1 font-mono text-[9px] sm:text-[10px] tracking-widest uppercase text-accent mb-4">
            <span>Why Choose Us</span>
            <span>·</span>
            <span>Our Technology</span>
          </div>
          <h2 className="font-display text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase tracking-tight text-alabaster">
            Advanced Care,<br />Proven Results
          </h2>
          <p className="mt-3 text-sm sm:text-base leading-relaxed text-alabaster-muted">
            We combine the latest dental technology with genuine clinical expertise to deliver outstanding outcomes — comfortably, efficiently and transparently.
          </p>
        </div>

        {/* 3-COLUMN CARDS */}
        <div className="grid gap-6 sm:gap-8 md:grid-cols-3">
          {CHAPTERS.map((ch, idx) => {
            const Icon = ICONS[idx] || Scan;
            const tag = TAGS[idx] || 'Technology';
            return (
              <article
                key={ch.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-white/10 bg-gradient-to-b from-accent/[0.04] to-transparent p-7 sm:p-8 backdrop-blur-md transition-all duration-300 hover:-translate-y-1.5 hover:border-accent/40 hover:shadow-[0_16px_40px_rgba(56,139,253,0.12)]"
              >
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent">
                      <Icon size={18} />
                    </span>
                    <span className="font-mono text-xs font-semibold tracking-widest text-accent/70">
                      // {ch.id}
                    </span>
                  </div>

                  <span className="inline-block font-mono text-[9px] tracking-widest uppercase text-alabaster-muted mb-2">
                    {tag}
                  </span>

                  <h3 className="font-display text-2xl font-bold uppercase tracking-tight text-alabaster group-hover:text-accent transition-colors">
                    {ch.title}
                  </h3>

                  <p className="mt-3 text-sm leading-relaxed text-alabaster-muted">
                    {ch.body}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between font-mono text-[10px] text-alabaster-muted">
                  <span className="uppercase tracking-widest text-alabaster-muted">CQC Registered</span>
                  <span className="text-accent group-hover:translate-x-1 transition-transform">Learn more →</span>
                </div>
              </article>
            );
          })}
        </div>

        {/* TRUST STATS ROW */}
        <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-white/10 pt-14">
          {[
            { value: '16+', label: 'Years in Practice' },
            { value: '12,000+', label: 'Happy Patients' },
            { value: '4.9 ★', label: 'Google Rating' },
            { value: '98%', label: 'Would Recommend' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <div className="font-display text-3xl sm:text-4xl font-extrabold text-accent">{stat.value}</div>
              <div className="mt-1 font-mono text-[10px] uppercase tracking-widest text-alabaster-muted">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
