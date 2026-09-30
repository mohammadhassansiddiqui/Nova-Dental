import { useMemo, useState, useEffect } from 'react';
import { X, Check, Download, Calendar, Clock, User, Mail, Shield, CheckCircle2, Loader2, Database } from 'lucide-react';
import { useScene } from '../context/SceneContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { RITUALS, STATIONS, TIME_SLOTS, buildDayCarousel } from '../data/content';

function buildIcs({ ritual, station, date, time, refId, email }) {
  const [h, m] = time.split(':').map(Number);
  const start = new Date(`${date}T${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:00`);
  const end = new Date(start.getTime() + 60 * 60 * 1000);
  const fmt = (d) =>
    d
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//NOVA Dental//EN',
    'BEGIN:VEVENT',
    `UID:${refId}@novadental.co.uk`,
    `DTSTAMP:${fmt(new Date())}`,
    `DTSTART:${fmt(start)}`,
    `DTEND:${fmt(end)}`,
    `SUMMARY:Nova Dental — ${ritual.title}`,
    `DESCRIPTION:Clinician: ${station.name}. Ref: ${refId}`,
    `ORGANIZER:mailto:hello@novadental.co.uk`,
    email ? `ATTENDEE:mailto:${email}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');
}

export default function BookingDrawer() {
  const { drawerOpen, closeDrawer, selectedRitualId } = useScene();
  const { user, profile } = useAuth();
  const days = useMemo(() => buildDayCarousel(), []);

  const [activeServices, setActiveServices] = useState(RITUALS);
  const [activeDoctors, setActiveDoctors] = useState(STATIONS);

  const [ritualId, setRitualId] = useState(RITUALS[0].id);
  const [stationId, setStationId] = useState(STATIONS[0].id);
  const [dateKey, setDateKey] = useState(days[0]?.key ?? '');
  const [time, setTime] = useState(TIME_SLOTS[0]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [nda, setNda] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [refId, setRefId] = useState('');
  const [dbNotice, setDbNotice] = useState('');

  // Fetch active services and doctors from Supabase
  useEffect(() => {
    supabase
      .from('services')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          const mapped = data.map((s, idx) => ({
            id: String(idx + 1).padStart(2, '0'),
            title: s.name,
            subtitle: s.subtitle || '',
            duration: s.duration || '60 min',
            price: Number(s.price) || 0,
            index: s.description || `${s.tag || 'Clinical'} care`,
            tag: s.tag || 'Cosmetic',
          }));
          setActiveServices(mapped);
        }
      });

    supabase
      .from('doctors')
      .select('*')
      .eq('active', true)
      .order('sort_order', { ascending: true })
      .then(({ data }) => {
        if (data && data.length > 0) {
          const mapped = data.map((d, idx) => ({
            id: idx + 1,
            name: d.name,
            role: d.role,
            years: d.years,
            specialty: d.specialty,
            rotation: STATIONS[idx % STATIONS.length]?.rotation ?? 0,
            camera: STATIONS[idx % STATIONS.length]?.camera ?? [0, 1.2, 4.2],
          }));
          setActiveDoctors(mapped);
        }
      });
  }, [drawerOpen]);

  // Sync selected ritual whenever drawer opens or selectedRitualId changes
  useEffect(() => {
    if (drawerOpen) {
      if (selectedRitualId) {
        setRitualId(selectedRitualId);
      } else {
        setRitualId(activeServices[0]?.id || RITUALS[0].id);
      }
    }
  }, [drawerOpen, selectedRitualId, activeServices]);

  // Autofill name and email if authenticated
  useEffect(() => {
    if (user?.email && !email) {
      setEmail(user.email);
    }
    if (profile?.full_name && !name) {
      setName(profile.full_name);
    }
  }, [user, profile]);

  const ritual = activeServices.find((r) => r.id === ritualId) ?? activeServices[0] ?? RITUALS[0];
  const station = activeDoctors.find((s) => s.id === stationId) ?? activeDoctors[0] ?? STATIONS[0];

  if (!drawerOpen) return null;

  const handleConfirm = async () => {
    if (!name.trim() || !email.trim() || submitting) return;
    setSubmitting(true);
    const id = `NOVA-${Date.now().toString(36).toUpperCase().slice(-8)}`;
    setRefId(id);

    try {
      const { error } = await supabase.from('appointments').insert({
        ref_id: id,
        patient_name: name.trim(),
        patient_email: email.trim(),
        service_name: ritual.title,
        doctor_name: station.name,
        date: dateKey,
        time: time,
        status: 'confirmed',
        patient_id: user?.id || null,
      });

      if (error) {
        console.warn('Supabase appointment insert note:', error.message);
        if (error.code === 'PGRST205' || error.message?.includes('schema cache')) {
          setDbNotice('Database note: "appointments" table not created yet in Supabase. Run schema.sql in Supabase SQL Editor to save permanently.');
        } else {
          setDbNotice(`Database status: ${error.message}`);
        }
      } else {
        setDbNotice('Synced successfully to Supabase database!');
      }
    } catch (err) {
      console.warn('Network error saving to Supabase:', err);
    } finally {
      setSubmitting(false);
      setConfirmed(true);
    }
  };

  const handleClose = () => {
    closeDrawer();
    setTimeout(() => {
      setConfirmed(false);
      setRefId('');
      setDbNotice('');
    }, 400);
  };

  const downloadIcs = () => {
    const blob = new Blob([buildIcs({ ritual, station, date: dateKey, time, refId, email })], {
      type: 'text/calendar;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${refId}.ics`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-[100] flex flex-col justify-end">
      {/* BACKDROP */}
      <button
        type="button"
        aria-label="Close booking"
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity"
        onClick={handleClose}
      />

      {/* DRAWER CONTAINER */}
      <div className="drawer-enter relative flex max-h-[90vh] flex-col rounded-t-[32px] border-t border-x border-white/10 bg-[#0d0e12] shadow-[0_-20px_60px_rgba(0,0,0,0.8)]">
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-5 sm:px-8">
          <div>
            <div className="inline-flex items-center gap-2 font-mono text-[10px] tracking-widest uppercase text-champagne">
              <span className="h-1.5 w-1.5 rounded-full bg-champagne" />
              Private Reservation Atelier
            </div>
            <h2 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-tight text-alabaster">
              Schedule Your Clinical Visit
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-stone-300 transition-colors hover:border-white/20 hover:text-alabaster"
          >
            <X size={18} />
          </button>
        </div>

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto px-6 py-6 sm:px-8 pb-32">
          {confirmed ? (
            <div className="flex flex-col items-center py-12 text-center max-w-md mx-auto">
              <div className="check-pop flex h-20 w-20 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/10 shadow-[0_0_30px_rgba(52,211,153,0.25)]">
                <Check className="text-emerald-400" size={38} />
              </div>
              <p className="mt-6 font-mono text-[11px] tracking-widest uppercase text-emerald-400 font-semibold">
                Reservation Confirmed
              </p>
              <h3 className="mt-2 font-display text-3xl font-extrabold uppercase text-alabaster">
                Pass {refId}
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-stone-300">
                A private clinical consultation for <strong className="text-alabaster">{ritual.title}</strong> has been secured with <strong className="text-alabaster">{station.name}</strong> on <strong className="text-champagne">{dateKey}</strong> at <strong className="text-champagne">{time}</strong>.
              </p>

              {nda && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-champagne/30 bg-champagne/10 px-3 py-1 font-mono text-[10px] text-champagne">
                  <Shield size={12} /> Discretion & NDA Protocol Enabled
                </div>
              )}

              {dbNotice && (
                <div className="mt-4 inline-flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-3 py-1.5 font-mono text-[10px] text-accent">
                  <Database size={12} />
                  <span>{dbNotice}</span>
                </div>
              )}

              <button
                type="button"
                onClick={downloadIcs}
                className="mt-8 inline-flex items-center gap-2.5 rounded-full border border-clay bg-clay px-7 py-3.5 font-mono text-[11px] font-bold tracking-widest uppercase text-canvas shadow-[0_0_20px_rgba(217,123,85,0.3)] transition hover:bg-clay/90 hover:scale-105"
              >
                <Download size={15} />
                Export to Calendar (.ics)
              </button>
            </div>
          ) : (
            <div className="mx-auto max-w-xl space-y-9">
              {/* STEP 01: RITUAL */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-mono text-[11px] font-semibold tracking-widest uppercase text-stone-300">
                    Step 01 // Select Protocol
                  </span>
                  <span className="font-mono text-[10px] text-champagne">{ritual.duration}</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeServices.map((r) => {
                    const selected = ritualId === r.id;
                    return (
                      <button
                        key={r.id}
                        type="button"
                        onClick={() => setRitualId(r.id)}
                        className={`flex flex-col justify-between rounded-2xl border p-3.5 text-left transition-all ${selected
                          ? 'border-clay bg-clay/15 shadow-[0_0_20px_rgba(217,123,85,0.15)] ring-1 ring-clay/40'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/20 hover:bg-white/[0.04]'
                          }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-semibold text-stone-400">
                            // 0{r.id}
                          </span>
                          <span className="font-mono text-xs font-bold text-alabaster">£{r.price}</span>
                        </div>
                        <h4 className="mt-2 font-display text-sm font-bold uppercase tracking-tight text-alabaster">
                          {r.title}
                        </h4>
                        <span className="mt-1 font-mono text-[9px] text-stone-400">
                          {r.duration} · {r.index}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 02: CLINICIAN */}
              <div>
                <span className="block mb-3 font-mono text-[11px] font-semibold tracking-widest uppercase text-stone-300">
                  Step 02 // Lead Clinician & Operatory
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {activeDoctors.map((s) => {
                    const selected = stationId === s.id;
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => setStationId(s.id)}
                        className={`flex items-center gap-3 rounded-2xl border p-3.5 text-left transition-all ${selected
                          ? 'border-champagne bg-champagne/15 shadow-[0_0_20px_rgba(212,175,55,0.15)] ring-1 ring-champagne/40'
                          : 'border-white/10 bg-white/[0.02] hover:border-white/20'
                          }`}
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-black/40 font-mono text-xs font-bold text-alabaster">
                          0{s.id}
                        </div>
                        <div className="min-w-0">
                          <p className="font-display text-sm font-bold uppercase text-alabaster truncate">
                            {s.name}
                          </p>
                          <p className="font-mono text-[10px] text-stone-400 truncate">{s.role}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 03: DATE */}
              <div>
                <span className="mb-3 flex items-center gap-2 font-mono text-[11px] font-semibold tracking-widest uppercase text-stone-300">
                  <Calendar size={13} className="text-champagne" /> Step 03 // Calendar Date
                </span>
                <div className="flex gap-2.5 overflow-x-auto pb-3 pt-1 scrollbar-thin">
                  {days.map((d) => {
                    const selected = dateKey === d.key;
                    return (
                      <button
                        key={d.key}
                        type="button"
                        onClick={() => setDateKey(d.key)}
                        className={`flex min-w-[4.8rem] flex-col items-center rounded-2xl border px-3 py-3 transition-all ${selected
                          ? 'border-clay bg-clay/20 shadow-[0_0_15px_rgba(217,123,85,0.2)] ring-1 ring-clay/40'
                          : 'border-white/10 bg-white/[0.02] text-stone-400 hover:border-white/20 hover:text-alabaster'
                          }`}
                      >
                        <span className="font-mono text-[9px] tracking-wider uppercase font-semibold">
                          {d.weekday}
                        </span>
                        <span className="my-0.5 text-xl font-extrabold text-alabaster">{d.day}</span>
                        <span className="font-mono text-[9px] uppercase text-stone-400">{d.month}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 04: TIME */}
              <div>
                <span className="mb-3 flex items-center gap-2 font-mono text-[11px] font-semibold tracking-widest uppercase text-stone-300">
                  <Clock size={13} className="text-clay" /> Step 04 // Time Slot
                </span>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const selected = time === slot;
                    return (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setTime(slot)}
                        className={`rounded-xl border py-2.5 font-mono text-xs font-semibold transition-all ${selected
                          ? 'border-clay bg-clay text-canvas shadow-[0_0_15px_rgba(217,123,85,0.3)]'
                          : 'border-white/10 bg-white/[0.02] text-stone-300 hover:border-white/20 hover:text-alabaster'
                          }`}
                      >
                        {slot}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* STEP 05: GUEST DETAILS */}
              <div>
                <span className="mb-3 block font-mono text-[11px] font-semibold tracking-widest uppercase text-stone-300">
                  Step 05 // Guest Credentials
                </span>
                <div className="space-y-3">
                  <div className="relative">
                    <User size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      placeholder="Full legal or preferred name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-black/50 pl-11 pr-4 py-3.5 text-sm text-alabaster placeholder:text-stone-500 focus:border-clay focus:outline-none focus:ring-1 focus:ring-clay/40 transition-all"
                    />
                  </div>

                  <div className="relative">
                    <Mail size={15} className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="email"
                      placeholder="Concierge confirmation email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full rounded-2xl border border-white/10 bg-black/50 pl-11 pr-4 py-3.5 text-sm text-alabaster placeholder:text-stone-500 focus:border-clay focus:outline-none focus:ring-1 focus:ring-clay/40 transition-all"
                    />
                  </div>

                  <label className="flex cursor-pointer items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.02] px-4 py-3 hover:border-white/20 transition-all">
                    <input
                      type="checkbox"
                      checked={nda}
                      onChange={(e) => setNda(e.target.checked)}
                      className="h-4 w-4 rounded accent-clay cursor-pointer"
                    />
                    <div className="text-xs">
                      <span className="font-semibold text-alabaster block">Swiss Discretion & Private NDA Protocol</span>
                      <span className="text-stone-400">Strict patient anonymity and encrypted records</span>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* BOTTOM FIXED CTA BAR */}
        {!confirmed && (
          <div className="sticky bottom-0 border-t border-white/10 bg-[#0d0e12]/95 px-6 py-4 sm:px-8 backdrop-blur-2xl">
            <div className="mx-auto flex max-w-xl flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="font-display text-sm font-bold text-alabaster block uppercase">
                  {ritual.title}
                </span>
                <span className="font-mono text-xs text-stone-400">
                  {dateKey} · {time} · <strong className="text-champagne font-bold">${ritual.price}</strong>
                </span>
              </div>

              <button
                type="button"
                onClick={handleConfirm}
                disabled={!name.trim() || !email.trim() || submitting}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-clay px-8 py-3.5 font-mono text-[11px] font-bold tracking-widest uppercase text-[#0B0C0E] shadow-[0_0_25px_rgba(217,123,85,0.35)] transition-all hover:bg-clay/90 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100"
              >
                {submitting ? (
                  <>
                    <Loader2 size={15} className="animate-spin" />
                    <span>Reserving...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm Reservation</span>
                    <CheckCircle2 size={15} />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
