# PDF Notes Page

This directory contains the main PDF annotation and note-taking page for the Noto application. This page serves as the central hub for PDF document management and the annotation workflow.

## 📁 File Overview

### `page.tsx` - Main PDF Notes Page Component

**Purpose**: The primary page component that orchestrates the complete PDF annotation experience, from file upload to note creation.

**Key Responsibilities**:

- PDF file upload and validation with drag & drop support
- PDF document display using the PDFAnnotationViewer component
- Annotation creation workflow management
- Cross-tab communication for note editor integration
- URL-based navigation to specific PDF coordinates
- Error handling and user feedback
- State management integration with Redux store

## 🏗️ Component Architecture

### Main Features

#### 1. **PDF File Upload System**

- **Drag & Drop Interface**: Users can drag PDF files directly onto the page
- **File Picker Integration**: Traditional file selection via button click
- **Validation**: Enforces 50MB size limit and PDF format requirements
- **Error Handling**: Provides specific error messages for different failure scenarios
- **Progress Indicators**: Shows upload status and loading states

```tsx
// Upload validation rules
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const ALLOWED_TYPE = "application/pdf";
```

#### 2. **PDF Viewer Integration**

- **Syncfusion PDF Viewer**: Full-featured PDF viewing with zoom, search, navigation
- **Annotation Overlay**: Real-time display of existing annotations
- **Text Selection**: Precise coordinate calculation for annotation creation
- **Mobile Responsive**: Touch-friendly interactions on mobile devices

#### 3. **Cross-Tab Communication**

- **PostMessage API**: Receives navigation commands from note editor tabs
- **URL Hash Navigation**: Supports direct linking to PDF coordinates
- **Coordinate Highlighting**: Visual feedback when navigating to specific locations
- **State Synchronization**: Maintains consistency across browser tabs

#### 4. **Annotation Workflow**

- **Text Selection Detection**: Captures user text selections with precise coordinates
- **Tooltip/Dialog UI**: Context-appropriate annotation creation interface
- **Note Editor Integration**: Opens note editor in new tab for annotation creation
- **Preview Cards**: Hover previews of existing annotations

## 🔧 Technical Implementation

### State Management

#### Redux Store Integration

```tsx
// Key state selectors
const currentPdf = useAppSelector((state) => state.annotations.currentPdf);
const tooltipState = useAppSelector(selectTooltipState);
const activeSelection = useAppSelector(selectActiveSelection);
const previewCard = useAppSelector(selectPreviewCard);
```

#### RTK Query for API Operations

```tsx
// Fetch annotations for current PDF
const { data: annotations } = useGetAnnotationsQuery({ pdfId: currentPdf?.id });

// Create new annotations
const [createAnnotation] = useCreateAnnotationMutation();
```

### File Upload Process

#### 1. **File Validation**

```tsx
const validateFile = (file: File): UploadError | null => {
  // Check MIME type
  if (file.type !== "application/pdf") return formatError;

  // Check file size
  if (file.size > MAX_FILE_SIZE) return sizeError;

  return null;
};
```

#### 2. **Server Upload Process** (Production Approach)

```tsx
// ✅ Production approach - upload to server first
const formData = new FormData();
formData.append("pdf", file);
formData.append("userId", user.id);

const response = await fetch("/api/pdfs/upload", {
  method: "POST",
  body: formData,
  onUploadProgress: (progress) => setUploadProgress(progress),
});

const { pdfDocument } = await response.json();
// pdfDocument.fileUrl is now a permanent cloud storage URL
```

#### 2a. **Blob URL Creation** (Development Only)

```tsx
// ⚠️ Current prototype approach - client-side only
// This should be replaced with server upload in production
const fileUrl = URL.createObjectURL(file);

// Clean up previous URLs to prevent memory leaks
if (currentPdf?.fileUrl?.startsWith("blob:")) {
  URL.revokeObjectURL(currentPdf.fileUrl);
}
```

#### 3. **Document Object Creation**

```tsx
const pdfDocument: PDFDocument = {
  id: crypto.randomUUID(),
  userId: "current-user", // TODO: Integrate with Clerk
  filename: file.name,
  uploadedAt: new Date(),
  fileUrl,
};
```

### Navigation System

#### URL Parameter Parsing

The page supports two navigation methods:

1. **Hash-based Navigation** (Primary)

   ```
   #pdf?page=3&x=120&y=450&width=200&height=18
   ```

2. **Search Parameter Navigation** (Fallback)
   ```
   ?page=3&x=120&y=450&width=200&height=18
   ```

#### Cross-Tab Communication

```tsx
// Listen for navigation messages from note editor
window.addEventListener("message", (event) => {
  if (isValidNavigationMessage(event.data)) {
    const { page, coordinates } = event.data;
    navigateToCoordinates({ page, ...coordinates });
  }
});
```

#### Coordinate Navigation

```tsx
const navigateToCoordinates = (navigation) => {
  // 1. Navigate to specific page
  viewer.navigation.goToPage(navigation.page);

  // 2. Scroll to coordinates
  scrollContainer.scrollTop = navigation.y * zoomFactor;

  // 3. Highlight target area
  createTemporaryHighlight(navigation);
};
```

## 🎨 User Interface

### Layout Structure

#### Header Section

- **Page Title**: "PDF & Notes" with current filename
- **Action Buttons**: Remove PDF, Filter, View toggles
- **Status Indicators**: Upload progress, annotation loading

#### Main Content Area

- **Upload Zone**: Drag & drop area when no PDF loaded
- **PDF Viewer**: Full-screen PDF display with annotations
- **Overlay Components**: Tooltips, preview cards, loading indicators

#### Interactive Elements

- **Annotation Tooltips**: Desktop text selection interface
- **Mobile Dialogs**: Touch-friendly annotation creation
- **Preview Cards**: Hover previews of existing annotations
- **Error Messages**: User-friendly error handling

### Responsive Design

#### Desktop Experience

- **Hover Interactions**: Tooltip-based annotation creation
- **Keyboard Shortcuts**: Full keyboard navigation support
- **Multi-window Support**: Cross-tab communication
- **Precise Mouse Interactions**: Pixel-perfect text selection

#### Mobile Experience

- **Touch-Friendly Targets**: Minimum 44px touch targets
- **Full-Screen Dialogs**: Mobile-optimized annotation creation
- **Gesture Support**: Touch-based PDF navigation
- **Responsive Layout**: Adapts to various screen sizes

## 🔄 Data Flow

### Upload Workflow

1. **File Selection**: User selects/drops PDF file
2. **Validation**: Check format and size constraints
3. **Blob Creation**: Create client-side URL for viewing
4. **State Update**: Store PDF document in Redux
5. **Viewer Load**: Initialize PDF viewer with document

### Annotation Workflow

1. **Text Selection**: User selects text in PDF
2. **Coordinate Calculation**: Calculate precise selection bounds
3. **UI Display**: Show tooltip (desktop) or dialog (mobile)
4. **Note Creation**: Open note editor in new tab
5. **Cross-Tab Sync**: Maintain state across browser tabs

### Navigation Workflow

1. **URL Parsing**: Extract navigation parameters
2. **Coordinate Validation**: Ensure valid navigation data
3. **PDF Navigation**: Navigate to specific page and coordinates
4. **Visual Feedback**: Highlight target area temporarily
5. **State Cleanup**: Clear navigation parameters

## 🚨 Error Handling

### Upload Errors

```tsx
interface UploadError {
  type: "size" | "format" | "general";
  message: string;
}
```

#### Error Types

- **Size Error**: File exceeds 50MB limit
- **Format Error**: Non-PDF file selected
- **General Error**: Network or processing failures

### PDF Viewer Errors

- **Loading Failures**: Corrupted or invalid PDF files
- **Rendering Issues**: Browser compatibility problems
- **Memory Errors**: Large file handling issues

### Navigation Errors

- **Invalid Coordinates**: Out-of-bounds navigation attempts
- **Missing Parameters**: Incomplete navigation data
- **Viewer Not Ready**: Navigation before PDF loads

## 🏗️ Backend Integration Architecture

### Current vs Production Approach

#### **Current Implementation** (Prototype)

- **Client-side only**: Files processed entirely in browser
- **Blob URLs**: Temporary URLs for immediate viewing
- **No persistence**: Files lost on page refresh
- **No user management**: Single-user prototype

#### **Production Implementation** (Recommended)

- **Server upload**: Files uploaded to cloud storage
- **Permanent URLs**: Stable URLs for long-term access
- **Database persistence**: PDF metadata and annotations stored
- **User authentication**: Multi-user support with Clerk

### Recommended Backend Stack

#### **File Storage**

```tsx
// Cloud storage options
- AWS S3 + CloudFront CDN
- Google Cloud Storage
- Azure Blob Storage
- Vercel Blob (for Vercel deployments)
```

#### **Database Schema**

```sql
-- PDF Documents
CREATE TABLE pdf_documents (
  id UUID PRIMARY KEY,
  user_id VARCHAR NOT NULL,
  filename VARCHAR NOT NULL,
  file_url VARCHAR NOT NULL,     -- Permanent cloud storage URL
  file_size INTEGER NOT NULL,
  mime_type VARCHAR DEFAULT 'application/pdf',
  uploaded_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Annotations
CREATE TABLE annotations (
  id UUID PRIMARY KEY,
  pdf_id UUID REFERENCES pdf_documents(id) ON DELETE CASCADE,
  user_id VARCHAR NOT NULL,
  selected_text TEXT NOT NULL,
  note_content TEXT NOT NULL,
  page_number INTEGER NOT NULL,
  coordinates JSONB NOT NULL,    -- {x, y, width, height}
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_pdf_documents_user_id ON pdf_documents(user_id);
CREATE INDEX idx_annotations_pdf_id ON annotations(pdf_id);
CREATE INDEX idx_annotations_user_id ON annotations(user_id);
```

#### **API Routes Structure**

```
/api/pdfs/
├── upload/          # POST - Upload new PDF
├── [id]/           # GET - Get PDF metadata
├── [id]/delete/    # DELETE - Remove PDF
└── [id]/annotations/
    ├── GET         # List annotations for PDF
    ├── POST        # Create new annotation
    ├── [annotationId]/
    │   ├── GET     # Get specific annotation
    │   ├── PUT     # Update annotation
    │   └── DELETE  # Delete annotation
```

#### **Server Upload Implementation**

```tsx
// app/api/pdfs/upload/route.ts
export async function POST(request: Request) {
  try {
    const { userId } = auth(); // Clerk authentication
    const formData = await request.formData();
    const file = formData.get("pdf") as File;

    // Server-side validation
    if (!file || file.type !== "application/pdf") {
      return NextResponse.json({ error: "Invalid file type" }, { status: 400 });
    }

    if (file.size > 50 * 1024 * 1024) {
      // 50MB limit
      return NextResponse.json({ error: "File too large" }, { status: 400 });
    }

    // Upload to cloud storage
    const fileBuffer = await file.arrayBuffer();
    const fileName = `${userId}/${Date.now()}-${file.name}`;

    const uploadResult = await cloudStorage.upload({
      buffer: fileBuffer,
      fileName,
      contentType: "application/pdf",
    });

    // Save to database
    const pdfDocument = await db.pdfDocument.create({
      data: {
        id: crypto.randomUUID(),
        userId,
        filename: file.name,
        fileUrl: uploadResult.url,
        fileSize: file.size,
        uploadedAt: new Date(),
      },
    });

    return NextResponse.json({ pdfDocument });
  } catch (error) {
    console.error("Upload error:", error);
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
```

#### **Client-Side Integration**

```tsx
// Updated handleFileUpload for production
const handleFileUpload = async (file: File) => {
  setIsUploading(true);
  setUploadProgress(0);

  try {
    // Client-side validation first
    const error = validateFile(file);
    if (error) {
      setUploadError(error);
      return;
    }

    // Create FormData for server upload
    const formData = new FormData();
    formData.append("pdf", file);

    // Upload with progress tracking
    const response = await fetch("/api/pdfs/upload", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Upload failed");
    }

    const { pdfDocument } = await response.json();

    // Update Redux store with server response
    dispatch(setPdfDocument(pdfDocument));

    // Show success notification
    pdfNotifications.uploadSuccess(file.name);
  } catch (error) {
    console.error("Upload error:", error);
    setUploadError({
      type: "general",
      message: error.message || "Failed to upload PDF",
    });
  } finally {
    setIsUploading(false);
    setUploadProgress(0);
  }
};
```

### Migration Path

#### **Phase 1**: Add Server Upload (Current Priority)

1. Create `/api/pdfs/upload` endpoint
2. Set up cloud storage (AWS S3 or Vercel Blob)
3. Update client upload logic
4. Add progress tracking

#### **Phase 2**: Database Integration

1. Set up database schema (PostgreSQL recommended)
2. Create PDF metadata CRUD operations
3. Implement user authentication with Clerk
4. Add PDF listing and management

#### **Phase 3**: Advanced Features

1. PDF thumbnail generation
2. Full-text search in PDFs
3. Collaborative annotations
4. Export/import functionality

## 🔮 Future Enhancements

### Planned Features

- **Server-Side Upload**: Replace blob URLs with permanent storage
- **User Authentication**: Integrate with Clerk for user management
- **PDF Metadata**: Extract and display document information
- **Annotation Search**: Full-text search across annotations
- **Collaborative Editing**: Real-time multi-user annotations

### Performance Improvements

- **Lazy Loading**: Load annotations on-demand
- **Virtual Scrolling**: Handle large documents efficiently
- **Caching Strategy**: Cache frequently accessed PDFs
- **Web Workers**: Offload coordinate calculations

### Accessibility Enhancements

- **Screen Reader Support**: Enhanced ARIA labels
- **Keyboard Navigation**: Complete keyboard-only operation
- **High Contrast Mode**: Support for accessibility themes
- **Voice Commands**: Voice-controlled PDF navigation

## 📱 Mobile Considerations

### Touch Interactions

- **Drag & Drop**: Touch-friendly file upload
- **Text Selection**: Optimized for touch selection
- **Annotation Creation**: Full-screen dialog interface
- **Navigation**: Touch-based PDF scrolling and zooming

### Performance Optimizations

- **Reduced Animations**: Minimize battery usage
- **Efficient Rendering**: Optimize for mobile GPUs
- **Memory Management**: Handle limited device memory
- **Network Awareness**: Adapt to connection quality

## 🧪 Testing Strategy

### Unit Tests

- File validation logic
- URL parameter parsing
- Error handling scenarios
- State management integration

### Integration Tests

- PDF upload workflow
- Cross-tab communication
- Annotation creation flow
- Navigation functionality

### E2E Tests

- Complete user workflows
- Cross-browser compatibility
- Mobile device testing
- Performance benchmarks

## 📞 Support & Documentation

### Related Components

- **PDFAnnotationViewer**: Main PDF display component
- **AnnotationTooltip**: Desktop annotation creation UI
- **MobileAnnotationDialog**: Mobile annotation creation UI
- **AnnotationPreviewCard**: Annotation hover previews

### Utility Functions

- **pdfCoordinates.ts**: Coordinate calculation utilities
- **crossTabNavigation.ts**: Cross-tab communication helpers
- **notifications.ts**: User feedback and error messages

### API Integration

- **annotationSlice.ts**: Redux state management
- **apiSlice.ts**: RTK Query API definitions

---

## 🚀 Usage Examples

### Basic PDF Upload

```tsx
// Component handles file upload automatically
<input
  type="file"
  accept=".pdf"
  onChange={handleFileSelect}
  ref={fileInputRef}
/>
```

### Cross-Tab Navigation

```tsx
// Send navigation message to PDF viewer tab
window.postMessage(
  {
    type: "PDF_NAVIGATION",
    page: 3,
    coordinates: { x: 120, y: 450, width: 200, height: 18 },
  },
  "*"
);
```

### Error Handling

```tsx
// Display user-friendly error messages
{
  uploadError && (
    <ErrorMessage
      type={uploadError.type}
      message={uploadError.message}
      onDismiss={dismissError}
    />
  );
}
```

---

_Last Updated: January 2025_
_Version: 1.0.0_
