# API Endpoints Complexity Analysis

This document categorizes API endpoints based on their operational complexity to assist in determining rate limiting capacities.

| Endpoint                                                         | Method | Complexity | Reason                                                   |
| :--------------------------------------------------------------- | :----- | :--------- | :------------------------------------------------------- |
| **AI**                                                           |        |            |                                                          |
| `/api/v1/ai/explain`                                             | POST   | **High**   | Generates text using AI (computationally intensive).     |
| `/api/v1/ai/assistant`                                           | POST   | **High**   | AI Chat processing + History context.                    |
| `/api/v1/ai/generate-summary`                                    | POST   | **High**   | Processes document content and generates AI summary.     |
| **Documents**                                                    |        |            |                                                          |
| `/api/v1/documents/`                                             | GET    | **Low**    | Simple database query (list).                            |
| `/api/v1/documents/:id`                                          | GET    | **Low**    | Simple database query (metadata).                        |
| `/api/v1/documents/upload-url`                                   | POST   | **Medium** | Generates signed URL (Storage Service interaction).      |
| `/api/v1/documents/finish-upload`                                | POST   | **Medium** | Database insert + Potential storage validation.          |
| `/api/v1/documents/:id`                                          | DELETE | **Medium** | Deletes from Database and Storage Service.               |
| `/api/v1/documents/:id/move`                                     | PATCH  | **Low**    | Simple database update.                                  |
| `/api/v1/documents/:id/rename`                                   | PUT    | **Low**    | Simple database update.                                  |
| `/api/v1/documents/google-drive`                                 | POST   | **High**   | External API call (Google Drive) + File processing.      |
| `/api/v1/documents/google-drive/:id`                             | GET    | **High**   | Proxy download from Google + Upload to Storage + Stream. |
| `/api/v1/documents/:id/generate-summary`                         | POST   | **High**   | AI Generation + Document Text Extraction.                |
| **Flashcards**                                                   |        |            |                                                          |
| `/api/v1/flashcards/`                                            | POST   | **Low**    | Manual creation (Database Insert).                       |
| `/api/v1/flashcards/generate-from-document`                      | POST   | **High**   | AI Generation from Document Content.                     |
| `/api/v1/flashcards/:id`                                         | GET    | **Low**    | Simple database query.                                   |
| `/api/v1/flashcards/document/:documentId`                        | GET    | **Low**    | Simple database query.                                   |
| `/api/v1/flashcards/:id`                                         | DELETE | **Low**    | Simple database delete.                                  |
| `/api/v1/flashcards/`                                            | GET    | **Low**    | Simple database query.                                   |
| **Folders**                                                      |        |            |                                                          |
| `/api/v1/folders/`                                               | GET    | **Low**    | Simple database query.                                   |
| `/api/v1/folders/`                                               | POST   | **Low**    | Simple database insert.                                  |
| `/api/v1/folders/:id`                                            | GET    | **Low**    | Simple database query.                                   |
| `/api/v1/folders/:id`                                            | PATCH  | **Low**    | Simple database update.                                  |
| `/api/v1/folders/:id`                                            | DELETE | **Medium** | Database delete + Recursive updates (moving children).   |
| **Google Classroom**                                             |        |            |                                                          |
| `/api/v1/integrations/lms/google-classroom/connect`              | GET    | **Low**    | Redirect to OAuth provider.                              |
| `/api/v1/integrations/lms/google-classroom/callback`             | GET    | **Medium** | OAuth Token Exchange + Database Update.                  |
| `/api/v1/integrations/lms/google-classroom/refresh-token`        | POST   | **Medium** | External API Call (Google Auth).                         |
| `/api/v1/integrations/lms/google-classroom/check-token`          | GET    | **Low**    | Database/Memory check.                                   |
| `/api/v1/integrations/lms/google-classroom/disconnect`           | POST   | **Low**    | Database update.                                         |
| `/api/v1/integrations/lms/google-classroom/connection-status`    | GET    | **Low**    | Database check.                                          |
| `/api/v1/integrations/lms/google-classroom/courses`              | GET    | **Medium** | External API Call (List Courses).                        |
| `/api/v1/integrations/lms/google-classroom/courses-with-content` | GET    | **High**   | Multiple External API Calls (Heavy data fetch).          |
| `/api/v1/integrations/lms/google-classroom/courses/:id/content`  | GET    | **High**   | External API Call (Fetch Course Materials).              |
| **Highlights**                                                   |        |            |                                                          |
| `/api/v1/highlights/`                                            | GET    | **Low**    | Simple database query.                                   |
| `/api/v1/highlights/`                                            | POST   | **Low**    | Simple database insert.                                  |
| `/api/v1/highlights/:id`                                         | GET    | **Low**    | Simple database query.                                   |
| `/api/v1/highlights/:id`                                         | PATCH  | **Low**    | Simple database update.                                  |
| `/api/v1/highlights/:id`                                         | DELETE | **Low**    | Simple database delete.                                  |
| **Notes**                                                        |        |            |                                                          |
| `/api/v1/notes/`                                                 | POST   | **Low**    | Simple database insert.                                  |
| `/api/v1/notes/`                                                 | GET    | **Low**    | Simple database query.                                   |
| `/api/v1/notes/:id`                                              | GET    | **Low**    | Simple database query.                                   |
| `/api/v1/notes/:id`                                              | PATCH  | **Low**    | Simple database update.                                  |
| `/api/v1/notes/:id`                                              | DELETE | **Low**    | Simple database delete.                                  |
| **Quizzes**                                                      |        |            |                                                          |
| `/api/v1/quizzes/`                                               | POST   | **High**   | AI Generation + Document Processing.                     |
| `/api/v1/quizzes/`                                               | GET    | **Low**    | Simple database query.                                   |
| `/api/v1/quizzes/:id`                                            | GET    | **Low**    | Simple database query.                                   |
| `/api/v1/quizzes/:id`                                            | DELETE | **Low**    | Simple database delete.                                  |
| **Settings**                                                     |        |            |                                                          |
| `/api/v1/settings/`                                              | GET    | **Low**    | Simple database query.                                   |
| `/api/v1/settings/`                                              | PATCH  | **Low**    | Simple database update.                                  |

## Proposed Rate Limiting Strategy

Based on the complexity levels identified above, the following rate limiting tiers are proposed to ensure system stability and fair resource usage.

### 1. Tier 1: High Complexity (AI & Heavy Integration)

- **Endpoints**: All AI generation, Google Classroom content fetching, Google Drive proxy.
- **Proposed Limit**: 5 requests per 5 minutes per user.
- **Reasoning**: These operations are computationally expensive (AI) or involve multiple high-latency external network calls.

### 2. Tier 2: Medium Complexity (Storage & Meta-Operations)

- **Endpoints**: File uploads, deletions, OAuth callbacks, Folder recursive deletes.
- **Proposed Limit**: 20 requests per minute per user.
- **Reasoning**: These involve significant I/O operations or interactions with external services like Supabase Storage.

### 3. Tier 3: Low Complexity (Standard CRUD)

- **Endpoints**: Fetching lists, getting single items, simple updates, manual creation.
- **Proposed Limit**: 100 requests per minute per user.
- **Reasoning**: These are lightweight database operations with minimal performance impact.

### Implementation Notes

- Consider using a sliding window algorithm for smoother enforcement.
- AI-specific endpoints might require additional quotas (e.g., monthly token limits).
- Administrative or "Test" routes should have even stricter limits or be restricted to specific environments.
