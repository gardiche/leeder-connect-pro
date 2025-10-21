-- ============================================
-- LEEDER COMPLETE DATABASE MIGRATION (SAFE VERSION)
-- Execute this file in Supabase SQL Editor
-- This version uses "IF NOT EXISTS" to avoid errors
-- ============================================

-- STEP 1: Create enums (only if they don't exist)
-- ============================================
DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('freelancer', 'company', 'admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.mission_status AS ENUM ('open', 'in_progress', 'completed', 'cancelled');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE public.application_status AS ENUM ('pending', 'accepted', 'rejected');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- STEP 2: Create tables
-- ============================================

-- Profiles table (common to all users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role user_role not null,
  name text not null,
  photo_url text,
  skip_onboarding boolean default false,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Freelancer profiles table
CREATE TABLE IF NOT EXISTS public.freelancer_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  skills text[] default array[]::text[],
  experience text,
  location text,
  distance_limit integer default 50,
  is_available boolean default true,
  hourly_rate decimal(10,2),
  siret text,
  rib_info text,
  id_document_url text,
  rating_average decimal(3,2) default 0,
  missions_completed integer default 0,
  birth_date date,
  nationality text,
  address text,
  phone text,
  max_travel_time integer,
  profile_completed boolean default false
);

-- Company profiles table
CREATE TABLE IF NOT EXISTS public.company_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  company_name text not null,
  sector text,
  contact_name text not null,
  address text,
  siret text,
  kbis_document_url text,
  rib_info text,
  rating_average decimal(3,2) default 0,
  activity text,
  mission_types text[],
  special_requirements text,
  location text,
  profile_completed boolean default false
);

-- Missions table
CREATE TABLE IF NOT EXISTS public.missions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text not null,
  skills_required text[] default array[]::text[],
  location text not null,
  duration text,
  hourly_rate decimal(10,2) not null,
  payment_delay integer default 7,
  equipment_needed text,
  status mission_status default 'open',
  assigned_freelancer_id uuid references public.profiles(id) on delete set null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Applications table
CREATE TABLE IF NOT EXISTS public.applications (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid references public.missions(id) on delete cascade not null,
  freelancer_id uuid references public.profiles(id) on delete cascade not null,
  status application_status default 'pending',
  message text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(mission_id, freelancer_id)
);

-- Add columns if they don't exist (for existing tables)
ALTER TABLE public.freelancer_profiles
  ADD COLUMN IF NOT EXISTS birth_date date,
  ADD COLUMN IF NOT EXISTS nationality text,
  ADD COLUMN IF NOT EXISTS address text,
  ADD COLUMN IF NOT EXISTS phone text,
  ADD COLUMN IF NOT EXISTS max_travel_time integer,
  ADD COLUMN IF NOT EXISTS profile_completed boolean default false;

ALTER TABLE public.company_profiles
  ADD COLUMN IF NOT EXISTS activity text,
  ADD COLUMN IF NOT EXISTS mission_types text[],
  ADD COLUMN IF NOT EXISTS special_requirements text,
  ADD COLUMN IF NOT EXISTS location text,
  ADD COLUMN IF NOT EXISTS profile_completed boolean default false;

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS skip_onboarding boolean default false;

-- STEP 3: Enable Row Level Security
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.freelancer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.missions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- STEP 4: Create admin function
-- ============================================
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- STEP 5: Drop existing policies (to avoid conflicts)
-- ============================================
DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update any profile" ON public.profiles;

DROP POLICY IF EXISTS "Freelancer profiles viewable by everyone" ON public.freelancer_profiles;
DROP POLICY IF EXISTS "Freelancers can update own profile" ON public.freelancer_profiles;
DROP POLICY IF EXISTS "Freelancers can insert own profile" ON public.freelancer_profiles;
DROP POLICY IF EXISTS "Admins can do anything with freelancer profiles" ON public.freelancer_profiles;

DROP POLICY IF EXISTS "Company profiles viewable by everyone" ON public.company_profiles;
DROP POLICY IF EXISTS "Companies can update own profile" ON public.company_profiles;
DROP POLICY IF EXISTS "Companies can insert own profile" ON public.company_profiles;
DROP POLICY IF EXISTS "Admins can do anything with company profiles" ON public.company_profiles;

DROP POLICY IF EXISTS "Missions viewable by authenticated users" ON public.missions;
DROP POLICY IF EXISTS "Companies can create missions" ON public.missions;
DROP POLICY IF EXISTS "Companies can update own missions" ON public.missions;
DROP POLICY IF EXISTS "Companies can delete own missions" ON public.missions;
DROP POLICY IF EXISTS "Admins can do anything with missions" ON public.missions;

DROP POLICY IF EXISTS "Applications viewable by mission company and applicant" ON public.applications;
DROP POLICY IF EXISTS "Freelancers can create applications" ON public.applications;
DROP POLICY IF EXISTS "Companies can update applications on their missions" ON public.applications;
DROP POLICY IF EXISTS "Admins can do anything with applications" ON public.applications;

-- STEP 6: Create RLS Policies
-- ============================================

-- Profiles policies
CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON public.profiles FOR SELECT
  USING (public.is_admin(auth.uid()));

CREATE POLICY "Admins can update any profile"
  ON public.profiles FOR UPDATE
  USING (public.is_admin(auth.uid()));

-- Freelancer profiles policies
CREATE POLICY "Freelancer profiles viewable by everyone"
  ON public.freelancer_profiles FOR SELECT
  USING (true);

CREATE POLICY "Freelancers can update own profile"
  ON public.freelancer_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Freelancers can insert own profile"
  ON public.freelancer_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can do anything with freelancer profiles"
  ON public.freelancer_profiles FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Company profiles policies
CREATE POLICY "Company profiles viewable by everyone"
  ON public.company_profiles FOR SELECT
  USING (true);

CREATE POLICY "Companies can update own profile"
  ON public.company_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Companies can insert own profile"
  ON public.company_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can do anything with company profiles"
  ON public.company_profiles FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Missions policies
CREATE POLICY "Missions viewable by authenticated users"
  ON public.missions FOR SELECT
  USING (auth.role() = 'authenticated');

CREATE POLICY "Companies can create missions"
  ON public.missions FOR INSERT
  WITH CHECK (auth.uid() = company_id);

CREATE POLICY "Companies can update own missions"
  ON public.missions FOR UPDATE
  USING (auth.uid() = company_id);

CREATE POLICY "Companies can delete own missions"
  ON public.missions FOR DELETE
  USING (auth.uid() = company_id);

CREATE POLICY "Admins can do anything with missions"
  ON public.missions FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- Applications policies
CREATE POLICY "Applications viewable by mission company and applicant"
  ON public.applications FOR SELECT
  USING (
    auth.uid() = freelancer_id OR
    auth.uid() IN (SELECT company_id FROM public.missions WHERE id = mission_id)
  );

CREATE POLICY "Freelancers can create applications"
  ON public.applications FOR INSERT
  WITH CHECK (auth.uid() = freelancer_id);

CREATE POLICY "Companies can update applications on their missions"
  ON public.applications FOR UPDATE
  USING (
    auth.uid() IN (SELECT company_id FROM public.missions WHERE id = mission_id)
  );

CREATE POLICY "Admins can do anything with applications"
  ON public.applications FOR ALL
  USING (public.is_admin(auth.uid()))
  WITH CHECK (public.is_admin(auth.uid()));

-- STEP 7: Create triggers
-- ============================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  new.updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_profiles_updated_at ON public.profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_missions_updated_at ON public.missions;
CREATE TRIGGER update_missions_updated_at BEFORE UPDATE ON public.missions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_applications_updated_at ON public.applications;
CREATE TRIGGER update_applications_updated_at BEFORE UPDATE ON public.applications
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
