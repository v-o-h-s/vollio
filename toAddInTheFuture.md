# Backend Integration TODO

## Current State vs Production Requirements

### 🚨 Current Implementation (Prototype Only)

The current PDF upload system uses **client-side blob URLs** for immediate viewing:

```tsx
// ❌ Current approach - prototype only
const fileUrl = URL.createObjectURL(file); // Creates blob:// URL
```

**Limitations:**

- Files are lost on page refresh
- No persistence across sessions
- No user management
- No server-side validation
- No file sharing capabilities

### ✅ Required Production Implementation

#### 1. Server Upload Endpoint

Create `/app/api/pdfs/upload/route.ts`:

```tsx
import { auth } from "@clerk/nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = auth();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("pdf") as File;

    // Server-side validation
    if (!file || file.type !== "application/pdf") {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    if (file.size > 50 * 1024 * 1024) {
      // 50MB limit
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    // Upload to cloud storage (choose one):

    // Option A: AWS S3
    const s3Key = `pdfs/${userId}/${Date.now()}-${file.name}`;
    const uploadResult = await s3
      .upload({
        Bucket: process.env.AWS_S3_BUCKET,
        Key: s3Key,
        Body: await file.arrayBuffer(),
        ContentType: "application/pdf",
      })
      .promise();

    // Option B: Vercel Blob (simpler for Vercel deployments)
    const blob = await put(`pdfs/${userId}/${Date.now()}-${file.name}`, file, {
      access: "public",
      contentType: "application/pdf",
    });

    // Save to database
    const pdfDocument = await db.pdfDocument.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        filename: file.name,
        fileUrl: uploadResult.Location, // or blob.url for Vercel Blob
        fileSize: file.size,
        uploadedAt: new Date(),
      },
    });

    return NextResponse.json({ pdfDocument });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
```

#### 2. Update Client Upload Logic

Modify `handleFileUpload` in `app/dashboard/pdf-notes/page.tsx`:

```tsx
const handleFileUpload = useCallback(
  async (file: File) => {
    setUploadError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Client-side validation first
      const error = validateFile(file);
      if (error) {
        setUploadError(error);
        return;
      }

      // Create FormData for server upload
      const formData = new FormData();
      formData.append("pdf", file);

      // Upload to server with progress tracking
      const response = await fetch("/api/pdfs/upload", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Upload failed");
      }

      const { pdfDocument } = await response.json();

      // Update Redux store with server response
      dispatch(setPdfDocument(pdfDocument));

      // Show success notification
      pdfNotifications.uploadSuccess(file.name);
    } catch (error) {
      console.error("Upload error:", error);
      setUploadError({
        type: "general",
        message: error.message || "Failed to upload PDF",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  },
  [dispatch]
);
```

#### 3. Database Schema

Set up database tables (PostgreSQL recommended):

```sql
-- PDF Documents table
CREATE TABLE pdf_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id VARCHAR NOT NULL,
  filename VARCHAR NOT NULL,
  file_url VARCHAR NOT NULL,
  file_size INTEGER NOT NULL,
  mime_type VARCHAR DEFAULT 'application/pdf',
  uploaded_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Annotations table
CREATE TABLE annotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pdf_id UUID REFERENCES pdf_documents(id) ON DELETE CASCADE,
  user_id VARCHAR NOT NULL,
  selected_text TEXT NOT NULL,
  note_content TEXT NOT NULL,
  page_number INTEGER NOT NULL,
  coordinates JSONB NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_pdf_documents_user_id ON pdf_documents(user_id);
CREATE INDEX idx_pdf_documents_created_at ON pdf_documents(created_at DESC);
CREATE INDEX idx_annotations_pdf_id ON annotations(pdf_id);
CREATE INDEX idx_annotations_user_id ON annotations(user_id);
```

#### 4. Environment Variables

Add to `.env.local`:

```bash
# Database
DATABASE_URL="postgresql://..."

# AWS S3 (if using S3)
AWS_ACCESS_KEY_ID="..."
AWS_SECRET_ACCESS_KEY="..."
AWS_S3_BUCKET="noto-pdfs"
AWS_REGION="us-east-1"

# Vercel Blob (if using Vercel Blob)
BLOB_READ_WRITE_TOKEN="..."

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="..."
CLERK_SECRET_KEY="..."
```

#### 5. Additional API Endpoints Needed

```
/api/pdfs/
├── upload/              # POST - Upload new PDF ✅ (above)
├── list/               # GET - List user's PDFs
├── [id]/               # GET - Get PDF metadata
├── [id]/delete/        # DELETE - Remove PDF
└── [id]/annotations/
    ├── GET             # List annotations for PDF
    ├── POST            # Create new annotation
    └── [annotationId]/
        ├── GET         # Get specific annotation
        ├── PUT         # Update annotation
        └── DELETE      # Delete annotation
```

## 🚀 Implementation Priority

### Phase 1: Basic Server Upload (High Priority)

1. ✅ Create upload API endpoint
2. ✅ Set up cloud storage (AWS S3 or Vercel Blob)
3. ✅ Update client upload logic
4. ✅ Add database schema
5. ✅ Test upload workflow

### Phase 2: PDF Management (Medium Priority)

1. Create PDF listing API
2. Add PDF deletion functionality
3. Implement user authentication checks
4. Add PDF metadata display

### Phase 3: Enhanced Features (Low Priority)

1. Upload progress tracking
2. PDF thumbnail generation
3. File type validation improvements
4. Bulk upload support

## 🔧 Quick Start Guide

### Option A: Using Vercel Blob (Recommended for Vercel deployments)

1. Install Vercel Blob:

```bash
npm install @vercel/blob
```

2. Add environment variable:

```bash
BLOB_READ_WRITE_TOKEN="your_token_here"
```

3. Use in upload endpoint:

```tsx
import { put } from "@vercel/blob";

const blob = await put(`pdfs/${userId}/${Date.now()}-${file.name}`, file, {
  access: "public",
  contentType: "application/pdf",
});
// blob.url is your permanent URL
```

### Option B: Using AWS S3

1. Install AWS SDK:

```bash
npm install aws-sdk
```

2. Configure AWS credentials in environment variables

3. Use in upload endpoint:

```tsx
import AWS from "aws-sdk";

const s3 = new AWS.S3();
const uploadResult = await s3
  .upload({
    Bucket: process.env.AWS_S3_BUCKET,
    Key: `pdfs/${userId}/${Date.now()}-${file.name}`,
    Body: await file.arrayBuffer(),
    ContentType: "application/pdf",
  })
  .promise();
// uploadResult.Location is your permanent URL
```

## 📝 Testing Checklist

- [ ] File upload works with authentication
- [ ] Large files (up to 50MB) upload successfully
- [ ] Invalid file types are rejected
- [ ] File size limits are enforced
- [ ] Uploaded PDFs display correctly in viewer
- [ ] Blob URLs are cleaned up properly
- [ ] Error handling works for network failures
- [ ] Database records are created correctly
- [ ] User can only access their own PDFs

---

**Note**: The current blob URL implementation should be considered temporary for development/prototype purposes only. Production deployment requires proper server-side file handling for security, persistence, and scalability.
