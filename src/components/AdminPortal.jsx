import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { 
  X, 
  Calendar, 
  Clock, 
  User, 
  Mail, 
  ShieldCheck, 
  CheckCircle, 
  XCircle, 
  RefreshCw, 
  Search, 
  Trash2, 
  Plus, 
  Phone, 
  Stethoscope, 
  Sparkles, 
  Building, 
  MapPin, 
  Edit3, 
  Check, 
  ToggleLeft, 
  ToggleRight, 
  FileText,
  Save,
  CheckCircle2,
  AlertCircle,
  RotateCcw
} from 'lucide-react';

export default function AdminPortal({ onClose }) {
  // Tabs: 'appointments' | 'doctors' | 'services' | 'settings'
  const [activeTab, setActiveTab] = useState('appointments');

  // Appointments State
  const [appointments, setAppointments] = useState([]);
  const [loadingAppts, setLoadingAppts] = useState(true);
  const [apptFilter, setApptFilter] = useState('all');
  const [apptSearch, setApptSearch] = useState('');
  const [updatingApptId, setUpdatingApptId] = useState(null);
  const [showAddApptModal, setShowAddApptModal] = useState(false);
  const [editingAppt, setEditingAppt] = useState(null);

  // Doctors / Specialists State
  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(false);
  const [showAddDoctorModal, setShowAddDoctorModal] = useState(false);
  const [editingDoctor, setEditingDoctor] = useState(null);

  // Services / Treatments State
  const [services, setServices] = useState([]);
  const [loadingServices, setLoadingServices] = useState(false);
  const [showAddServiceModal, setShowAddServiceModal] = useState(false);
  const [editingService, setEditingService] = useState(null);

  // Clinic Info / Settings State
  const [clinicInfo, setClinicInfo] = useState({
    clinic_name: 'Nova Dental',
    tagline: 'Advanced Dental Care',
    phone: '020 7946 0821',
    email: 'hello@novadental.co.uk',
    address: '14 Harley Street, London, W1G 9PH',
    hours_weekday: 'Monday – Friday: 08:30 – 18:30',
    hours_saturday: 'Saturday: 09:00 – 14:00',
    hours_sunday: 'Sunday: Closed',
  });
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsNotice, setSettingsNotice] = useState('');

  // New Appointment Form State
  const [newAppt, setNewAppt] = useState({
    patient_name: '',
    patient_email: '',
    patient_phone: '',
    service_name: '',
    doctor_name: '',
    date: new Date().toISOString().split('T')[0],
    time: '10:00',
    admin_notes: '',
  });

  // New Doctor Form State
  const [newDoctor, setNewDoctor] = useState({
    name: '',
    role: 'Cosmetic & Restorative Dentist',
    specialty: 'Smile Makeovers · Veneers',
    years: '10 yrs',
    sort_order: 1,
  });

  // New Service Form State
  const [newService, setNewService] = useState({
    name: '',
    subtitle: '',
    tag: 'Cosmetic',
    duration: '60 min',
    price: 350,
    description: '',
  });

  // ─── Data Fetchers ────────────────────────────────────────────────────────
  const fetchAppointments = async () => {
    setLoadingAppts(true);
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .order('created_at', { ascending: false });
      if (!error && data) setAppointments(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAppts(false);
    }
  };

  const fetchDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const { data, error } = await supabase
        .from('doctors')
        .select('*')
        .order('sort_order', { ascending: true });
      if (!error && data) setDoctors(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingDoctors(false);
    }
  };

  const fetchServices = async () => {
    setLoadingServices(true);
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('sort_order', { ascending: true });
      if (!error && data) setServices(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingServices(false);
    }
  };

  const fetchClinicInfo = async () => {
    try {
      const { data, error } = await supabase.from('clinic_info').select('*');
      if (!error && data && data.length > 0) {
        const map = {};
        data.forEach((item) => {
          map[item.key] = item.value;
        });
        setClinicInfo((prev) => ({ ...prev, ...map }));
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchAppointments();
    fetchDoctors();
    fetchServices();
    fetchClinicInfo();
  }, []);

  // ─── Appointment Business Logic ───────────────────────────────────────────
  const updateApptStatus = async (id, newStatus) => {
    setUpdatingApptId(id);
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: newStatus })
        .eq('id', id);

      if (error) {
        alert(`Could not update appointment: ${error.message}`);
      } else {
        setAppointments((prev) =>
          prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
        );
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingApptId(null);
    }
  };

  const deleteAppt = async (id) => {
    if (!confirm('Are you sure you want to permanently delete this reservation record?')) return;
    setUpdatingApptId(id);
    try {
      const { error } = await supabase.from('appointments').delete().eq('id', id);
      if (error) {
        alert(`Error deleting: ${error.message}`);
      } else {
        setAppointments((prev) => prev.filter((a) => a.id !== id));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setUpdatingApptId(null);
    }
  };

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    if (!newAppt.patient_name || !newAppt.patient_email) return;
    const ref = `NOVA-${Date.now().toString(36).toUpperCase().slice(-6)}`;
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          ref_id: ref,
          patient_name: newAppt.patient_name,
          patient_email: newAppt.patient_email,
          service_name: newAppt.service_name || (services[0]?.name ?? 'Comprehensive Dental Examination'),
          doctor_name: newAppt.doctor_name || (doctors[0]?.name ?? 'Dr. Sarah Mitchell'),
          date: newAppt.date,
          time: newAppt.time,
          status: 'confirmed',
          admin_notes: newAppt.admin_notes,
        })
        .select()
        .single();

      if (error) {
        alert(`Error creating appointment: ${error.message}`);
      } else if (data) {
        setAppointments((prev) => [data, ...prev]);
        setShowAddApptModal(false);
        setNewAppt({
          patient_name: '',
          patient_email: '',
          patient_phone: '',
          service_name: '',
          doctor_name: '',
          date: new Date().toISOString().split('T')[0],
          time: '10:00',
          admin_notes: '',
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveEditedAppointment = async (e) => {
    e.preventDefault();
    if (!editingAppt) return;
    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          patient_name: editingAppt.patient_name,
          patient_email: editingAppt.patient_email,
          service_name: editingAppt.service_name,
          doctor_name: editingAppt.doctor_name,
          date: editingAppt.date,
          time: editingAppt.time,
          status: editingAppt.status,
          admin_notes: editingAppt.admin_notes,
        })
        .eq('id', editingAppt.id);

      if (error) {
        alert(`Error updating appointment: ${error.message}`);
      } else {
        setAppointments((prev) =>
          prev.map((a) => (a.id === editingAppt.id ? editingAppt : a))
        );
        setEditingAppt(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ─── Doctor Management ────────────────────────────────────────────────────
  const toggleDoctorActive = async (id, currentStatus) => {
    const nextStatus = !currentStatus;
    try {
      const { error } = await supabase
        .from('doctors')
        .update({ active: nextStatus })
        .eq('id', id);

      if (error) {
        alert(`Could not toggle clinician: ${error.message}`);
      } else {
        setDoctors((prev) =>
          prev.map((d) => (d.id === id ? { ...d, active: nextStatus } : d))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    if (!newDoctor.name) return;
    try {
      const { data, error } = await supabase
        .from('doctors')
        .insert({
          name: newDoctor.name,
          role: newDoctor.role,
          specialty: newDoctor.specialty,
          years: newDoctor.years,
          sort_order: doctors.length + 1,
          active: true,
        })
        .select()
        .single();

      if (error) {
        alert(`Error adding doctor: ${error.message}`);
      } else if (data) {
        setDoctors((prev) => [...prev, data]);
        setShowAddDoctorModal(false);
        setNewDoctor({
          name: '',
          role: 'Cosmetic & Restorative Dentist',
          specialty: 'Smile Makeovers · Veneers',
          years: '10 yrs',
          sort_order: 1,
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveEditedDoctor = async (e) => {
    e.preventDefault();
    if (!editingDoctor) return;
    try {
      const { error } = await supabase
        .from('doctors')
        .update({
          name: editingDoctor.name,
          role: editingDoctor.role,
          specialty: editingDoctor.specialty,
          years: editingDoctor.years,
          active: editingDoctor.active,
        })
        .eq('id', editingDoctor.id);

      if (error) {
        alert(`Error editing clinician: ${error.message}`);
      } else {
        setDoctors((prev) =>
          prev.map((d) => (d.id === editingDoctor.id ? editingDoctor : d))
        );
        setEditingDoctor(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteDoctor = async (id) => {
    if (!confirm('Are you sure you want to remove this clinician from the practice?')) return;
    try {
      const { error } = await supabase.from('doctors').delete().eq('id', id);
      if (error) {
        alert(`Error removing doctor: ${error.message}`);
      } else {
        setDoctors((prev) => prev.filter((d) => d.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ─── Service Management ───────────────────────────────────────────────────
  const toggleServiceActive = async (id, currentStatus) => {
    const nextStatus = !currentStatus;
    try {
      const { error } = await supabase
        .from('services')
        .update({ active: nextStatus })
        .eq('id', id);

      if (error) {
        alert(`Could not toggle service: ${error.message}`);
      } else {
        setServices((prev) =>
          prev.map((s) => (s.id === id ? { ...s, active: nextStatus } : s))
        );
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateService = async (e) => {
    e.preventDefault();
    if (!newService.name) return;
    try {
      const { data, error } = await supabase
        .from('services')
        .insert({
          name: newService.name,
          subtitle: newService.subtitle,
          tag: newService.tag,
          duration: newService.duration,
          price: Number(newService.price) || 0,
          description: newService.description,
          sort_order: services.length + 1,
          active: true,
        })
        .select()
        .single();

      if (error) {
        alert(`Error creating treatment: ${error.message}`);
      } else if (data) {
        setServices((prev) => [...prev, data]);
        setShowAddServiceModal(false);
        setNewService({
          name: '',
          subtitle: '',
          tag: 'Cosmetic',
          duration: '60 min',
          price: 350,
          description: '',
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveEditedService = async (e) => {
    e.preventDefault();
    if (!editingService) return;
    try {
      const { error } = await supabase
        .from('services')
        .update({
          name: editingService.name,
          subtitle: editingService.subtitle,
          tag: editingService.tag,
          duration: editingService.duration,
          price: Number(editingService.price) || 0,
          description: editingService.description,
          active: editingService.active,
        })
        .eq('id', editingService.id);

      if (error) {
        alert(`Error editing treatment: ${error.message}`);
      } else {
        setServices((prev) =>
          prev.map((s) => (s.id === editingService.id ? editingService : s))
        );
        setEditingService(null);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const deleteService = async (id) => {
    if (!confirm('Are you sure you want to delete this treatment ritual?')) return;
    try {
      const { error } = await supabase.from('services').delete().eq('id', id);
      if (error) {
        alert(`Error deleting service: ${error.message}`);
      } else {
        setServices((prev) => prev.filter((s) => s.id !== id));
      }
    } catch (e) {
      console.error(e);
    }
  };

  // ─── Settings ─────────────────────────────────────────────────────────────
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsNotice('');
    try {
      const entries = Object.entries(clinicInfo).map(([key, value]) => ({
        key,
        value,
        updated_at: new Date().toISOString(),
      }));

      const { error } = await supabase.from('clinic_info').upsert(entries);
      if (!error) {
        setSettingsNotice('Clinic settings saved live to Supabase!');
        setTimeout(() => setSettingsNotice(''), 4000);
      } else {
        setSettingsNotice(`Error: ${error.message}`);
      }
    } catch (err) {
      setSettingsNotice('Failed to save settings');
    } finally {
      setSavingSettings(false);
    }
  };

  // Filtered Appointments
  const filteredAppts = appointments.filter((app) => {
    const matchesStatus = apptFilter === 'all' || app.status === apptFilter;
    const q = apptSearch.toLowerCase();
    const matchesSearch =
      !q ||
      app.patient_name?.toLowerCase().includes(q) ||
      app.patient_email?.toLowerCase().includes(q) ||
      app.service_name?.toLowerCase().includes(q) ||
      app.ref_id?.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="fixed inset-0 z-[210] flex items-center justify-center p-2 sm:p-4 md:p-6">
      {/* BACKDROP */}
      <div 
        className="absolute inset-0 bg-black/85 backdrop-blur-xl transition-opacity" 
        onClick={onClose} 
      />

      {/* CONTAINER */}
      <div className="relative flex flex-col w-full max-w-6xl max-h-[94vh] rounded-3xl border border-accent/30 bg-[#070b14] shadow-[0_25px_80px_rgba(0,0,0,0.9)] overflow-hidden">
        
        {/* TOP BAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 px-6 py-4 bg-[#0a0f1d]">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-2xl border border-accent/40 bg-accent/15 text-accent shadow-[0_0_15px_rgba(56,139,253,0.25)]">
              <ShieldCheck size={22} />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display text-lg sm:text-xl font-bold uppercase tracking-wider text-alabaster">
                  Nova Dental Atelier
                </h2>
                <span className="rounded-full border border-amber-500/40 bg-amber-500/20 px-2 py-0.5 font-mono text-[9px] font-bold tracking-widest uppercase text-amber-300">
                  ADMIN SUITE
                </span>
              </div>
              <p className="font-mono text-xs text-alabaster-muted">
                Executive clinical scheduling & practice control suite
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => {
                fetchAppointments();
                fetchDoctors();
                fetchServices();
                fetchClinicInfo();
              }}
              className="inline-flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 font-mono text-[11px] text-alabaster hover:border-white/20 hover:bg-white/[0.08] transition-all"
            >
              <RefreshCw size={13} className={loadingAppts ? 'animate-spin' : ''} />
              <span>Sync All</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04] text-alabaster-muted hover:border-white/20 hover:text-alabaster transition-all"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* 4 PRIMARY NAVIGATION TABS */}
        <div className="flex border-b border-white/10 bg-[#060913] px-6 overflow-x-auto">
          {[
            { id: 'appointments', label: '01 Appointments', count: appointments.length, icon: Calendar },
            { id: 'doctors', label: '02 Doctors & Operatories', count: doctors.length, icon: Stethoscope },
            { id: 'services', label: '03 Treatments & Pricing', count: services.length, icon: Sparkles },
            { id: 'settings', label: '04 Practice Hours & Info', icon: Building },
          ].map((tab) => {
            const Icon = tab.icon;
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 py-3.5 px-4 font-mono text-[11px] uppercase tracking-wider transition-all border-b-2 whitespace-nowrap ${
                  active
                    ? 'border-accent text-accent font-bold bg-accent/[0.05]'
                    : 'border-transparent text-alabaster-muted hover:text-alabaster'
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
                {typeof tab.count === 'number' && (
                  <span className={`rounded-full px-2 py-0.2 font-mono text-[9px] ${
                    active ? 'bg-accent/20 text-accent font-bold' : 'bg-white/5 text-alabaster-muted'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ─── TAB 1: APPOINTMENTS ─────────────────────────────────────────── */}
        {activeTab === 'appointments' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* METRICS & QUICK ACTIONS */}
            <div className="p-4 sm:p-6 border-b border-white/5 bg-[#060a14] flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 flex-1">
                <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-3.5">
                  <span className="block font-mono text-[9px] uppercase tracking-wider text-alabaster-muted">
                    Total
                  </span>
                  <span className="font-display text-xl font-bold text-alabaster mt-0.5 block">
                    {appointments.length}
                  </span>
                </div>
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] p-3.5">
                  <span className="block font-mono text-[9px] uppercase tracking-wider text-emerald-400">
                    Confirmed
                  </span>
                  <span className="font-display text-xl font-bold text-emerald-400 mt-0.5 block">
                    {appointments.filter((a) => a.status === 'confirmed').length}
                  </span>
                </div>
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-3.5">
                  <span className="block font-mono text-[9px] uppercase tracking-wider text-amber-400">
                    Pending Review
                  </span>
                  <span className="font-display text-xl font-bold text-amber-400 mt-0.5 block">
                    {appointments.filter((a) => a.status === 'pending').length}
                  </span>
                </div>
                <div className="rounded-2xl border border-cyan/20 bg-cyan/[0.04] p-3.5">
                  <span className="block font-mono text-[9px] uppercase tracking-wider text-cyan">
                    Completed Visits
                  </span>
                  <span className="font-display text-xl font-bold text-cyan mt-0.5 block">
                    {appointments.filter((a) => a.status === 'completed').length}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowAddApptModal(true)}
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-accent px-5 py-3 font-mono text-[11px] font-bold uppercase tracking-widest text-white shadow-[0_0_20px_rgba(56,139,253,0.3)] hover:bg-accent/90 transition-all shrink-0"
              >
                <Plus size={15} />
                <span>+ Add Reservation</span>
              </button>
            </div>

            {/* FILTER & SEARCH */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-6 py-3 bg-[#080d1a] border-b border-white/5">
              <div className="relative w-full sm:w-72">
                <Search size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-alabaster-muted" />
                <input
                  type="text"
                  placeholder="Search patient, treatment, pass..."
                  value={apptSearch}
                  onChange={(e) => setApptSearch(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.03] pl-9 pr-3 py-2 text-xs text-alabaster placeholder-alabaster-muted/40 outline-none focus:border-accent/50 focus:ring-1 focus:ring-accent/30"
                />
              </div>

              <div className="flex items-center gap-1.5 self-start sm:self-auto overflow-x-auto w-full sm:w-auto">
                {['all', 'confirmed', 'pending', 'completed', 'cancelled'].map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => setApptFilter(st)}
                    className={`rounded-xl px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-all whitespace-nowrap ${
                      apptFilter === st
                        ? 'bg-accent text-white font-semibold shadow-[0_0_15px_rgba(56,139,253,0.3)]'
                        : 'bg-white/[0.03] text-alabaster-muted hover:text-alabaster border border-white/5'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* LIST */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
              {loadingAppts ? (
                <div className="py-20 text-center font-mono text-xs text-alabaster-muted">
                  <RefreshCw size={24} className="animate-spin text-accent mx-auto mb-2" />
                  Loading clinical reservations...
                </div>
              ) : filteredAppts.length === 0 ? (
                <div className="py-20 text-center rounded-2xl border border-dashed border-white/10 p-8">
                  <Calendar size={36} className="text-alabaster-muted/40 mx-auto mb-3" />
                  <p className="font-display text-sm font-bold uppercase text-alabaster">
                    No reservations found
                  </p>
                  <p className="font-mono text-xs text-alabaster-muted mt-1">
                    Bookings created online or added manually will appear here in real time.
                  </p>
                </div>
              ) : (
                filteredAppts.map((app) => {
                  const isCompleted = app.status === 'completed';
                  const isCancelled = app.status === 'cancelled';
                  const isConfirmed = app.status === 'confirmed';
                  const isPending = app.status === 'pending';

                  return (
                    <div
                      key={app.id}
                      className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5 hover:border-accent/30 transition-all"
                    >
                      {/* LEFT: PASS & PATIENT */}
                      <div className="flex items-start gap-4">
                        <div className="flex flex-col items-center justify-center h-12 w-14 shrink-0 rounded-xl border border-white/10 bg-black/40 font-mono text-[10px] text-accent">
                          <span className="text-[8px] text-alabaster-muted">REF</span>
                          <strong className="text-[11px] font-bold text-alabaster">
                            {app.ref_id ? app.ref_id.split('-')[1] || app.ref_id.slice(-5) : 'APP'}
                          </strong>
                        </div>

                        <div>
                          <div className="flex flex-wrap items-center gap-2 mb-1">
                            <h4 className="font-display text-base font-bold text-alabaster uppercase">
                              {app.patient_name || 'Guest Patient'}
                            </h4>
                            <span
                              className={`rounded-full px-2 py-0.5 font-mono text-[9px] font-semibold uppercase tracking-wider border ${
                                isConfirmed
                                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                                  : isCompleted
                                  ? 'border-cyan/30 bg-cyan/10 text-cyan'
                                  : isCancelled
                                  ? 'border-red-500/30 bg-red-500/10 text-red-400'
                                  : 'border-amber-500/30 bg-amber-500/10 text-amber-400'
                              }`}
                            >
                              {app.status}
                            </span>
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] text-alabaster-muted">
                            <span className="flex items-center gap-1.5">
                              <Mail size={12} className="text-accent" />
                              {app.patient_email}
                            </span>
                            <span className="text-white/20">|</span>
                            <span className="text-alabaster font-medium">{app.service_name}</span>
                            {app.doctor_name && (
                              <>
                                <span className="text-white/20">|</span>
                                <span className="text-alabaster-muted">{app.doctor_name}</span>
                              </>
                            )}
                            {app.admin_notes && (
                              <>
                                <span className="text-white/20">|</span>
                                <span className="text-amber-400/80 italic">Notes: {app.admin_notes}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* RIGHT: DATE & STATUS ACTIONS (PROPER CLINICAL LIFECYCLE) */}
                      <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 pt-3 lg:pt-0 border-t border-white/5 lg:border-t-0">
                        <div className="flex items-center gap-3 font-mono text-xs bg-black/30 px-3.5 py-2 rounded-xl border border-white/5">
                          <span className="flex items-center gap-1.5 text-alabaster">
                            <Calendar size={13} className="text-accent" />
                            {app.date}
                          </span>
                          <span className="flex items-center gap-1.5 text-champagne font-semibold">
                            <Clock size={13} />
                            {app.time}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* PENDING: Can Confirm or Cancel */}
                          {isPending && (
                            <>
                              <button
                                type="button"
                                onClick={() => updateApptStatus(app.id, 'confirmed')}
                                disabled={updatingApptId === app.id}
                                className="flex h-8 items-center gap-1 rounded-xl border border-emerald-500/40 bg-emerald-500/15 px-3 font-mono text-[10px] font-bold text-emerald-300 hover:bg-emerald-500/25 transition-all shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                              >
                                <CheckCircle size={12} />
                                <span>Confirm</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => updateApptStatus(app.id, 'cancelled')}
                                disabled={updatingApptId === app.id}
                                className="flex h-8 items-center gap-1 rounded-xl border border-red-500/30 bg-red-500/10 px-2.5 font-mono text-[10px] text-red-400 hover:bg-red-500/20 transition-all"
                              >
                                <XCircle size={12} />
                                <span>Cancel</span>
                              </button>
                            </>
                          )}

                          {/* CONFIRMED: Can Mark Completed or Cancel */}
                          {isConfirmed && (
                            <>
                              <button
                                type="button"
                                onClick={() => updateApptStatus(app.id, 'completed')}
                                disabled={updatingApptId === app.id}
                                className="flex h-8 items-center gap-1 rounded-xl border border-cyan/40 bg-cyan/15 px-3 font-mono text-[10px] font-bold text-cyan hover:bg-cyan/25 transition-all shadow-[0_0_12px_rgba(6,182,212,0.15)]"
                              >
                                <CheckCircle size={12} />
                                <span>Complete Visit</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => updateApptStatus(app.id, 'cancelled')}
                                disabled={updatingApptId === app.id}
                                className="flex h-8 items-center gap-1 rounded-xl border border-red-500/30 bg-red-500/10 px-2.5 font-mono text-[10px] text-red-400 hover:bg-red-500/20 transition-all"
                              >
                                <XCircle size={12} />
                                <span>Cancel</span>
                              </button>
                            </>
                          )}

                          {/* COMPLETED: Visit finished. NEVER show Cancel! Allow Reopen only */}
                          {isCompleted && (
                            <button
                              type="button"
                              onClick={() => updateApptStatus(app.id, 'confirmed')}
                              disabled={updatingApptId === app.id}
                              title="Reopen to Confirmed status"
                              className="flex h-8 items-center gap-1 rounded-xl border border-white/10 bg-white/5 px-2.5 font-mono text-[10px] text-alabaster-muted hover:text-white transition-all"
                            >
                              <RotateCcw size={11} />
                              <span>Reopen</span>
                            </button>
                          )}

                          {/* CANCELLED: Never show complete! Allow Reactivate/Reschedule */}
                          {isCancelled && (
                            <button
                              type="button"
                              onClick={() => updateApptStatus(app.id, 'confirmed')}
                              disabled={updatingApptId === app.id}
                              className="flex h-8 items-center gap-1 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-2.5 font-mono text-[10px] text-emerald-400 hover:bg-emerald-500/20 transition-all"
                            >
                              <RotateCcw size={11} />
                              <span>Reactivate</span>
                            </button>
                          )}

                          {/* EDIT MODAL TRIGGER */}
                          <button
                            type="button"
                            onClick={() => setEditingAppt(app)}
                            title="Edit Appointment Details"
                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-alabaster-muted hover:border-accent hover:text-accent transition-all"
                          >
                            <Edit3 size={13} />
                          </button>

                          {/* DELETE TRIGGER */}
                          <button
                            type="button"
                            onClick={() => deleteAppt(app.id)}
                            disabled={updatingApptId === app.id}
                            title="Delete Record"
                            className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 text-alabaster-muted hover:border-red-500/40 hover:text-red-400 transition-all"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 2: DOCTORS & OPERATORY SUITES ───────────────────────────── */}
        {activeTab === 'doctors' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-white/5 bg-[#060a14] flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold uppercase text-alabaster">
                  Clinical Providers & Treatment Suites ({doctors.length})
                </h3>
                <p className="font-mono text-xs text-alabaster-muted">
                  Edit specialist dentists, assigned operatory chairs, and active status
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddDoctorModal(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-accent px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-white shadow-[0_0_20px_rgba(56,139,253,0.3)] hover:bg-accent/90 transition-all"
              >
                <Plus size={15} />
                <span>+ Add Specialist</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
              {doctors.length === 0 ? (
                <div className="py-20 text-center font-mono text-xs text-alabaster-muted">
                  No clinicians registered yet.
                </div>
              ) : (
                doctors.map((doc, idx) => (
                  <div
                    key={doc.id || idx}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5 hover:border-accent/30 transition-all"
                  >
                    <div className="flex items-center gap-4">
                      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 font-mono text-xs font-bold text-accent">
                        0{idx + 1}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-display text-base font-bold text-alabaster uppercase">
                            {doc.name}
                          </h4>
                          <span className="font-mono text-[9px] uppercase tracking-wider text-accent border border-accent/30 bg-accent/10 px-2 py-0.5 rounded-full">
                            Suite 0{idx + 1}
                          </span>
                        </div>
                        <p className="font-mono text-xs text-stone-300">{doc.role}</p>
                        <p className="font-mono text-[10px] text-alabaster-muted mt-0.5">
                          {doc.specialty} · Experience: {doc.years}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => toggleDoctorActive(doc.id, doc.active !== false)}
                        className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-all ${
                          doc.active !== false
                            ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                            : 'border-white/10 bg-white/5 text-alabaster-muted'
                        }`}
                      >
                        {doc.active !== false ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                        <span>{doc.active !== false ? 'Available' : 'Inactive'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setEditingDoctor(doc)}
                        className="flex h-8 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 font-mono text-[10px] text-alabaster hover:border-accent hover:text-accent transition-all"
                      >
                        <Edit3 size={12} />
                        <span>Edit</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteDoctor(doc.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 text-alabaster-muted hover:border-red-500/40 hover:text-red-400 transition-all"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* ─── TAB 3: TREATMENTS & PRICING ─────────────────────────────────── */}
        {activeTab === 'services' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="p-4 sm:p-6 border-b border-white/5 bg-[#060a14] flex items-center justify-between">
              <div>
                <h3 className="font-display text-base font-bold uppercase text-alabaster">
                  Treatments & Fee Schedule ({services.length})
                </h3>
                <p className="font-mono text-xs text-alabaster-muted">
                  Toggling a treatment to disabled removes it live from public reservation drawer
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowAddServiceModal(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-accent px-4 py-2.5 font-mono text-[11px] font-bold uppercase tracking-widest text-white shadow-[0_0_20px_rgba(56,139,253,0.3)] hover:bg-accent/90 transition-all"
              >
                <Plus size={15} />
                <span>+ Add Treatment</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3">
              {services.map((srv, idx) => (
                <div
                  key={srv.id || idx}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-white/10 bg-white/[0.02] p-4 sm:p-5 hover:border-accent/30 transition-all"
                >
                  <div className="flex items-center gap-4">
                    <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/10 bg-black/40 font-mono text-xs font-bold text-accent">
                      0{idx + 1}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-display text-base font-bold text-alabaster uppercase">
                          {srv.name}
                        </h4>
                        <span className="font-mono text-[9px] uppercase tracking-wider text-cyan border border-cyan/30 bg-cyan/10 px-2 py-0.5 rounded-full">
                          {srv.tag || 'Clinical'}
                        </span>
                      </div>
                      <p className="font-mono text-xs text-stone-300">{srv.subtitle}</p>
                      <p className="font-mono text-[10px] text-alabaster-muted mt-0.5">
                        Duration: {srv.duration} · Base Fee: £{srv.price}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono text-lg font-bold text-alabaster mr-2">
                      £{srv.price}
                    </span>

                    <button
                      type="button"
                      onClick={() => toggleServiceActive(srv.id, srv.active !== false)}
                      className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition-all ${
                        srv.active !== false
                          ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                          : 'border-white/10 bg-white/5 text-alabaster-muted'
                      }`}
                    >
                      {srv.active !== false ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                      <span>{srv.active !== false ? 'Active' : 'Disabled'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setEditingService(srv)}
                      className="flex h-8 items-center gap-1.5 rounded-xl border border-white/10 bg-white/[0.04] px-3 font-mono text-[10px] text-alabaster hover:border-accent hover:text-accent transition-all"
                    >
                      <Edit3 size={12} />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => deleteService(srv.id)}
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/10 text-alabaster-muted hover:border-red-500/40 hover:text-red-400 transition-all"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ─── TAB 4: PRACTICE HOURS & INFO ───────────────────────────────── */}
        {activeTab === 'settings' && (
          <div className="flex-1 overflow-y-auto p-6 sm:p-8">
            <form onSubmit={handleSaveSettings} className="max-w-2xl mx-auto space-y-6">
              <div>
                <h3 className="font-display text-lg font-bold uppercase text-alabaster">
                  Practice Information & Hours
                </h3>
                <p className="font-mono text-xs text-alabaster-muted">
                  Update clinic contact coordinates and opening hours displayed across the website
                </p>
              </div>

              {settingsNotice && (
                <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 font-mono text-xs text-emerald-400 flex items-center gap-2">
                  <CheckCircle2 size={15} />
                  <span>{settingsNotice}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-alabaster-muted mb-1.5">
                    Clinic Name
                  </label>
                  <input
                    type="text"
                    value={clinicInfo.clinic_name}
                    onChange={(e) => setClinicInfo({ ...clinicInfo, clinic_name: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-alabaster outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-alabaster-muted mb-1.5">
                    Tagline
                  </label>
                  <input
                    type="text"
                    value={clinicInfo.tagline}
                    onChange={(e) => setClinicInfo({ ...clinicInfo, tagline: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-alabaster outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-alabaster-muted mb-1.5">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    value={clinicInfo.phone}
                    onChange={(e) => setClinicInfo({ ...clinicInfo, phone: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-alabaster outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-alabaster-muted mb-1.5">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={clinicInfo.email}
                    onChange={(e) => setClinicInfo({ ...clinicInfo, email: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-alabaster outline-none focus:border-accent"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-alabaster-muted mb-1.5">
                    Practice Physical Address
                  </label>
                  <input
                    type="text"
                    value={clinicInfo.address}
                    onChange={(e) => setClinicInfo({ ...clinicInfo, address: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-alabaster outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-alabaster-muted mb-1.5">
                    Weekday Hours
                  </label>
                  <input
                    type="text"
                    value={clinicInfo.hours_weekday}
                    onChange={(e) => setClinicInfo({ ...clinicInfo, hours_weekday: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-alabaster outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-alabaster-muted mb-1.5">
                    Saturday Hours
                  </label>
                  <input
                    type="text"
                    value={clinicInfo.hours_saturday}
                    onChange={(e) => setClinicInfo({ ...clinicInfo, hours_saturday: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-alabaster outline-none focus:border-accent"
                  />
                </div>

                <div>
                  <label className="block font-mono text-[10px] uppercase tracking-widest text-alabaster-muted mb-1.5">
                    Sunday Hours
                  </label>
                  <input
                    type="text"
                    value={clinicInfo.hours_sunday}
                    onChange={(e) => setClinicInfo({ ...clinicInfo, hours_sunday: e.target.value })}
                    className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-4 py-2.5 text-xs text-alabaster outline-none focus:border-accent"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end">
                <button
                  type="submit"
                  disabled={savingSettings}
                  className="inline-flex items-center gap-2 rounded-2xl bg-accent px-6 py-3 font-mono text-[11px] font-bold uppercase tracking-widest text-white shadow-[0_0_20px_rgba(56,139,253,0.3)] hover:bg-accent/90 disabled:opacity-50"
                >
                  <Save size={15} />
                  <span>{savingSettings ? 'Saving...' : 'Save Settings'}</span>
                </button>
              </div>
            </form>
          </div>
        )}

      </div>

      {/* ─── MODAL: MANUAL RESERVATION ───────────────────────────────────────── */}
      {showAddApptModal && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowAddApptModal(false)} />
          <form
            onSubmit={handleCreateAppointment}
            className="relative w-full max-w-lg rounded-3xl border border-accent/30 bg-[#0d1322] p-6 sm:p-8 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display text-base font-bold uppercase text-alabaster">
                Manual Patient Reservation
              </h3>
              <button
                type="button"
                onClick={() => setShowAddApptModal(false)}
                className="text-alabaster-muted hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-alabaster-muted mb-1">
                Patient Full Name
              </label>
              <input
                type="text"
                required
                value={newAppt.patient_name}
                onChange={(e) => setNewAppt({ ...newAppt, patient_name: e.target.value })}
                placeholder="Jane Doe"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs text-alabaster outline-none focus:border-accent"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[10px] uppercase text-alabaster-muted mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={newAppt.patient_email}
                  onChange={(e) => setNewAppt({ ...newAppt, patient_email: e.target.value })}
                  placeholder="jane@example.com"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs text-alabaster outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-alabaster-muted mb-1">
                  Phone (Optional)
                </label>
                <input
                  type="tel"
                  value={newAppt.patient_phone}
                  onChange={(e) => setNewAppt({ ...newAppt, patient_phone: e.target.value })}
                  placeholder="07700 900077"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs text-alabaster outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[10px] uppercase text-alabaster-muted mb-1">
                  Treatment Service
                </label>
                <select
                  value={newAppt.service_name}
                  onChange={(e) => setNewAppt({ ...newAppt, service_name: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#070b14] px-3.5 py-2 text-xs text-alabaster outline-none focus:border-accent"
                >
                  <option value="">Select Treatment...</option>
                  {services.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name} (£{s.price})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-alabaster-muted mb-1">
                  Clinician / Dentist
                </label>
                <select
                  value={newAppt.doctor_name}
                  onChange={(e) => setNewAppt({ ...newAppt, doctor_name: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#070b14] px-3.5 py-2 text-xs text-alabaster outline-none focus:border-accent"
                >
                  <option value="">Select Dentist...</option>
                  {doctors.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[10px] uppercase text-alabaster-muted mb-1">
                  Appointment Date
                </label>
                <input
                  type="date"
                  required
                  value={newAppt.date}
                  onChange={(e) => setNewAppt({ ...newAppt, date: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#070b14] px-3.5 py-2 text-xs text-alabaster outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-alabaster-muted mb-1">
                  Time Slot
                </label>
                <input
                  type="time"
                  required
                  value={newAppt.time}
                  onChange={(e) => setNewAppt({ ...newAppt, time: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#070b14] px-3.5 py-2 text-xs text-alabaster outline-none focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-alabaster-muted mb-1">
                Clinical Notes / Medical Requirements
              </label>
              <textarea
                rows={2}
                value={newAppt.admin_notes}
                onChange={(e) => setNewAppt({ ...newAppt, admin_notes: e.target.value })}
                placeholder="Allergies, previous crowns, sedation request..."
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs text-alabaster outline-none focus:border-accent"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowAddApptModal(false)}
                className="rounded-xl px-4 py-2 font-mono text-[11px] text-alabaster-muted hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-accent px-5 py-2 font-mono text-[11px] font-bold text-white shadow hover:bg-accent/90"
              >
                Book Chair
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── MODAL: EDIT APPOINTMENT ─────────────────────────────────────────── */}
      {editingAppt && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setEditingAppt(null)} />
          <form
            onSubmit={handleSaveEditedAppointment}
            className="relative w-full max-w-lg rounded-3xl border border-accent/30 bg-[#0d1322] p-6 sm:p-8 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display text-base font-bold uppercase text-alabaster">
                Edit Reservation ({editingAppt.ref_id || 'Ref'})
              </h3>
              <button
                type="button"
                onClick={() => setEditingAppt(null)}
                className="text-alabaster-muted hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-alabaster-muted mb-1">
                Patient Name
              </label>
              <input
                type="text"
                required
                value={editingAppt.patient_name}
                onChange={(e) => setEditingAppt({ ...editingAppt, patient_name: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs text-alabaster outline-none focus:border-accent"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[10px] uppercase text-alabaster-muted mb-1">
                  Email
                </label>
                <input
                  type="email"
                  required
                  value={editingAppt.patient_email}
                  onChange={(e) => setEditingAppt({ ...editingAppt, patient_email: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs text-alabaster outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-alabaster-muted mb-1">
                  Status
                </label>
                <select
                  value={editingAppt.status}
                  onChange={(e) => setEditingAppt({ ...editingAppt, status: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#070b14] px-3.5 py-2 text-xs text-alabaster outline-none focus:border-accent"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[10px] uppercase text-alabaster-muted mb-1">
                  Treatment Service
                </label>
                <select
                  value={editingAppt.service_name}
                  onChange={(e) => setEditingAppt({ ...editingAppt, service_name: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#070b14] px-3.5 py-2 text-xs text-alabaster outline-none focus:border-accent"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.name}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-alabaster-muted mb-1">
                  Dentist / Clinician
                </label>
                <select
                  value={editingAppt.doctor_name}
                  onChange={(e) => setEditingAppt({ ...editingAppt, doctor_name: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#070b14] px-3.5 py-2 text-xs text-alabaster outline-none focus:border-accent"
                >
                  {doctors.map((d) => (
                    <option key={d.id} value={d.name}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[10px] uppercase text-alabaster-muted mb-1">
                  Date
                </label>
                <input
                  type="date"
                  required
                  value={editingAppt.date}
                  onChange={(e) => setEditingAppt({ ...editingAppt, date: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#070b14] px-3.5 py-2 text-xs text-alabaster outline-none focus:border-accent"
                />
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-alabaster-muted mb-1">
                  Time
                </label>
                <input
                  type="time"
                  required
                  value={editingAppt.time}
                  onChange={(e) => setEditingAppt({ ...editingAppt, time: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#070b14] px-3.5 py-2 text-xs text-alabaster outline-none focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-alabaster-muted mb-1">
                Clinical Notes
              </label>
              <textarea
                rows={2}
                value={editingAppt.admin_notes || ''}
                onChange={(e) => setEditingAppt({ ...editingAppt, admin_notes: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs text-alabaster outline-none focus:border-accent"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingAppt(null)}
                className="rounded-xl px-4 py-2 font-mono text-[11px] text-alabaster-muted hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-accent px-5 py-2 font-mono text-[11px] font-bold text-white shadow hover:bg-accent/90"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── MODAL: ADD DOCTOR ──────────────────────────────────────────────── */}
      {showAddDoctorModal && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowAddDoctorModal(false)} />
          <form
            onSubmit={handleCreateDoctor}
            className="relative w-full max-w-md rounded-3xl border border-accent/30 bg-[#0d1322] p-6 sm:p-8 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display text-base font-bold uppercase text-alabaster">
                Add Specialist Clinician
              </h3>
              <button
                type="button"
                onClick={() => setShowAddDoctorModal(false)}
                className="text-alabaster-muted hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-alabaster-muted mb-1">
                Doctor Full Name
              </label>
              <input
                type="text"
                required
                value={newDoctor.name}
                onChange={(e) => setNewDoctor({ ...newDoctor, name: e.target.value })}
                placeholder="Dr. Alexander Wright, BDS"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs text-alabaster outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-alabaster-muted mb-1">
                Clinical Role / Title
              </label>
              <input
                type="text"
                required
                value={newDoctor.role}
                onChange={(e) => setNewDoctor({ ...newDoctor, role: e.target.value })}
                placeholder="Endodontist & Microsurgeon"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs text-alabaster outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-alabaster-muted mb-1">
                Specialty Focus
              </label>
              <input
                type="text"
                required
                value={newDoctor.specialty}
                onChange={(e) => setNewDoctor({ ...newDoctor, specialty: e.target.value })}
                placeholder="Root Canal Therapy · Bone Preservation"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs text-alabaster outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-alabaster-muted mb-1">
                Years of Experience
              </label>
              <input
                type="text"
                required
                value={newDoctor.years}
                onChange={(e) => setNewDoctor({ ...newDoctor, years: e.target.value })}
                placeholder="15 yrs"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs text-alabaster outline-none focus:border-accent"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowAddDoctorModal(false)}
                className="rounded-xl px-4 py-2 font-mono text-[11px] text-alabaster-muted hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-accent px-5 py-2 font-mono text-[11px] font-bold text-white shadow hover:bg-accent/90"
              >
                Add Specialist
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── MODAL: EDIT DOCTOR ─────────────────────────────────────────────── */}
      {editingDoctor && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setEditingDoctor(null)} />
          <form
            onSubmit={handleSaveEditedDoctor}
            className="relative w-full max-w-md rounded-3xl border border-accent/30 bg-[#0d1322] p-6 sm:p-8 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display text-base font-bold uppercase text-alabaster">
                Edit Clinician Profile
              </h3>
              <button
                type="button"
                onClick={() => setEditingDoctor(null)}
                className="text-alabaster-muted hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-alabaster-muted mb-1">
                Doctor Full Name
              </label>
              <input
                type="text"
                required
                value={editingDoctor.name}
                onChange={(e) => setEditingDoctor({ ...editingDoctor, name: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs text-alabaster outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-alabaster-muted mb-1">
                Clinical Role
              </label>
              <input
                type="text"
                required
                value={editingDoctor.role}
                onChange={(e) => setEditingDoctor({ ...editingDoctor, role: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs text-alabaster outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-alabaster-muted mb-1">
                Specialty Focus
              </label>
              <input
                type="text"
                required
                value={editingDoctor.specialty}
                onChange={(e) => setEditingDoctor({ ...editingDoctor, specialty: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs text-alabaster outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-alabaster-muted mb-1">
                Experience
              </label>
              <input
                type="text"
                required
                value={editingDoctor.years}
                onChange={(e) => setEditingDoctor({ ...editingDoctor, years: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs text-alabaster outline-none focus:border-accent"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 font-mono text-xs text-alabaster cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingDoctor.active !== false}
                  onChange={(e) => setEditingDoctor({ ...editingDoctor, active: e.target.checked })}
                  className="rounded accent-accent"
                />
                <span>Active & Accepting Appointments</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingDoctor(null)}
                className="rounded-xl px-4 py-2 font-mono text-[11px] text-alabaster-muted hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-accent px-5 py-2 font-mono text-[11px] font-bold text-white shadow hover:bg-accent/90"
              >
                Save Clinician
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── MODAL: ADD TREATMENT ───────────────────────────────────────────── */}
      {showAddServiceModal && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setShowAddServiceModal(false)} />
          <form
            onSubmit={handleCreateService}
            className="relative w-full max-w-md rounded-3xl border border-accent/30 bg-[#0d1322] p-6 sm:p-8 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display text-base font-bold uppercase text-alabaster">
                Add Dental Treatment Ritual
              </h3>
              <button
                type="button"
                onClick={() => setShowAddServiceModal(false)}
                className="text-alabaster-muted hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-alabaster-muted mb-1">
                Treatment Name
              </label>
              <input
                type="text"
                required
                value={newService.name}
                onChange={(e) => setNewService({ ...newService, name: e.target.value })}
                placeholder="Comprehensive Hygiene & AirFlow"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs text-alabaster outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-alabaster-muted mb-1">
                Subtitle / Procedure Summary
              </label>
              <input
                type="text"
                value={newService.subtitle}
                onChange={(e) => setNewService({ ...newService, subtitle: e.target.value })}
                placeholder="Deep Biofilm & Stain Removal"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs text-alabaster outline-none focus:border-accent"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[10px] uppercase text-alabaster-muted mb-1">
                  Discipline Category
                </label>
                <select
                  value={newService.tag}
                  onChange={(e) => setNewService({ ...newService, tag: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#070b14] px-3.5 py-2 text-xs text-alabaster outline-none focus:border-accent"
                >
                  <option value="Cosmetic">Cosmetic</option>
                  <option value="Restorative">Restorative</option>
                  <option value="Implantology">Implantology</option>
                  <option value="Orthodontics">Orthodontics</option>
                  <option value="Preventative">Preventative</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-alabaster-muted mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  required
                  value={newService.duration}
                  onChange={(e) => setNewService({ ...newService, duration: e.target.value })}
                  placeholder="60 min"
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs text-alabaster outline-none focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-alabaster-muted mb-1">
                Base Fee (£)
              </label>
              <input
                type="number"
                required
                value={newService.price}
                onChange={(e) => setNewService({ ...newService, price: e.target.value })}
                placeholder="250"
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs text-alabaster outline-none focus:border-accent"
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setShowAddServiceModal(false)}
                className="rounded-xl px-4 py-2 font-mono text-[11px] text-alabaster-muted hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-accent px-5 py-2 font-mono text-[11px] font-bold text-white shadow hover:bg-accent/90"
              >
                Add Treatment
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ─── MODAL: EDIT TREATMENT ─────────────────────────────────────────── */}
      {editingService && (
        <div className="fixed inset-0 z-[220] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/80" onClick={() => setEditingService(null)} />
          <form
            onSubmit={handleSaveEditedService}
            className="relative w-full max-w-md rounded-3xl border border-accent/30 bg-[#0d1322] p-6 sm:p-8 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <h3 className="font-display text-base font-bold uppercase text-alabaster">
                Edit Treatment Protocol
              </h3>
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="text-alabaster-muted hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-alabaster-muted mb-1">
                Treatment Name
              </label>
              <input
                type="text"
                required
                value={editingService.name}
                onChange={(e) => setEditingService({ ...editingService, name: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs text-alabaster outline-none focus:border-accent"
              />
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-alabaster-muted mb-1">
                Subtitle
              </label>
              <input
                type="text"
                value={editingService.subtitle || ''}
                onChange={(e) => setEditingService({ ...editingService, subtitle: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs text-alabaster outline-none focus:border-accent"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-mono text-[10px] uppercase text-alabaster-muted mb-1">
                  Category
                </label>
                <select
                  value={editingService.tag || 'Cosmetic'}
                  onChange={(e) => setEditingService({ ...editingService, tag: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-[#070b14] px-3.5 py-2 text-xs text-alabaster outline-none focus:border-accent"
                >
                  <option value="Cosmetic">Cosmetic</option>
                  <option value="Restorative">Restorative</option>
                  <option value="Implantology">Implantology</option>
                  <option value="Orthodontics">Orthodontics</option>
                  <option value="Preventative">Preventative</option>
                </select>
              </div>

              <div>
                <label className="block font-mono text-[10px] uppercase text-alabaster-muted mb-1">
                  Duration
                </label>
                <input
                  type="text"
                  required
                  value={editingService.duration}
                  onChange={(e) => setEditingService({ ...editingService, duration: e.target.value })}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs text-alabaster outline-none focus:border-accent"
                />
              </div>
            </div>

            <div>
              <label className="block font-mono text-[10px] uppercase text-alabaster-muted mb-1">
                Fee (£)
              </label>
              <input
                type="number"
                required
                value={editingService.price}
                onChange={(e) => setEditingService({ ...editingService, price: e.target.value })}
                className="w-full rounded-xl border border-white/10 bg-white/[0.04] px-3.5 py-2 text-xs text-alabaster outline-none focus:border-accent"
              />
            </div>

            <div className="flex items-center justify-between pt-2">
              <label className="flex items-center gap-2 font-mono text-xs text-alabaster cursor-pointer">
                <input
                  type="checkbox"
                  checked={editingService.active !== false}
                  onChange={(e) => setEditingService({ ...editingService, active: e.target.checked })}
                  className="rounded accent-accent"
                />
                <span>Active on Public Booking Menu</span>
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/10">
              <button
                type="button"
                onClick={() => setEditingService(null)}
                className="rounded-xl px-4 py-2 font-mono text-[11px] text-alabaster-muted hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded-xl bg-accent px-5 py-2 font-mono text-[11px] font-bold text-white shadow hover:bg-accent/90"
              >
                Save Treatment
              </button>
            </div>
          </form>
        </div>
      )}

    </div>
  );
}
