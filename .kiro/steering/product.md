---
inclusion: always
---

# Product Context: Noto PDF Annotation App

## Core Product Requirements

**Noto** is a PDF annotation and note-taking application with comprehensive theme support and modern UI/UX. When implementing features, always consider these essential capabilities:

### Primary Features
- **PDF Upload & Storage**: Use `/api/pdfs/upload` endpoint with Supabase Storage, organize files by `{userId}/{timestamp}_{filename}`
- **PDF Viewing**: Integrate Syncfusion PDF Viewer component (licensed) for all PDF rendering
- **Rich Text Editing**: Use TipTap-based NotionEditor with floating toolbars for annotation content creation
- **Text Annotation**: Implement click-drag text selection with coordinate-based positioning (not DOM-based)
- **Annotation CRUD**: Store all annotations in Supabase with automatic RLS protection
- **Advanced Note-Taking System**: Enhanced notes interface with grid/list/compact views, filtering, sorting, and search
- **Cross-Document Navigation**: Enable seamless switching between PDFs, annotations, and notes
- **Complete Theme System**: Light/dark mode support with system preference detection and theme-aware components
- **Responsive Dashboard**: Collapsible sidebar with theme selection, user profile management, and modern navigation
- **Mobile-First Design**: Prioritize touch-friendly interactions and responsive layouts

### Authentication & Security Rules
- **Authentication Required**: All features require Clerk authentication - redirect unauthenticated users to sign-in
- **Data Isolation**: Rely on Supabase RLS policies for automatic user data separation
- **File Security**: Use time-limited signed URLs for PDF access, implement automatic cleanup on failures
- **Input Validation**: Validate all file uploads (size, type, content) before processing

## Implementation Guidelines

### User Experience Patterns
When building UI flows, follow these established patterns:
- **Annotation Flow**: Text selection → Note dialog with rich editor → Save (minimize clicks)
- **Rich Text Editing**: Use floating toolbars for context-aware formatting, slash commands for quick actions
- **Theme Integration**: All components must support light/dark modes with theme-aware styling
- **Visual Feedback**: Always highlight annotated text, show hover tooltips, use preview cards
- **Navigation**: Dashboard as central hub with collapsible sidebar, easy PDF switching, breadcrumb navigation
- **Error Handling**: Show user-friendly messages, provide retry options, log detailed errors

### Technical Implementation Rules
- **PDF Coordinates**: Always use PDF page coordinates for annotations, never DOM positions
- **Server Communication**: Always use RTK Query for API calls - never use direct fetch calls
- **State Management**: Use Redux Toolkit with RTK Query for all API calls and caching
- **Auto-Save Architecture**: Editor components handle auto-save internally using RTK Query mutations
- **Theme Support**: Implement theme-aware styling using CSS custom properties and Tailwind dark mode classes
- **Mobile Support**: Implement touch gestures for text selection, use mobile-specific dialogs
- **Performance**: Lazy load annotations, handle large PDFs efficiently, cache API responses
- **Cross-tab Sync**: Use PostMessage API for real-time annotation synchronization

### Feature Boundaries
**Always Implement:**
- PDF viewing and text annotation functionality
- User authentication and secure data persistence
- Mobile-responsive interfaces with theme support
- Cross-tab synchronization
- Theme-aware loading states and skeleton components

**Never Implement:**
- PDF editing or content modification
- Collaborative real-time features
- Rich text formatting in notes
- Offline functionality

## Development Context

### Available Infrastructure
When building features, leverage these completed and tested systems:
- **Supabase Backend**: Complete database with RLS, file storage with signed URLs, comprehensive error handling, and activity tracking
- **Authentication**: Full Clerk integration with JWT-based RLS policies and automatic user data isolation
- **PDF System**: Complete upload API (`/api/pdfs/upload`), listing API (`/api/pdfs`), individual access API (`/api/pdfs/[id]`), Syncfusion viewer integration, and coordinate-based annotations
- **Rich Text Editor**: Complete TipTap integration with NotionEditor, floating toolbars, slash commands, editor extensions, and auto-save functionality
- **Note-Taking System**: Complete note creation, editing, and management with auto-save, word count, and keyboard shortcuts
- **UI Components**: Complete annotation component suite (tooltips, dialogs, overlays, preview cards) with mobile responsiveness
- **State Management**: Redux store with RTK Query, typed hooks, selectors, and real-time cache invalidation
- **Mobile Support**: Touch-friendly interfaces, responsive dialogs, mobile-specific interactions, and gesture handling
- **Cross-tab Sync**: PostMessage-based navigation and state synchronization with error handling
- **Error Handling**: Comprehensive error boundaries, recovery mechanisms, and user-friendly error messages
- **Activity Tracking**: Real-time user activity monitoring with debounced API calls and recent activity display
- **Dashboard**: Complete PDF and note management interface with recent activity, upload functionality, and signed URL handling

### Current Development Status
The core infrastructure is complete and functional:
1. **Backend Integration**: Supabase backend with RLS, file storage, and comprehensive error handling is fully implemented
2. **API Endpoints**: PDF upload, listing, and individual access endpoints are complete and tested
3. **Frontend Integration**: RTK Query API calls are integrated throughout the application with real data flow
4. **Activity Tracking**: Real-time user activity monitoring and recent activity display is implemented
5. **Error Handling**: Comprehensive error handling system with recovery mechanisms is in place

### Current Development Focus
When working on new features, prioritize:
1. **Note System Completion**: Complete notes API endpoints (`/api/notes`), database schema, and full CRUD operations
2. **Feature Enhancement**: Add advanced annotation features like annotation types, search, and export
3. **Performance Optimization**: Implement virtual scrolling, caching improvements, and mobile optimizations
4. **User Experience**: Enhance accessibility, keyboard navigation, and collaborative features
5. **Testing Coverage**: Expand test coverage for edge cases and integration scenarios

### Code Integration Points
- Use `getAuthenticatedSupabaseClient()` for all database operations
- Import components from `@/components/[feature]/` directories
- Use typed Redux hooks from `@/lib/store/hooks`
- Follow established error handling patterns in `@/lib/utils/error-handling`
- Implement mobile-responsive patterns from existing components
