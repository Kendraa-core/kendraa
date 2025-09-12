-- =====================================================
-- COMPLETE INSTITUTIONS TABLE SCHEMA
-- =====================================================
-- This schema includes ALL fields used in the institution onboarding
-- Run this in your Supabase SQL editor to fix all PGRST204 errors

-- Drop existing table if it exists (be careful with this in production!)
-- DROP TABLE IF EXISTS institutions CASCADE;

-- Create the complete institutions table with ALL required fields
CREATE TABLE IF NOT EXISTS institutions (
  -- Primary key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- Basic institution information (existing fields)
  name TEXT NOT NULL,
  description TEXT,
  type TEXT DEFAULT 'hospital',
  location TEXT,
  website TEXT,
  phone TEXT,
  
  -- Additional fields that are MISSING and causing errors
  established_year INTEGER,
  size TEXT,
  admin_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  verified BOOLEAN DEFAULT false,
  
  -- NEW FIELDS from onboarding (these are causing PGRST204 errors)
  short_tagline TEXT,
  accreditation TEXT,
  logo_url TEXT,
  banner_url TEXT,
  theme_color TEXT DEFAULT '#007fff',
  short_description TEXT,
  social_media_links JSONB,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_institutions_admin_user_id ON institutions(admin_user_id);
CREATE INDEX IF NOT EXISTS idx_institutions_type ON institutions(type);
CREATE INDEX IF NOT EXISTS idx_institutions_verified ON institutions(verified);
CREATE INDEX IF NOT EXISTS idx_institutions_name ON institutions(name);

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
-- Enable RLS
ALTER TABLE institutions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON institutions;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON institutions;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON institutions;

-- Create RLS policies
CREATE POLICY "Enable read access for authenticated users" ON institutions
  FOR SELECT USING (auth.uid() = admin_user_id OR verified = true);

CREATE POLICY "Enable insert for authenticated users" ON institutions
  FOR INSERT WITH CHECK (auth.uid() = admin_user_id);

CREATE POLICY "Enable update for authenticated users" ON institutions
  FOR UPDATE USING (auth.uid() = admin_user_id)
  WITH CHECK (auth.uid() = admin_user_id);

-- =====================================================
-- AUTO-UPDATE TRIGGER
-- =====================================================
-- Create function to automatically update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS update_institutions_updated_at ON institutions;

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_institutions_updated_at 
  BEFORE UPDATE ON institutions 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- PERMISSIONS
-- =====================================================
-- Grant necessary permissions
GRANT ALL ON institutions TO authenticated;
GRANT ALL ON institutions TO service_role;

-- =====================================================
-- FIELD MAPPING REFERENCE
-- =====================================================
-- Form Data → Database Columns:
-- 
-- Basic Info:
--   institutionName → name
--   shortTagline → short_tagline (NEW)
-- 
-- Institution Details:
--   institutionType → type (converted to slug)
--   establishmentYear → established_year (NEW, converted to integer)
--   accreditation → accreditation (NEW)
-- 
-- Branding:
--   logoUrl → logo_url (NEW)
--   bannerUrl → banner_url (NEW)
--   themeColor → theme_color (NEW)
-- 
-- About Institution:
--   shortDescription → short_description (NEW - this was causing the error!)
--   detailedDescription → description
--   website → website
--   socialMediaLinks → social_media_links (NEW, stored as JSONB)
--   headquarters → location
--   employeeCount → size (NEW)
--   contactEmail → email (NEW)
--   contactPhone → phone
-- 
-- System Fields:
--   admin_user_id → admin_user_id (NEW)
--   verified → verified (NEW, defaults to false)
--   created_at → created_at (NEW, auto-generated)
--   updated_at → updated_at (NEW, auto-updated)

-- =====================================================
-- VERIFICATION QUERY
-- =====================================================
-- Run this after creating the table to verify all columns exist:
-- SELECT column_name, data_type, is_nullable 
-- FROM information_schema.columns 
-- WHERE table_name = 'institutions' 
-- ORDER BY ordinal_position;
