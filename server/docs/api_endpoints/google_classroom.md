# Google Classroom Integration API Endpoints

Base URL: `/api/v1/integrations/lms/google-classroom`

## 1. Connect

Initiates the OAuth2 flow to connect to Google Classroom.

- **URL**: `/connect`
- **Method**: `GET`
- **Auth Required**: Yes
- **Response**: Redirects to Google OAuth consent screen (302 redirect)

## 2. Callback

Handles the OAuth2 callback from Google.

- **URL**: `/callback`
- **Method**: `GET`
- **Query Parameters**:
  - `code` (string, required): Authorization code
  - `state` (string, optional): CSRF state token

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Connected to Google Classroom successfully",
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
  - **Code**: 400 Bad Request (CSRF validation failed)
    ```json
    {
      "success": false,
      "message": "Invalid state parameter - possible CSRF attack detected",
      "data": null,
      "error": "CSRF validation failed"
    }
    ```

## 3. Refresh Token

Manually refreshes the Google Classroom access token.

- **URL**: `/refresh`
- **Method**: `GET`
- **Auth Required**: Yes

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Access token refreshed successfully",
      "data": null,
      "error": null
    }
    ```

- **Error Response**:
  - **Code**: 401 Unauthorized

## 4. Check Token Status

Checks if the current Google Classroom token is valid.

- **URL**: `/check`
- **Method**: `GET`
- **Auth Required**: Yes

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Token status retrieved successfully",
      "data": {
        "isValid": true
      },
      "error": null
    }
    ```

- **Error Response**:
  - **Code**: 401 Unauthorized

## 5. Disconnect

Disconnects the user from Google Classroom (removes tokens).

- **URL**: `/disconnect`
- **Method**: `DELETE`
- **Auth Required**: Yes

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Disconnected from Google Classroom successfully",
      "data": null,
      "error": null
    }
    ```

- **Error Response**:
  - **Code**: 401 Unauthorized

## 6. Get Connection Status

Checks if the user is currently connected to Google Classroom.

- **URL**: `/status`
- **Method**: `GET`
- **Auth Required**: Yes

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Connection status retrieved successfully",
      "data": {
        "isConnected": true
      },
      "error": null
    }
    ```

- **Error Response**:
  - **Code**: 401 Unauthorized

## 7. List Courses

Retrieves a lightweight list of courses from Google Classroom (without content).

- **URL**: `/courses/list`
- **Method**: `GET`
- **Auth Required**: Yes

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Courses retrieved successfully",
      "data": [
        {
          "id": "string",
          "name": "string",
          "updateTime": "string (ISO 8601)",
          "courseState": "ACTIVE | ARCHIVED | PROVISIONED | DECLINED | SUSPENDED",
          "alternateLink": "string (optional)"
        }
      ],
      "error": null
    }
    ```

- **Error Response**:
  - **Code**: 401 Unauthorized

## 8. Get Courses with Content

Retrieves courses along with their content (announcements and materials). **Note**: This is a heavy operation that fetches all content for all courses.

- **URL**: `/courses`
- **Method**: `GET`
- **Auth Required**: Yes

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Courses with content retrieved successfully",
      "data": [
        {
          "id": "string",
          "name": "string",
          "updateTime": "string",
          "courseState": "string",
          "alternateLink": "string",
          "content": {
            "announcements": [
              {
                "id": "string",
                "courseId": "string",
                "state": "PUBLISHED | DRAFT | DELETED",
                "alternateLink": "string",
                "updatedAt": "string",
                "materials": {
                  "driveFiles": [
                    {
                      "id": "string",
                      "title": "string"
                    }
                  ]
                }
              }
            ],
            "materials": [
              {
                "id": "string",
                "courseId": "string",
                "title": "string (optional)",
                "state": "PUBLISHED | DRAFT | DELETED",
                "alternateLink": "string",
                "updatedAt": "string",
                "materials": {
                  "driveFiles": [
                    {
                      "id": "string",
                      "title": "string",
                      "thumbnailUrl": "string (optional)"
                    }
                  ]
                }
              }
            ]
          }
        }
      ],
      "error": null
    }
    ```

- **Error Response**:
  - **Code**: 401 Unauthorized

## 9. Get Course Content

Retrieves content (announcements and materials) for a specific course.

- **URL**: `/courses/:courseId/content`
- **Method**: `GET`
- **Auth Required**: Yes
- **URL Parameters**:
  - `courseId` (string): The Google Classroom Course ID

- **Success Response**:
  - **Code**: 200 OK
  - **Content**:
    ```json
    {
      "success": true,
      "message": "Course content retrieved successfully",
      "data": {
        "announcements": [
          {
            "id": "string",
            "courseId": "string",
            "state": "PUBLISHED | DRAFT | DELETED",
            "alternateLink": "string",
            "updatedAt": "string",
            "materials": {
              "driveFiles": [
                {
                  "id": "string",
                  "title": "string"
                }
              ]
            }
          }
        ],
        "materials": [
          {
            "id": "string",
            "courseId": "string",
            "title": "string (optional)",
            "state": "PUBLISHED | DRAFT | DELETED",
            "alternateLink": "string",
            "updatedAt": "string",
            "materials": {
              "driveFiles": [
                {
                  "id": "string",
                  "title": "string",
                  "thumbnailUrl": "string (optional)"
                }
              ]
            }
          }
        ]
      },
      "error": null
    }
    ```

- **Error Response**:
  - **Code**: 401 Unauthorized
  - **Note**: If the course or content is not found, gracefully returns empty arrays instead of throwing 404
