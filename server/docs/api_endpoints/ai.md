# AI API Endpoints

Base URL: `/api/v1/ai`

## 1. Explain Text

Generates an explanation for the provided text using generative AI.

- **URL**: `/explain`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body Parameters**:

  - `text` (string): The text to be explained (max 1000 words).

- **Success Response**:

  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Explanation generated successfully",
      "data": {
        "title": "string",
        "content": {
          "type": "doc",
          "content": [...]
        }
      },
      "error": null
    }
    ```

- **Error Response**:
  - **Code**: 400 Bad Request
    ```json
    {
      "success": false,
      "message": "Input text is too long. Please provide text with less than 1000 words.",
      "data": null,
      "error": { "message": "Input text is too long..." }
    }
    ```
  - **Code**: 401 Unauthorized
    ```json
    {
      "success": false,
      "message": "Not authenticated",
      "data": null,
      "error": { "message": "Not authenticated" }
    }
    ```

## 2. Assistant Chat

Generates a response from the AI assistant based on the provided message and history.

- **URL**: `/assistant`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body Parameters**:

  - `message` (string): The user's message.
  - `history` (array, optional): Previous chat history.
    - `role` (string): "user" | "assistant"
    - `content` (string): The text content of the message.

- **Success Response**:

  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Assistant response generated successfully",
      "data": {
        "content": {
          "type": "doc",
          "content": [...]
        }
      },
      "error": null
    }
    ```

## 3. Generate Summary

Generates an AI summary for the provided document.

- **URL**: `/generate-summary`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body Parameters**:

  - `documentId` (string): The document ID to summarize.

- **Success Response**:

  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Summary generated successfully",
      "data": {
        "id": "string",
        "documentId": "string",
        "text": "string"
      },
      "error": null
    }
    ```
