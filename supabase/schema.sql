-- ============================================================
-- NOVA DENTAL — Supabase Schema & Policies
-- Run this entire script in: Supabase Dashboard → SQL Editor
-- ============================================================

-- 1. PROFILES (extends auth.users)
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  role text not null default 'patient' check (role in ('patient','admin')),
  full_name text,
  phone text,
  created_at timestamptz default now()
);

-- Admin check helper function (SECURITY DEFINER avoids RLS infinite recursion)
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);

drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

drop policy if exists "Admins can view all profiles" on public.profiles;
create policy "Admins can view all profiles" on public.profiles for select using (public.is_admin());

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, new.raw_user_meta_data->>'full_name')
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. SERVICES
create table if not exists public.services (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  subtitle text,
  tag text,
  duration text,
  price numeric,
  description text,
  active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

alter table public.services enable row level security;

drop policy if exists "Anyone can view active services" on public.services;
create policy "Anyone can view active services" on public.services for select using (active = true);

drop policy if exists "Admins can manage services" on public.services;
create policy "Admins can manage services" on public.services for all using (public.is_admin());

-- 3. DOCTORS
create table if not exists public.doctors (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  role text,
  specialty text,
  years text,
  bio text,
  active boolean default true,
  sort_order int default 0,
  created_at timestamptz default now()
);

alter table public.doctors enable row level security;

drop policy if exists "Anyone can view active doctors" on public.doctors;
create policy "Anyone can view active doctors" on public.doctors for select using (active = true);

drop policy if exists "Admins can manage doctors" on public.doctors;
create policy "Admins can manage doctors" on public.doctors for all using (public.is_admin());

-- 4. APPOINTMENTS
create table if not exists public.appointments (
  id uuid default gen_random_uuid() primary key,
  ref_id text,
  patient_id uuid references auth.users(id) on delete set null,
  patient_name text not null,
  patient_email text not null,
  service_id uuid references public.services(id) on delete set null,
  service_name text,
  doctor_id uuid references public.doctors(id) on delete set null,
  doctor_name text,
  date date not null,
  time text not null,
  status text not null default 'confirmed' check (status in ('pending','confirmed','completed','cancelled','postponed')),
  admin_notes text,
  created_at timestamptz default now()
);

alter table public.appointments enable row level security;

drop policy if exists "Anyone can insert appointments" on public.appointments;
create policy "Anyone can insert appointments" on public.appointments for insert with check (true);

drop policy if exists "Patients can view own appointments" on public.appointments;
create policy "Patients can view own appointments" on public.appointments for select using (patient_id = auth.uid());

drop policy if exists "Admins can manage all appointments" on public.appointments;
create policy "Admins can manage all appointments" on public.appointments for all using (public.is_admin());

-- 5. CLINIC INFO (key-value store for site configuration)
create table if not exists public.clinic_info (
  key text primary key,
  value text,
  updated_at timestamptz default now()
);

alter table public.clinic_info enable row level security;

drop policy if exists "Anyone can read clinic info" on public.clinic_info;
create policy "Anyone can read clinic info" on public.clinic_info for select using (true);

drop policy if exists "Admins can manage clinic info" on public.clinic_info;
create policy "Admins can manage clinic info" on public.clinic_info for all using (public.is_admin());

-- ============================================================
-- SEED DATA
-- ============================================================

insert into public.clinic_info (key, value) values
  ('clinic_name', 'Nova Dental'),
  ('tagline', 'Advanced Dental Care'),
  ('phone', '020 7946 0821'),
  ('email', 'hello@novadental.co.uk'),
  ('address', '14 Harley Street, London, W1G 9PH'),
  ('hours_weekday', 'Monday – Friday: 08:30 – 18:30'),
  ('hours_saturday', 'Saturday: 09:00 – 14:00'),
  ('hours_sunday', 'Sunday: Closed'),
  ('google_maps_url', 'https://maps.google.com')
on conflict (key) do nothing;

insert into public.services (name, subtitle, tag, duration, price, sort_order) values
  ('Professional Teeth Whitening', 'In-Office Zoom® Whitening', 'Cosmetic', '60 min', 350, 1),
  ('Porcelain Veneers', 'Ultra-thin Smile Restoration', 'Restorative', '2 × 90 min', 980, 2),
  ('Dental Implant Placement', 'Titanium Osseointegration', 'Implantology', '90 min', 2400, 3),
  ('Invisalign® Clear Aligners', 'Full Orthodontic Course', 'Orthodontics', '12–18 months', 4200, 4)
on conflict do nothing;

insert into public.doctors (name, role, specialty, years, sort_order) values
  ('Dr. Sarah Mitchell', 'Cosmetic & Restorative Dentist', 'Smile Makeovers · Veneers', '16 yrs', 1),
  ('Dr. James Okafor', 'Oral & Maxillofacial Surgeon', 'Implants · Bone Grafting', '12 yrs', 2),
  ('Dr. Priya Nair', 'Orthodontist — BDS, MOrth', 'Invisalign · Fixed Braces', '10 yrs', 3),
  ('Dr. Tom Hargreaves', 'Periodontist & Implant Specialist', 'Gum Therapy · Bone Restoration', '14 yrs', 4)
on conflict do nothing;
