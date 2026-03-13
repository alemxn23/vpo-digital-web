-- ============================================================
-- VPO Digital — Supabase Migration
-- Run this in Supabase > SQL Editor (one time only)
-- ============================================================

-- 1. Add cedula_profesional (unique per doctor, prevents duplicate accounts)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS cedula_profesional TEXT UNIQUE;

-- 2. Add plan_type ('free' = default, 'unlimited' = VIP)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS plan_type TEXT NOT NULL DEFAULT 'free';

-- 3. Add index for fast cedula lookups
CREATE UNIQUE INDEX IF NOT EXISTS idx_profiles_cedula
  ON public.profiles (cedula_profesional)
  WHERE cedula_profesional IS NOT NULL;

-- 4. Grant VIP to a specific user by email
-- (Replace the email with the actual VIP user's email)
-- UPDATE public.profiles
--   SET plan_type = 'unlimited'
--   WHERE id = (SELECT id FROM auth.users WHERE email = 'mcfidel98@gmail.com');

-- ============================================================
-- OPTIONAL: Enable Google OAuth in Supabase Dashboard
-- Go to: Authentication > Providers > Google
-- Paste your Google Client ID and Client Secret
-- Add these redirect URIs in Google Cloud Console:
--   https://vpo.mx/auth/callback
--   https://www.vpo.mx/auth/callback
--   https://tozvtcjvzvxwcpmwyzhw.supabase.co/auth/v1/callback
--   http://localhost:5173 (solo para desarrollo local)
-- ============================================================
