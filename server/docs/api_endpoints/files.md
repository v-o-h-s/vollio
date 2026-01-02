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
Retrieves a specific document's metadata by ID.

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
    "documentname": "string",
    "documentUrl": "string",
    "documentSize": "number",
    "mimeType": "string",
    "uploadedAt": "string (ISO 8601)",
    "folderId": "string | null",
    "isGoogleDriveDocument": "boolean"
  },
  "error": null
}
```

**Error Responses**:
- **401 Unauthorized**: User not authenticated
- **404 Not Found**: Document does not exist

---

## 3. Upload Document
Uploads a new document to storage and saves metadata to database.

- **URL**: `/upload`
- **Method**: `POST`
- **Auth Required**: Yes
- **Content-Type**: `multipart/form-data`
- **Form Parameters**:
  - `document` (document, required): The document to upload
  - `folderId` (string, optional): Folder ID to organize document

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Document uploaded successfully",
  "data": {
    "id": "string (UUID)",
    "documentname": "string",
    "documentSize": "number",
    "uploadedAt": "string (ISO 8601)",
    "documentUrl": "string",
    "storagePath": "string"
  },
  "error": null
}
```

**Error Responses**:
- **400 Bad Request**: No document provided
- **401 Unauthorized**: User not authenticated

---

## 4. Delete Document
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

## 5. Move Document
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

## 6. Rename Document
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

## 7. Stream Document
Streams a document for download/viewing using a token. Supports both GET (full stream) and HEAD (headers only) requests.

- **URL**: `/stream`
- **Method**: `GET` or `HEAD`
- **Auth Required**: No (token-based)
- **Query Parameters**: `token` (string, required) - Access token

**Success Response** (200 OK):
- **Content**: Binary Document stream
- **Headers**:
  - `Content-Type`: `application/pdf`
  - `Content-Disposition`: `inline; documentname=document.document`
  - `Accept-Ranges`: `bytes` (for range requests)

**HEAD Request**: Returns headers only without document content (useful for Document.js preflight checks)

**Error Responses**:
- **400 Bad Request**: Missing token
- **401 Unauthorized**: Invalid or expired token
- **403 Forbidden**: Wrong token purpose
- **404 Not Found**: Document not found
- **500 Internal Server Error**: Google Classroom tokens expired

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

## 9. Get Document from Google Drive
Retrieves a document's content from Google Drive via the system.

- **URL**: `/google-drive/:documentId`
- **Method**: `GET`
- **Auth Required**: Yes
- **URL Parameters**: `documentId` (string) - Internal document ID

**Success Response** (200 OK):
- **Content**: Binary document stream
- **Headers**:
  - `Content-Type`: Document's MIME type (e.g., `application/pdf`)
  - `Content-Disposition`: `inline; documentname="<documentname>"`

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
