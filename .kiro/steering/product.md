---
inclusion: always
---

# Product Context: Noto PDF Annotation App

## Core Product Requirements

**Noto** is a modern, secure PDF annotation and note-taking application built with Next.js 15 and React 19. It provides enterprise-grade document processing, AI-powered quiz generation, and comprehensive theme support. When implementing features, always consider these essential capabilities:

### Primary Features

#### Core PDF & Annotation System ✅ COMPLETED
- **PDF Upload & Storage**: Complete Supabase Storage integration with comprehensive file validation, signed URLs, and automatic expiration handling
- **PDF Viewing**: Full Syncfusion PDF Viewer integration with text selection, zoom, search, navigation, and coordinate-based positioning
- **Enhanced Text Annotation**: Sophisticated text selection workflow with AnnotationTooltip, coordinate conversion, and automatic highlight creation
- **PDF Annotation Workflow**: Text selection → AnnotationTooltip → NoteCreationModal → automatic highlight → HighlightHoverToolbar for existing annotations
- **Coordinate-Based Positioning**: Advanced PDF-to-screen coordinate conversion with canvas detection and viewport boundary handling
- **Annotation CRUD**: Complete annotation storage in Supabase with automatic RLS protection and note-highlight linking

#### Advanced Document Processing ✅ COMPLETED
- **Syncfusion Text Extraction**: Enterprise-grade text extraction using Syncfusion PDF Viewer for superior accuracy and layout preservation
- **OCR Fallback System**: Automatic fallback to node-tesseract-ocr for scanned documents and extraction failures
- **Background Processing Queue**: Asynchronous document processing with progress tracking, timeout management, and job status monitoring
- **Semantic Chunking**: Intelligent text segmentation with configurable overlap, content type detection, and boundary respect
- **Multi-Language Support**: Comprehensive language detection and processing for international documents
- **Metadata Preservation**: Complete extraction of document metadata, page numbers, and structural information

#### AI-Powered Quiz Generation ✅ COMPLETED
- **RAG-Based Quiz Generation**: Advanced retrieval-augmented generation for intelligent quiz creation from PDF content
- **Vector Search Integration**: Semantic search across document chunks for relevant content identification
- **Multiple Question Types**: Support for multiple choice, true/false, and short answer questions
- **Difficulty Levels**: Configurable difficulty settings (easy, medium, hard) with appropriate question complexity
- **Multi-Document Quizzes**: Generate quizzes from multiple PDF sources with balanced content representation
- **Interactive Quiz Player**: Complete quiz-taking interface with progress tracking, scoring, and review modes
- **Quiz History & Analytics**: Comprehensive quiz attempt tracking, performance analytics, and retake functionality

#### Rich Text Editor System ✅ COMPLETED
- **Notion-like Block Editor**: Complete TipTap-based block editor with internal auto-save, RTK Query integration, and simplified API
- **Floating Toolbars**: Context-aware formatting toolbars with intelligent positioning and mobile responsiveness
- **Slash Commands**: Notion-style slash command system for quick block creation and formatting
- **Cross-tab Synchronization**: Real-time updates using BroadcastChannel and PostMessage APIs
- **Auto-Save Architecture**: Editor-internal auto-save using RTK Query mutations with debounced updates and visual feedback

#### Advanced Note Management ✅ COMPLETED
- **Complete CRUD Operations**: Full note creation, editing, updating, and deletion with API integration
- **Enhanced Notes Interface**: Grid, list, and compact view modes with advanced filtering, sorting, and search capabilities
- **Auto-Save Status Management**: Context-based auto-save status with floating indicators positioned in bottom-right
- **Custom UI Components**: Styled confirmation dialogs, floating status indicators, and enhanced error handling
- **Obsidian-Style Interface**: Clean design with separate title input, borderless layouts, and intuitive workflows

#### Complete Theme System ✅ COMPLETED
- **Dark/Light Mode**: Full theme support with system preference detection and persistent storage
- **Theme-Aware Components**: All UI elements including loading skeletons adapt to current theme
- **Custom Theme Toggle**: Integrated theme selection in dashboard sidebar dropdown
- **Cross-tab Synchronization**: Theme changes synchronized across all open browser tabs

#### Modern Dashboard & Navigation ✅ COMPLETED
- **Responsive Dashboard**: Collapsible sidebar with theme selection, user profile management, and modern navigation
- **Cross-Document Navigation**: Seamless switching between PDFs, annotations, and notes with router integration
- **Mobile-First Design**: Touch-friendly interactions and responsive layouts with comprehensive mobile optimization
- **Real-time Activity Tracking**: User activity monitoring with debounced API calls and recent activity display

### Authentication & Security Rules
- **Authentication Required**: All features require Clerk authentication - redirect unauthenticated users to sign-in
- **Data Isolation**: Rely on Supabase RLS policies for automatic user data separation
- **File Security**: Use time-limited signed URLs for PDF access, implement automatic cleanup on failures
- **Input Validation**: Validate all file uploads (size, type, content) before processing

## Implementation Guidelines

### User Experience Patterns
When building UI flows, follow these established patterns:
- **Enhanced Annotation Flow**: Text selection → AnnotationTooltip with smart positioning → NoteCreationModal with NotionEditor → automatic highlight creation → HighlightHoverToolbar for future access
- **Coordinate-Based Positioning**: Use PDF coordinates with sophisticated screen conversion, canvas detection, and viewport boundary adjustment
- **Rich Text Editing**: Use floating toolbars for context-aware formatting, slash commands for quick actions
- **Theme Integration**: All components must support light/dark modes with theme-aware styling
- **Visual Feedback**: Always highlight annotated text, show hover tooltips, use preview cards
- **Navigation**: Dashboard as central hub with collapsible sidebar, easy PDF switching, breadcrumb navigation, seamless PDF-to-notes routing
- **Portal-Based UI**: Use React Portals for floating components with proper z-index management outside PDF containers
- **Error Handling**: Show user-friendly messages, provide retry options, log detailed errors
- **Confirmation Dialogs**: Use custom styled confirmation dialogs instead of browser alerts
- **Auto-Save Feedback**: Provide real-time status indicators for save operations with visual feedback
- **Loading States**: Show loading spinners and disabled states during async operations
- **Toast Notifications**: Use toast messages for success/error feedback with appropriate styling

### Technical Implementation Rules
- **PDF Coordinates**: Always use PDF page coordinates for annotations with sophisticated screen conversion using canvas detection
- **Coordinate Conversion**: Implement fallback hierarchy: page-specific canvas → general canvas → viewer element → original coordinates
- **Viewport Boundary Handling**: Automatically adjust tooltip/modal positioning to stay within visible screen area
- **Server Communication**: Always use RTK Query for API calls - never use direct fetch calls
- **State Management**: Use Redux Toolkit with RTK Query for all API calls and caching
- **Auto-Save Architecture**: Editor components handle auto-save internally using RTK Query mutations
- **Theme Support**: Implement theme-aware styling using CSS custom properties and Tailwind dark mode classes
- **Portal Rendering**: Use React Portals for floating components to ensure proper z-index management
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

### Current Development Status ✅ PRODUCTION READY
The Noto PDF annotation application is fully implemented and production-ready:

1. **Complete Backend Integration**: Supabase backend with RLS, file storage, comprehensive error handling, and activity tracking is fully implemented and tested
2. **Full API Coverage**: All API endpoints (PDFs, notes, annotations, quiz generation, document processing) are complete and tested
3. **Frontend Integration**: RTK Query API calls integrated throughout with real data flow and comprehensive error handling
4. **Document Processing**: Advanced text extraction with Syncfusion primary extraction and OCR fallback system
5. **AI Quiz Generation**: Complete RAG-based quiz generation with vector search and multi-document support
6. **Rich Text Editor**: Full Notion-like editor with auto-save, floating toolbars, and cross-tab synchronization
7. **Theme System**: Complete dark/light mode implementation with system preference detection
8. **Mobile Optimization**: Touch-friendly interfaces with responsive design and mobile-specific interactions
9. **Error Handling**: Comprehensive error boundaries, recovery mechanisms, and user-friendly error messages
10. **Testing Coverage**: Extensive test coverage for core functionality and edge cases

### Current Development Focus
The application is feature-complete. Future enhancements should focus on:
1. **Performance Optimization**: Virtual scrolling for large document collections, advanced caching strategies
2. **Advanced Features**: Collaborative editing, advanced search with content indexing, bulk operations
3. **User Experience**: Enhanced accessibility features, advanced keyboard shortcuts, user onboarding
4. **Analytics & Monitoring**: User behavior analytics, performance monitoring, usage patterns
5. **Scalability**: Database optimization, CDN integration, advanced caching mechanisms

### Code Integration Points
- Use `getAuthenticatedSupabaseClient()` for all database operations
- Import components from `@/components/[feature]/` directories
- Use typed Redux hooks from `@/lib/store/hooks`
- Follow established error handling patterns in `@/lib/utils/error-handling`
- Implement mobile-responsive patterns from existing components
