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
  tooltipState: TooltipState;
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
- `setTooltipState({visible, position})` - Control annotation tooltip
- `setPreviewCard({visible, annotationId, position})` - Control annotation preview

## RTK Query Endpoints

### PDF Operations

- `uploadPDF(formData)` - Upload PDF to Supabase Storage
- `getPDFs()` - Fetch user's PDFs with signed URLs and recent activity
- `getPDF(id)` - Get individual PDF with fresh signed URL

### Response Types

- **SupabaseUploadResponse** - PDF upload with metadata and signed URL
- **SupabasePDFListResponse** - PDF list with recent activity and total count
- **SupabasePDFAccessResponse** - Individual PDF access with fresh signed URL

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
