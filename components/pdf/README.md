# PDF Components

This folder contains all PDF-related components for the Noto application. These components work together to provide a complete PDF annotation experience with text selection, highlighting, and note creation capabilities.

## 📁 File Overview

### Core Components

#### `PDFAnnotationViewer.tsx` - Main PDF Viewer

**Purpose**: The primary PDF viewer component that integrates Syncfusion PDF Viewer with annotation functionality and Supabase backend.

**Key Responsibilities**:

- PDF document loading from Supabase signed URLs with automatic refresh
- Text selection detection and coordinate calculation
- Activity tracking for PDF access with real-time updates
- Mobile/desktop responsive annotation creation workflow
- Error handling, loading states, and URL expiration management
- Integration with Redux store and RTK Query for state management

**Key Features**:

- Full Syncfusion PDF Viewer integration (zoom, search, navigation, print, etc.)
- Supabase signed URL handling with automatic 30-minute refresh
- Real-time text selection with precise coordinate mapping
- Activity tracking with debounced API calls and cache invalidation
- Mobile-first responsive design with touch-friendly interactions
- Comprehensive error boundaries and graceful fallbacks
- URL expiration handling with retry mechanisms
- Cross-tab communication support for navigation

**Usage**:

```tsx
<PDFAnnotationViewer
  pdfDocument={pdfDocument} // PDFDocument with Supabase signed URL
  onAnnotationCreate={handleAnnotationCreate}
  onAnnotationUpdate={handleAnnotationUpdate}
  onAnnotationDelete={handleAnnotationDelete}
  className="w-full h-full"
/>
```

---

#### `AnnotationOverlay.tsx` - Annotation Highlights

**Purpose**: Renders interactive annotation highlights over PDF pages.

**Key Responsibilities**:

- Positioning annotation highlights over PDF text
- Zoom-aware coordinate transformation
- Mouse/touch interaction handling for existing annotations
- Real-time overlay positioning updates as user scrolls/zooms

**Key Features**:

- RTK Query integration for fetching annotation data
- Dynamic positioning based on PDF viewer zoom and scroll state
- Touch-friendly interaction targets on mobile devices
- Hover effects and visual feedback
- Keyboard shortcut support

**Usage**:

```tsx
<AnnotationOverlay
  pageNumber={currentPage}
  pdfViewerRef={pdfViewerRef}
  onAnnotationHover={handleAnnotationHover}
  onAnnotationClick={handleAnnotationClick}
/>
```

---

#### `AnnotationTooltip.tsx` - Desktop Text Selection UI

**Purpose**: Displays a floating tooltip with "Create note" button when text is selected on desktop.

**Key Responsibilities**:

- Viewport edge detection and automatic repositioning
- Smooth fade-in/fade-out animations with delays
- Click-outside-to-close functionality
- Desktop-only display (hidden on mobile)

**Key Features**:

- Smart positioning to stay within viewport bounds
- 200ms delay on hide for better user experience
- Blue accent styling consistent with app theme (#3B82F6)
- Semantic HTML structure

**Usage**:

```tsx
<AnnotationTooltip
  position={{ x: 100, y: 200 }}
  visible={showTooltip}
  onCreateNote={handleCreateNote}
  onClose={handleCloseTooltip}
/>
```

---

#### Responsive Design

The PDF annotation system uses responsive design to adapt to different screen sizes without requiring separate mobile components.

**Key Responsibilities**:

- Mobile-optimized annotation creation interface
- Touch-friendly button sizing and interactions
- Selected text preview with smart truncation
- Radix UI Dialog integration

**Key Features**:

- Full-screen modal optimized for mobile viewports
- Touch-friendly button sizing (44px minimum height)
- Auto-focus on primary action button
- Responsive layout that adapts to screen size

**Usage**:

The annotation system automatically adapts to different screen sizes using responsive CSS.

---

#### `AnnotationPreviewCard.tsx` - Annotation Hover Preview

**Purpose**: Displays a preview card showing annotation content when hovering over highlights.

**Key Responsibilities**:

- Content truncation with smart word boundary detection
- Viewport boundary detection and automatic repositioning
- Click-to-edit functionality for annotation management
- Mobile-responsive sizing and interactions

**Key Features**:

- Smart text truncation (~100 characters with word boundaries)
- Automatic collision detection and repositioning
- Smooth enter/exit animations via Radix UI Popover
- Touch-friendly button sizing on mobile devices

**Usage**:

```tsx
<AnnotationPreviewCard
  annotation={annotationData}
  position={{ x: 150, y: 250 }}
  visible={showPreview}
  onEdit={handleEditAnnotation}
  onClose={handleClosePreview}
/>
```

---

### Utility Components

#### `FallbackUI.tsx` - Error State Components

**Purpose**: Collection of fallback UI components for error states and empty states.

**Components Included**:

- `TextSelectionFallback`: When text selection fails
- `AnnotationCreationFallback`: When annotation creation fails
- `PDFViewerFallback`: When PDF loading/viewing fails
- `NetworkErrorFallback`: When network requests fail
- `EmptyStateFallback`: Generic empty state component

**Key Features**:

- Consistent visual design with appropriate icons
- Helpful error messages and troubleshooting tips
- Action buttons for recovery (retry, cancel, help)
- Responsive design

**Usage**:

```tsx
<PDFViewerFallback
  error="Failed to load PDF document"
  onRetry={handleRetry}
  onUploadNew={handleUploadNew}
  fileName="document.pdf"
/>
```

---

#### `index.ts` - Module Exports

**Purpose**: Centralized exports for all PDF components.

**Exports**:

- All main components for external use
- Fallback UI components
- Type definitions and interfaces

## 🏗️ Component Architecture

### Component Hierarchy

```
PDFAnnotationViewer (main container)
├── AnnotationOverlay (highlights existing annotations)
├── AnnotationTooltip (text selection UI)
├── AnnotationPreviewCard (hover preview of annotations)
└── FallbackUI components (error states)
```

### Data Flow

1. **PDF Loading**: PDFAnnotationViewer loads PDF using Syncfusion
2. **Text Selection**: User selects text, coordinates are calculated
3. **Annotation Creation**: Tooltip (desktop) or Dialog (mobile) appears
4. **State Management**: Redux store manages annotation state
5. **Overlay Rendering**: AnnotationOverlay renders highlights for existing annotations
6. **Preview on Hover**: AnnotationPreviewCard shows annotation details

### State Management

- **Redux Store**: Central state management for annotations
- **RTK Query**: API calls for CRUD operations
- **Local State**: Component-specific UI state (tooltips, dialogs, etc.)

## 🎨 Design System

### Color Scheme

- **Primary Blue**: `#3B82F6` (blue-600) - Used for buttons and highlights
- **Hover Blue**: `#2563EB` (blue-700) - Used for hover states
- **Background Blue**: `rgba(59, 130, 246, 0.2)` - Used for annotation highlights
- **Error Red**: `#EF4444` (red-500) - Used for error states
- **Warning Yellow**: `#F59E0B` (amber-500) - Used for warning states

### Typography

- **Font Family**: System font stack (Inter, system-ui, sans-serif)
- **Font Sizes**: Tailwind CSS scale (text-xs, text-sm, text-base, etc.)
- **Font Weights**: 400 (normal), 500 (medium), 600 (semibold)

### Spacing

- **Component Padding**: 12px (p-3), 16px (p-4)
- **Button Padding**: 6px 12px (px-3 py-1.5)
- **Mobile Touch Targets**: Minimum 44px height
- **Border Radius**: 6px (rounded-lg), 8px (rounded-xl)

## 📱 Responsive Design

### Breakpoints

- **Mobile**: < 768px - Uses dialog-based annotation creation
- **Desktop**: ≥ 768px - Uses tooltip-based annotation creation

### Mobile Optimizations

- Touch-friendly button sizing (minimum 44px height)
- Full-screen dialogs instead of tooltips
- Larger touch targets for annotation highlights
- Simplified interactions and gestures

### Desktop Features

- Hover states and tooltips
- Keyboard shortcuts and navigation
- Precise mouse interactions
- Multi-window support

## 🔧 Technical Implementation

### Dependencies

- **Syncfusion PDF Viewer**: `@syncfusion/ej2-react-pdfviewer` - Licensed PDF viewer component
- **Redux Toolkit**: State management and RTK Query for API calls
- **Radix UI**: Accessible UI primitives (Dialog, Popover)
- **Tailwind CSS**: Utility-first styling
- **Lucide React**: Icon library
- **Next.js**: App Router for navigation and API routes
- **Supabase**: Backend database and storage integration

### Key Utilities

- **Activity Tracking**: `lib/utils/activity-tracking.ts` - User activity monitoring
- **Activity Tracking Hook**: `hooks/use-activity-tracking.ts` - React hook for activity tracking
- **Responsive Design**: CSS-based responsive design for different screen sizes
- **Supabase Helpers**: `lib/utils/supabase-helpers.ts` - Database and storage utilities
- **Error Boundaries**: `components/ErrorBoundary.tsx` - Error handling components

### Performance Considerations

- **Lazy Loading**: Components load only when needed
- **Memoization**: React.memo and useMemo for expensive calculations
- **Debouncing**: Scroll and resize event handlers
- **Virtualization**: Large annotation lists (future enhancement)

## 🧪 Testing Strategy

### Unit Tests

- Component rendering and props handling
- Event handler functionality
- Coordinate calculation accuracy
- Error state handling

### Integration Tests

- PDF loading and text selection workflow
- Annotation creation and editing flow
- Mobile/desktop responsive behavior
- Keyboard shortcuts and workflow

### E2E Tests

- Complete annotation workflow
- Cross-browser compatibility
- Mobile device testing
- Performance benchmarks

## 🚀 Usage Examples

### Basic PDF Viewer

```tsx
import { PDFAnnotationViewer } from "@/components/pdf";

function PDFPage() {
  const handleAnnotationCreate = (selection) => {
    // Handle new annotation creation
  };

  return <PDFAnnotationViewer onAnnotationCreate={handleAnnotationCreate} />;
}
```

### With Existing Annotations

```tsx
import { PDFAnnotationViewer } from "@/components/pdf";
import { useGetAnnotationsQuery } from "@/lib/store/apiSlice";

function PDFPageWithAnnotations() {
  const { data: annotations } = useGetAnnotationsQuery({ pdfId: "pdf-123" });

  return (
    <PDFAnnotationViewer
      annotations={annotations}
      onAnnotationCreate={handleCreate}
      onAnnotationClick={handleClick}
    />
  );
}
```

### Error Handling

```tsx
import { PDFViewerFallback } from "@/components/pdf";

function PDFPageWithErrorHandling() {
  const [error, setError] = useState(null);

  if (error) {
    return (
      <PDFViewerFallback
        error={error}
        onRetry={() => setError(null)}
        onUploadNew={handleUploadNew}
      />
    );
  }

  return <PDFAnnotationViewer />;
}
```

## 🔮 Future Enhancements

### Planned Features

- **Collaborative Annotations**: Real-time multi-user annotation editing
- **Annotation Types**: Support for different annotation types (highlight, note, drawing)
- **Export Functionality**: Export annotations to various formats
- **Search in Annotations**: Full-text search across annotation content
- **Annotation Threading**: Reply to annotations and create discussions

### Performance Improvements

- **Virtual Scrolling**: For documents with many annotations
- **Web Workers**: Offload coordinate calculations
- **Caching**: Intelligent caching of PDF pages and annotations
- **Progressive Loading**: Load annotations as user scrolls

### Future Enhancements

- **Enhanced User Experience**: Improved interaction patterns
- **High Contrast Mode**: Support for high contrast themes
- **Keyboard Shortcuts**: Complete keyboard shortcut support
- **Voice Commands**: Voice-controlled annotation creation

---

## 📞 Support

For questions about these components or contributions, please refer to:

- **Documentation**: `/docs/pdf-components.md`
- **API Reference**: `/docs/api/pdf-components.md`
- **Issue Tracker**: GitHub Issues
- **Team Contact**: Noto Development Team

---

_Last Updated: January 2025_
_Version: 1.0.0_
