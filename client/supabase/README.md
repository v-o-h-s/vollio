# Supabase Setup Guide

This directory contains the database schema, storage policies, and Row Level Security (RLS) configuration for the PDF annotation application with Clerk authentication integration.

## Prerequisites

1. Supabase project created

2. Environment variables set in `.env.local`
3. Understanding of Row Level Security (RLS) concepts

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

### 4. Environment Variables

Ensure these variables are set in `.env.local`:

```env
# Supabase
PROJECT_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key


```

## Verification

After setup, you can verify the configuration by:

1. Checking that tables exist in Supabase Dashboard → Table Editor
2. Verifying RLS policies are active
3. Confirming storage bucket exists with proper policies
4. Testing Clerk JWT template generates valid tokens

## Database Schema

### Tables

- `pdfs`: Stores PDF file metadata with RLS policies for user isolation
- `user_activity`: Tracks user interactions with PDFs (view, upload, delete)
- `annotations`: Stores PDF annotations with coordinates and content (future)

### Functions

- `auth.uid()`: Supabase Auth function to get current user ID

### Row Level Security (RLS)

All tables have RLS enabled with policies that automatically filter data by user:

```sql
-- Example RLS policy for pdfs table
CREATE POLICY "Users can only access their own PDFs" ON pdfs
FOR ALL USING (user_id = auth.uid());
```

### Storage

- `pdfs` bucket: Private storage for PDF files with user-based access control
- Signed URLs with configurable expiration (default: 1 hour)
- Automatic file organization by user ID

## API Integration

### Supabase Helper Functions

The application includes comprehensive helper functions in `lib/utils/supabase-helpers.ts`:

- **Error Handling**: `mapSupabaseError()` - Converts Supabase errors to application error types
- **Retry Logic**: `withRetry()` - Implements exponential backoff for failed operations
- **File Validation**: `validateFile()` - Comprehensive PDF validation with security checks
- **Signed URLs**: `generateSignedUrl()` - Creates time-limited file access URLs
- **Type Guards**: `isPDFRow()`, `isUserActivityRow()` - Runtime type validation

### API Endpoints

- `POST /api/pdfs/upload` - Upload PDF with validation and metadata storage
- `GET /api/pdfs` - List user's PDFs with signed URLs and recent activity
- `GET /api/pdfs/[id]` - Get individual PDF with fresh signed URL and activity tracking
- `DELETE /api/pdfs/[id]` - Delete PDF from storage and database
