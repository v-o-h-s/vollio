# Summary API Endpoints

Base URL: `/api/v1/summaries`

## 1. Create Summary

Creates a new summary for a document.

- **URL**: `/`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body Parameters**:

  - `documentId` (string, required): UUID of the document
  - `mainPoints` (string[], required): List of key points summarized from the document
  - `text` (string, optional): Full text of the summary

- **Success Response**:

  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Summary created successfully",
      "data": {
        "id": "string (UUID)",
        "documentId": "string (UUID)",
        "mainPoints": ["string"],
        "text": "string"
      }
    }
    ```

- **Error Responses**:
  - **Code**: 401 Unauthorized
  - **Code**: 400 Bad Request (Invalid input)

---

## 2. Update Summary

Updates an existing summary's main points or text.

- **URL**: `/`
- **Method**: `PATCH`
- **Auth Required**: Yes
- **Body Parameters**:

  - `id` (string, required): UUID of the summary to update
  - `mainPoints` (string[], optional): Updated list of key points
  - `text` (string, optional): Updated full text

- **Success Response**:

  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Summary updated successfully",
      "data": {
        "id": "string (UUID)",
        "documentId": "string (UUID)",
        "mainPoints": ["string"],
        "text": "string"
      }
    }
    ```

- **Error Responses**:
  - **Code**: 401 Unauthorized
  - **Code**: 404 Not Found (If summary ID doesn't exist)

---

## 3. Delete Summary

Deletes a specific summary.

- **URL**: `/`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **Body Parameters**:

  - `id` (string, required): UUID of the summary to delete

- **Success Response**:

  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Summary deleted successfully",
      "data": null
    }
    ```

- **Error Responses**:
  - **Code**: 401 Unauthorized

---

## 4. Get Summaries by Document ID

Retrieves all summaries associated with a specific document.

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: Yes
- **Query Parameters**:

  - `documentId` (string, required): UUID of the document

- **Success Response**:

  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Summaries retrieved successfully",
      "data": [
        {
          "id": "string (UUID)",
          "documentId": "string (UUID)",
          "mainPoints": ["string"],
          "text": "string"
        }
      ]
    }
    ```

- **Error Responses**:
  - **Code**: 401 Unauthorized

---

## 5. Get Summary by ID

Retrieves a specific summary by its ID.

- **URL**: `/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **URL Parameters**:

  - `id` (string, required): UUID of the summary

- **Success Response**:

  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Summary retrieved successfully",
      "data": {
        "id": "string (UUID)",
        "documentId": "string (UUID)",
        "mainPoints": ["string"],
        "text": "string"
      }
    }
    ```

- **Error Responses**:
  - **Code**: 401 Unauthorized
  - **Code**: 404 Not Found
