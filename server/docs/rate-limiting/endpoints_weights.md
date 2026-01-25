# Endpoint Rate Limiting Weights

This document defines the cost (weight) associated with each API endpoint for rate limiting purposes. The Token Bucket algorithm is used, where each user has a bucket of tokens that replenishes over time. Consuming an endpoint deducts the specified number of tokens from the bucket.

## Weight Categories

| Category | Cost (Tokens) | Description |
| :--- | :--- | :--- |
| **Low** | 1 | Standard database operations (CRUD), lightweight logic. |
| **Medium** | 5 | External API calls (Google Drive/Classroom), complex queries, file operations. |
| **High** | 20 | AI generation (LLM), Embeddings, heavy processing, recursive external API calls. |

## Endpoint Weights

### Assistant (`/api/v1/assistant`)

| Method | Endpoint | Handler | Weight | Category |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/` | `assistantChat` | **20** | High |

### Documents (`/api/v1/documents`)

| Method | Endpoint | Handler | Weight | Category |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/` | `getAllDocuments` | **1** | Low |
| GET | `/google-drive/:documentId` | `getDocumentFromGoogleDrive` | **5** | Medium |
| POST | `/google-drive` | `addDocumentFromGoogleDrive` | **5** | Medium |
| POST | `/upload-url` | `getStorageUrl` | **1** | Low |
| GET | `/:id` | `getDocumentById` | **1** | Low |
| DELETE | `/:id` | `deleteDocument` | **1** | Low |
| PATCH | `/:id/move` | `moveDocument` | **1** | Low |
| PUT | `/:id/rename` | `renameDocument` | **1** | Low |
| POST | `/:id/generate-summary` | `generateSummary` | **20** | High |
| POST | `/finish-upload` | `createDocument` | **1** | Low |

### Flashcards (`/api/v1/flashcards`)

| Method | Endpoint | Handler | Weight | Category |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/` | `createFlashCardsSet` | **1** | Low |
| POST | `/generate-from-document` | `generateFlashCardsSet` | **20** | High |
| GET | `/:id` | `getFlashCardsSetById` | **1** | Low |
| GET | `/document/:documentId` | `getFlashCardsSetsByDocumentId` | **1** | Low |
| DELETE | `/:id` | `deleteFlashCardsSet` | **1** | Low |
| GET | `/` | `getAllFlashCardsSets` | **1** | Low |

### Folders (`/api/v1/folders`)

| Method | Endpoint | Handler | Weight | Category |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/` | `getAllFolders` | **1** | Low |
| POST | `/` | `createFolder` | **1** | Low |
| GET | `/:id` | `getFolderById` | **1** | Low |
| PUT | `/:id` | `updateFolder` | **1** | Low |
| DELETE | `/:id` | `deleteFolder` | **1** | Low |

### Google Classroom (`/api/v1/integrations/lms/google-classroom`)

| Method | Endpoint | Handler | Weight | Category |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/connect` | `connect` | **1** | Low |
| GET | `/callback` | `callback` | **5** | Medium |
| GET | `/refresh` | `refreshAccessToken` | **5** | Medium |
| GET | `/check` | `checkTokenStatus` | **1** | Low |
| DELETE | `/disconnect` | `disconnect` | **1** | Low |
| GET | `/status` | `getConnectionStatus` | **1** | Low |
| GET | `/courses/list` | `getCourses` | **5** | Medium |
| GET | `/courses` | `getCoursesWithContent` | **20** | High |
| GET | `/courses/:courseId/content` | `getCourseContent` | **5** | Medium |

### Highlights (`/api/v1/highlights`)

| Method | Endpoint | Handler | Weight | Category |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/` | `getHighlightsByDocumentId` | **1** | Low |
| POST | `/` | `createHighlight` | **1** | Low |
| GET | `/:id` | `getHighlightById` | **1** | Low |
| PATCH | `/:id` | `updateHighlight` | **1** | Low |
| DELETE | `/:id` | `deleteHighlight` | **1** | Low |
| GET | `/tags/:tagName/count` | `countHighlightsByTag` | **1** | Low |
| DELETE | `/tags/:tagName` | `deleteHighlightsByTag` | **1** | Low |

### Notes (`/api/v1/notes`)

| Method | Endpoint | Handler | Weight | Category |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/` | `createNote` | **1** | Low |
| GET | `/` | `getAllNotes` | **1** | Low |
| GET | `/:id` | `getNoteById` | **1** | Low |
| PUT | `/:id` | `updateNote` | **1** | Low |
| DELETE | `/:id` | `deleteNote` | **1** | Low |

### Quizzes (`/api/v1/quizzes`)

| Method | Endpoint | Handler | Weight | Category |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/` | `createQuiz` | **20** | High |
| GET | `/:id` | `getQuizById` | **1** | Low |
| DELETE | `/:id` | `deleteQuizById` | **1** | Low |
| GET | `/` | `getAllQuizzes` | **1** | Low |

### Settings (`/api/v1/settings`)

| Method | Endpoint | Handler | Weight | Category |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/` | `getSettings` | **1** | Low |
| PATCH | `/` | `updateSettings` | **1** | Low |

### Test (`/api/v1/test`)

| Method | Endpoint | Handler | Weight | Category |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/:id` | `embeddDocument` | **20** | High |
