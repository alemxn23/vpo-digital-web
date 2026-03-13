-- ============================================================
-- Migration: Doctor Profile & Medical Verification System
-- Run this in Supabase SQL Editor (Settings > SQL Editor)
-- ============================================================

-- 1. Add new columns to the profiles table
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'unverified',
  ADD COLUMN IF NOT EXISTS ine_url TEXT,
  ADD COLUMN IF NOT EXISTS selfie_url TEXT;

-- 2. Add a check constraint for verification_status values
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS chk_verification_status;

ALTER TABLE public.profiles
  ADD CONSTRAINT chk_verification_status
  CHECK (verification_status IN ('unverified', 'pending', 'approved', 'rejected'));

-- 3. Create a Storage bucket for INE + selfie uploads
-- (Run this block separately if it fails — buckets are managed separately)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'ine-comprobantes',
  'ine-comprobantes',
  FALSE,  -- private bucket
  10485760,  -- 10 MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO NOTHING;

-- 4. Storage RLS Policies for the bucket
-- Allow authenticated users to upload to their own folder
DROP POLICY IF EXISTS "Users can upload their own INE" ON storage.objects;
CREATE POLICY "Users can upload their own INE"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'ine-comprobantes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to read their own files
DROP POLICY IF EXISTS "Users can view their own INE" ON storage.objects;
CREATE POLICY "Users can view their own INE"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'ine-comprobantes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- Allow users to update/replace their own files
DROP POLICY IF EXISTS "Users can update their own INE" ON storage.objects;
CREATE POLICY "Users can update their own INE"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'ine-comprobantes'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 5. (OPTIONAL) Admin view: see all pending verifications
-- Create a view so admins can easily review pending doctors
CREATE OR REPLACE VIEW public.pending_verifications AS
  SELECT
    p.id,
    p.full_name,
    p.cedula_profesional,
    p.verification_status,
    p.ine_url,
    p.selfie_url,
    u.email,
    u.created_at
  FROM public.profiles p
  JOIN auth.users u ON p.id = u.id
  WHERE p.verification_status = 'pending'
  ORDER BY u.created_at DESC;

-- 6. Function to approve or reject a doctor (admin use)
-- Call: SELECT approve_doctor('user-uuid-here');
CREATE OR REPLACE FUNCTION public.approve_doctor(doctor_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET
    verified = TRUE,
    verification_status = 'approved'
  WHERE id = doctor_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.reject_doctor(doctor_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles
  SET
    verified = FALSE,
    verification_status = 'rejected'
  WHERE id = doctor_id;
END;
$$;

-- ============================================================
-- HOW TO USE AS ADMIN:
--
-- 1. See all pending verifications:
--    SELECT * FROM public.pending_verifications;
--
-- 2. Verify a doctor manually (after checking SEP + INE):
--    SELECT approve_doctor('paste-user-uuid-here');
--
-- 3. Reject a doctor:
--    SELECT reject_doctor('paste-user-uuid-here');
--
-- 4. To find a user's UUID by email:
--    SELECT id FROM auth.users WHERE email = 'doctor@example.com';
-- ============================================================
