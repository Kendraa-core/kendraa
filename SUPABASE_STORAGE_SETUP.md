# Supabase Storage Setup Guide for Kendraa

This guide will help you set up the required storage buckets in Supabase for the Kendraa application.

## Prerequisites

1. Access to your Supabase project dashboard
2. Admin permissions for your Supabase project

## Required Storage Buckets

The Kendraa application requires two storage buckets:

1. **`avatars`** - For user profile pictures
2. **`banners`** - For user profile banner images

## Step-by-Step Setup

### 1. Access Supabase Dashboard

1. Go to [supabase.com](https://supabase.com)
2. Sign in to your account
3. Select your Kendraa project

### 2. Navigate to Storage

1. In the left sidebar, click on **"Storage"**
2. You'll see the storage management interface

### 3. Create the `avatars` Bucket

1. Click **"Create a new bucket"**
2. Fill in the details:
   - **Name**: `avatars`
   - **Public bucket**: ✅ **Check this box** (Important!)
   - **File size limit**: `5 MB` (or your preferred limit)
   - **Allowed MIME types**: `image/*`
3. Click **"Create bucket"**

### 4. Create the `banners` Bucket

1. Click **"Create a new bucket"** again
2. Fill in the details:
   - **Name**: `banners`
   - **Public bucket**: ✅ **Check this box** (Important!)
   - **File size limit**: `10 MB` (or your preferred limit)
   - **Allowed MIME types**: `image/*`
3. Click **"Create bucket"**

### 5. Configure Bucket Policies

For each bucket (`avatars` and `banners`), you need to set up Row Level Security (RLS) policies:

#### For the `avatars` bucket:

1. Click on the `avatars` bucket
2. Go to the **"Policies"** tab
3. Click **"New Policy"**
4. Choose **"Create a policy from scratch"**
5. Configure the policy:

**Policy Name**: `Allow authenticated users to upload avatars`
**Target roles**: `authenticated`
**Using policy definition**:
```sql
(auth.uid()::text = (storage.foldername(name))[1])
```

**Policy Name**: `Allow public to view avatars`
**Target roles**: `public`
**Using policy definition**:
```sql
true
```

#### For the `banners` bucket:

1. Click on the `banners` bucket
2. Go to the **"Policies"** tab
3. Click **"New Policy"**
4. Choose **"Create a policy from scratch"**
5. Configure the policy:

**Policy Name**: `Allow authenticated users to upload banners`
**Target roles**: `authenticated`
**Using policy definition**:
```sql
(auth.uid()::text = (storage.foldername(name))[1])
```

**Policy Name**: `Allow public to view banners`
**Target roles**: `public`
**Using policy definition**:
```sql
true
```

## Alternative: Quick Setup Script

If you have access to the Supabase CLI, you can run this script:

```bash
# Install Supabase CLI if you haven't already
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF

# Create buckets and policies
supabase db push
```

## Verification

After setting up the buckets, you can verify they're working:

1. Go to your Kendraa application
2. Try to upload a profile picture or banner
3. Check that the upload succeeds
4. Verify the image is accessible via the public URL

## Troubleshooting

### Common Issues:

1. **"Bucket not found" error**:
   - Make sure the bucket names are exactly `avatars` and `banners`
   - Check that the buckets are created in the correct project

2. **"Access denied" error**:
   - Verify that the buckets are set as public
   - Check that the RLS policies are correctly configured

3. **"File too large" error**:
   - Increase the file size limit in the bucket settings
   - Check that the file is within the allowed size

4. **"Invalid file type" error**:
   - Verify that the MIME types include `image/*`
   - Check that the uploaded file is actually an image

### Debug Steps:

1. Check the browser console for detailed error messages
2. Verify bucket names in the code match the actual bucket names
3. Test bucket access through the Supabase dashboard
4. Check RLS policies are active and correctly configured

## Security Considerations

- The buckets are set to public for viewing, which is necessary for displaying profile images
- Upload is restricted to authenticated users only
- Files are organized by user ID to prevent unauthorized access
- Consider implementing additional validation on the server side

## Support

If you encounter issues:

1. Check the Supabase documentation: [supabase.com/docs](https://supabase.com/docs)
2. Review the error messages in the browser console
3. Verify all steps in this guide have been completed
4. Check that your Supabase project has the correct configuration

---

**Note**: This setup is required for the profile image upload functionality to work correctly in the Kendraa application.
