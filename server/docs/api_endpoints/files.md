# File API Endpoints

Base URL: `/api/v1/files`

## Overview
All file endpoints require authentication unless noted otherwise. Responses follow a standard format with `success`, `message`, `data`, and `error` fields.

---

## 1. Get All Files
Retrieves all files for the authenticated user.

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: Yes

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Files fetched successfully",
  "data": {
    "pdfs": [
      {
        "id": "string (UUID)",
        "filename": "string",
        "fileSize": "number",
        "mimeType": "string",
        "uploadedAt": "string (ISO 8601)",
        "folderId": "string | null",
        "isGoogleDriveFile": "boolean"
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

## 2. Get File by ID
Retrieves a specific file's metadata by ID.

- **URL**: `/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **URL Parameters**: `id` (string, UUID)

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "File fetched successfully",
  "data": {
    "id": "string (UUID)",
    "filename": "string",
    "fileUrl": "string",
    "fileSize": "number",
    "mimeType": "string",
    "uploadedAt": "string (ISO 8601)",
    "folderId": "string | null",
    "isGoogleDriveFile": "boolean"
  },
  "error": null
}
```

**Error Responses**:
- **401 Unauthorized**: User not authenticated
- **404 Not Found**: File does not exist

---

## 3. Upload File
Uploads a new file to storage and saves metadata to database.

- **URL**: `/upload`
- **Method**: `POST`
- **Auth Required**: Yes
- **Content-Type**: `multipart/form-data`
- **Form Parameters**:
  - `file` (file, required): The file to upload
  - `folderId` (string, optional): Folder ID to organize file

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "File uploaded successfully",
  "data": {
    "id": "string (UUID)",
    "filename": "string",
    "fileSize": "number",
    "uploadedAt": "string (ISO 8601)",
    "fileUrl": "string",
    "storagePath": "string"
  },
  "error": null
}
```

**Error Responses**:
- **400 Bad Request**: No file provided
- **401 Unauthorized**: User not authenticated

---

## 4. Delete File
Deletes a file from storage and database.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **URL Parameters**: `id` (string, UUID)

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "File deleted successfully",
  "data": null,
  "error": null
}
```

**Error Responses**:
- **401 Unauthorized**: User not authenticated
- **404 Not Found**: File does not exist

---

## 5. Move File
Moves a file to a different folder.

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
  "message": "File moved successfully",
  "data": null,
  "error": null
}
```

**Error Responses**:
- **401 Unauthorized**: User not authenticated
- **404 Not Found**: File does not exist

---

## 6. Rename File
Renames a file.

- **URL**: `/:id/rename`
- **Method**: `PUT`
- **Auth Required**: Yes
- **URL Parameters**: `id` (string, UUID)
- **Request Body**:
```json
{
  "filename": "string"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "File renamed successfully",
  "data": null,
  "error": null
}
```

**Error Responses**:
- **401 Unauthorized**: User not authenticated
- **404 Not Found**: File does not exist

---

## 7. Create Signed URL
Creates a signed JWT token for secure file streaming without authentication.

- **URL**: `/:id/signed-url`
- **Method**: `POST`
- **Auth Required**: Yes
- **URL Parameters**: `id` (string, UUID)

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "Signed URL created successfully",
  "data": {
    "url": "string (JWT token)"
  },
  "error": null
}
```

**Error Responses**:
- **401 Unauthorized**: User not authenticated
- **404 Not Found**: File does not exist

**Usage**: Use the returned token to stream the file:
```
GET /api/v1/files/stream?token={url}
```

---

## 8. Stream File (with Signed URL)
Streams a file for download/viewing using a signed JWT token. Supports both GET (full stream) and HEAD (headers only) requests.

- **URL**: `/stream`
- **Method**: `GET` or `HEAD`
- **Auth Required**: No (token-based)
- **Query Parameters**: `token` (string, required) - JWT from `/signed-url` endpoint

**Success Response** (200 OK):
- **Content**: Binary PDF stream
- **Headers**:
  - `Content-Type`: `application/pdf`
  - `Content-Disposition`: `inline; filename=file.pdf`
  - `Accept-Ranges`: `bytes` (for range requests)

**HEAD Request**: Returns headers only without file content (useful for PDF.js preflight checks)

**Error Responses**:
- **400 Bad Request**: Missing token
- **401 Unauthorized**: Invalid or expired token
- **403 Forbidden**: Wrong token purpose
- **404 Not Found**: File not found
- **500 Internal Server Error**: Google Classroom tokens expired

---

## 9. Add File from Google Drive
Adds a reference to a Google Drive file into the system.

- **URL**: `/google-drive`
- **Method**: `POST`
- **Auth Required**: Yes
- **Request Body**:
```json
{
  "fileGoogleDriveId": "string"
}
```

**Success Response** (200 OK):
```json
{
  "success": true,
  "message": "File added successfully",
  "data": null,
  "error": null
}
```

**Error Responses**:
- **401 Unauthorized**: User not authenticated
- **404 Not Found**: File not found in Google Drive

---

## 10. Get File from Google Drive
Retrieves a file's content from Google Drive via the system.

- **URL**: `/google-drive/:fileId`
- **Method**: `GET`
- **Auth Required**: Yes
- **URL Parameters**: `fileId` (string) - Internal file ID

**Success Response** (200 OK):
- **Content**: Binary file stream
- **Headers**:
  - `Content-Type`: File's MIME type (e.g., `application/pdf`)
  - `Content-Disposition`: `inline; filename="<filename>"`

**Error Responses**:
- **401 Unauthorized**: User not authenticated
- **404 Not Found**: File does not exist in DB or Google Drive
