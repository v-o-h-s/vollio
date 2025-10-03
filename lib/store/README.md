# Redux Store for PDF Annotations

This directory contains the Redux store implementation for managing PDF annotation state with RTK Query integration for API calls.

## Files

- **index.ts** - Main store configuration with RTK Query middleware
- **annotationSlice.ts** - Redux slice with all annotation-related state and actions
- **apiSlice.ts** - RTK Query API slice for PDF and annotation operations
- **hooks.ts** - Typed hooks for React components
- **provider.tsx** - Redux Provider component for app integration

## State Structure

```typescript
interface AnnotationState {
  currentPdf: PDFDocument | null;
  annotations: Record<string, Annotation>;
  activeSelection: TextSelection | null;
  hoveredAnnotation: string | null;
  previewCard: PreviewCardState;
}
```

## Available Actions

### PDF Management

- `setPdfDocument(pdf)` - Set current PDF document
- `clearPdfDocument()` - Clear current PDF and reset state

### Annotation CRUD

- `loadAnnotations(annotations[])` - Load annotations from API
- `createAnnotation(annotation)` - Add new annotation
- `updateAnnotation({id, updates})` - Update existing annotation
- `deleteAnnotation(id)` - Remove annotation

### UI State Management

- `setActiveSelection(selection)` - Set currently selected text
- `setHoveredAnnotation(id)` - Set hovered annotation
- `setPreviewCard({visible, annotationId, position})` - Control annotation preview

## RTK Query Endpoints

### PDF Operations

- `uploadPDF(formData)` - Upload PDF to Supabase Storage with comprehensive validation
- `getPDFs()` - Fetch user's PDFs with signed URLs and recent activity tracking
- `getPDF(id)` - Get individual PDF with fresh signed URL and activity logging
- `deletePDF(id)` - Delete PDF from storage and database with cleanup
- `renamePDF({id, filename})` - Rename PDF with validation and duplicate checking

### Note Operations

- `createNote(noteData)` - Create new note with rich text content
- `updateNote({id, updates})` - Update existing note with auto-save integration
- `deleteNote(id)` - Delete note with confirmation and cleanup
- `getNotes()` - Fetch user's notes with filtering and sorting
- `getNote(id)` - Get individual note with content and metadata

### Quiz Operations

- `generateQuiz(config)` - Generate AI-powered quiz from documents using RAG
- `getQuizzes()` - Fetch user's quiz list with filtering and sorting options
- `getQuiz(id)` - Get individual quiz with questions and metadata
- `submitQuizAttempt(attempt)` - Submit quiz attempt with scoring and detailed results
- `processDocument(request)` - Process documents for RAG-based quiz generation
- `searchContent(request)` - Advanced content search with semantic filtering

### Annotation Operations

- `createAnnotation(annotation)` - Create PDF annotation with coordinates
- `updateAnnotation({id, updates})` - Update annotation content and styling
- `deleteAnnotation(id)` - Delete annotation with highlight cleanup
- `getAnnotations(pdfId)` - Get annotations for specific PDF

### Response Types

- **SupabaseUploadResponse** - PDF upload with metadata and signed URL
- **SupabasePDFListResponse** - PDF list with recent activity and total count
- **SupabasePDFAccessResponse** - Individual PDF access with fresh signed URL
- **NoteResponse** - Note data with rich text content and metadata
- **QuizResponse** - Quiz data with questions, configuration, and metadata
- **QuizGenerationResponse** - RAG-based quiz generation results with source chunks
- **DocumentProcessingResponse** - Document processing status and job information
- **ContentSearchResponse** - Search results with relevance scoring and chunks
- **AnnotationResponse** - Annotation data with coordinates and styling

## Usage

### Basic State Management

```typescript
import { useAppSelector, useAppDispatch } from "@/lib/store/hooks";
import { setPdfDocument, setActiveSelection } from "@/lib/store/annotationSlice";

function MyComponent() {
  const dispatch = useAppDispatch();
  const currentPdf = useAppSelector((state) => state.annotations.currentPdf);
  const annotations = useAppSelector((state) => state.annotations.annotations);

  // Set PDF document
  dispatch(setPdfDocument(pdfDocument));
  
  // Set active text selection
  dispatch(setActiveSelection(textSelection));
}
```

### RTK Query API Calls

```typescript
import { useUploadPDFMutation, useGetPDFsQuery, useGetPDFQuery } from "@/lib/store/apiSlice";

function PDFComponent() {
  // Upload PDF
  const [uploadPDF, { isLoading: isUploading }] = useUploadPDFMutation();
  
  // Get all PDFs
  const { data: pdfList, error, isLoading } = useGetPDFsQuery();
  
  // Get individual PDF with fresh signed URL
  const { data: pdfData, refetch } = useGetPDFQuery(pdfId, {
    pollingInterval: 30 * 60 * 1000 // Refresh every 30 minutes
  });

  const handleUpload = async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    const result = await uploadPDF(formData).unwrap();
  };
}
```
