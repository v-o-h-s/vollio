# PDF Annotation API Documentation

This document describes the API endpoints created for the PDF annotation system prototype.

## Authentication

All endpoints require Clerk authentication. The `userId` is automatically extracted from the authenticated session.

## Endpoints

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

Upload a new PDF file.

**Request:**

- Content-Type: `multipart/form-data`
- Body: FormData with `file` field containing the PDF

**Validation:**

- File must be PDF type (`application/pdf`)
- File size must be ≤ 50MB

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

#### GET /api/pdfs/upload

Get all PDFs for the authenticated user.

**Response:**

```json
{
  "success": true,
  "data": [
    {
      "id": "pdf_1234567890_def456",
      "userId": "user_123",
      "filename": "document.pdf",
      "uploadedAt": "2025-01-08T10:00:00.000Z",
      "fileUrl": "blob:pdf_1234567890_def456"
    }
  ]
}
```

#### GET /api/pdfs/[id]

Get a specific PDF by ID.

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

## Mock Database

For the prototype implementation, all data is stored in memory using the `MockDatabase` class in `lib/mock-db.ts`. This provides:

- In-memory storage for annotations and PDFs
- User isolation (users can only access their own data)
- CRUD operations for both annotations and PDFs
- Utility methods for development and testing

**Note:** In a production implementation, this would be replaced with a real database (PostgreSQL, MongoDB, etc.) and proper file storage (AWS S3, Google Cloud Storage, etc.).

## Usage Examples

### Creating an annotation workflow:

1. Upload PDF: `POST /api/pdfs/upload`
2. Get PDF details: `GET /api/pdfs/[id]`
3. Create annotation: `POST /api/annotations`
4. Get annotations for PDF: `GET /api/annotations?pdfId={id}`
5. Update annotation: `PUT /api/annotations`

### Retrieving annotations for a specific page:

```
GET /api/annotations?pdfId=pdf_123&page=1
```

This will return all annotations for page 1 of the specified PDF.
