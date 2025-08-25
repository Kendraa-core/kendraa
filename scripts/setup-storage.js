#!/usr/bin/env node

/**
 * Supabase Storage Setup Script for Kendraa
 * 
 * This script helps you set up the required storage buckets in Supabase.
 * Run this script after configuring your Supabase credentials.
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Check for required environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  console.error('\nPlease check your .env.local file and ensure these variables are set.');
  process.exit(1);
}

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorageBuckets() {
  console.log('🚀 Setting up Supabase storage buckets for Kendraa...\n');

  const buckets = [
    {
      name: 'avatars',
      public: true,
      fileSizeLimit: 5242880, // 5MB
      allowedMimeTypes: ['image/*']
    },
    {
      name: 'banners',
      public: true,
      fileSizeLimit: 10485760, // 10MB
      allowedMimeTypes: ['image/*']
    }
  ];

  for (const bucketConfig of buckets) {
    try {
      console.log(`📦 Creating bucket: ${bucketConfig.name}`);
      
      // Create bucket
      const { data: bucket, error: createError } = await supabase.storage.createBucket(
        bucketConfig.name,
        {
          public: bucketConfig.public,
          fileSizeLimit: bucketConfig.fileSizeLimit,
          allowedMimeTypes: bucketConfig.allowedMimeTypes
        }
      );

      if (createError) {
        if (createError.message.includes('already exists')) {
          console.log(`   ✅ Bucket '${bucketConfig.name}' already exists`);
        } else {
          console.error(`   ❌ Error creating bucket '${bucketConfig.name}':`, createError.message);
          continue;
        }
      } else {
        console.log(`   ✅ Bucket '${bucketConfig.name}' created successfully`);
      }

      // Set up RLS policies
      console.log(`   🔐 Setting up policies for '${bucketConfig.name}'`);
      
      // Policy 1: Allow authenticated users to upload
      const { error: uploadPolicyError } = await supabase.rpc('create_storage_policy', {
        bucket_name: bucketConfig.name,
        policy_name: `Allow authenticated users to upload ${bucketConfig.name}`,
        policy_definition: `(auth.uid()::text = (storage.foldername(name))[1])`,
        target_roles: ['authenticated']
      });

      if (uploadPolicyError) {
        console.log(`   ⚠️  Upload policy already exists or error: ${uploadPolicyError.message}`);
      } else {
        console.log(`   ✅ Upload policy created for '${bucketConfig.name}'`);
      }

      // Policy 2: Allow public to view
      const { error: viewPolicyError } = await supabase.rpc('create_storage_policy', {
        bucket_name: bucketConfig.name,
        policy_name: `Allow public to view ${bucketConfig.name}`,
        policy_definition: 'true',
        target_roles: ['public']
      });

      if (viewPolicyError) {
        console.log(`   ⚠️  View policy already exists or error: ${viewPolicyError.message}`);
      } else {
        console.log(`   ✅ View policy created for '${bucketConfig.name}'`);
      }

    } catch (error) {
      console.error(`   ❌ Error setting up bucket '${bucketConfig.name}':`, error.message);
    }
  }

  console.log('\n🎉 Storage setup completed!');
  console.log('\n📋 Manual verification steps:');
  console.log('1. Go to your Supabase dashboard');
  console.log('2. Navigate to Storage section');
  console.log('3. Verify that "avatars" and "banners" buckets exist');
  console.log('4. Check that both buckets are marked as "Public"');
  console.log('5. Verify RLS policies are active');
  console.log('\n🔗 Dashboard URL:', `${supabaseUrl.replace('/rest/v1', '')}/storage`);
}

// Run the setup
setupStorageBuckets().catch(console.error);
