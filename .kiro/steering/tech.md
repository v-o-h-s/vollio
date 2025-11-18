---
inclusion: always
---

# Technical Guidelines

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **React**: Version 19
- **TypeScript**: Strict mode enabled
- **Styling**: Tailwind CSS + shadcn/ui components with comprehensive dark mode support
- **Theme System**: Complete light/dark mode implementation with system preference detection
- **State Management**: Redux Toolkit with RTK Query
- **Authentication**: Clerk with JWT integration
- **Database**: Supabase with Row Level Security (RLS)
- **File Storage**: Supabase Storage with signed URLs
- **PDF Rendering**: Syncfusion PDF Viewer (licensed)
- **Rich Text Editor**: TipTap with floating toolbars and extensions
- **UI Components**: Custom confirmation dialogs and floating status indicators
- **Auto-Save Architecture**: Context-based status management with RTK Query integration
- **Testing**: Vitest + React Testing Library

## Recent Technical Implementations ✅ COMPLETED

### Complete API Ecosystem ✅ IMPLEMENTED
- **Folder Management API**: Complete CRUD operations with hierarchical folder support and PDF organization
- **Highlight Management API**: Full highlight lifecycle with multi-mode support, color customization, and context menus
- **Enhanced Notes API**: Complete note management with auto-save, RTK Query integration, and cross-tab synchronization
- **Advanced PDF API**: Upload, processing, viewing, and deletion with comprehensive error handling and cleanup
- **Document Processing**: Syncfusion text extraction with OCR fallback and semantic chunking capabilities
- **Image Upload API**: Secure image handling for rich text editor integration with validation and optimization

### Database Schema Completion ✅ IMPLEMENTED
- **Complete Schema**: All tables (PDFs, Notes, Annotations, Highlights, Folders, Document Chunks) fully implemented
- **RLS Policies**: Comprehensive Row Level Security for all tables with user isolation
- **Indexes**: Optimized database indexes for performance and query efficiency
- **Relationships**: Proper foreign key relationships and cascading operations
- **Type Safety**: Complete TypeScript interfaces for all database operations

### Advanced Document Processing Architecture ✅ COMPLETED
- **Syncfusion Primary Extraction**: Enterprise-grade text extraction using Syncfusion PDF Viewer for superior accuracy and layout preservation
- **Advanced Layout Detection**: Intelligent recognition of document structure, tables, headings, lists, and formatting preservation
- **OCR Fallback System**: Automatic fallback to node-tesseract-ocr for scanned documents and extraction failures with confidence thresholds
- **Background Processing Queue**: Asynchronous document processing with progress tracking, timeout management, and job status monitoring
- **Semantic Chunking**: Intelligent text segmentation with configurable overlap, content type detection, and boundary respect
- **Multi-Language Support**: Comprehensive language detection and processing for international documents with OCR language packs
- **Metadata Preservation**: Complete extraction of document metadata, page numbers, structural information, and processing statistics

### Advanced Document Processing System ✅ COMPLETED
- **Syncfusion Integration**: Enterprise-grade PDF text extraction with superior accuracy and layout preservation
- **OCR Fallback System**: Automatic fallback to node-tesseract-ocr for scanned documents with confidence thresholds
- **Intelligent Text Processing**: Advanced text extraction with layout preservation and metadata retention
- **Multi-Language Support**: Comprehensive language detection and processing for international documents
- **File Management**: Secure upload, storage, and retrieval with comprehensive validation and automatic cleanup

### PDF Annotation Architecture ✅ COMPLETED
- **AnnotationTooltip Integration**: Sophisticated PDF-to-screen coordinate conversion with canvas detection  
- **Local State Management**: Tooltip state managed locally in PDFAnnotationViewer with React useState
- **Multi-Component Workflow**: NoteCreationModal, HighlightHoverToolbar, NotePreviewModal integration
- **Coordinate Conversion System**: Multiple fallback methods for accurate PDF positioning
- **Syncfusion Integration**: Type-safe annotation creation with highlight-note linking
- **Portal-Based Rendering**: React Portal usage for proper z-index management outside PDF containers
- **State Race Condition Fix**: Eliminated showSelectionToolbar state clearing that caused tooltip flicker
- **Immediate State Updates**: Removed setTimeout delays that caused race conditions in tooltip visibility
- **Clean State Transitions**: Proper state management for reliable tooltip appearance on repeated selections

### Enhanced PDF Annotation Tools ✅ COMPLETED
- **Multi-Mode Highlighting System**: Three distinct highlighting modes with color-coded visual feedback
  - 🟡 **Quick Highlight**: Instant highlighting without note creation (yellow)
  - 🟠 **Inline Comment**: Highlighting with hover-based comment display (orange)
  - 🔵 **Linked Note**: Full note creation with highlight linkage (blue)
- **Advanced Highlight Management**: Complete highlight lifecycle with interactive management tools
  - **HighlightHoverTrigger**: Small trigger button appearing on highlight hover for context menu access
  - **HighlightContextMenu**: Comprehensive dropdown menu with color picker, opacity slider, and deletion
  - **Color Customization**: 8 predefined colors (Yellow, Orange, Pink, Green, Blue, Purple, Red, Cyan)
  - **Opacity Control**: Real-time opacity adjustment from 10% to 100% with visual feedback
  - **RTK Query Integration**: All highlight operations use proper API mutations with error handling
- **Complete API Integration**: Full CRUD operations for highlights with database persistence
  - **Highlight API**: `/api/highlights` and `/api/highlights/[id]` endpoints fully implemented
  - **Database Schema**: Highlights table with textbounds, color, opacity, and type fields
  - **Type Safety**: Complete TypeScript interfaces for all highlight operations
  - **Error Handling**: Comprehensive error boundaries and user-friendly error messages
- **Glassmorphism UI Design**: Modern floating header with backdrop blur and transparency effects
- **Dynamic Tool Selection**: Context-aware dropdown menus with nested highlighting options
- **Visual Tool Indicators**: Real-time display of selected tool and mode with color-coded status
- **Smart Tooltip Adaptation**: AnnotationTooltip dynamically updates based on selected tool and mode
- **Focus Mode Integration**: Seamless tool access in both normal and focus viewing modes
- **Responsive Tool Interface**: Mobile-optimized tool selection with touch-friendly interactions
- **Coordinate Conversion System**: Multiple fallback methods for accurate PDF positioning
- **Syncfusion Integration**: Type-safe annotation creation with highlight-note linking using correct bounds format
- **Portal-Based Rendering**: React Portal usage for proper z-index management outside PDF containers
- **State Race Condition Fix**: Eliminated showSelectionToolbar state clearing that caused tooltip flicker
- **Immediate State Updates**: Removed setTimeout delays that caused race conditions in tooltip visibility
- **Clean State Transitions**: Proper state management for reliable tooltip appearance on repeated selections
- **Bounds Format Correction**: Fixed Syncfusion annotation bounds to use {x, y, width, height} format instead of {left, top, width, height}
- **Annotation API Validation**: Added comprehensive checks for PDF viewer readiness and annotation module availability
- **Debug Infrastructure**: Comprehensive logging for bounds processing, coordinate conversion, and annotation creation

### Enhanced PDF Selection Workflow ✅ COMPLETED
- **Smart Canvas Detection**: Page-specific canvas element detection with querySelector fallbacks and coordinate conversion
- **Viewport Boundary Handling**: Automatic tooltip repositioning to stay within screen bounds with intelligent positioning
- **Text Selection Processing**: Comprehensive validation and bounds calculation from textBounds arrays with error handling
- **Highlight Creation**: Automatic highlight annotation creation linked to note IDs with Syncfusion integration
- **Navigation Integration**: Seamless routing between PDF viewer and note pages with cross-tab synchronization

### Complete Auto-Save Architecture ✅ COMPLETED
- **Editor-Internal Auto-Save**: NotionEditor components handle auto-save internally using RTK Query mutations
- **RTK Query Integration**: All save operations use RTK Query for consistency, caching, and error handling
- **Simplified Component API**: Removed complex callback props in favor of internal auto-save management
- **Automatic Note Creation**: Seamlessly creates new notes when content is added without manual intervention
- **Visual Feedback**: Real-time save status indicators with error recovery mechanisms and user notifications
- **Content Preservation**: Automatic content preservation during network issues and editor errors

### Quiz Management System ✅ COMPLETED
- **Quiz Center Interface**: Complete quiz management dashboard with filtering, categorization, and progress tracking
- **Advanced Filtering**: Multi-dimensional filtering by category, difficulty, completion status, and search queries
- **Progress Tracking**: Comprehensive progress visualization with completion rates, best scores, and attempt history
- **Category Management**: Organized quiz categories (Mathematics, Programming, History, Chemistry, Computer Science, Language)
- **Difficulty Levels**: Three-tier difficulty system (Easy, Medium, Hard) with color-coded visual indicators
- **Statistics Dashboard**: Real-time statistics cards with gradient styling showing total quizzes, completed count, average scores, and study streaks
- **Interactive Quiz Cards**: Rich quiz cards with metadata, progress bars, tags, bookmarking, and action buttons
- **Document Integration**: Quiz creation from uploaded PDFs with DocumentSelectionTabs component for file management
- **Bookmark System**: Complete bookmark functionality with visual indicators and filtering options
- **Responsive Design**: Mobile-optimized quiz interface with touch-friendly interactions and adaptive layouts
- **Theme Integration**: Full dark/light mode support with theme-aware styling and gradient effects
- **Floating Sidebar Integration**: Page-specific quick actions with keyboard shortcuts for quiz management

### Modern Navigation System ✅ COMPLETED
- **Floating Navigation**: Glassmorphism-based navigation dock with auto-hide functionality
  - **Collapsed State**: Compact dock with logo, navigation icons, and user avatar
  - **Expanded State**: Full 2x2 grid with descriptions, user profile, and settings access
  - **Auto-Hide Behavior**: Smart scroll detection with smooth visibility transitions
  - **Theme Integration**: Complete dark/light mode support with gradient effects
  - **User Profile Integration**: Dropdown menus with theme selection and account management
  - **Hydration Safety**: Prevents layout shifts with proper loading states and mounted component detection
- **Floating Sidebar**: Left-positioned collapsible sidebar with context-aware actions
  - **Page-Specific Actions**: Dynamic action sets based on current route (PDFs, Notes, Quizzes, Dashboard)
  - **Keyboard Shortcuts**: Integrated shortcuts with visual indicators (Ctrl+N, Ctrl+F, F5, etc.)
  - **Event System**: Loose coupling with page components through custom events
  - **Glassmorphism Design**: Consistent styling with backdrop blur and theme-aware transparency
- **Responsive Design**: Touch-optimized interactions with mobile-first approach
- **Accessibility**: Full keyboard navigation and screen reader support
- **Performance**: Optimized animations with hardware acceleration

### Advanced Error Handling System ✅ COMPLETED
- **8-Category Error Classification**: AuthError, AIError, ValidationError, StorageError, FileError, DatabaseError, NetworkError, GeneralError
- **Factory Method Pattern**: Static factory methods for creating specific error types with proper context
- **BaseAppError Architecture**: All errors inherit from BaseAppError with timestamp, severity, userMessage, technicalMessage, statusCode, context, and retryable properties
- **Comprehensive Error Mapping**: DatabaseError.mapSupabaseErrorCodeToDatabaseError() for automatic Supabase error mapping
- **withErrorHandler Wrapper**: API route wrapper for consistent error formatting and JSON responses
- **withValidation Wrapper**: Request body validation using Zod schemas with proper error handling
- **withValidatedHandler Wrapper**: Composed wrapper combining validation and error handling for cleaner routes
- **Error Response Formatting**: Consistent JSON responses with errorType, errorSubType, userMessage, severity, timestamp, actionLabel, and context

### Request Validation System ✅ COMPLETED
- **Zod Schema Integration**: Request body validation at route level before handler execution
- **withValidation Wrapper**: Automatically validates request against schema and throws ValidationError on failure
- **Flexible Validation Methods**: ValidationError factory methods for field-level, format, length, and duplicate value validations
- **Comprehensive Error Details**: Validation errors include field paths, error codes, expected formats, and human-readable messages
- **Type Safety**: Full TypeScript support for validated request bodies

### Logging Architecture ✅ COMPLETED
- **Logger Utility**: Centralized logging with colorized output, timestamps, and emoji indicators
- **Log Levels**: info(), warn(), error(), success() methods with distinct styling
- **Emoji Indicators**: Visual hierarchy with 📂, 📝, 👤, 🔍, ✅, ❌, 🔐, 💾, ⚠️ for quick scanning
- **Request Tracing**: Logging at request entry, validation, authentication, operations, and response points
- **Comprehensive Context**: Logs include operation names, user IDs, resource IDs, error details, and timing information
- **Error Logging**: Full error stack traces and context for debugging in error handlers
- **Obsidian-Style Design**: Clean interface with separate title input and borderless layouts

### RTK Query Patterns
- **Mutation Integration**: All CRUD operations use RTK Query mutations for consistency
- **Cache Management**: Automatic cache invalidation and real-time updates
- **Error Handling**: Comprehensive error recovery with toast notifications
- **Loading States**: Visual feedback during all async operations
- **Local UI State**: Tooltip positioning and visibility managed with local React state in components
- **Redux for Persistence**: Only persistent application state stored in Redux (annotations, PDFs, selections)

## Code Style & Conventions

### TypeScript

- Use strict TypeScript configuration
- Define interfaces for all data structures
- Prefer `type` for unions, `interface` for object shapes
- Use proper generic constraints and utility types
- Export types alongside components when needed

### React Components

- Use functional components with hooks
- Prefer named exports over default exports
- Use PascalCase for component names and files
- Keep components focused and single-responsibility
- Use proper TypeScript props interfaces

#### PDF Annotation Component Patterns
```typescript
// Coordinate conversion with fallback methods
const handleTextSelection = useCallback((args: TextSelectionEventArgs) => {
  // 1. Validate input data first before any state changes
  if (!args?.textContent?.trim() || !args.textBounds?.length) return;
  
  // 2. Calculate bounds using Math.min/max
  const bounds = calculateSelectionBounds(args.textBounds);
  
  // 3. Convert PDF coordinates to screen coordinates
  const screenPosition = convertPDFToScreenCoords(bounds, pdfViewerRef.current);
  
  // 4. Adjust for viewport boundaries
  const adjustedPosition = adjustForViewport(screenPosition);
  
  // 5. Update state immediately without clearing showSelectionToolbar first
  setSelectionBounds(bounds);
  setTooltipPosition(adjustedPosition);
  
  // 6. Use minimal delay only for final show state to prevent race conditions
  setTimeout(() => setShowSelectionToolbar(true), 10);
}, [dependencies]);

// Syncfusion bounds processing - CRITICAL: Use x,y format not left,top
const extractSelectionBounds = (args: TextSelectionCompleteEventArgs): any[] => {
  // Syncfusion expects bounds as { x, y, width, height } NOT { left, top, width, height }
  return args.textBounds.map((b: any) => ({
    x: b.left || b.x || 0,
    y: b.top || b.y || 0,
    width: b.width || (b.right ? b.right - (b.left || b.x || 0) : 0) || 0,
    height: b.height || (b.bottom ? b.bottom - (b.top || b.y || 0) : 0) || 0,
  }));
};

// Syncfusion annotation creation with validation
const createHighlight = useCallback((bounds: any[], pageNumber: number) => {
  // Validate PDF viewer and annotation module are ready
  if (!pdfViewerRef.current?.annotation) {
    console.error("PDF viewer annotation module not available");
    return;
  }
  
  if (isLoading) {
    console.error("PDF document is still loading");
    return;
  }
  
  const annotationSettings = {
    bounds: bounds,
    pageNumber: pageNumber + 1, // Convert to 1-based page numbers
    color: "#FFFF00",
    opacity: 0.4,
    author: "User",
    subject: "Quick Highlight",
  };
  
  pdfViewerRef.current.annotation.addAnnotation("Highlight", annotationSettings);
}, [isLoading]);

// Portal-based floating components with proper visibility logic
const FloatingComponent = ({ position, visible }) => {
  const [isDelayedVisible, setIsDelayedVisible] = useState(false);
  
  useEffect(() => {
    let timeoutId: NodeJS.Timeout | undefined;
    
    if (visible) {
      setIsDelayedVisible(true); // Show immediately
    } else {
      timeoutId = setTimeout(() => setIsDelayedVisible(false), 200); // Delayed hide
    }
    
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [visible]);
  
  if (!isDelayedVisible) return null;
  
  return createPortal(
    <div className="fixed z-[9999]" style={{ left: position.x, top: position.y }}>
      {/* Component content */}
    </div>,
    document.body
  );
};

// Syncfusion annotation integration
const createHighlight = useCallback((noteId: string, bounds: Rectangle) => {
  if (!pdfViewerRef.current) return;
  
  const annotationData = {
    bounds: [bounds],
    pageNumber: currentPageNumber + 1, // Convert to 1-based
    note: `Note ID: ${noteId}`,
  };
  
  (pdfViewerRef.current.annotation as any).addAnnotation("Highlight", annotationData);
}, [currentPageNumber]);
```

### File Naming

- Components: `PascalCase.tsx` (e.g., `PDFAnnotationViewer.tsx`)
- Hooks: `use-kebab-case.ts` (e.g., `use-keyboard-shortcuts.ts`)
- Utilities: `kebab-case.ts` (e.g., `pdf-coordinates.ts`)
- API routes: `route.ts` in appropriate directory structure

### Import Organization

- Use `@/` path alias for project root imports
- Group imports: external libraries, internal components, types
- Use named imports when possible
- Import types with `import type` when only used for typing

### Document Processing Patterns

#### Syncfusion Text Extraction
```typescript
// Primary text extraction using Syncfusion
const extractTextWithSyncfusion = async (pdfBuffer: Buffer, options: ProcessingOptions) => {
  const extractor = new SyncfusionTextExtractor();
  const result = await extractor.extractText(pdfBuffer, {
    preserveFormatting: options.preserveFormatting,
    extractTables: options.extractTables,
    pageRange: options.pageRange
  });
  
  if (result.success) {
    return result.pageTexts.map(page => ({
      pageNumber: page.pageNumber,
      text: preprocessText(page.text),
      metadata: page.metadata
    }));
  }
  
  throw new Error(result.error || 'Syncfusion extraction failed');
};

// OCR fallback with node-tesseract-ocr
const extractTextWithOCR = async (pdfPath: string, options: OCROptions) => {
  const ocrResult = await ocrService.processPDF(pdfPath, {
    language: options.language || 'eng',
    psmMode: options.psmMode || 3,
    confidenceThreshold: options.confidenceThreshold || 30,
    preprocessImage: true
  });
  
  return ocrResult.results;
};

// Semantic chunking with content type detection
const createSemanticChunks = (text: string, options: ChunkingOptions) => {
  const chunkingResult = chunkingService.createChunks(text, {
    chunkSize: options.chunkSize || 400,
    chunkOverlap: options.chunkOverlap || 50,
    preserveStructure: true,
    respectSentenceBoundaries: true
  });
  
  return chunkingResult.chunks.map(chunk => ({
    id: chunk.id,
    content: chunk.content,
    tokenCount: chunk.tokenCount,
    contentType: chunk.metadata.contentType,
    hasOverlap: chunk.metadata.hasOverlap
  }));
};
```



## Architecture Patterns

### State Management

- Use Redux Toolkit slices for feature-based state
- **Always use RTK Query for server communication** - preferred over direct fetch calls
- RTK Query provides automatic caching, loading states, and synchronization
- Use typed hooks from `lib/store/hooks.ts`
- Keep selectors in dedicated files with memoization
- Prefer mutations and queries over manual API calls for consistency

### Component Structure

- Separate UI components (`components/ui/`) from feature components
- Use composition over inheritance
- Implement proper error boundaries
- Handle loading and error states consistently
- Integrate theme context and support in UI components
- Use floating components for non-intrusive navigation (FloatingNavigation at bottom, FloatingSidebar at left)

### Styling Guidelines

- Use Tailwind CSS utility classes with dark mode support (`dark:` prefixes)
- Implement theme-aware components using CSS custom properties and theme tokens
- Use semantic color tokens: `bg-muted`, `text-foreground`, `border-border` for consistency
- Apply theme-aware styling to skeleton components and loading states
- Follow shadcn/ui component patterns with theme integration
- Implement responsive design with mobile-first approach
- Prefer theme tokens over hardcoded colors for maintainability

### API Design

- Follow RESTful conventions in `/app/api/` routes
- Use `withErrorHandling` wrapper for all API routes
- Use proper HTTP status codes and consistent error response format
- Validate request data with TypeScript interfaces and server-side validation
- Use `getAuthenticatedSupabaseClient()` with RLS for automatic security
- Implement proper error cleanup (e.g., remove uploaded files on database failures)
- Use comprehensive error logging and user-friendly error messages

### RTK Query Best Practices

- **Use RTK Query for All API Operations**: Replace direct fetch calls with RTK Query mutations and queries
- **Mutation Pattern**: Use `useMutation` hooks for create, update, delete operations
- **Cache Management**: Leverage automatic cache invalidation with proper tags
- **Error Handling**: Use `.unwrap()` for throwing errors in try-catch blocks
- **Loading States**: Extract `isLoading` from mutation hooks for UI feedback
- **Optimistic Updates**: Use RTK Query's optimistic update patterns where appropriate
- **Type Safety**: Properly type all mutations and queries with TypeScript interfaces

```typescript
// Preferred RTK Query pattern
const [deleteNote, { isLoading: isDeleting }] = useDeleteNoteMutation();

const handleDelete = async () => {
  try {
    await deleteNote(noteId).unwrap();
    toast.success("Note deleted successfully");
  } catch (error) {
    toast.error("Failed to delete note");
  }
};
```

## Performance Guidelines

- Use React.memo() for expensive components
- Implement proper dependency arrays in useEffect/useMemo
- Lazy load heavy components when appropriate
- Optimize PDF rendering with proper viewport management
- Use RTK Query caching for API responses

## Error Handling

- Use `ErrorBoundary` components for graceful React error handling
- Implement specialized error boundaries (`PDFErrorBoundary`, `UploadErrorBoundary`)
- Use error handling hooks (`useErrorHandler`, `useUploadErrorHandler`, `usePDFErrorHandler`)
- Follow comprehensive error handling patterns from `@/lib/utils/error-handling`
- Provide meaningful error messages to users with recovery actions
- Log detailed errors server-side while sanitizing user-facing messages

## Testing Standards

- Write unit tests for utility functions
- Test component behavior, not implementation details
- Mock external dependencies (APIs, Syncfusion components)
- Use descriptive test names and organize with describe blocks
- Maintain good test coverage for critical paths

## Security Considerations

- Validate all user inputs with comprehensive file validation
- Use Clerk's authentication with JWT integration
- Implement Row Level Security (RLS) for automatic data isolation
- Sanitize data before rendering and storage
- Use signed URLs for secure file access with expiration
- Implement proper CORS policies
- Handle file uploads securely with size and type validation
- Organize storage by user ID to prevent cross-user access

## Supabase Integration Patterns

### Database Operations

- Use `getAuthenticatedSupabaseClient()` for all database operations (implemented and tested)
- Rely on RLS policies for automatic user data filtering (fully configured with Clerk JWT integration)
- Implement retry logic with `withRetry()` for critical operations (implemented in supabase-helpers.ts)
- Use type guards to validate database row structures (implemented: `isPDFRow`, `isUserActivityRow`)
- Map database rows to application types with helper functions (implemented: `mapPDFRowToDocument`, `mapActivityRowToActivity`)

### File Storage

- Organize files by user ID: `{userId}/{timestamp}_{filename}` (implemented in `generateStoragePath`)
- Generate signed URLs only when needed with automatic refresh (implemented with 30-minute expiry)
- Implement cleanup on upload failures to prevent orphaned files (implemented in upload route)
- Validate files comprehensively before upload (implemented with security checks and malicious pattern detection)
- Use proper MIME types and cache control headers (implemented in storage upload)

### Error Handling

- Map Supabase errors to application error types (implemented in `mapSupabaseError`)
- Implement proper cleanup on partial failures (implemented in all API routes)
- Use non-blocking operations for non-critical features (implemented for activity logging)
- Provide meaningful error messages to users (implemented with comprehensive error boundaries)
- Log detailed errors for debugging while hiding sensitive information (implemented with server-side logging)

### Activity Tracking

- Real-time user activity monitoring with debounced API calls (implemented)
- Recent activity display with automatic cache invalidation (implemented)
- Activity recording for view, upload, and delete operations (implemented)
- Non-blocking activity logging that doesn't fail main operations (implemented)

## Rich Text Editor Guidelines

### TipTap Integration

- Use TipTap core with React integration for rich text editing
- Implement floating toolbars for context-aware formatting options
- Use extension system for custom functionality (slash commands, image upload, enhanced links)
- Follow established editor patterns from `components/editor/` directory

### Editor Components

- **NotionEditor**: Main editor component with full TipTap integration, auto-save, and keyboard shortcuts
- **FloatingToolbar**: Context-aware toolbar that appears on text selection
- **AdvancedFloatingToolbar**: Feature-rich toolbar with color picker and advanced options
- **PDFAnnotationToolbar**: Specialized toolbar for PDF annotation workflows
- **EditorProvider**: Context provider for editor state management

### Editor Extensions

- **SlashCommand**: Notion-style slash commands for quick formatting
- **ImageUpload**: Drag-and-drop image upload with preview
- **EnhancedLink**: Advanced link handling with validation
- **KeyboardShortcuts**: Standard keyboard shortcuts for formatting

### Editor State Management

- Use EditorProvider for editor-specific state
- Integrate with Redux store for annotation and note content
- Handle unsaved changes and auto-save functionality with debounced saves
- Implement proper error recovery for editor failures
- Support keyboard shortcuts (Ctrl/Cmd+S for save, Escape for navigation)

### Auto-Save Architecture

- **Editor-Internal Auto-Save**: NotionEditor components handle auto-save internally without requiring parent component callbacks
- Use RTK Query mutations for create and update operations (following the "always use RTK Query" principle)
- Implement debounced saves with `useAutoSave` hook integration
- Provide visual feedback for save status (idle, typing, saving, saved, error states)
- Handle both note creation and updates automatically within the editor
- Extract titles from editor content automatically for new notes
- Simplify parent component APIs by removing complex callback functions
- Use `onSaveSuccess` callbacks only when parents need to respond to save events
- Maintain cross-tab synchronization through RTK Query cache invalidation

## Mobile Responsiveness

- Use Tailwind responsive prefixes consistently
- Test on mobile devices and various screen sizes
- Implement touch-friendly interactions
- Consider mobile-specific UI patterns for complex features
- Ensure floating toolbars adapt to mobile viewports
- Use mobile-specific dialogs for annotation creation
