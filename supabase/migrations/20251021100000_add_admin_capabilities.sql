-- Create admin profile function to allow admins to see both views
-- This will be used to grant admins access to both freelancer and company views

-- First, let's ensure the admin role exists in the enum (it should already exist from initial migration)

-- Create a function to check if a user is an admin
create or replace function public.is_admin(user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = user_id and role = 'admin'
  );
end;
$$ language plpgsql security definer;

-- Update RLS policies to allow admins full access

-- Missions: Allow admins to create, update, and delete any mission
create policy "Admins can do anything with missions"
  on public.missions for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Applications: Allow admins to create, update, and delete any application
create policy "Admins can do anything with applications"
  on public.applications for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Profiles: Allow admins to view and update any profile
create policy "Admins can view all profiles"
  on public.profiles for select
  using (public.is_admin(auth.uid()));

create policy "Admins can update any profile"
  on public.profiles for update
  using (public.is_admin(auth.uid()));

-- Freelancer profiles: Allow admins full access
create policy "Admins can do anything with freelancer profiles"
  on public.freelancer_profiles for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Company profiles: Allow admins full access
create policy "Admins can do anything with company profiles"
  on public.company_profiles for all
  using (public.is_admin(auth.uid()))
  with check (public.is_admin(auth.uid()));

-- Add a flag to profiles to mark completed onboarding (for admin bypass)
alter table public.profiles
  add column if not exists skip_onboarding boolean default false;

comment on column public.profiles.skip_onboarding is 'If true, user can skip onboarding (for admins)';
