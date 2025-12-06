# Note API Endpoints

Base URL: `/api/v1/notes`

## 1. Create Note

Creates a new note.

- **URL**: `/`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body Parameters**:
  - `title` (string): Title of the note
  - `content` (string): Content of the note
  - `pdfId` (string, optional): Associated PDF ID

- **Success Response**:
  - **Code**: 201 Created
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "id": "string (UUID)",
        "title": "string",
        "content": "string",
        "userId": "string (UUID)",
        "pdfId": "string (UUID, optional)",
        "createdAt": "string (ISO 8601 timestamp)",
        "updatedAt": "string (ISO 8601 timestamp)"
      }
    }
    ```

- **Error Response**:
  - **Code**: 401 Unauthorized
    ```json
    {
      "error": "Unauthorized"
    }
    ```

## 2. Get All Notes

Retrieves all notes for the authenticated user.

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: Yes

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "data": [
        {
          "id": "string (UUID)",
          "title": "string",
          "content": "string",
          "userId": "string (UUID)",
          "pdfId": "string (UUID, optional)",
          "createdAt": "string (ISO 8601 timestamp)",
          "updatedAt": "string (ISO 8601 timestamp)"
        }
      ]
    }
    ```

- **Error Response**:
  - **Code**: 401 Unauthorized

## 3. Get Note by ID

Retrieves a specific note.

- **URL**: `/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **URL Parameters**:
  - `id` (string): The UUID of the note

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "id": "string (UUID)",
        "title": "string",
        "content": "string",
        "userId": "string (UUID)",
        "pdfId": "string (UUID, optional)",
        "createdAt": "string (ISO 8601 timestamp)",
        "updatedAt": "string (ISO 8601 timestamp)"
      }
    }
    ```

- **Error Response**:
  - **Code**: 401 Unauthorized

## 4. Update Note

Updates an existing note.

- **URL**: `/:id`
- **Method**: `PUT`
- **Auth Required**: Yes
- **URL Parameters**:
  - `id` (string): The UUID of the note
- **Body Parameters**:
  - `title` (string, optional): New title
  - `content` (string, optional): New content

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "data": {
        "id": "string (UUID)",
        "title": "string",
        "content": "string",
        "userId": "string (UUID)",
        "pdfId": "string (UUID, optional)",
        "createdAt": "string (ISO 8601 timestamp)",
        "updatedAt": "string (ISO 8601 timestamp)"
      }
    }
    ```

- **Error Response**:
  - **Code**: 401 Unauthorized

## 5. Delete Note

Deletes a note.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **URL Parameters**:
  - `id` (string): The UUID of the note

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Note deleted successfully"
    }
    ```

- **Error Response**:
  - **Code**: 401 Unauthorized
