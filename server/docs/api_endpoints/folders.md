# Folder API Endpoints

Base URL: `/api/v1/folders`

## 1. Get All User Folders

Retrieves all folders for the authenticated user with Document counts.

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: Yes

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Folders retrieved successfully",
      "data": [
        {
          "id": "string (UUID)",
          "userId": "string (UUID)",
          "name": "string",
          "description": "string | null",
          "parentId": "string (UUID) | null",
          "color": "string | null",
          "icon": "string | null",
          "documentCount": "number",
          "createdAt": "string (ISO 8601 timestamp)",
          "updatedAt": "string (ISO 8601 timestamp)"
        }
      ],
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

## 2. Create Folder

Creates a new folder for the authenticated user.

- **URL**: `/`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body Parameters**:
  - `name` (string, required): Name of the folder (1-255 characters)
  - `description` (string, optional): Description of the folder
  - `parentId` (string, optional): UUID of parent folder for nested folders
  - `color` (string, optional): Hex color code for folder
  - `icon` (string, optional): Icon identifier for folder

- **Success Response**:
  - **Code**: 201 Created
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Folder created successfully",
      "data": {
        "id": "string (UUID)",
        "userId": "string (UUID)",
        "name": "string",
        "description": "string | null",
        "parentId": "string (UUID) | null",
        "color": "string | null",
        "icon": "string | null",
        "createdAt": "string (ISO 8601 timestamp)",
        "updatedAt": "string (ISO 8601 timestamp)"
      },
      "error": null
    }
    ```

- **Error Responses**:
  - **Code**: 400 Bad Request
    ```json
    {
      "success": false,
      "message": "Invalid input",
      "data": null,
      "error": { "message": "Folder name already exists" }
    }
    ```
  - **Code**: 401 Unauthorized
  - **Code**: 404 Not Found (parent folder doesn't exist)

## 3. Get Folder by ID

Retrieves a specific folder with Document count.

- **URL**: `/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **URL Parameters**:
  - `id` (string): The UUID of the folder

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Folder retrieved successfully",
      "data": {
        "id": "string (UUID)",
        "userId": "string (UUID)",
        "name": "string",
        "description": "string | null",
        "parentId": "string (UUID) | null",
        "color": "string | null",
        "icon": "string | null",
        "documentCount": "number",
        "createdAt": "string (ISO 8601 timestamp)",
        "updatedAt": "string (ISO 8601 timestamp)"
      },
      "error": null
    }
    ```

- **Error Responses**:
  - **Code**: 401 Unauthorized
  - **Code**: 404 Not Found

## 4. Update Folder

Updates folder properties with partial updates support.

- **URL**: `/:id`
- **Method**: `PATCH`
- **Auth Required**: Yes
- **URL Parameters**:
  - `id` (string): The UUID of the folder
- **Body Parameters** (all optional):
  - `name` (string): New folder name
  - `description` (string | null): Update description
  - `parentId` (string | null): Move to different parent folder
  - `color` (string | null): Update hex color code
  - `icon` (string | null): Update icon identifier

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Folder updated successfully",
      "data": {
        "id": "string (UUID)",
        "userId": "string (UUID)",
        "name": "string",
        "description": "string | null",
        "parentId": "string (UUID) | null",
        "color": "string | null",
        "icon": "string | null",
        "createdAt": "string (ISO 8601 timestamp)",
        "updatedAt": "string (ISO 8601 timestamp)"
      },
      "error": null
    }
    ```

- **Error Responses**:
  - **Code**: 400 Bad Request (circular reference, duplicate name, etc.)
  - **Code**: 401 Unauthorized
  - **Code**: 404 Not Found

## 5. Delete Folder

Deletes a folder and optionally moves its contents.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **URL Parameters**:
  - `id` (string): The UUID of the folder to delete
- **Query Parameters**:
  - `targetFolderId` (string, optional): UUID of folder to move Documents and subfolders to. If not provided, contents moved to root level.

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Folder deleted successfully",
      "data": {
        "deletedFolderId": "string (UUID)",
        "movedPdfCount": "number",
        "movedSubfolderCount": "number"
      },
      "error": null
    }
    ```

- **Error Responses**:
  - **Code**: 401 Unauthorized
  - **Code**: 404 Not Found (folder or target folder doesn't exist)
  - **Code**: 400 Bad Request (invalid targetFolderId)

## Validation Rules

- **Folder Name**: Required, 1-255 characters, must be unique per user within same parent
- **Parent ID**: Must be valid UUID and must be owned by the authenticated user
- **Circular Reference**: Cannot set a folder as its own parent or ancestor
- **Color**: Must be valid hex color code (e.g., #FF5733)
- **Icon**: Any string identifier (e.g., folder-icon-1, custom-icon)

## Notes

- All folder operations enforce user isolation - users can only access their own folders
- Document count is calculated by counting all Documents directly in the folder
- Deleting a folder with Documents requires specifying a targetFolderId or they will be moved to root
- Nested folder hierarchies are supported with parentId references
