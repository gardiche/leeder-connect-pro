-- Create enum for user roles
create type public.user_role as enum ('freelancer', 'company', 'admin');

-- Create enum for mission status
create type public.mission_status as enum ('open', 'in_progress', 'completed', 'cancelled');

-- Create enum for application status
create type public.application_status as enum ('pending', 'accepted', 'rejected');

-- Create profiles table (common to all users)
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  role user_role not null,
  name text not null,
  photo_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Create freelancer_profiles table
create table public.freelancer_profiles (
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
  missions_completed integer default 0
);

-- Create company_profiles table
create table public.company_profiles (
  id uuid primary key references public.profiles(id) on delete cascade,
  company_name text not null,
  sector text,
  contact_name text not null,
  address text,
  siret text,
  kbis_document_url text,
  rib_info text,
  rating_average decimal(3,2) default 0
);

-- Create missions table
create table public.missions (
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

-- Create applications table
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  mission_id uuid references public.missions(id) on delete cascade not null,
  freelancer_id uuid references public.profiles(id) on delete cascade not null,
  status application_status default 'pending',
  message text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now(),
  unique(mission_id, freelancer_id)
);

-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.freelancer_profiles enable row level security;
alter table public.company_profiles enable row level security;
alter table public.missions enable row level security;
alter table public.applications enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
  on public.profiles for select
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Freelancer profiles policies
create policy "Freelancer profiles viewable by everyone"
  on public.freelancer_profiles for select
  using (true);

create policy "Freelancers can update own profile"
  on public.freelancer_profiles for update
  using (auth.uid() = id);

create policy "Freelancers can insert own profile"
  on public.freelancer_profiles for insert
  with check (auth.uid() = id);

-- Company profiles policies
create policy "Company profiles viewable by everyone"
  on public.company_profiles for select
  using (true);

create policy "Companies can update own profile"
  on public.company_profiles for update
  using (auth.uid() = id);

create policy "Companies can insert own profile"
  on public.company_profiles for insert
  with check (auth.uid() = id);

-- Missions policies
create policy "Missions viewable by authenticated users"
  on public.missions for select
  using (auth.role() = 'authenticated');

create policy "Companies can create missions"
  on public.missions for insert
  with check (auth.uid() = company_id);

create policy "Companies can update own missions"
  on public.missions for update
  using (auth.uid() = company_id);

create policy "Companies can delete own missions"
  on public.missions for delete
  using (auth.uid() = company_id);

-- Applications policies
create policy "Applications viewable by mission company and applicant"
  on public.applications for select
  using (
    auth.uid() = freelancer_id or 
    auth.uid() in (select company_id from public.missions where id = mission_id)
  );

create policy "Freelancers can create applications"
  on public.applications for insert
  with check (auth.uid() = freelancer_id);

create policy "Companies can update applications on their missions"
  on public.applications for update
  using (
    auth.uid() in (select company_id from public.missions where id = mission_id)
  );

-- Create function to update updated_at timestamp
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Create triggers for updated_at
create trigger update_profiles_updated_at before update on public.profiles
  for each row execute function public.update_updated_at_column();

create trigger update_missions_updated_at before update on public.missions
  for each row execute function public.update_updated_at_column();

create trigger update_applications_updated_at before update on public.applications
  for each row execute function public.update_updated_at_column();