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

## Recent Technical Implementations

### PDF Annotation Architecture
- **AnnotationTooltip Integration**: Sophisticated PDF-to-screen coordinate conversion with canvas detection
- **Multi-Component Workflow**: NoteCreationModal, HighlightHoverToolbar, NotePreviewModal integration
- **Coordinate Conversion System**: Multiple fallback methods for accurate PDF positioning
- **Syncfusion Integration**: Type-safe annotation creation with highlight-note linking
- **Portal-Based Rendering**: React Portal usage for proper z-index management outside PDF containers

### Enhanced PDF Selection Workflow
- **Smart Canvas Detection**: Page-specific canvas element detection with querySelector fallbacks
- **Viewport Boundary Handling**: Automatic tooltip repositioning to stay within screen bounds
- **Text Selection Processing**: Comprehensive validation and bounds calculation from textBounds arrays
- **Highlight Creation**: Automatic highlight annotation creation linked to note IDs
- **Navigation Integration**: Seamless routing between PDF viewer and note pages

### UI/UX Architecture
- **Custom Dialog Components**: Styled confirmation dialogs replacing browser alerts
- **Context-Based State**: AutoSaveStatusProvider for global auto-save status management
- **Floating Components**: Bottom-right positioned status indicators with scoped visibility
- **Obsidian-Style Design**: Clean interface with separate title input and borderless layouts

### RTK Query Patterns
- **Mutation Integration**: All CRUD operations use RTK Query mutations for consistency
- **Cache Management**: Automatic cache invalidation and real-time updates
- **Error Handling**: Comprehensive error recovery with toast notifications
- **Loading States**: Visual feedback during all async operations

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
  // 1. Validate input data
  if (!args?.textContent?.trim() || !args.textBounds?.length) return;
  
  // 2. Calculate bounds using Math.min/max
  const bounds = calculateSelectionBounds(args.textBounds);
  
  // 3. Convert PDF coordinates to screen coordinates
  const screenPosition = convertPDFToScreenCoords(bounds, pdfViewerRef.current);
  
  // 4. Adjust for viewport boundaries
  const adjustedPosition = adjustForViewport(screenPosition);
}, [dependencies]);

// Portal-based floating components
const FloatingComponent = ({ position, visible }) => {
  if (!visible) return null;
  
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
