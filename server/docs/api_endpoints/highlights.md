# Highlight API Endpoints

Base URL: `/api/v1/highlights`

## 1. Get All Highlights

Retrieves all highlights for the authenticated user, optionally filtered by PDF.

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:
  - `pdfId` (string, optional): Filter highlights by PDF ID (UUID format)

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Highlights retrieved successfully",
      "data": [
        {
          "id": "string (UUID)",
          "userId": "string (UUID)",
          "pdfId": "string (UUID)",
          "type": "string (text|area)",
          "content": {
            "text": "string | null",
            "image": "string | null"
          },
          "position": {
            "boundingRect": {
              "height": "number",
              "pageNumber": "number",
              "width": "number",
              "x1": "number",
              "x2": "number",
              "y1": "number",
              "y2": "number"
            },
            "rects": [
              {
                "height": "number",
                "pageNumber": "number",
                "width": "number",
                "x1": "number",
                "x2": "number",
                "y1": "number",
                "y2": "number"
              }
            ]
          },
          "color": "string | null",
          "hasNote": "boolean",
          "noteId": "string (UUID) | null",
          "tags": "string[] | null",
          "style": "string | null",
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

## 2. Create Highlight

Creates a new highlight on a PDF.

- **URL**: `/`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body Parameters**:
  - `pdfId` (string, required): UUID of the PDF to highlight
  - `type` (string, required): Type of highlight - "text" or "area"
  - `content` (object, required): Highlight content
    - `text` (string, optional): Text content of highlight
    - `image` (string, optional): Image data of highlight
  - `position` (object, required): Position information
    - `boundingRect` (object, required): Bounding rectangle coordinates
      - `height` (number, required): Height in pixels
      - `pageNumber` (number, required): Page number (0-indexed)
      - `width` (number, required): Width in pixels
      - `x1` (number, required): Start X coordinate
      - `x2` (number, required): End X coordinate
      - `y1` (number, required): Start Y coordinate
      - `y2` (number, required): End Y coordinate
    - `rects` (array, required): Array of rectangle coordinates (same structure as boundingRect)
  - `color` (string, optional): Hex color code for highlight (e.g., #FFFF00)
  - `tags` (string[], optional): Tags for organizing highlights
  - `style` (string, optional): Style identifier for highlight appearance
  - `noteId` (string, optional): UUID of associated note

- **Success Response**:
  - **Code**: 201 Created
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Highlight created successfully",
      "data": {
        "id": "string (UUID)",
        "userId": "string (UUID)",
        "pdfId": "string (UUID)",
        "type": "string (text|area)",
        "content": {
          "text": "string | null",
          "image": "string | null"
        },
        "position": {
          "boundingRect": { /* as above */ },
          "rects": [ /* as above */ ]
        },
        "color": "string | null",
        "hasNote": "boolean",
        "noteId": "string (UUID) | null",
        "tags": "string[] | null",
        "style": "string | null",
        "createdAt": "string (ISO 8601 timestamp)",
        "updatedAt": "string (ISO 8601 timestamp)"
      },
      "error": null
    }
    ```

- **Error Responses**:
  - **Code**: 400 Bad Request (invalid position data, invalid type, etc.)
  - **Code**: 401 Unauthorized
  - **Code**: 404 Not Found (PDF doesn't exist)

## 3. Get Highlight by ID

Retrieves a specific highlight.

- **URL**: `/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **URL Parameters**:
  - `id` (string): The UUID of the highlight

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Highlight retrieved successfully",
      "data": {
        "id": "string (UUID)",
        "userId": "string (UUID)",
        "pdfId": "string (UUID)",
        "type": "string (text|area)",
        "content": {
          "text": "string | null",
          "image": "string | null"
        },
        "position": {
          "boundingRect": { /* as above */ },
          "rects": [ /* as above */ ]
        },
        "color": "string | null",
        "hasNote": "boolean",
        "noteId": "string (UUID) | null",
        "tags": "string[] | null",
        "style": "string | null",
        "createdAt": "string (ISO 8601 timestamp)",
        "updatedAt": "string (ISO 8601 timestamp)"
      },
      "error": null
    }
    ```

- **Error Responses**:
  - **Code**: 401 Unauthorized
  - **Code**: 404 Not Found

## 4. Update Highlight

Updates highlight properties with partial updates support.

- **URL**: `/:id`
- **Method**: `PATCH`
- **Auth Required**: Yes
- **URL Parameters**:
  - `id` (string): The UUID of the highlight
- **Body Parameters** (all optional):
  - `content` (object): Update highlight content
    - `text` (string | null): Update text content
    - `image` (string | null): Update image data
  - `position` (object): Update position data (same structure as create)
  - `color` (string | null): Update hex color code
  - `tags` (string[] | null): Update tags
  - `style` (string | null): Update style identifier
  - `noteId` (string | null): Update or remove associated note

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Highlight updated successfully",
      "data": {
        "id": "string (UUID)",
        "userId": "string (UUID)",
        "pdfId": "string (UUID)",
        "type": "string (text|area)",
        "content": { /* as above */ },
        "position": { /* as above */ },
        "color": "string | null",
        "hasNote": "boolean",
        "noteId": "string (UUID) | null",
        "tags": "string[] | null",
        "style": "string | null",
        "createdAt": "string (ISO 8601 timestamp)",
        "updatedAt": "string (ISO 8601 timestamp)"
      },
      "error": null
    }
    ```

- **Error Responses**:
  - **Code**: 400 Bad Request (invalid data)
  - **Code**: 401 Unauthorized
  - **Code**: 404 Not Found

## 5. Delete Highlight

Deletes a specific highlight.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **URL Parameters**:
  - `id` (string): The UUID of the highlight to delete

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Highlight deleted successfully",
      "data": {
        "deletedHighlightId": "string (UUID)"
      },
      "error": null
    }
    ```

- **Error Responses**:
  - **Code**: 401 Unauthorized
  - **Code**: 404 Not Found

## Validation Rules

- **Type**: Must be "text" or "area"
- **Position**: Required with complete boundingRect and rects array
  - All coordinate values must be positive numbers
  - pageNumber must be non-negative integer
  - x1 < x2, y1 < y2
- **Color**: Must be valid hex color code if provided (e.g., #FFFF00)
- **PDF ID**: Must be valid UUID and must exist in user's PDFs
- **Note ID**: If provided, must be valid UUID and valid note owned by user

## Notes

- All highlight operations enforce user isolation - users can only access their own highlights
- `hasNote` is automatically calculated based on whether `noteId` is set
- Tags can be used for organizing and searching highlights
- Coordinates are in PDF coordinate system (not screen coordinates)
- Position data is immutable - cannot change after creation, only content and metadata
- Multiple highlights can reference the same note
- Deleted highlights cannot be recovered
