-- Add new fields to freelancer_profiles table for onboarding
alter table public.freelancer_profiles
  add column if not exists birth_date date,
  add column if not exists nationality text,
  add column if not exists address text,
  add column if not exists phone text,
  add column if not exists max_travel_time integer, -- in minutes
  add column if not exists profile_completed boolean default false;

-- Add comment for clarity
comment on column public.freelancer_profiles.max_travel_time is 'Maximum travel time in minutes for missions';
comment on column public.freelancer_profiles.distance_limit is 'Maximum distance in kilometers for missions';
comment on column public.freelancer_profiles.profile_completed is 'Indicates if the freelancer has completed their onboarding';
