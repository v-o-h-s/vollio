# Document API Endpoints

Base URL: `/api/v1/documents`

## Overview

All document endpoints require authentication unless noted otherwise. Responses follow a standard format with `success`, `message`, `data`, and `error` fields.

---

## 1. Get All Documents
Retrieves all documents for the authenticated user.

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: Yes

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Documents fetched successfully",
  "data": {
    "documents": [
      {
        "id": "string (UUID)",
        "documentname": "string",
        "documentSize": "number",
        "mimeType": "string",
        "uploadedAt": "string (ISO 8601)",
        "folderId": "string | null",
        "isGoogleDriveDocument": "boolean"
      }
    ],
    "totalCount": "number"
  },
  "error": null
}
```

**Error Responses**:

- **401 Unauthorized**: User not authenticated

---

## 2. Get Document by ID

Retrieves a specific document's metadata by ID. This is the primary endpoint for retrieving document content links.

- **URL**: `/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **URL Parameters**: `id` (string, UUID)

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Document fetched successfully",
  "data": {
    "id": "string (UUID)",
    "name": "string",
    "documentUrl": "string (Signed URL or Proxy URL)",
    "size": "number",
    "mimeType": "string",
    "uploadedAt": "string (ISO 8601)",
    "folderId": "string | null",
    "isGoogleDriveDocument": "boolean"
  },
  "error": null
}
```

> **Note on `documentUrl`**: If the document is cached, this is a direct signed URL from Supabase Storage. If it's a first-time access for a Google Drive file, this may be a proxy URL (`/google-drive/:id`) that handles on-demand caching.

**Error Responses**:

- **401 Unauthorized**: User not authenticated
- **404 Not Found**: Document does not exist

---

## 3. Generate Upload URL

Generates a signed URL for direct client-side upload to storage.

- **URL**: `/upload-url`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:

```json
{
  "name": "string (filename)"
}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Storage URL retrieved successfully",
  "data": {
    "storageUrl": "string (signed URL)",
    "storagePath": "string (path in bucket)"
  },
  "error": null
}
```

---

## 4. Finish Upload

Finalizes the document creation in the database after successful storage upload.

- **URL**: `/finish-upload`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:

```json
{
  "name": "string (original filename)",
  "size": "number (bytes)",
  "storagePath": "string (path from Step 3)",
  "folderId": "string | null (optional)"
}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Document created successfully",
  "data": {
    "id": "string (UUID of new document)"
  },
  "error": null
}
```

**Error Responses**:

- **400 Bad Request**: No document provided
- **401 Unauthorized**: User not authenticated

---

## 5. Delete Document

Deletes a document from storage and database.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **URL Parameters**: `id` (string, UUID)

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Document deleted successfully",
  "data": null,
  "error": null
}
```

**Error Responses**:

- **401 Unauthorized**: User not authenticated
- **404 Not Found**: Document does not exist

---

## 6. Move Document

Moves a document to a different folder.

- **URL**: `/:id/move`
- **Method**: `PATCH`
- **Auth Required**: Yes
- **URL Parameters**: `id` (string, UUID)
- **Request Body**:

```json
{
  "folderId": "string | null"
}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Document moved successfully",
  "data": null,
  "error": null
}
```

**Error Responses**:

- **401 Unauthorized**: User not authenticated
- **404 Not Found**: Document does not exist

---

## 7. Rename Document

Renames a document.

- **URL**: `/:id/rename`
- **Method**: `PUT`
- **Auth Required**: Yes
- **URL Parameters**: `id` (string, UUID)
- **Request Body**:

```json
{
  "documentname": "string"
}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Document renamed successfully",
  "data": null,
  "error": null
}
```

**Error Responses**:

- **401 Unauthorized**: User not authenticated
- **404 Not Found**: Document does not exist

---

---

## 8. Add Document from Google Drive

Adds a reference to a Google Drive document into the system.

- **URL**: `/google-drive`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:

```json
{
  "documentGoogleDriveId": "string"
}
```

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Document added successfully",
  "data": null,
  "error": null
}
```

**Error Responses**:

- **401 Unauthorized**: User not authenticated
- **404 Not Found**: Document not found in Google Drive

---

## 9. Get Document from Google Drive (Proxy & Cache)

Retrieves a document's content from Google Drive via the system. This endpoint also acts as a proxy that triggers the **internal caching flow** to Supabase Storage.

- **URL**: `/google-drive/:documentId`
- **Method**: `GET`
- **Auth Required**: Yes
- **URL Parameters**: `documentId` (string) - Internal document ID

**Success Response** (200 OK):

- **Content**: Binary document stream
- **Headers**:
  - `Content-Type`: Document's MIME type (e.g., `application/pdf`)
  - `Content-Disposition`: `inline; name="<filename>"`

**Error Responses**:

- **401 Unauthorized**: User not authenticated
- **404 Not Found**: Document does not exist in DB or Google Drive

---

## 10. Generate Summary

Generates a summary note for a document using AI.

- **URL**: `/:id/generate-summary`
- **Method**: `POST`
- **Auth Required**: Yes
- **URL Parameters**: `id` (string, UUID)

**Success Response** (200 OK):

```json
{
  "success": true,
  "message": "Summary generated successfully",
  "data": {
    "id": "string (UUID)",
    "title": "string",
    "content": "object (JSONContent)",
    "documentId": "string (UUID)",
    "createdAt": "string (ISO 8601)",
    "updatedAt": "string (ISO 8601)",
    "isSummary": true
  },
  "error": null
}
```

**Error Responses**:

- **401 Unauthorized**: User not authenticated
- **404 Not Found**: Document does not exist
- **500 Internal Server Error**: No chunks found for document or AI generation failed
