# API Endpoints Complexity Analysis

This document categorizes API endpoints based on their operational complexity to assist in determining rate limiting capacities.

| Endpoint | Method | Complexity | Reason |
| :--- | :--- | :--- | :--- |
| **AI** | | | |
| `/api/v1/ai/explain` | POST | **High** | Generates text using AI (computationally intensive). |
| `/api/v1/ai/assistant` | POST | **High** | AI Chat processing + History context. |
| `/api/v1/ai/generate-summary` | POST | **High** | Processes document content and generates AI summary. |
| **Documents** | | | |
| `/api/v1/documents/` | GET | **Low** | Simple database query (list). |
| `/api/v1/documents/:id` | GET | **Low** | Simple database query (metadata). |
| `/api/v1/documents/upload-url` | POST | **Medium** | Generates signed URL (Storage Service interaction). |
| `/api/v1/documents/finish-upload` | POST | **Medium** | Database insert + Potential storage validation. |
| `/api/v1/documents/:id` | DELETE | **Medium** | Deletes from Database and Storage Service. |
| `/api/v1/documents/:id/move` | PATCH | **Low** | Simple database update. |
| `/api/v1/documents/:id/rename` | PUT | **Low** | Simple database update. |
| `/api/v1/documents/google-drive` | POST | **High** | External API call (Google Drive) + File processing. |
| `/api/v1/documents/google-drive/:id` | GET | **High** | Proxy download from Google + Upload to Storage + Stream. |
| `/api/v1/documents/:id/generate-summary` | POST | **High** | AI Generation + Document Text Extraction. |
| **Flashcards** | | | |
| `/api/v1/flashcards/` | POST | **Low** | Manual creation (Database Insert). |
| `/api/v1/flashcards/generate-from-document` | POST | **High** | AI Generation from Document Content. |
| `/api/v1/flashcards/:id` | GET | **Low** | Simple database query. |
| `/api/v1/flashcards/document/:documentId` | GET | **Low** | Simple database query. |
| `/api/v1/flashcards/:id` | DELETE | **Low** | Simple database delete. |
| `/api/v1/flashcards/` | GET | **Low** | Simple database query. |
| **Folders** | | | |
| `/api/v1/folders/` | GET | **Low** | Simple database query. |
| `/api/v1/folders/` | POST | **Low** | Simple database insert. |
| `/api/v1/folders/:id` | GET | **Low** | Simple database query. |
| `/api/v1/folders/:id` | PATCH | **Low** | Simple database update. |
| `/api/v1/folders/:id` | DELETE | **Medium** | Database delete + Recursive updates (moving children). |
| **Google Classroom** | | | |
| `/api/v1/integrations/lms/google-classroom/connect` | GET | **Low** | Redirect to OAuth provider. |
| `/api/v1/integrations/lms/google-classroom/callback` | GET | **Medium** | OAuth Token Exchange + Database Update. |
| `/api/v1/integrations/lms/google-classroom/refresh-token` | POST | **Medium** | External API Call (Google Auth). |
| `/api/v1/integrations/lms/google-classroom/check-token` | GET | **Low** | Database/Memory check. |
| `/api/v1/integrations/lms/google-classroom/disconnect` | POST | **Low** | Database update. |
| `/api/v1/integrations/lms/google-classroom/connection-status` | GET | **Low** | Database check. |
| `/api/v1/integrations/lms/google-classroom/courses` | GET | **Medium** | External API Call (List Courses). |
| `/api/v1/integrations/lms/google-classroom/courses-with-content` | GET | **High** | Multiple External API Calls (Heavy data fetch). |
| `/api/v1/integrations/lms/google-classroom/courses/:id/content` | GET | **High** | External API Call (Fetch # Fix this TypeError in a node application

## Error Summary
- **Type:** TypeError
- **Message:** Promise.withResolvers is not a function
- **Status:** Unhandled
- **Location:** /app/server/dist/infrastructure/services/DocumentProcessingService.js in `DocumentProcessingService.getText`
- **Time Range:** 2026-02-04T03:48:30.000Z to 2026-02-04T10:34:15.000Z

## Stack Trace
```
TypeError: Promise.withResolvers is not a function
    at QuizController.createQuiz (/app/server/dist/interface/controllers/quiz.controller.js:19:30)
    at CreateGeneralQuizUseCase.execute (/app/server/dist/application/use-cases/quizzes/CreateGeneralQuizUseCase.js:31:9)
    at EnsureDocumentChunkedUseCase.execute (/app/server/dist/application/use-cases/chunking/EnsureExistingOfDocumentChunkUseCase.js:12:13)
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    at ChunkDocumentByIdUseCase.execute (/app/server/dist/application/use-cases/chunking/ChunkDocumentByIdUseCase.js:13:59)
    at DocumentProcessingService.getText (/app/server/dist/infrastructure/services/DocumentProcessingService.js:41:38)
    at Object.getDocument (/app/node_modules/pdfjs-dist/build/pdf.mjs:11351:16)
    at new PDFDocumentLoadingTask (/app/node_modules/pdfjs-dist/build/pdf.mjs:11542:32)
```

## Breadcrumbs
1. [2026-02-04T10:34:19.000Z] http - https://sgihxxokwpsahogqrlla.supabase.co/storage/v1/object/documents/c03cf7de-5052-4779-a8d0-8fed79fdd661/1770197743073_nmo_lab_01.pdf - 200
2. [2026-02-04T10:34:18.000Z] http - https://sgihxxokwpsahogqrlla.supabase.co/rest/v1/documents - 200
3. [2026-02-04T10:34:18.000Z] http - https://sgihxxokwpsahogqrlla.supabase.co/rest/v1/chunks - 200
4. [2026-02-04T10:34:18.000Z] http - https://sgihxxokwpsahogqrlla.supabase.co/storage/v1/object/sign/documents/c03cf7de-5052-4779-a8d0-8fed79fdd661/1770197743073_nmo_lab_01.pdf - 200
5. [2026-02-04T10:34:18.000Z] http - https://sgihxxokwpsahogqrlla.supabase.co/rest/v1/documents - 200
6. [2026-02-04T10:34:18.000Z] http - POST /api/v1/quizzes
7. [2026-02-04T10:34:18.000Z] http - https://sgihxxokwpsahogqrlla.supabase.co/auth/v1/user - 200
8. [2026-02-04T10:34:01.000Z] console - Sentry initialized for deployment environment

## Impact
- **Occurrences:** 6
- **Affected Users:** 2
- **Environment:** deployment

## Technical Details
- Runtime: node v20.20.0
- OS: Alpine Linux 3.23.3

- Device: x64 - DO-Premium-AMD
- Environment: deployment
- Server: ef7cf10df232
- URL: https://api.vollio.xyz/api/v1/quizzes
- Method: POST
- User: abderrahmane.dilmi@ensia.edu.dz (abderrahmane.dilmi@ensia.edu.dz)

## Tags
environment=deployment, level=error, mechanism=auto.function.fastify, os=Alpine Linux 3.23.3
, os.name=Alpine Linux, runtime=node v20.20.0, runtime.name=node, server_name=ef7cf10df232, user=id:c03cf7de-5052-4779-a8d0-8fed79fdd661, url=https://api.vollio.xyz/api/v1/quizzes

## Contexts
- user:
  - id: c03cf7de-5052-4779-a8d0-8fed79fdd661
  - email: abderrahmane.dilmi@ensia.edu.dz
- trace:
  - span_id: 77228c74dae5946e
  - trace_id: 556861a25d650562a32e5b5656503550
- runtime:
  - name: node
  - version: v20.20.0
- app:
  - app_start_time: 2026-02-04T10:33:59.225Z
  - app_memory: 237293568
  - free_memory: 1730904064
- os:
  - kernel_version: 6.17.0-8-generic
  - name: Alpine Linux
  - version: 3.23.3

- device:
  - boot_time: 2026-02-03T14:17:45.356Z
  - arch: x64
  - memory_size: 4104159232
  - free_memory: 1730904064
  - processor_count: 2
  - cpu_description: DO-Premium-AMD
  - processor_frequency: 0
- culture:
  - locale: en-US
  - timezone: UTC

---

# Steps

1. **Analyze the Error:** Identify the root cause from stack trace, call site, and context
2. **Determine Fix Location:** Locate the exact file and function that needs modification
3. **Implement the Fix:** Make the necessary code changes or configuration adjustments to resolve the issue
4. **Validate Fix:** Ensure the solution addresses the root cause without introducing new issues

# Notes

- Focus on actionable fixes, not just explanations
- Include file paths and line numbers when relevant
- If multiple solutions exist, provide the most reliable one
- For recurring errors (high occurrence count), suggest preventive measures
- Keep fixes minimal and targeted to the specific issue
). |
| **Highlights** | | | |
| `/api/v1/highlights/` | GET | **Low** | Simple database query. |
| `/api/v1/highlights/` | POST | **Low** | Simple database insert. |
| `/api/v1/highlights/:id` | GET | **Low** | Simple database query. |
| `/api/v1/highlights/:id` | PATCH | **Low** | Simple database update. |
| `/api/v1/highlights/:id` | DELETE | **Low** | Simple database delete. |
| **Notes** | | | |
| `/api/v1/notes/` | POST | **Low** | Simple database insert. |
| `/api/v1/notes/` | GET | **Low** | Simple database query. |
| `/api/v1/notes/:id` | GET | **Low** | Simple database query. |
| `/api/v1/notes/:id` | PATCH | **Low** | Simple database update. |
| `/api/v1/notes/:id` | DELETE | **Low** | Simple database delete. |
| **Quizzes** | | | |
| `/api/v1/quizzes/` | POST | **High** | AI Generation + Document Processing. |
| `/api/v1/quizzes/` | GET | **Low** | Simple database query. |
| `/api/v1/quizzes/:id` | GET | **Low** | Simple database query. |
| `/api/v1/quizzes/:id` | DELETE | **Low** | Simple database delete. |
| **Settings** | | | |
| `/api/v1/settings/` | GET | **Low** | Simple database query. |
| `/api/v1/settings/` | PATCH | **Low** | Simple database update. |

## Proposed Rate Limiting Strategy

Based on the complexity levels identified above, the following rate limiting tiers are proposed to ensure system stability and fair resource usage.

### 1. Tier 1: High Complexity (AI & Heavy Integration)
*   **Endpoints**: All AI generation, Google Classroom content fetching, Google Drive proxy.
*   **Proposed Limit**: 5 requests per 5 minutes per user.
*   **Reasoning**: These operations are computationally expensive (AI) or involve multiple high-latency external network calls.

### 2. Tier 2: Medium Complexity (Storage & Meta-Operations)
*   **Endpoints**: File uploads, deletions, OAuth callbacks, Folder recursive deletes.
*   **Proposed Limit**: 20 requests per minute per user.
*   **Reasoning**: These involve significant I/O operations or interactions with external services like Supabase Storage.

### 3. Tier 3: Low Complexity (Standard CRUD)
*   **Endpoints**: Fetching lists, getting single items, simple updates, manual creation.
*   **Proposed Limit**: 100 requests per minute per user.
*   **Reasoning**: These are lightweight database operations with minimal performance impact.

### Implementation Notes
- Consider using a sliding window algorithm for smoother enforcement.
- AI-specific endpoints might require additional quotas (e.g., monthly token limits).
- Administrative or "Test" routes should have even stricter limits or be restricted to specific environments.
