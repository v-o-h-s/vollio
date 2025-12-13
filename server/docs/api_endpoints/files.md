# File API Endpoints

Base URL: `/api/v1/files`

## 1. Get All Files
Retrieves all files for the authenticated user.

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: Yes

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Files fetched successfully",
      "data": {
        "pdfs": [
          {
            "id": "string (UUID)",
            "filename": "string",
            "file_size": "number",
            "storage_path": "string | null",
            "google_file_id": "string | null",
            "mime_type": "string",
            "folder_id": "string | null",
            "isGoogleDriveFile": "boolean"
          }
        ],
        "totalCount": "number"
      },
      "error": null
    }
    ```

- **Error Response**:
  - **Code**: 401 Unauthorized
    ```json
    {
      "success": false,
      "message": "Not authenticated",
      "data": null,
      "error": { "message": "Not authenticated" }
    }
    ```

## 2. Get File by ID
Retrieves a specific file's metadata by ID.

- **URL**: `/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **URL Parameters**:
  - `id` (string): The UUID of the file

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
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
        "uploadedAt": "string (ISO 8601)"
        "folderId": "string | null",
        "isGoogleDriveFile": "boolean"
      },
      "error": null
    }

- **Error Responses**:
  - **Code**: 401 Unauthorized
  - **Code**: 404 Not Found

## 3. Upload File
Uploads a new file to storage and saves metadata to database.

- **URL**: `/upload`
- **Method**: `POST`
- **Auth Required**: Yes
- **Content-Type**: `multipart/form-data`
- **Form Parameters**:
  - `file` (file, required): The PDF file to upload
  - `folderId` (string, optional): Folder ID to organize file

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
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

- **Error Responses**:
  - **Code**: 400 Bad Request (no file provided)
    ```json
    {
      "success": false,
      "status": 400,
      "data": null,
      "error": { "message": "No file provided" }
    }
    ```
  - **Code**: 401 Unauthorized

## 4. Delete File
Deletes a file from storage and database.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **URL Parameters**:
  - `id` (string): The UUID of the file

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "File deleted successfully"
    }
    ```

- **Error Responses**:
  - **Code**: 401 Unauthorized
  - **Code**: 404 Not Found

## 5. Move File
Moves a file to a different folder.

- **URL**: `/:id/move`
- **Method**: `PATCH`
- **Auth Required**: Yes
- **URL Parameters**:
  - `id` (string): The UUID of the file
- **Body Parameters**:
  ```json
  {
    "folderId": "string | null"
  }
  ```

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "File moved successfully",
      "data": {
        "id": "string (UUID)",
        "filename": "string",
        "file_size": "number",
        "storage_path": "string | null",
        "google_file_id": "string | null",
        "mime_type": "string",
        "folder_id": "string | null"
      },
      "error": null
    }
    ```

- **Error Responses**:
  - **Code**: 401 Unauthorized
  - **Code**: 404 Not Found

## 6. Rename File
Renames a file.

- **URL**: `/:id/rename`
- **Method**: `PUT`
- **Auth Required**: Yes
- **URL Parameters**:
  - `id` (string): The UUID of the file
- **Body Parameters**:
  ```json
  {
    "filename": "string"
  }
  ```

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "pdf": {
        "id": "string (UUID)",
        "filename": "string",
        "fileSize": "number",
        "createdAt": "string (ISO 8601)",
        "updatedAt": "string (ISO 8601)"
      }
    }
    ```

- **Error Responses**:
  - **Code**: 401 Unauthorized
  - **Code**: 404 Not Found

## 7. Stream File
Streams a file for download/viewing.

- **URL**: `/:id/stream`
- **Method**: `GET`
- **Auth Required**: Yes
- **URL Parameters**:
  - `id` (string): The UUID of the file

- **Success Response**:
  - **Code**: 200 OK
  - **Content**: Binary PDF stream
  - **Headers**:
    - `Content-Type`: `application/pdf`

- **Error Responses**:
  - **Code**: 401 Unauthorized
  - **Code**: 404 Not Found

## 8. Add File from Google Drive
Adds a reference to a Google Drive file into the system.

- **URL**: `/google-drive`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body Parameters**:
  ```json
  {
    "fileGoogleDriveId": "string"
  }
  ```

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "File added successfully",
      "data": null,
      "error": null
    }
    ```

- **Error Responses**:
  - **Code**: 401 Unauthorized
  - **Code**: 404 Not Found (File not found in Google Drive)

## 9. Get File from Google Drive
Retrieves a file's content from Google Drive via the system.

- **URL**: `/google-drive/:fileId`
- **Method**: `GET`
- **Auth Required**: Yes
- **URL Parameters**:
  - `fileId` (string): The internal ID of the file

- **Success Response**:
  - **Code**: 200 OK
  - **Content**: Binary file stream
  - **Headers**:
    - `Content-Type`: File's MIME type (e.g., `application/pdf`)
    - `Content-Disposition`: `inline; filename="<filename>"`

- **Error Responses**:
  - **Code**: 401 Unauthorized
  - **Code**: 404 Not Found (File does not exist in DB or Google Drive)

- **Success Response**:
  - **Code**: 200 OK
  - **Content**: Binary file stream
  - **Headers**:
    - `Content-Type`: File's MIME type (e.g., `application/pdf`)
    - `Content-Disposition`: `inline; filename="<filename>"`

- **Error Responses**:
  - **Code**: 401 Unauthorized
    ```json
    {
      "success": false,
      "message": "User not authenticated",
      "data": null,
      "error": "Unauthorized"
    }
    ```
  - **Code**: 404 Not Found - File does not exist in DB or Google Drive

## 2. Add File from Google Drive
Adds a reference to a Google Drive file into the system.

- **URL**: `/`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body Parameters**:
  ```json
  {
    "fileGoogleDriveId": "string"
  }
  ```

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "File added successfully",
      "data": null,
      "error": null
    }
    ```

- **Error Responses**:
  - **Code**: 401 Unauthorized
    ```json
    {
      "success": false,
      "message": "User not authenticated",
      "data": null,
      "error": "Unauthorized"
    }
    ```
  - **Code**: 404 Not Found - File metadata cannot be fetched from Google Drive
