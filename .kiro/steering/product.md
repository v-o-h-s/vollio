---
inclusion: always
---

# Product Context: Noto PDF Annotation App

## Core Product Requirements

**Noto** is a modern, secure PDF annotation and note-taking application built with Next.js 15 and React 19. It provides enterprise-grade document processing, intelligent PDF annotation tools, and comprehensive theme support. When implementing features, always consider these essential capabilities:

### Primary Features

#### Core PDF & Annotation System ✅ COMPLETED
- **PDF Upload & Storage**: Complete Supabase Storage integration with comprehensive file validation, signed URLs, and automatic expiration handling
- **PDF Viewing**: Full Syncfusion PDF Viewer integration with text selection, zoom, search, navigation, and coordinate-based positioning
- **Enhanced Text Annotation**: Sophisticated text selection workflow with AnnotationTooltip, coordinate conversion, and automatic highlight creation
- **PDF Annotation Workflow**: Text selection → AnnotationTooltip → NoteCreationModal → automatic highlight → HighlightHoverToolbar for existing annotations
- **Coordinate-Based Positioning**: Advanced PDF-to-screen coordinate conversion with canvas detection and viewport boundary handling
- **Annotation CRUD**: Complete annotation storage in Supabase with automatic RLS protection and note-highlight linking

#### Advanced PDF Annotation Tools ✅ COMPLETED
- **Multi-Mode Highlighting System**: Professional annotation toolkit with three distinct highlighting modes
  - 🟡 **Quick Highlight**: Instant text highlighting without note creation for rapid document review
  - 🟠 **Inline Comment**: Highlighting with contextual comment display on hover for detailed annotations
  - 🔵 **Linked Note**: Full note creation with highlight linkage for comprehensive document analysis
- **Advanced Highlight Management**: Complete highlight lifecycle management with HighlightContextMenu and HighlightHoverTrigger
  - **Color Customization**: 8 predefined colors with visual color picker interface
  - **Opacity Control**: Adjustable opacity from 10% to 100% with real-time slider feedback
  - **Highlight Deletion**: Safe highlight removal with confirmation and proper cleanup
  - **Hover Interactions**: Smart hover triggers that appear on highlight mouseover
- **Complete API Integration**: Full CRUD operations for highlights with database persistence
  - **Highlight API**: `/api/highlights` and `/api/highlights/[id]` endpoints fully implemented
  - **Database Schema**: Highlights table with textbounds, color, opacity, and type fields
  - **RTK Query Integration**: All highlight operations use proper API mutations with error handling
- **Glassmorphism Interface**: Modern floating header with backdrop blur effects and transparency for immersive PDF viewing
- **Dynamic Tool Selection**: Intelligent dropdown menus with nested tool options and visual feedback
- **Context-Aware Tooltips**: Smart annotation tooltips that adapt based on selected tool and highlighting mode
- **Visual Tool Indicators**: Real-time display of active tool and mode with color-coded status indicators
- **Focus Mode Integration**: Seamless tool access in both normal and distraction-free focus viewing modes
- **Professional UI Design**: Enterprise-grade interface with consistent glassmorphism styling across all components
- **Syncfusion Annotation Integration**: Proper bounds format handling with {x, y, width, height} coordinates for reliable highlighting
- **Annotation Validation**: Comprehensive checks for PDF readiness and annotation module availability before highlight creation
- **Debug Infrastructure**: Real-time logging and test utilities for troubleshooting annotation issues
- **Portal-Based Rendering**: React Portal usage for proper z-index management and floating component positioning



#### Advanced Document Processing ✅ COMPLETED
- **Syncfusion Text Extraction**: Enterprise-grade text extraction using Syncfusion PDF Viewer for superior accuracy and layout preservation
- **OCR Fallback System**: Automatic fallback to node-tesseract-ocr for scanned documents and extraction failures
- **Intelligent Text Processing**: Advanced text processing with layout preservation and metadata extraction
- **Multi-Language Support**: Comprehensive language detection and processing for international documents
- **Secure File Management**: Comprehensive file validation, storage organization, and automatic cleanup

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
- **Floating Navigation System**: Modern glassmorphism-based navigation dock with auto-hide functionality
  - **Collapsed State**: Compact dock with logo, navigation icons, and user avatar for minimal screen footprint
  - **Expanded State**: Full 2x2 grid layout with descriptions, user profile, and comprehensive settings access
  - **Auto-Hide Behavior**: Smart scroll detection with smooth visibility transitions for immersive content viewing
  - **Theme Integration**: Complete dark/light mode support with gradient effects and smooth transitions
  - **User Profile Integration**: Dropdown menus with theme selection, settings, and account management
  - **Hydration Safety**: Prevents layout shifts with proper loading states and mounted component detection
- **Floating Sidebar**: Left-positioned collapsible sidebar with page-specific quick actions
  - **Context-Aware Actions**: Dynamic action sets that adapt based on current route (PDFs, Notes, Quizzes, Dashboard)
  - **Keyboard Shortcuts**: Integrated shortcuts with visual indicators (Ctrl+N, Ctrl+F, F5, etc.)
  - **Event Communication**: Loose coupling with page components through custom event system
  - **Glassmorphism Design**: Consistent styling with backdrop blur and theme-aware transparency
- **Cross-Document Navigation**: Seamless switching between PDFs, annotations, and notes with router integration
- **Mobile-First Design**: Touch-friendly interactions and responsive layouts with comprehensive mobile optimization
- **Real-time Activity Tracking**: User activity monitoring with debounced API calls and recent activity display

#### Quiz Management System ✅ COMPLETED
- **Quiz Center Interface**: Complete quiz management dashboard with filtering, categorization, and progress tracking
- **Advanced Filtering**: Multi-dimensional filtering by category, difficulty, completion status, and search queries
- **Progress Tracking**: Comprehensive progress visualization with completion rates, best scores, and attempt history
- **Category Management**: Organized quiz categories (Mathematics, Programming, History, Chemistry, Computer Science, Language)
- **Difficulty Levels**: Three-tier difficulty system (Easy, Medium, Hard) with color-coded visual indicators
- **Statistics Dashboard**: Real-time statistics cards showing total quizzes, completed count, average scores, and study streaks
- **Interactive Quiz Cards**: Rich quiz cards with metadata, progress bars, tags, bookmarking, and action buttons
- **Responsive Design**: Mobile-optimized quiz interface with touch-friendly interactions and adaptive layouts
- **Theme Integration**: Full dark/light mode support with theme-aware styling and gradient effects

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
- **Navigation**: Modern floating navigation system with glassmorphism dock, auto-hide behavior, and seamless PDF-to-notes routing
- **Floating Sidebar Integration**: Context-aware page-specific actions with keyboard shortcuts, event-based communication, and collapsible design
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

1. **Complete Backend Integration**: Supabase backend with RLS, file storage, comprehensive error handling, and activity tracking
2. **Full API Coverage**: All core API endpoints (PDFs, notes, annotations, highlights, folders) are complete and tested
3. **Frontend Integration**: RTK Query API calls integrated throughout with real data flow and comprehensive error handling
4. **Document Processing**: Advanced text extraction with Syncfusion primary extraction and OCR fallback system
5. **PDF Annotation System**: Complete multi-mode highlighting with advanced management tools and glassmorphism UI
6. **Rich Text Editor**: Full Notion-like editor with auto-save, floating toolbars, and cross-tab synchronization
7. **Theme System**: Complete dark/light mode implementation with system preference detection and cross-tab synchronization
8. **Folder Management**: Hierarchical folder system with drag & drop support and PDF organization
9. **Quiz Management**: Complete quiz center with filtering, progress tracking, and interactive management interface
10. **Mobile Optimization**: Touch-friendly interfaces with responsive design, mobile-specific interactions, and gesture support
11. **Error Handling**: Comprehensive error boundaries, recovery mechanisms, and user-friendly error messages
12. **Testing Coverage**: Comprehensive test coverage for core functionality and edge cases
13. **Documentation**: Complete and up-to-date documentation covering all systems and APIs

### Current Development Focus
The application is feature-complete and production-ready. Future enhancements should focus on:
1. **Performance Optimization**: Virtual scrolling for large document collections, advanced caching strategies, edge computing integration
2. **Collaboration Features**: Real-time collaborative editing, shared workspaces, team annotation management
3. **Enterprise Features**: Team workspaces, advanced permissions, audit logging, compliance features
4. **Advanced Analytics**: User behavior analytics, annotation insights, usage patterns
5. **AI Enhancement**: Intelligent content suggestions, automated tagging, smart search capabilities
6. **Accessibility**: Enhanced WCAG compliance, assistive technology support, inclusive design improvements
7. **Scalability**: Database optimization, CDN integration, microservices architecture, global deployment

### Code Integration Points
- Use `getAuthenticatedSupabaseClient()` for all database operations
- Import components from `@/components/[feature]/` directories
- Use typed Redux hooks from `@/lib/store/hooks`
- Follow established error handling patterns in `@/lib/utils/error-handling`
- Implement mobile-responsive patterns from existing components
