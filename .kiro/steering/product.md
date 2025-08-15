---
inclusion: always
---

# Product Context: Noto PDF Annotation App

## Core Product Requirements

**Noto** is a PDF annotation and note-taking application. When implementing features, always consider these essential capabilities:

### Primary Features
- **PDF Upload & Storage**: Use `/api/pdfs/upload` endpoint with Supabase Storage, organize files by `{userId}/{timestamp}_{filename}`
- **PDF Viewing**: Integrate Syncfusion PDF Viewer component (licensed) for all PDF rendering
- **Text Annotation**: Implement click-drag text selection with coordinate-based positioning (not DOM-based)
- **Annotation CRUD**: Store all annotations in Supabase with automatic RLS protection
- **Cross-Document Navigation**: Enable seamless switching between PDFs and their annotations
- **Mobile-First Design**: Prioritize touch-friendly interactions and responsive layouts

### Authentication & Security Rules
- **Authentication Required**: All features require Clerk authentication - redirect unauthenticated users to sign-in
- **Data Isolation**: Rely on Supabase RLS policies for automatic user data separation
- **File Security**: Use time-limited signed URLs for PDF access, implement automatic cleanup on failures
- **Input Validation**: Validate all file uploads (size, type, content) before processing

## Implementation Guidelines

### User Experience Patterns
When building UI flows, follow these established patterns:
- **Annotation Flow**: Text selection → Note dialog → Save (minimize clicks)
- **Visual Feedback**: Always highlight annotated text, show hover tooltips, use preview cards
- **Navigation**: Dashboard as central hub, easy PDF switching, breadcrumb navigation
- **Error Handling**: Show user-friendly messages, provide retry options, log detailed errors

### Technical Implementation Rules
- **PDF Coordinates**: Always use PDF page coordinates for annotations, never DOM positions
- **State Management**: Use Redux Toolkit with RTK Query for all API calls and caching
- **Mobile Support**: Implement touch gestures for text selection, use mobile-specific dialogs
- **Performance**: Lazy load annotations, handle large PDFs efficiently, cache API responses
- **Cross-tab Sync**: Use PostMessage API for real-time annotation synchronization

### Feature Boundaries
**Always Implement:**
- PDF viewing and text annotation functionality
- User authentication and secure data persistence
- Mobile-responsive interfaces
- Cross-tab synchronization

**Never Implement:**
- PDF editing or content modification
- Collaborative real-time features
- Rich text formatting in notes
- Offline functionality

## Development Context

### Available Infrastructure
When building features, leverage these completed systems:
- **Supabase Backend**: Database with RLS, file storage with signed URLs, comprehensive error handling
- **Authentication**: Clerk integration with JWT-based RLS policies
- **PDF System**: Upload API (`/api/pdfs/upload`), Syncfusion viewer integration, coordinate-based annotations
- **UI Components**: Complete annotation component suite (tooltips, dialogs, overlays, preview cards)
- **State Management**: Redux store with RTK Query, typed hooks, and selectors
- **Mobile Support**: Touch-friendly interfaces, responsive dialogs, mobile-specific interactions
- **Cross-tab Sync**: PostMessage-based navigation and state synchronization

### Current Development Focus
When working on new features, prioritize:
1. **API Integration**: Connect existing UI components with Supabase backend APIs
2. **Dashboard Functionality**: Complete PDF listing and individual PDF access endpoints
3. **Data Flow**: Replace mock data with real RTK Query API calls throughout the application

### Code Integration Points
- Use `getAuthenticatedSupabaseClient()` for all database operations
- Import components from `@/components/[feature]/` directories
- Use typed Redux hooks from `@/lib/store/hooks`
- Follow established error handling patterns in `@/lib/utils/error-handling`
- Implement mobile-responsive patterns from existing components
