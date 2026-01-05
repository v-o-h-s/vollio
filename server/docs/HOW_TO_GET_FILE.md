# How to Get Document Content

This guide explains the process and logic for retrieving document content within the Vollio system, particularly focusing on the hybrid source approach (Local/Supabase Storage vs. Google Drive).

## Core Strategy: Hybrid Fetching & Caching

Vollio uses an "On-Demand Caching" strategy for external documents (currently Google Drive/Classroom). This minimizes external API calls and ensures better performance for subsequent access.

### 1. Document Identification

Each document in the system has:

- `id`: Internal UUID.
- `google_document_id`: (Optional) ID from Google Drive.
- `storage_path`: (Optional) Path in Supabase Storage if the file is locally cached.

### 2. Retrieval Flow (`GetDocumentById`)

When a client requests a document by its internal ID (`GET /api/v1/documents/:id`):

1.  **Metadata Check**: The system checks if the document exists and determines its source.
2.  **Source Discrimination**:
    - **Native/Already Cached**: If a `storage_path` exists, the system immediately generates a **Signed URL** from Supabase Storage.
    - **Google Drive (First Access)**: If it's a Google Drive document without a `storage_path`:
      - The system triggers an asynchronous **Caching Flow**.
      - It attempts to download the file from Google, upload it to Supabase Storage, and update the `storage_path`.
      - **Immediate Response**: If caching is successful within the request window, it returns the new signed URL. If not (fallback), it returns a **Proxy URL** (`/api/v1/documents/google-drive/:id`) that allows the client to stream it directly while caching finishes in the background.

### 3. Proxy URL Strategy (`GET /api/v1/documents/google-drive/:id`)

This endpoint serves as a bridge for uncached Google Drive documents:

- It requires authentication.
- It fetches the content from Google Drive using the user's OAuth tokens.
- It streams the binary content directly to the client.
- **Side Effect**: It also triggers/ensures the caching process so that the next request will use the faster Supabase Storage path.

## Summary Table

| Source Type      | First Access Action       | Subsequent Access Action |
| :--------------- | :------------------------ | :----------------------- |
| **Local Upload** | Signed URL (Supabase)     | Signed URL (Supabase)    |
| **Google Drive** | Proxy URL → Trigger Cache | Signed URL (Supabase)    |

## Implementation Details

### Server-side

- `GetDocumentByIdUseCase`: Orchestrates the source check and caching trigger.
- `GetDocumentFromGoogleDriveUseCase`: Handles the heavy lifting of token validation, downloading, uploading, and DB updates.
- `document.controller.ts`: Exposes the endpoints.

### Client-side

- `BetterViewer.tsx`: Consumes the `documentUrl` provided by the server. It doesn't need to know the origin; it just treats the URL as the source for `PdfLoader`.
- `documentEndpoint.ts`: Defines the RTK Query hooks.
