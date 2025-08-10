# Supabase Setup Guide

This directory contains the database schema and storage policies for the PDF annotation application.

## Prerequisites

1. Supabase project created
2. Clerk authentication configured
3. Environment variables set in `.env.local`

## Setup Steps

### 1. Database Schema Setup

Run the migration file in your Supabase SQL editor:

```sql
-- Copy and paste the contents of migrations/001_initial_schema.sql
-- into the Supabase SQL editor and execute
```

### 2. Storage Bucket Setup

1. Go to Supabase Dashboard → Storage
2. Create a new bucket named `pdfs` (private)
3. Run the storage policy SQL in the SQL editor:

```sql
-- Copy and paste the contents of storage/pdfs_bucket_policy.sql
-- into the Supabase SQL editor and execute
```

### 3. Clerk Integration Setup

1. In Clerk Dashboard, go to JWT Templates
2. Create a new template named "supabase"
3. Use this configuration:

```json
{
  "aud": "authenticated",
  "exp": "{{exp}}",
  "iat": "{{iat}}",
  "iss": "https://sgihxxokwpsahogqrlla.supabase.co/auth/v1",
  "sub": "{{user.id}}",
  "email": "{{user.primary_email_address.email_address}}",
  "phone": "{{user.primary_phone_number.phone_number}}",
  "app_metadata": {
    "provider": "clerk",
    "providers": ["clerk"]
  },
  "user_metadata": {
    "user_id": "{{user.id}}"
  }
}
```

### 4. Environment Variables

Ensure these variables are set in `.env.local`:

```env
# Supabase
PROJECT_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key

# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-publishable-key
CLERK_SECRET_KEY=your-secret-key
```

## Verification

After setup, you can verify the configuration by:

1. Checking that tables exist in Supabase Dashboard → Table Editor
2. Verifying RLS policies are active
3. Confirming storage bucket exists with proper policies
4. Testing Clerk JWT template generates valid tokens

## Database Schema

### Tables

- `pdfs`: Stores PDF file metadata
- `user_activity`: Tracks user interactions with PDFs

### Functions

- `requesting_user_id()`: Extracts Clerk user ID from JWT for RLS policies

### Storage

- `pdfs` bucket: Private storage for PDF files with user-based access control
