-- Fix storage bucket policies for avatars and banners
-- This script creates the necessary RLS policies for storage buckets

-- First, let's check if the buckets exist and create them if they don't
-- Note: Bucket creation needs to be done through the Supabase dashboard or with service role key

-- Create RLS policies for avatars bucket
-- Allow authenticated users to upload their own avatar files
CREATE POLICY "Users can upload their own avatar files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own avatar files
CREATE POLICY "Users can update their own avatar files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own avatar files
CREATE POLICY "Users can delete their own avatar files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to avatar files
CREATE POLICY "Avatar files are publicly readable" ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- Create RLS policies for banners bucket
-- Allow authenticated users to upload their own banner files
CREATE POLICY "Users can upload their own banner files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'banners' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to update their own banner files
CREATE POLICY "Users can update their own banner files" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'banners' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to delete their own banner files
CREATE POLICY "Users can delete their own banner files" ON storage.objects
FOR DELETE USING (
  bucket_id = 'banners' 
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow public read access to banner files
CREATE POLICY "Banner files are publicly readable" ON storage.objects
FOR SELECT USING (bucket_id = 'banners');

-- Alternative simpler policies if the above don't work
-- These are more permissive but should work for development

-- Drop existing policies if they exist (optional)
-- DROP POLICY IF EXISTS "Users can upload their own avatar files" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can update their own avatar files" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can delete their own avatar files" ON storage.objects;
-- DROP POLICY IF EXISTS "Avatar files are publicly readable" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can upload their own banner files" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can update their own banner files" ON storage.objects;
-- DROP POLICY IF EXISTS "Users can delete their own banner files" ON storage.objects;
-- DROP POLICY IF EXISTS "Banner files are publicly readable" ON storage.objects;

-- Simpler policies for development (more permissive)
-- CREATE POLICY "Allow authenticated users to upload to avatars" ON storage.objects
-- FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- CREATE POLICY "Allow authenticated users to update avatars" ON storage.objects
-- FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- CREATE POLICY "Allow authenticated users to delete avatars" ON storage.objects
-- FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- CREATE POLICY "Allow public read access to avatars" ON storage.objects
-- FOR SELECT USING (bucket_id = 'avatars');

-- CREATE POLICY "Allow authenticated users to upload to banners" ON storage.objects
-- FOR INSERT WITH CHECK (bucket_id = 'banners' AND auth.role() = 'authenticated');

-- CREATE POLICY "Allow authenticated users to update banners" ON storage.objects
-- FOR UPDATE USING (bucket_id = 'banners' AND auth.role() = 'authenticated');

-- CREATE POLICY "Allow authenticated users to delete banners" ON storage.objects
-- FOR DELETE USING (bucket_id = 'banners' AND auth.role() = 'authenticated');

-- CREATE POLICY "Allow public read access to banners" ON storage.objects
-- FOR SELECT USING (bucket_id = 'banners');
