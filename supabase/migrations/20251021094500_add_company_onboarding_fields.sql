-- Add new fields to company_profiles table for onboarding
alter table public.company_profiles
  add column if not exists activity text, -- Enseigne ou activité
  add column if not exists mission_types text[], -- Type de missions offertes
  add column if not exists special_requirements text, -- Exigences particulières
  add column if not exists location text, -- Localisation
  add column if not exists profile_completed boolean default false;

-- Add comments for clarity
comment on column public.company_profiles.activity is 'Company activity or brand name';
comment on column public.company_profiles.mission_types is 'Types of missions offered by the company';
comment on column public.company_profiles.special_requirements is 'Special requirements and skills needed';
comment on column public.company_profiles.location is 'Company location';
comment on column public.company_profiles.profile_completed is 'Indicates if the company has completed their onboarding';
