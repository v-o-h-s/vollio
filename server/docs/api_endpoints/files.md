# File API Endpoints

Base URL: `/api/v1/files`

## 1. Get File from Google Drive
Retrieves a file's content from Google Drive via the system.

- **URL**: `/classroom/:fileId`
- **Method**: `GET`
- **Auth Required**: Yes
- **URL Parameters**:
  - `fileId` (string): The internal ID of the file.

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
