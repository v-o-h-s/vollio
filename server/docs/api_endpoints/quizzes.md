# Quiz API Endpoints

Base URL: `/api/v1/quizzes`

## 1. Create Quiz

Generates a new quiz from a document.

- **URL**: `/`
- **Method**: `POST`
- **Auth Required**: Yes
- **Body Parameters**:
  - `documentId` (string, required): UUID of the document
  - `difficultyLevel` (string, required): "easy", "medium", or "hard"
  - `userPrompt` (string, optional): Guide for generation
  - `numberOfQuestions` (number, optional): Total questions (1-44)
  - `language` (string, optional): "en", "fr", or "ar"

  - `explanationLevel` (string, optional): "none", "brief", or "detailed"
  - `questionsDistribution` (object, optional):
    - `mcq` (number): Number of MCQs
    - `true_false` (number): Number of True/False questions

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:

    ```json
    {
      "success": true,
      "message": "Quiz created successfully",
      "data": {
        "id": "string (UUID)",
        "title": "string",
        "documentId": "string (UUID)",
        "language": "string",
        "settings": {
            "difficultyLevel": "string",
            "numberOfQuestions": number,

            "explanationLevel": "string"
        },
        "questions": [...],
        "createdAt": "string (ISO timestamp)"
      }
    }
    ```

  - **Error Responses**:
    - **Code**: 401 Unauthorized
      ```json
      {
        "success": false,
        "message": "Unauthorized",
        "data": null,
        "error": {
          "name": "UnauthorizedError",
          "subType": "Unauthorized",
          "message": "Unauthorized",
          "details": "Unauthorized",
          "statusCode": 401,
          "extra": {}
        }
      }
      ```
    - **Code**: 404 Not Found (If documentId is invalid)
    - **Code**: 500 Internal Server Error (If AI generation fails or no content found)

## 2. Get All Quizzes

Retrieves all quizzes for the authenticated user. Note: Question details are typically excluded (returns empty array) for performance in list views.

- **URL**: `/`
- **Method**: `GET`
- **Auth Required**: Yes

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Quizzes retrieved successfully",
      "data": [
        {
          "id": "string (UUID)",
          "title": "string",
          "documentId": "string (UUID)",
          "language": "string",
          "settings": {...},
          "createdAt": "string (ISO timestamp)"
        }
      ]
    }
    ```

- **Error Responses**:
  - **Code**: 401 Unauthorized

## 3. Get Quiz by ID

Retrieves a specific quiz with all its questions and options.

- **URL**: `/:id`
- **Method**: `GET`
- **Auth Required**: Yes
- **URL Parameters**:
  - `id` (string): The UUID of the quiz

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Quiz retrieved successfully",
      "data": {
        "id": "string (UUID)",
        "title": "string",
        "questions": [...]
      }
    }
    ```

- **Error Responses**:
  - **Code**: 401 Unauthorized
  - **Code**: 404 Not Found (If quiz ID is invalid or doesn't exist)

## 4. Delete Quiz

Deletes a quiz and all associated questions and metadata.

- **URL**: `/:id`
- **Method**: `DELETE`
- **Auth Required**: Yes
- **URL Parameters**:
  - `id` (string): The UUID of the quiz

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Quiz deleted successfully",
      "data": null
    }
    ```

- **Error Responses**:
  - **Code**: 401 Unauthorized
