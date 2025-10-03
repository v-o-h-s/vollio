# Noto PDF Annotation API Documentation

This document describes the API endpoints for the Noto PDF annotation application with Supabase backend integration. All API interactions should use RTK Query mutations and queries for consistency, caching, and automatic error handling.

## Authentication

All endpoints require Clerk authentication with JWT tokens. The `userId` is automatically extracted from the authenticated session and used for Row Level Security (RLS) in Supabase.

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

## Endpoints

### Notes API

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

#### PUT /api/notes/[id]

Update an existing note.

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

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "note_1234567890_abc123",
    "userId": "user_123",
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
    },
    "createdAt": "2025-01-08T10:00:00.000Z",
    "updatedAt": "2025-01-08T10:05:00.000Z"
  }
}
```

#### DELETE /api/notes/[id]

Delete a note.

**Path Parameters:**

- `id`: The note ID to delete

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "note_1234567890_abc123",
    "userId": "user_123",
    "title": "Deleted Note Title",
    "content": {...},
    "createdAt": "2025-01-08T10:00:00.000Z",
    "updatedAt": "2025-01-08T10:00:00.000Z"
  }
}
```

### Annotations API

#### GET /api/annotations

Get annotations for the authenticated user.

**Query Parameters:**

- `pdfId` (optional): Filter annotations by PDF ID
- `page` (optional): Filter annotations by page number

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "annotation_1234567890_abc123",
      "userId": "user_123",
      "pdfId": "pdf_1234567890_def456",
      "pageNumber": 1,
      "selectedText": "Selected text from PDF",
      "noteContent": "User's note content",
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

Create a new annotation.

**Request Body:**

```json
{
  "pdfId": "pdf_1234567890_def456",
  "pageNumber": 1,
  "selectedText": "Selected text from PDF",
  "noteContent": "User's note content",
  "coordinates": {
    "x": 100,
    "y": 200,
    "width": 150,
    "height": 20
  }
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "annotation_1234567890_abc123",
    "userId": "user_123",
    "pdfId": "pdf_1234567890_def456",
    "pageNumber": 1,
    "selectedText": "Selected text from PDF",
    "noteContent": "User's note content",
    "coordinates": {
      "x": 100,
      "y": 200,
      "width": 150,
      "height": 20
    },
    "createdAt": "2025-01-08T10:00:00.000Z",
    "updatedAt": "2025-01-08T10:00:00.000Z"
  }
}
```

#### PUT /api/annotations

Update an existing annotation.

**Request Body:**

```json
{
  "id": "annotation_1234567890_abc123",
  "noteContent": "Updated note content"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "annotation_1234567890_abc123",
    "userId": "user_123",
    "pdfId": "pdf_1234567890_def456",
    "pageNumber": 1,
    "selectedText": "Selected text from PDF",
    "noteContent": "Updated note content",
    "coordinates": {
      "x": 100,
      "y": 200,
      "width": 150,
      "height": 20
    },
    "createdAt": "2025-01-08T10:00:00.000Z",
    "updatedAt": "2025-01-08T10:05:00.000Z"
  }
}
```

#### DELETE /api/annotations

Delete an annotation.

**Query Parameters:**

- `id` (required): The annotation ID to delete

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "annotation_1234567890_abc123",
    "userId": "user_123",
    "pdfId": "pdf_1234567890_def456",
    "pageNumber": 1,
    "selectedText": "Selected text from PDF",
    "noteContent": "User's note content",
    "coordinates": {
      "x": 100,
      "y": 200,
      "width": 150,
      "height": 20
    },
    "createdAt": "2025-01-08T10:00:00.000Z",
    "updatedAt": "2025-01-08T10:00:00.000Z"
  }
}
```

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

#### DELETE /api/pdfs/[id]

Delete a specific PDF by ID.

**Path Parameters:**

- `id`: The PDF ID

**Response:**

```json
{
  "success": true,
  "data": {
    "id": "pdf_1234567890_def456",
    "userId": "user_123",
    "filename": "document.pdf",
    "uploadedAt": "2025-01-08T10:00:00.000Z",
    "fileUrl": "blob:pdf_1234567890_def456"
  }
}
```

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

## RAG System API

### POST /api/quiz/generate-rag

Generate quizzes using RAG-based content analysis from processed documents.

**Request Body:**
```json
{
  "documentIds": ["doc_123", "doc_456"],
  "questionCount": 10,
  "difficulty": "medium",
  "questionTypes": ["multiple_choice", "true_false"],
  "pageRange": { "start": 1, "end": 10 },
  "focusAreas": ["key concepts", "definitions"],
  "learningObjectives": ["understand main concepts"]
}
```

**Response:**
```json
{
  "success": true,
  "quizId": "quiz_789",
  "message": "Quiz generated successfully",
  "metadata": {
    "questionsGenerated": 10,
    "sourceDocumentTitles": ["Document 1", "Document 2"],
    "totalChunksSearched": 45,
    "averageRelevanceScore": 0.87,
    "generationTime": 23.5,
    "aiModel": "gpt-4"
  }
}
```

### POST /api/quiz/advanced-search

Advanced semantic search across document chunks for targeted content discovery.

**Request Body:**
```json
{
  "query": "machine learning algorithms",
  "documentIds": ["doc_123"],
  "contentTypes": ["paragraph", "heading"],
  "confidenceRange": { "min": 0.7, "max": 1.0 },
  "relevanceRange": { "min": 0.8, "max": 1.0 },
  "maxResults": 20
}
```

**Response:**
```json
{
  "success": true,
  "results": [
    {
      "chunkId": "chunk_123",
      "content": "Machine learning algorithms...",
      "relevanceScore": 0.92,
      "metadata": {
        "documentId": "doc_123",
        "pageNumber": 5,
        "contentType": "paragraph",
        "confidence": 0.89
      }
    }
  ],
  "totalResults": 15,
  "searchTime": 1.2
}
```

### ~~GET /api/quiz/history~~ [REMOVED]

~~Retrieve quiz attempt history and performance analytics for the authenticated user.~~ 

**Status**: Removed - Analytics functionality has been removed from the quiz system.

**~~Query Parameters:~~**
- `limit` (optional): Maximum number of attempts to return (default: 20)
- `offset` (optional): Number of attempts to skip for pagination (default: 0)

**Response:**
```json
{
  "success": true,
  "attempts": [
    {
      "id": "attempt_123",
      "quizId": "quiz_789",
      "score": 85,
      "totalQuestions": 10,
      "completedAt": "2025-01-15T10:30:00Z",
      "timeSpent": 300
    }
  ],
  "summary": {
    "totalAttempts": 25,
    "averageScore": 78,
    "bestScore": 95,
    "improvementTrend": "improving"
  }
}
```

### POST /api/rag/monitoring

Submit user feedback and system metrics for RAG system monitoring.

**Request Body:**
```json
{
  "type": "feedback",
  "data": {
    "feedbackType": "quiz",
    "targetId": "quiz_123",
    "rating": 4,
    "feedback": "Great quiz quality, relevant questions"
  }
}
```

**Response:**
```json
{
  "success": true,
  "message": "Feedback submitted successfully",
  "feedbackId": "feedback_456"
}
```

## RTK Query Integration

All RAG endpoints are integrated with RTK Query for consistent state management:

```typescript
// RAG Quiz Generation
const [generateRAGQuiz] = useGenerateRAGQuizMutation();
const handleGenerateQuiz = async (params) => {
  const result = await generateRAGQuiz(params).unwrap();
  return result;
};

// Advanced Search
const [performAdvancedSearch] = useAdvancedSearchMutation();
const searchResults = await performAdvancedSearch(searchParams).unwrap();

// Quiz History (Removed)
// const { data: quizHistory } = useGetQuizHistoryQuery(); // Analytics removed

// Feedback Submission
const [submitFeedback] = useSubmitFeedbackMutation();
await submitFeedback(feedbackData).unwrap();
```

### Error Handling:

All API endpoints return consistent error responses with user-friendly messages and technical details for debugging. The frontend automatically handles common errors like authentication failures, rate limiting, and network issues.
