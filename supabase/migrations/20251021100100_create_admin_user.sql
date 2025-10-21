-- NOTE: This migration creates an admin user directly in the database
-- WARNING: In production, you should create the user through Supabase Auth UI
-- and then update their profile role to 'admin'

-- For development/testing, you can manually create the user in Supabase Auth Dashboard:
-- 1. Go to Authentication > Users in Supabase Dashboard
-- 2. Click "Add User"
-- 3. Email: admin@admin.com
-- 4. Password: admin
-- 5. Confirm the user (disable email confirmation if needed)
-- 6. Copy the user ID

-- Then run this to set the user as admin (replace USER_ID with actual UUID):
-- UPDATE auth.users SET email_confirmed_at = now() WHERE email = 'admin@admin.com';
-- INSERT INTO public.profiles (id, email, name, role, skip_onboarding)
-- VALUES ('USER_ID', 'admin@admin.com', 'Administrator', 'admin', true);

-- Alternative: Use Supabase Auth API to create the user programmatically
-- This is a placeholder comment explaining the process

COMMENT ON TABLE public.profiles IS 'To create admin user:
1. Create user via Supabase Auth Dashboard (email: admin@admin.com, password: admin)
2. Get the user UUID from auth.users
3. Insert profile: INSERT INTO public.profiles (id, email, name, role, skip_onboarding) VALUES (''USER_UUID'', ''admin@admin.com'', ''Administrator'', ''admin'', true)';
