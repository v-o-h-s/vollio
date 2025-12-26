# API Hooks Reference

This document provides a comprehensive list of all available RTK Query hooks in the application.

## Table of Contents

- [PDF Management](#pdf-management)
- [Folder Management](#folder-management)
- [Notes Management](#notes-management)
- [Annotations](#annotations)
- [Highlights](#highlights)
- [Summaries](#summaries)
- [Google Classroom Integration](#google-classroom-integration)
- [File Management](#file-management)

---

## PDF Management

### Queries

- `useGetPDFsQuery()` - Fetch all user's PDFs with folders
- `useGetPDFQuery(documentId: string)` - Fetch a single PDF by ID

### Mutations

- `useUploadPDFMutation()` - Upload a new PDF file
- `useDeletePDFMutation()` - Delete a PDF
- `useRenamePDFMutation()` - Rename a PDF
- `useMovePDFMutation()` - Move a PDF to a different folder

**Cache Tags:** `PDF`, `PDF:LIST`

---

## Folder Management

### Queries

- `useGetFoldersQuery()` - Fetch all user's folders with PDF counts

### Mutations

- `useCreateFolderMutation()` - Create a new folder
- `useUpdateFolderMutation()` - Update folder name or parent
- `useDeleteFolderMutation()` - Delete a folder (optionally move contents)

**Cache Tags:** `Folder`, `Folder:LIST`

---

## Notes Management

### Queries

- `useGetNotesQuery()` - Fetch all user's notes
- `useGetNoteQuery(noteId: string)` - Fetch a single note by ID

### Mutations

- `useCreateNoteMutation()` - Create a new note
- `useUpdateNoteMutation()` - Update note content
- `useDeleteNoteMutation()` - Delete a note

**Cache Tags:** `Note`, `Note:LIST`

---

## Annotations

### Queries

- `useGetAnnotationsQuery()` - Fetch all annotations

### Mutations

- `useCreateAnnotationMutation()` - Create a new annotation

**Cache Tags:** `Annotation`

---

## Highlights

### Queries

- `useGetHighlightsQuery()` - Fetch all highlights
- `useGetPDFHighlightsQuery(documentId: string)` - Fetch highlights for a specific PDF

### Mutations

- `useCreateHighlightMutation()` - Create a new highlight
- `useUpdateHighlightMutation()` - Update a highlight
- `useDeleteHighlightMutation()` - Delete a highlight

**Cache Tags:** `Highlight`

---

## Summaries

### Queries

- `useGetSummaryByPdfIdQuery(documentId: string)` - Fetch summary for a specific PDF

### Mutations

- `useCreateOrUpdateSummaryMutation()` - Create or update a summary
- `useUpdateSummaryMutation()` - Update an existing summary
- `useDeleteSummaryMutation()` - Delete a summary

**Cache Tags:** `Summary`

---

## Google Classroom Integration

### Queries

- `useCheckGoogleClassroomTokenStatusQuery()` - Check if user is connected to Google Classroom
- `useGetGoogleClassroomCoursesListQuery()` - Get list of user's courses
- `useGetGoogleClassroomCourseContentQuery(courseId: string)` - Get content (materials) for a specific course

### Mutations

- `useConnectGoogleClassroomMutation()` - Initiate OAuth connection to Google Classroom
- `useDisconnectGoogleClassroomMutation()` - Disconnect from Google Classroom

**Cache Tags:** `GoogleClassroom`, `GoogleClassroom:TOKEN_STATUS`, `GoogleClassroom:COURSES`, `GoogleClassroom:{courseId}`

**API Routes:**

- `/api/v1/integrations/lms/google-classroom/*` (proxied from server)

---

## File Management

### Queries

- `useGetFileFromGoogleDriveQuery(fileId: string)` - Fetch a file from Google Drive as Blob

### Mutations

- `useAddFileFromGoogleDriveMutation()` - Add a file from Google Drive to the user's PDFs

**Request Type for Add File:**

```typescript
{
  fileId: string;       // Google Drive file ID
  fileName: string;     // File name
  mimeType: string;     // MIME type (e.g., "application/pdf")
  fileSize: number;     // File size in bytes
  folderId?: string;    // Optional folder ID to organize the file
}
```

**Cache Tags:** `File`, `File:LIST`, `File:{fileId}`

**Notes:**

- Adding a file from Google Drive also invalidates the `PDF:LIST` tag
- Google Drive PDFs have `storage_path: null` and `google_file_id` set
- Use `isGoogleDriveFile` flag to identify Google Drive files

**API Routes:**

- `/api/v1/files/*` (proxied from server)
- `/api/v1/files/classroom/:fileId` - Get file content

---

## Usage Examples

### Fetching PDFs

```typescript
import { useGetPDFsQuery } from "@/lib/store/apiSlice";

function MyComponent() {
  const { data, isLoading, error } = useGetPDFsQuery();

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error loading PDFs</div>;

  return (
    <div>
      {data?.pdfs.map((pdf) => (
        <div key={pdf.id}>
          {pdf.filename}
          {pdf.isGoogleDriveFile && <span>📁 Google Drive</span>}
        </div>
      ))}
    </div>
  );
}
```

### Adding a Google Drive File

```typescript
import { useAddFileFromGoogleDriveMutation } from "@/lib/store/apiSlice";

function AddFromDrive() {
  const [addFile, { isLoading }] = useAddFileFromGoogleDriveMutation();

  const handleAdd = async (fileId: string) => {
    try {
      await addFile({
        fileId,
        fileName: "document.pdf",
        mimeType: "application/pdf",
        fileSize: 1024000,
      }).unwrap();
      // Success!
    } catch (err) {
      // Handle error
    }
  };
}
```

### Fetching Google Classroom Courses

```typescript
import {
  useCheckGoogleClassroomTokenStatusQuery,
  useGetGoogleClassroomCoursesListQuery,
} from "@/lib/store/apiSlice";

function ClassroomIntegration() {
  const { data: tokenStatus } = useCheckGoogleClassroomTokenStatusQuery();
  const { data: courses } = useGetGoogleClassroomCoursesListQuery(undefined, {
    skip: !tokenStatus?.isConnected,
  });

  return (
    <div>
      {tokenStatus?.isConnected ? (
        courses?.data.courses.map((course) => (
          <div key={course.id}>{course.name}</div>
        ))
      ) : (
        <button>Connect to Google Classroom</button>
      )}
    </div>
  );
}
```

---

## Cache Invalidation

The following mutations automatically invalidate related caches:

- **Upload PDF** → Invalidates `PDF:LIST`
- **Delete PDF** → Invalidates `PDF:LIST` and specific `PDF:{id}`
- **Create/Update/Delete Folder** → Invalidates `Folder:LIST` and `PDF:LIST`
- **Add File from Google Drive** → Invalidates `PDF:LIST` and `File:LIST`
- **Disconnect Google Classroom** → Invalidates `GoogleClassroom:TOKEN_STATUS` and `GoogleClassroom:COURSES`

---

## Configuration

### Base URL

All endpoints are prefixed with `/api` (configured in `apiSlice.ts`)

### Timeout

Default timeout is 30 seconds for all requests

### Rewrites

The following routes are proxied to the backend server (localhost:3000):

- `/api/v1/notes/*`
- `/api/v1/integrations/*`
- `/api/v1/files/*`

Configure in `next.config.ts` if the server port changes.

---

## Type Safety

All hooks are fully typed with TypeScript. Import types from:

- `@/lib/types/pdf` - PDF, Folder, Highlight types
- `@vollio/shared
- `@vollio/shared
- `@vollio/shared

---

Last Updated: December 6, 2025
