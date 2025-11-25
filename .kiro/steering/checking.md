---
inclusion: always
---

---

## inclusion: always

# Error Handling and Problem Resolution

## Error Handling Checklist

When implementing new API endpoints, follow this standardized error handling pattern:

### Endpoint Implementation Checklist

- [ ] **Schema Definition**: Create Zod schema in `/lib/dto/` with proper validation rules
  - [ ] Required fields properly marked
  - [ ] String length constraints (min/max)
  - [ ] Enum values for known options
  - [ ] Custom validation for complex fields (emails, UUIDs, etc.)

- [ ] **Handler Implementation**: Create handler function following the pattern
  - [ ] Authenticate user with `const { userId } = await auth()`
  - [ ] Throw `AuthError.authenticationRequired()` if no userId
  - [ ] Parse request body with proper error handling
  - [ ] Implement business logic validation (not field validation)
  - [ ] Log operations with `Logger.info()`, `Logger.success()`, `Logger.error()`
  - [ ] Use emoji indicators for visual scanning (📂, 📝, 🔐, ✅, ❌)

- [ ] **Wrapper Integration**: Use proper wrapper composition
  - [ ] For validation + error handling: `export const POST = withValidatedHandler(schema, handler)`
  - [ ] For error handling only: `export const GET = withErrorHandler(handler)`
  - [ ] Schema should not be passed to handler directly - it's already validated

- [ ] **Error Throwing**: Use proper error classes with context
  - [ ] `AuthError.authenticationRequired()` for missing auth
  - [ ] `ValidationError.fieldRequired()` for missing fields (should be caught by Zod)
  - [ ] `ValidationError.duplicateValue()` for constraint violations
  - [ ] `DatabaseError.insertFailed()` for DB insert failures
  - [ ] `DatabaseError.queryFailed()` for DB query failures

- [ ] **Logging Best Practices**
  - [ ] Log at request start with resource type emoji (📂 folders, 📝 notes)
  - [ ] Log at key operations (auth check: 🔐, validation: ✅/❌, DB: 💾)
  - [ ] Include context in all logs (userId, resourceId, operation name)
  - [ ] Log success before return: `Logger.success('✅ Created', { id })`
  - [ ] Log errors with full context: `Logger.error('❌ Failed', { error, context })`

- [ ] **Type Safety**
  - [ ] Validated body data should be fully typed from Zod schema
  - [ ] Use type inference: `type CreateRequest = z.infer<typeof createSchema>`
  - [ ] No `any` types in handlers
  - [ ] Response types should be explicit interfaces

### Common Implementation Patterns

**Modern GET Endpoint:**
```typescript
export const GET = withErrorHandler(async (req: NextRequest) => {
  Logger.info('📂 Fetching resources');
  const { userId } = await auth();
  if (!userId) throw AuthError.authenticationRequired('Auth required', {});
  
  const data = await db.query(userId);
  Logger.success('✅ Fetched', { count: data.length });
  return NextResponse.json({ success: true, data });
});
```

**Modern POST Endpoint with Validation:**
```typescript
export const POST = withValidatedHandler(createSchema, async (req) => {
  Logger.info('📝 Creating resource');
  const { userId } = await auth();
  if (!userId) throw AuthError.authenticationRequired('Auth required', {});
  
  const body = await req.json(); // Already validated by wrapper
  
  // Business logic validation only (field validation handled by Zod)
  const existing = await findDuplicate(body.name);
  if (existing) {
    throw ValidationError.duplicateValue('name', 'Already exists', { userId });
  }
  
  const result = await db.insert({ ...body, userId });
  Logger.success('✅ Created', { id: result.id });
  return NextResponse.json({ success: true, data: result });
});
```

## Debugging Approach

When encountering errors or implementation challenges:

1. **Analyze first**: Check error messages, stack traces, and console logs
2. **Use existing patterns**: Reference error classes in `/lib/utils/error-handling/`
3. **Test incrementally**: Apply small, isolated changes
4. **Verify core flows**: Ensure fixes don't break PDF upload → annotation → navigation
5. **Check logs**: Look for emoji indicators in console/server logs to trace execution

## Framework-Specific Issues

### Next.js 15 + App Router

- Import resolution: Use `@/` prefix consistently, check `tsconfig.json` paths
- Route handlers: Export named functions (GET, POST) in `route.ts` files
- Client/Server boundaries: Use `"use client"` directive for interactive components

### React 19 + TypeScript

- Strict mode: Define proper interfaces for all props and API responses
- Hook dependencies: Include all dependencies in useEffect/useMemo arrays
- Type imports: Use `import type` for TypeScript-only imports

### Authentication (Clerk)

- Protected routes: Use `auth()` in server components, `useAuth()` in client components
- JWT integration: Ensure Supabase RLS policies match Clerk JWT structure
- Redirect handling: Use `redirect()` from `next/navigation` for unauthenticated users

## Common Error Patterns

### Theme System Issues

- **Theme not persisting**: Check localStorage permissions and ensure ThemeProvider is not remounting
- **Theme flashing**: Verify theme script runs before React hydration and CSS includes both theme variants
- **Components not theme-aware**: Ensure components use theme tokens (`bg-muted`, `text-foreground`) instead of hardcoded colors
- **Skeleton loading issues**: Verify skeleton components use `bg-muted` and loading-shimmer uses theme-aware CSS custom properties

### Database Operations

- **RLS violations**: Check user authentication and policy configuration
- **Type mismatches**: Validate database row structure with type guards
- **Connection issues**: Use `getAuthenticatedSupabaseClient()` consistently

### RTK Query Issues

- **Cache invalidation**: Use proper tag invalidation after mutations
- **Loading states**: Handle isLoading, isError states in components
- **Type safety**: Define proper TypeScript interfaces for API responses

### Document Processing Issues

- **Syncfusion License Errors**: Verify Syncfusion license is properly configured and not expired
- **Text Extraction Failures**: Check fallback from Syncfusion to OCR is working correctly
- **OCR Processing Errors**: Validate node-tesseract-ocr installation and language packs
- **Chunking Failures**: Ensure semantic chunking respects content boundaries and token limits
- **Processing Queue Issues**: Monitor background job status and timeout handling
- **Memory Leaks**: Verify proper cleanup of temporary files and child processes

#### Document Processing Debugging Checklist

When text extraction fails:

1. Check Syncfusion license status and component initialization
2. Verify PDF buffer is valid and not corrupted
3. Test OCR fallback with known scanned documents
4. Monitor processing queue for stuck or failed jobs
5. Check temporary file cleanup and disk space
6. Validate chunking output for proper content segmentation

### PDF Annotation Issues

- **Tooltip Race Conditions**: Don't clear showSelectionToolbar state at start of selection handler
- **Coordinate Conversion**: Ensure proper PDF-to-screen coordinate mapping with canvas detection
- **State Flicker**: Avoid rapid state changes (false→true) that confuse visibility logic
- **Event Handler Conflicts**: Check for pageClick events interfering with text selection
- **Debug Patterns**: Use development-only debug panels to track state changes in real-time
- **Syncfusion Bounds Format**: CRITICAL - Use {x, y, width, height} format, NOT {left, top, width, height}
- **Annotation Module Readiness**: Always validate pdfViewerRef.current?.annotation exists before calling addAnnotation
- **Document Loading State**: Check isLoading state before attempting to create annotations
- **Highlight Context Menu**: Ensure HighlightContextMenu and HighlightHoverTrigger are properly positioned using React Portals
- **RTK Query Mutations**: Use proper error handling for highlight update/delete operations with toast notifications
- **Color/Opacity Updates**: Validate color hex codes and opacity ranges (0.1-1.0) before API calls

#### PDF Annotation Debugging Checklist

When highlighting doesn't work:

1. **Check bounds format**: Ensure using {x, y, width, height} not {left, top, width, height}
2. **Verify PDF viewer readiness**: Check pdfViewerRef.current?.annotation is available
3. **Check document loading**: Ensure isLoading is false before creating annotations
4. **Test with fixed coordinates**: Use test button with known good coordinates
5. **Console logging**: Check for bounds processing and API call errors
6. **Page number conversion**: Ensure 0-based pageIndex is converted to 1-based pageNumber
7. **Annotation module injection**: Verify Annotation service is included in Inject services array

When tooltip doesn't appear on subsequent selections:

1. Check if showSelectionToolbar state is being cleared unnecessarily
2. Verify setTimeout delays aren't causing race conditions
3. Ensure validation happens before any state changes
4. Check console for coordinate conversion errors
5. Verify tooltip position is within viewport bounds
6. Test with debug panel showing real-time state values

### UI Component Issues

- **Confirmation Dialogs**: Use custom `DeleteConfirmationDialog` instead of browser `window.confirm()`
- **Auto-Save Status**: Ensure `AutoSaveStatusProvider` is wrapped around components that need status
- **Context Errors**: Check that context hooks are used within their respective providers
- **Loading States**: Always show loading spinners during async operations

### File Operations

- **Upload failures**: Implement cleanup in catch blocks to prevent orphaned files
- **Storage access**: Generate fresh signed URLs, don't cache expired ones
- **File validation**: Check size, type, and content before processing

### State Management

- **RTK Query errors**: Handle loading/error states in components
- **Cross-tab sync**: Use PostMessage API for real-time updates
- **Stale data**: Implement proper cache invalidation strategies

## Error Handling Standards

### User-Facing Errors

- Use `@/components/ui/error-notification.tsx` for consistent error display
- Provide actionable error messages with retry options
- Log detailed errors server-side while showing simplified messages to users

### API Error Responses

```typescript
// Standard error response format
return NextResponse.json(
  { error: "User-friendly message", details: "Technical details" },
  { status: 400 }
);
```

### Component Error Boundaries

- Wrap feature components with `<ErrorBoundary>`
- Implement fallback UI for graceful degradation
- Use `useErrorHandling()` hook for consistent error state management

## Critical Verification Points

After any changes, verify these core flows work:

- **Authentication**: Sign-in → Dashboard access → Protected API calls
- **PDF workflow**: Upload → View → Annotate → Save → Cross-tab sync
- **Document processing**: PDF upload → Syncfusion extraction → OCR fallback → Chunking → Storage
- **Quiz generation**: Document selection → Text processing → Vector search → Question generation
- **Note workflow**: Create → Edit → Auto-save → Navigation → Persistence
- **Mobile experience**: Touch selection → Annotation dialog → Note editing → Save
- **Auto-save functionality**: Content changes → Debounced save → Status feedback → Error recovery
- **Error recovery**: Network failures → Retry mechanisms → User feedback

## Current Development Context

### Production Ready Features ✅ COMPLETED

- **Complete API Ecosystem**: All core APIs (PDFs, Notes, Annotations, Highlights, Folders) fully implemented
- **Rich Text Editor**: Full TipTap integration with NotionEditor, auto-save, and keyboard shortcuts
- **Auto-Save System**: Complete auto-save architecture with RTK Query integration and status tracking
- **Database Schema**: All tables implemented with RLS policies and optimized indexes
- **Error Handling**: Comprehensive error boundaries and recovery mechanisms throughout
- **Documentation**: Complete and up-to-date documentation covering all systems

### Production Maintenance Checklist

- **API Consistency**: Ensure all new endpoints follow established RTK Query patterns
- **Database Migrations**: Update database.ts types when schema changes occur
- **Error Handling**: Maintain comprehensive error boundaries for all new features
- **Documentation Updates**: Keep documentation current with any new implementations
- **Type Safety**: Maintain strict TypeScript compliance across all components
- **Mobile Responsiveness**: Test all new features on mobile devices
- **Cross-tab Synchronization**: Ensure new features work across browser tabs
- **Performance**: Monitor and optimize any performance-critical operations
- **Security**: Validate all user inputs and maintain RLS policy compliance
- **Testing**: Maintain test coverage for all critical functionality

## Syncfusion PDF Annotation Debugging Checklist

When implementing or debugging Syncfusion PDF annotations:

- ✅ Use correct bounds format: `{x, y, width, height}` NOT `{left, top, width, height}`
- ✅ Convert 0-based pageIndex to 1-based pageNumber: `pageNumber: pageIndex + 1`
- ✅ Validate PDF viewer reference exists: `pdfViewerRef.current?.annotation`
- ✅ Check document loading state: `!isLoading` before creating annotations
- ✅ Include Annotation service in Inject: `<Inject services={[..., Annotation]} />`
- ✅ Use simplified annotation settings matching Syncfusion documentation
- ✅ Add comprehensive logging for bounds processing and API calls
- ✅ Test with fixed coordinates first using debug test button
- ❌ Don't use {left, top} format - causes annotation creation failures
- ❌ Don't attempt annotation creation while PDF is still loading
- ❌ Don't skip validation of annotation module availability

### Syncfusion Annotation Creation Pattern

```typescript
// Correct bounds processing
const extractSelectionBounds = (args) => {
  return args.textBounds.map((b) => ({
    x: b.left || b.x || 0, // Use x, not left
    y: b.top || b.y || 0, // Use y, not top
    width: b.width || 0,
    height: b.height || 0,
  }));
};

// Correct annotation creation
const createHighlight = () => {
  if (!pdfViewerRef.current?.annotation || isLoading) return;

  const settings = {
    bounds: processedBounds,
    pageNumber: pageIndex + 1, // Convert to 1-based
    color: "#FFFF00",
    opacity: 0.4,
  };

  pdfViewerRef.current.annotation.addAnnotation("Highlight", settings);
};
```

## RTK Query Implementation Checklist

When implementing or refactoring API calls:

- ✅ Use `useCreateNoteMutation` instead of direct fetch to `/api/notes`
- ✅ Use `useUpdateNoteMutation` instead of manual PUT requests
- ✅ Use `useGetNotesQuery` for fetching note lists with automatic caching
- ✅ Leverage RTK Query's automatic loading and error states
- ✅ Use `invalidatesTags` for cache synchronization after mutations
- ❌ Avoid direct fetch calls unless absolutely necessary (file uploads, etc.)

## Auto-Save Architecture Checklist

When working with editor components:

- ✅ Auto-save should be handled internally by NotionEditor components
- ✅ Use RTK Query mutations for create/update operations in auto-save
- ✅ Provide simple `onSaveSuccess` callbacks for parent notifications if needed
- ✅ Remove complex `onAutoSave`, `onNoteIdChange` callback props
- ✅ Extract titles automatically from editor content for new notes
- ❌ Avoid passing save functions down from parent components
- ❌ Avoid complex state management between editor and parent for saving

## Document Processing Implementation Checklist

When implementing or debugging document processing:

- ✅ Use `DocumentProcessingService` with Syncfusion as primary extraction method
- ✅ Implement proper fallback to `OCRService` with node-tesseract-ocr
- ✅ Use `ChunkingService` for semantic text segmentation with content type detection
- ✅ Leverage `ProcessingQueue` for background processing of large documents
- ✅ Implement proper error handling and cleanup for temporary files
- ✅ Use RTK Query for all document processing API calls
- ✅ Store processing status and progress in Supabase with RLS policies
- ❌ Avoid blocking UI during document processing operations
- ❌ Don't skip OCR fallback validation for scanned documents
- ❌ Avoid processing documents without proper user authentication

## RAG System Implementation Checklist

When implementing or debugging RAG-based quiz generation:

- ✅ Use `/api/quiz/generate-rag` for RAG-based quiz generation with proper authentication
- ✅ Implement `/api/quiz/advanced-search` for sophisticated content filtering and semantic search
- ✅ Use `SimpleFeedbackForm` component for user feedback collection and system improvement
- ✅ Leverage vector search integration for relevant content identification across document chunks
- ✅ Implement proper error handling for RAG service failures and fallback mechanisms
- ✅ Use `MobileQuizGeneratorInterface` for mobile-optimized RAG quiz generation
- ✅ Store RAG performance metrics and user feedback in Supabase with RLS policies
- ✅ Implement proper rate limiting and quota management for RAG API calls
- ❌ Avoid blocking UI during RAG processing operations - use background processing
- ❌ Don't skip validation of document processing status before RAG generation
- ❌ Avoid RAG operations without proper user authentication and document access verification

## Highlight Management Implementation Checklist

When implementing or debugging highlight management features:

- ✅ Use `HighlightHoverTrigger` component for hover-based context menu activation
- ✅ Implement `HighlightContextMenu` with proper color picker and opacity slider
- ✅ Use RTK Query mutations (`useUpdateHighlightMutation`, `useDeleteHighlightMutation`) for all operations
- ✅ Validate color values as hex codes and opacity as decimal (0.1-1.0)
- ✅ Use React Portals for proper z-index management of floating menus
- ✅ Implement proper error handling with toast notifications for user feedback
- ✅ Position floating components using transform: translate for precise placement
- ✅ Handle loading states during highlight operations with disabled UI elements
- ❌ Avoid direct DOM manipulation - use React state and props for all interactions
- ❌ Don't skip validation of highlight existence before showing context menus
- ❌ Avoid hardcoded positioning - use dynamic calculation based on highlight bounds

## Quiz System Implementation Checklist

When implementing or debugging quiz management features:

- ✅ Use proper filtering logic for category, difficulty, and search queries
- ✅ Implement responsive grid layouts that adapt to different screen sizes
- ✅ Use theme-aware styling with proper dark/light mode support
- ✅ Validate quiz data structure and ensure proper TypeScript interfaces
- ✅ Implement proper loading states and skeleton components for quiz cards
- ✅ Use consistent badge styling for categories and difficulty levels
- ✅ Implement proper progress tracking with visual progress bars
- ✅ Handle empty states gracefully with appropriate messaging and actions
- ✅ Use proper gradient styling for visual appeal and brand consistency
- ✅ Implement bookmark functionality with proper state management
- ❌ Avoid hardcoded quiz data in production - use proper API integration
- ❌ Don't skip mobile responsiveness testing for quiz interfaces
- ❌ Avoid inconsistent styling between quiz cards and other UI components

## Production Maintenance Checklist

When maintaining the production application:

- **API Consistency**: Ensure all new endpoints follow established RTK Query patterns
- **Database Migrations**: Update database.ts types when schema changes occur
- **Error Handling**: Maintain comprehensive error boundaries for all new features
- **Documentation Updates**: Keep documentation current with any new implementations
- **Type Safety**: Maintain strict TypeScript compliance across all components
- **Mobile Responsiveness**: Test all new features on mobile devices
- **Cross-tab Synchronization**: Ensure new features work across browser tabs
- **Performance**: Monitor and optimize any performance-critical operations
- **Security**: Validate all user inputs and maintain RLS policy compliance
- **Testing**: Maintain test coverage for all critical functionality
- **Quiz System**: Ensure quiz filtering, progress tracking, and responsive design work correctly
- **Theme Integration**: Verify all new components support light/dark mode switching
