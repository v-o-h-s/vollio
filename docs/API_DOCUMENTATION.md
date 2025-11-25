# Noto PDF Annotation API Documentation

This document describes the comprehensive API endpoints for the Noto PDF annotation application with complete Supabase backend integration. All API interactions use RTK Query mutations and queries for consistency, caching, and automatic error handling.

## 🚀 Current Status: Production Ready ✅

The Noto API is fully implemented and production-ready with:
- **Complete CRUD Operations**: All core endpoints (PDFs, Notes, Annotations, Highlights, Folders)
- **Advanced Features**: Document processing, vector search, highlight management
- **Security**: JWT authentication, RLS policies, comprehensive validation
- **Error Handling**: 8-category error classification with proper status codes and user-friendly messages
- **Logging**: Comprehensive request/response logging with emoji indicators
- **Performance**: Rate limiting, caching, optimized queries

## Authentication

All endpoints require Clerk authentication with JWT tokens. The `userId` is automatically extracted from the authenticated session and used for Row Level Security (RLS) in Supabase.

## Error Handling

### Error Categories

All endpoints use a consistent 8-category error handling system:

1. **AuthError** (401/403) - Authentication and authorization failures
2. **ValidationError** (400) - Invalid request data or schema validation failures
3. **DatabaseError** (500) - Supabase operation failures with automatic error code mapping
4. **FileError** (500) - File operation failures
5. **StorageError** (500) - Cloud storage operation failures
6. **NetworkError** (503) - Network connectivity issues
7. **AIError** (500) - AI service failures
8. **GeneralError** (500) - Unexpected or internal server errors

### Error Response Format

All error responses follow a consistent format:

```json
{
  "success": false,
  "errorType": "AUTH_ERROR",
  "errorSubType": "AUTHENTICATION_REQUIRED",
  "error": {
    "userMessage": "User must be authenticated to perform this operation",
    "message": "User authentication failed",
    "severity": "HIGH",
    "timestamp": "2025-11-18T14:30:45.000Z",
    "actionLabel": "Sign In",
    "statusCode": 401,
    "context": {
      "operation": "fetch_user_folders",
      "userId": null
    }
  }
}
```

### Common HTTP Status Codes

- **200** - Successful GET/POST/PUT request
- **201** - Successful resource creation
- **400** - Bad request or validation error
- **401** - Unauthorized (authentication required)
- **403** - Forbidden (insufficient permissions)
- **404** - Resource not found
- **409** - Conflict (duplicate value or constraint violation)
- **429** - Too many requests (rate limited)
- **500** - Internal server error
- **503** - Service unavailable

## Client Integration

**Important**: Always use RTK Query for API calls instead of direct fetch requests. This ensures consistent caching, loading states, and error handling across the application.

```typescript
// Preferred: Use RTK Query
import { useGetNotesQuery, useCreateNoteMutation } from '@/lib/store/apiSlice';

const { data: notes, isLoading, error } = useGetNotesQuery();
const [createNote] = useCreateNoteMutation();

// Avoid: Direct fetch calls
// const response = await fetch('/api/notes');
```

## Request Validation

All POST and PUT endpoints validate request data using Zod schemas before processing. Validation happens automatically via the `withValidation` wrapper middleware.

### Validation Error Response Format

When validation fails, the response includes detailed information about which fields failed and why:

```json
{
  "success": false,
  "errorType": "VALIDATION_ERROR",
  "error": {
    "userMessage": "Invalid request data. Please check the errors and try again",
    "message": "Validation failed for request body: name is required; name must be between 1 and 255 characters",
    "statusCode": 400,
    "context": {
      "operation": "create_folder",
      "validationErrors": [
        {
          "path": "name",
          "message": "Required",
          "code": "too_small"
        },
        {
          "path": "color",
          "message": "Invalid enum value",
          "code": "invalid_enum_value"
        }
      ]
    }
  }
}
```

### Common Validation Errors

- **Field Required** (400): A required field is missing
- **Field Too Long** (400): String exceeds maximum length
- **Field Too Short** (400): String is below minimum length
- **Invalid Format** (400): Field value doesn't match expected format (email, UUID, color, etc.)
- **Invalid Enum** (400): Value not in allowed options list
- **Duplicate Value** (409): Unique constraint violation (e.g., folder name already exists)
- **Invalid File** (400): Uploaded file has invalid type or size

## API Endpoint Patterns

### Modern Endpoint Pattern with Validation & Error Handling

All modern API endpoints follow this standardized pattern combining validation and error handling:

```typescript
import { withValidatedHandler } from '@/lib/wrappers/withErrorHandling';
import { createFolderSchema } from '@/lib/dto/folder';
import { Logger } from '@/lib/utils/logger';

async function handlePOST(req: NextRequest) {
  Logger.info('📂 Creating folder');
  
  // Auth check
  const { userId } = await auth();
  if (!userId) throw AuthError.authenticationRequired('Auth required', {});
  
  // Body already validated by wrapper - fully typed
  const body = await req.json();
  
  // Business logic validation only
  const existingFolder = await findFolder(body.name, userId);
  if (existingFolder) {
    throw ValidationError.duplicateValue('name', 'A folder with this name already exists', {
      userId,
      requestedName: body.name
    });
  }
  
  // Insert and return
  const folder = await createFolderInDB({ ...body, userId });
  Logger.success('✅ Folder created', { id: folder.id });
  
  return NextResponse.json({ success: true, data: folder });
}

export const POST = withValidatedHandler(createFolderSchema, handlePOST);
```

### Key Benefits of This Pattern

1. **Automatic Validation**: Schema validation runs before handler executes
2. **Typed Request Data**: Body data is fully typed from Zod schema
3. **Comprehensive Logging**: Request entry, validation, errors all logged with emojis
4. **Consistent Error Handling**: All 8 error types handled with proper status codes
5. **No Redundant Checks**: Wrapper handles field validation, handler handles business logic
6. **User-Friendly Messages**: Validation errors include helpful context for clients

## Core API Endpoints

### Folders API ✅ IMPLEMENTED

#### GET /api/folders
Get all folders for the authenticated user with hierarchical structure.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "folder_uuid",
      "userId": "user_123",
      "name": "Research Papers",
      "parentId": null,
      "createdAt": "2025-01-08T10:00:00.000Z",
      "updatedAt": "2025-01-08T10:00:00.000Z"
    }
  ]
}
```

#### POST /api/folders
Create a new folder with optional parent folder.

**Request Body:**
```json
{
  "name": "New Folder",
  "parentId": "parent_folder_uuid" // optional
}
```

#### PUT /api/folders/[id]
Update folder name or move to different parent.

#### DELETE /api/folders/[id]
Delete folder and optionally move contents to parent or root.

### Highlights API ✅ IMPLEMENTED

#### GET /api/highlights
Get all highlights for the authenticated user with filtering options.

**Query Parameters:**
- `pdfId` (optional): Filter highlights by PDF ID
- `type` (optional): Filter by highlight type (quick, comment, note)
- `page` (optional): Filter by page number

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "highlight_uuid",
      "userId": "user_123",
      "pdfId": "pdf_uuid",
      "noteId": "note_uuid",
      "content": "Selected text content",
      "title": "Highlight title",
      "color": "#FFFF00",
      "opacity": 0.4,
      "pageNumber": 1,
      "type": "quick",
      "textbounds": [
        {
          "x": 100,
          "y": 200,
          "width": 150,
          "height": 20
        }
      ],
      "createdAt": "2025-01-08T10:00:00.000Z",
      "updatedAt": "2025-01-08T10:00:00.000Z"
    }
  ]
}
```

#### POST /api/highlights
Create a new highlight with multi-mode support.

**Request Body:**
```json
{
  "pdfId": "pdf_uuid",
  "noteId": "note_uuid", // optional for quick highlights
  "content": "Selected text content",
  "title": "Highlight title", // optional
  "color": "#FFFF00",
  "opacity": 0.4,
  "pageNumber": 1,
  "type": "quick", // "quick" | "comment" | "note"
  "textbounds": [
    {
      "x": 100,
      "y": 200,
      "width": 150,
      "height": 20
    }
  ]
}
```

#### PUT /api/highlights/[id]
Update highlight properties (color, opacity, content).

#### DELETE /api/highlights/[id]
Delete a specific highlight by ID.

### Notes API ✅ IMPLEMENTED

#### GET /api/notes

Get all notes for the authenticated user.

**Query Parameters:**

- `limit` (optional): Maximum number of notes to return (default: 50)
- `offset` (optional): Number of notes to skip for pagination (default: 0)

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "note_1234567890_abc123",
      "userId": "user_123",
      "title": "My Note Title",
      "content": {
        "type": "doc",
        "content": [
          {
            "type": "paragraph",
            "content": [
              {
                "type": "text",
                "text": "Note content here..."
              }
            ]
          }
        ]
      },
      "createdAt": "2025-01-08T10:00:00.000Z",
      "updatedAt": "2025-01-08T10:00:00.000Z"
    }
  ]
}
```

#### POST /api/notes

Create a new note.

**Request Body:**

```json
{
  "title": "My Note Title",
  "content": {
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Note content here..."
          }
        ]
      }
    ]
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "note_1234567890_abc123",
    "userId": "user_123",
    "title": "My Note Title",
    "content": {
      "type": "doc",
      "content": [
        {
          "type": "paragraph",
          "content": [
            {
              "type": "text",
              "text": "Note content here..."
            }
          ]
        }
      ]
    },
    "createdAt": "2025-01-08T10:00:00.000Z",
    "updatedAt": "2025-01-08T10:00:00.000Z"
  }
}
```

#### PUT /api/notes/[id] ✅ IMPLEMENTED

Update an existing note with enhanced auto-save integration.

**Path Parameters:**
- `id`: The note ID

**Request Body:**
```json
{
  "title": "Updated Note Title",
  "content": {
    "type": "doc",
    "content": [
      {
        "type": "paragraph",
        "content": [
          {
            "type": "text",
            "text": "Updated note content..."
          }
        ]
      }
    ]
  }
}
```

**Features:**
- Auto-save integration with RTK Query
- Real-time status tracking
- Cross-tab synchronization
- Comprehensive error handling

#### DELETE /api/notes/[id] ✅ IMPLEMENTED

Delete a note with enhanced confirmation and cleanup.

**Path Parameters:**
- `id`: The note ID to delete

**Features:**
- Custom styled confirmation dialogs
- Loading states during deletion
- Automatic cleanup of related data
- Toast notifications for feedback
- Comprehensive error handling

### Annotations API ✅ IMPLEMENTED

#### GET /api/annotations
Get annotations for the authenticated user with enhanced filtering.

**Query Parameters:**
- `pdfId` (optional): Filter annotations by PDF ID
- `page` (optional): Filter annotations by page number
- `noteId` (optional): Filter annotations by linked note

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "annotation_uuid",
      "userId": "user_123",
      "pdfId": "pdf_uuid",
      "noteId": "note_uuid",
      "pageNumber": 1,
      "selectedText": "Selected text from PDF",
      "content": "User's annotation content",
      "coordinates": {
        "x": 100,
        "y": 200,
        "width": 150,
        "height": 20
      },
      "createdAt": "2025-01-08T10:00:00.000Z",
      "updatedAt": "2025-01-08T10:00:00.000Z"
    }
  ]
}
```

#### POST /api/annotations
Create a new annotation with enhanced coordinate handling.

**Request Body:**
```json
{
  "pdfId": "pdf_uuid",
  "noteId": "note_uuid",
  "pageNumber": 1,
  "selectedText": "Selected text from PDF",
  "content": "User's annotation content",
  "coordinates": {
    "x": 100,
    "y": 200,
    "width": 150,
    "height": 20
  }
}
```

**Features:**
- Automatic coordinate validation
- PDF-to-screen coordinate conversion
- Integration with highlight system
- Real-time cross-tab synchronization

#### PUT /api/annotations/[id]
Update annotation content with enhanced validation.

#### DELETE /api/annotations/[id]
Delete annotation with automatic cleanup of related highlights.

### PDF Management API

#### POST /api/pdfs/upload

Upload a new PDF file to Supabase Storage with comprehensive validation and error handling.

**Request:**

- Content-Type: `multipart/form-data`
- Body: FormData with `file` field containing the PDF

**Validation:**

- File must be PDF type (`application/pdf`)
- File size must be ≤ 50MB
- Comprehensive security validation (malicious pattern detection, filename sanitization)
- Rate limiting: 10 uploads per minute per user

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid-generated-id",
    "filename": "document.pdf",
    "fileSize": 1048576,
    "uploadedAt": "2025-01-08T10:00:00.000Z",
    "fileUrl": "https://supabase-signed-url",
    "storagePath": "user_123/1704708000000_document.pdf"
  }
}
```

**Error Responses:**

- `400` - File validation failed, invalid file type, or file too large
- `401` - User not authenticated
- `429` - Rate limit exceeded
- `500` - Storage or database error with cleanup

#### GET /api/pdfs

Get all PDFs for the authenticated user with recent activity and signed URLs.

**Query Parameters:**

- `limit` (optional): Maximum number of PDFs to return (default: 50)
- `offset` (optional): Number of PDFs to skip for pagination (default: 0)

**Response:**

```json
{
  "success": true,
  "data": {
    "pdfs": [
      {
        "id": "uuid-generated-id",
        "filename": "document.pdf",
        "fileSize": 1048576,
        "uploadedAt": "2025-01-08T10:00:00.000Z",
        "fileUrl": "https://supabase-signed-url",
        "mimeType": "application/pdf"
      }
    ],
    "recentActivity": {
      "pdfId": "uuid-generated-id",
      "filename": "document.pdf",
      "accessedAt": "2025-01-08T11:00:00.000Z",
      "fileUrl": "https://supabase-signed-url",
      "activityType": "view"
    },
    "totalCount": 1
  }
}
```

**Features:**

- Automatic user data filtering via RLS
- Fresh signed URLs generated for each request
- Recent activity tracking with last accessed PDF
- Rate limiting: 60 requests per minute per user
- Comprehensive error handling with fallback for missing signed URLs

#### GET /api/pdfs/[id]

Get a specific PDF by ID with fresh signed URL and activity tracking.

**Path Parameters:**

- `id`: The PDF UUID

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "uuid-generated-id",
    "filename": "document.pdf",
    "fileSize": 1048576,
    "uploadedAt": "2025-01-08T10:00:00.000Z",
    "fileUrl": "https://supabase-signed-url",
    "mimeType": "application/pdf"
  }
}
```

**Features:**

- Automatic user access verification via RLS
- Fresh signed URL generated for secure file access
- Activity tracking records "view" activity
- Rate limiting: 120 requests per minute per user
- Comprehensive error handling for missing or inaccessible files

**Error Responses:**

- `404` - PDF not found or user doesn't have access
- `401` - User not authenticated
- `429` - Rate limit exceeded
- `500` - Storage or database error

#### DELETE /api/pdfs/[id] ✅ IMPLEMENTED

Delete a specific PDF by ID with comprehensive cleanup.

**Path Parameters:**
- `id`: The PDF UUID

**Features:**
- Automatic cleanup of related annotations and highlights
- Storage file deletion with error handling
- Activity tracking for delete operations
- Comprehensive error handling and rollback
- Rate limiting: 30 deletions per hour per user

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "pdf_uuid",
    "userId": "user_123",
    "filename": "document.pdf",
    "uploadedAt": "2025-01-08T10:00:00.000Z",
    "deletedAt": "2025-01-08T11:00:00.000Z"
  }
}
```

## Advanced API Endpoints

### Document Processing API ✅ IMPLEMENTED

#### POST /api/documents/process
Process uploaded PDF with advanced text extraction.

**Features:**
- Syncfusion primary text extraction
- OCR fallback for scanned documents
- Semantic chunking with overlap
- Multi-language support
- Background processing queue

#### GET /api/documents/[id]/status
Get document processing status and progress.

#### GET /api/documents/[id]/chunks
Retrieve processed document chunks for search and analysis.

### Image Upload API ✅ IMPLEMENTED

#### POST /api/images/upload
Upload images for rich text editor integration.

**Features:**
- Secure image validation
- Automatic resizing and optimization
- Supabase Storage integration
- Signed URL generation

### Quiz Management API ✅ PLANNED

#### GET /api/quizzes
Get all quizzes for the authenticated user with filtering options.

**Query Parameters:**
- `category` (optional): Filter by quiz category
- `difficulty` (optional): Filter by difficulty level
- `completed` (optional): Filter by completion status

#### POST /api/quizzes
Create a new quiz from selected documents.

**Request Body:**
```json
{
  "title": "Quiz Title",
  "description": "Quiz description",
  "category": "Programming",
  "difficulty": "Medium",
  "documents": [
    {
      "id": "doc_uuid",
      "selectedPages": [1, 2, 3]
    }
  ]
}
```

#### GET /api/quizzes/[id]
Get a specific quiz by ID with questions and metadata.

#### PUT /api/quizzes/[id]
Update quiz metadata and settings.

#### DELETE /api/quizzes/[id]
Delete a quiz and associated data.

## Error Responses

All endpoints return consistent error responses:

```json
{
  "error": "Error message description"
}
```

**Common HTTP Status Codes:**

- `400` - Bad Request (missing/invalid parameters)
- `401` - Unauthorized (not authenticated)
- `404` - Not Found (resource doesn't exist)
- `500` - Internal Server Error

## Supabase Backend Integration

The application uses Supabase for both database and file storage with comprehensive security and error handling:

### Database Features

- **PostgreSQL Database**: Production-ready database with ACID compliance
- **Row Level Security (RLS)**: Automatic user data isolation at database level
- **JWT Integration**: Clerk authentication tokens used for RLS policies
- **Activity Tracking**: Real-time user activity monitoring and recent activity display
- **Comprehensive Error Handling**: Retry logic, error mapping, and graceful fallbacks

### Storage Features

- **Supabase Storage**: Secure file storage with private buckets
- **Signed URLs**: Time-limited file access with automatic expiration (1 hour default)
- **File Organization**: User-specific paths (`{userId}/{timestamp}_{filename}`)
- **Security Validation**: Comprehensive file validation with malicious pattern detection
- **Automatic Cleanup**: Failed uploads are automatically cleaned up to prevent orphaned files

### Performance & Reliability

- **Connection Pooling**: Efficient database connection management
- **Retry Logic**: Exponential backoff for failed operations
- **Caching**: RTK Query caching with intelligent invalidation
- **Rate Limiting**: Per-user rate limits to prevent abuse
- **Monitoring**: Comprehensive error logging and performance tracking

## Usage Examples

### Complete PDF workflow:

1. **Upload PDF**: `POST /api/pdfs/upload` with FormData
2. **List PDFs**: `GET /api/pdfs` to get all user PDFs with recent activity
3. **Access PDF**: `GET /api/pdfs/[id]` to get individual PDF with fresh signed URL
4. **Create annotation**: `POST /api/annotations` (when annotation system is implemented)
5. **Get annotations**: `GET /api/annotations?pdfId={id}` (when annotation system is implemented)

### Complete Notes workflow:

1. **Create note**: `POST /api/notes` with title and content
2. **List notes**: `GET /api/notes` to get all user notes
3. **Update note**: `PUT /api/notes/[id]` with updated content
4. **Delete note**: `DELETE /api/notes/[id]` to remove note

### Frontend Integration with RTK Query:

```typescript
import { 
  useUploadPDFMutation, 
  useGetPDFsQuery, 
  useGetPDFQuery,
  useCreateNoteMutation,
  useGetNotesQuery,
  useUpdateNoteMutation,
  useDeleteNoteMutation
} from '@/lib/store/apiSlice';

// Upload PDF
const [uploadPDF, { isLoading }] = useUploadPDFMutation();
const handleUpload = async (file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  const result = await uploadPDF(formData).unwrap();
};

// Get all PDFs with recent activity
const { data: pdfList, error, isLoading } = useGetPDFsQuery();

// Get individual PDF with automatic signed URL refresh
const { data: pdfData } = useGetPDFQuery(pdfId, {
  pollingInterval: 30 * 60 * 1000 // Refresh every 30 minutes
});

// Notes management
const [createNote] = useCreateNoteMutation();
const [updateNote] = useUpdateNoteMutation();
const [deleteNote] = useDeleteNoteMutation();
const { data: notes } = useGetNotesQuery();

// Create note with auto-save
const handleCreateNote = async (title: string, content: any) => {
  const result = await createNote({ title, content }).unwrap();
  return result.data;
};

// Update note with auto-save
const handleUpdateNote = async (id: string, title: string, content: any) => {
  const result = await updateNote({ id, title, content }).unwrap();
  return result.data;
};
```

## RTK Query Integration

All API endpoints are integrated with RTK Query for consistent state management:

```typescript
// Example Usage
const [submitFeedback] = useSubmitFeedbackMutation();
await submitFeedback(feedbackData).unwrap();
```

### Error Handling:

All API endpoints return consistent error responses with user-friendly messages and technical details for debugging. The frontend automatically handles common errors like authentication failures, rate limiting, and network issues.
