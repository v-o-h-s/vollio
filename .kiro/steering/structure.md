---
inclusion: always
---

# Project Structure & File Organization

## Architecture Principles

### State Management Strategy ✅ COMPLETED
- **Redux Store**: Persistent application state (PDFs, annotations, notes, quiz data, user selections, preview cards)
- **Local Component State**: Transient UI state (tooltip positioning, modal visibility, loading states, form inputs)
- **RTK Query**: All server communications, caching, real-time updates, and API state management
- **Context Providers**: Scoped state management (AutoSaveStatusProvider, ThemeProvider, EditorProvider, QuizAccessibilityProvider)

### Component State Guidelines
- Use Redux for data that needs to persist across component unmounts
- Use local useState for ephemeral UI state (visibility, positioning, form inputs)  
- Tooltip states managed locally in PDF components, not in Redux
- Preview card state in Redux for cross-component coordination

## File Placement Rules

### Components

#### UI Components (`components/ui/`)
- **shadcn/ui Base Components**: `button.tsx`, `dialog.tsx`, `card.tsx`, `input.tsx`, `label.tsx`, `popover.tsx`, `separator.tsx`, `skeleton.tsx` (theme-aware), `dropdown-menu.tsx`, `badge.tsx`, `theme-toggle.tsx`
- **Enhanced UI Components**: 
  - `error-notification.tsx` - User-friendly error display with retry options
  - `loading.tsx` - Loading states and spinners with theme support
  - `KeyboardShortcutsHelp.tsx` - Keyboard shortcuts help dialog
  - `note-card.tsx` - Note display card with preview and metadata
  - `note-skeleton.tsx` - Theme-aware loading skeleton for notes
  - `enhanced-note-card.tsx` - Advanced note card with rich interactions and theme support
  - `enhanced-notes-list.tsx` - Optimized notes list with virtualization, filtering, and theme integration
  - `enhanced-notes-list-skeleton.tsx` - Theme-aware loading skeleton for notes list
  - `delete-confirmation-dialog.tsx` - Custom styled confirmation dialog with loading states and error handling

#### Feature Components (`components/[feature]/`)

##### Theme Components (`components/theme/`)
- **ThemeProvider.tsx** - Context provider for theme state management with localStorage persistence and system preference detection
- **ThemeDemo.tsx** - Interactive demo component showcasing theme functionality and features
- **ThemeToggleDemo.tsx** - Comprehensive demo of different ThemeToggle variants and configurations
- **README.md** - Complete documentation covering theme system features, API reference, and implementation guides

##### PDF Components (`components/pdf/`) ✅ COMPLETED
- **PDFAnnotationViewer.tsx** - Main PDF viewer with Syncfusion integration, enhanced coordinate conversion, complete annotation workflow, multi-mode highlighting system, glassmorphism UI design, and proper bounds format handling for reliable highlighting
- **PDFDirectoryView.tsx** - Comprehensive file system-style PDF management interface with drag & drop support and visual file management
- **AnnotationTooltip.tsx** - Enhanced text selection UI with sophisticated PDF-to-screen coordinate conversion, viewport boundary detection, dynamic tool adaptation, and smart content updates
- **NoteCreationModal.tsx** - Large modal for note creation with NotionEditor integration, auto-save, and enhanced layout with selected text reference
- **HighlightHoverToolbar.tsx** - Mini toolbar for existing highlights with "View Note" and "Open" buttons, router navigation integration
- **NotePreviewModal.tsx** - Read-only note preview modal with TipTap editor for quick viewing without leaving PDF
- **PDFUploadZone.tsx** - Drag and drop upload interface with visual feedback and folder context
- **PDFThumbnail.tsx** - PDF thumbnail generation and display with caching
- **PDFContextMenu.tsx** - Right-click context menu with file operations
- **PDFBreadcrumb.tsx** - Breadcrumb navigation for folder hierarchy
- **PDFSearchBar.tsx** - Search input with real-time filtering
- **PDFSortOptions.tsx** - Dropdown for sorting options
- **PDFViewToggle.tsx** - Toggle between grid and list views
- **PDFFolder.tsx** - Individual folder display component
- **AnnotationPreviewCard.tsx** - Hover preview of annotation content with edit functionality
- **FallbackUI.tsx** - Error state components for PDF operations (TextSelectionFallback, PDFViewerFallback, etc.)

##### PDF Annotation Tools Architecture ✅ COMPLETED
- **Multi-Mode Highlighting**: Three distinct highlighting modes with color-coded visual feedback and different annotation behaviors
- **Glassmorphism UI**: Modern floating header with backdrop blur effects, transparency, and gradient overlays for professional appearance
- **Dynamic Tool Selection**: Context-aware dropdown menus with nested highlighting options and real-time visual indicators
- **Smart Tooltip System**: AnnotationTooltip component that dynamically adapts content based on selected tool and highlighting mode
- **Focus Mode Integration**: Seamless tool access in both normal and distraction-free viewing modes with enhanced "Show Header" button styling
- **State Management**: Proper tool and mode state management with props passing to PDF annotation components

##### Quiz Components (`components/quiz/`) ✅ COMPLETED
- **QuizGeneratorInterface.tsx** - Main quiz generation interface with document selection and configuration
- **ResponsiveQuizInterface.tsx** - Responsive wrapper for desktop/mobile quiz interfaces
- **MobileQuizGeneratorInterface.tsx** - Mobile-optimized quiz generation interface with RAG integration and touch-friendly interactions
- **InteractiveQuizPlayer.tsx** - Complete quiz-taking interface with progress tracking, scoring, and mobile optimization
- **QuizResultsDisplay.tsx** - Quiz results display with detailed feedback (analytics removed)
- **QuizConfigurationPanel.tsx** - Quiz settings and configuration options with advanced customization
- **DocumentProcessingStatus.tsx** - Document processing progress and status display with real-time updates
- **MultiDocumentStatus.tsx** - Status display for multi-document quiz generation with balanced processing
- **ContentPreview.tsx** - Preview of document content for quiz generation with content analysis
- **QuizErrorBoundary.tsx** - Error handling components for quiz functionality with recovery mechanisms
- **QuizLoadingStates.tsx** - Loading state components for quiz operations with skeleton UI
- **ChunkManagementPanel.tsx** - Document chunk management and optimization for improved quiz generation
- **QuizAccessibilityProvider.tsx** - Accessibility context and utilities for quiz components with WCAG compliance

##### RAG Components (`components/rag/`) ✅ COMPLETED
- **SimpleFeedbackForm.tsx** - User feedback collection for RAG system performance monitoring and improvement
- **RAGSearchInterface.tsx** - Advanced search interface for RAG-based content discovery
- **RAGResultsDisplay.tsx** - Display component for RAG search results with relevance scoring
- **RAGMonitoringDashboard.tsx** - Performance monitoring and analytics for RAG operations

##### RAG Components (`components/rag/`) ✅ COMPLETED
- **SimpleFeedbackForm.tsx** - User feedback collection for RAG system performance monitoring and improvement
- **RAGSearchInterface.tsx** - Advanced search interface for RAG-based content discovery
- **RAGResultsDisplay.tsx** - Display component for RAG search results with relevance scoring
- **RAGMonitoringDashboard.tsx** - Performance monitoring and analytics for RAG operations

##### Editor Components (`components/editor/`)
- **Core Editor Components**:
  - `NotionEditor.tsx` - Main TipTap-based block editor with internal auto-save, RTK Query integration, and simplified API
  - `EditorProvider.tsx` - Context provider for editor state management and cross-tab sync
  - `LazyNotionEditor.tsx` - Performance-optimized wrapper with lazy loading and skeleton states
  - `ResponsiveNotionEditor.tsx` - Responsive editor that adapts to screen size
  - `RobustNotionEditor.tsx` - Editor with enhanced error handling and recovery (no callback complexity)
  - `MultiModeEditor.tsx` - Editor with multiple editing modes (rich text, markdown, etc.)
  - `NotionEditorWithAutoSave.tsx` - [DEPRECATED] - Auto-save is now built into base NotionEditor

- **Floating Toolbar Components**:
  - `FloatingToolbar.tsx` - Basic floating toolbar with essential formatting options
  - `AdvancedFloatingToolbar.tsx` - Feature-rich toolbar with color picker and advanced options
  - `PDFAnnotationToolbar.tsx` - Specialized toolbar for PDF annotation workflows
  - `AdaptiveFloatingToolbar.tsx` - Toolbar that adapts to context and device
  - `ContextualToolbar.tsx` - Context-aware toolbar based on selected content
  - `BubbleMenu.tsx` - Bubble menu for inline formatting
  - `TableBubbleMenu.tsx` - Specialized bubble menu for table operations

- **Mobile Editor Components**:
  - `MobileNotionEditor.tsx` - Mobile-optimized editor with touch interactions
  - `MobileEditorToolbar.tsx` - Mobile-specific toolbar with touch-friendly buttons
  - `MobileFormattingPanel.tsx` - Mobile formatting panel with swipe gestures
  - `MobileBlockSelector.tsx` - Mobile block type selector with visual previews
  - `MobileContextMenu.tsx` - Mobile context menu for editor actions
  - `MobileDragDrop.tsx` - Mobile drag-and-drop functionality for blocks
  - `MobileSlashCommand.tsx` - Mobile-optimized slash command interface
  - `MobileTextSelection.tsx` - Mobile text selection with enhanced touch handling

- **Editor Extensions** (`components/editor/extensions/`):
  - `SlashCommand.tsx` - Notion-style slash commands for quick formatting
  - `ImageUpload.tsx` - Drag-and-drop image upload with Supabase integration
  - `ImageUploadView.tsx` - Image upload view component with progress
  - `EnhancedLink.tsx` - Advanced link handling with validation and preview
  - `KeyboardShortcuts.ts` - Comprehensive keyboard shortcuts for accessibility

- **Editor Utilities**:
  - `EditorErrorBoundary.tsx` - Error boundary specifically for editor components
  - `EditorStatsDisplay.tsx` - Word count, character count, and reading time display
  - `EditorToolbar.tsx` - Traditional toolbar for editor formatting
  - `AutoSaveStatus.tsx` - Auto-save status indicator with visual feedback
  - `LinkDialog.tsx` - Link creation and editing dialog
  - `KeyboardShortcutsDialog.tsx` - Keyboard shortcuts help dialog
  - `AccessibilityProvider.tsx` - Accessibility context and utilities
  - `AccessibilitySettingsDialog.tsx` - Accessibility settings configuration
  - `TypographySettings.tsx` - Typography and reading preferences

- **Demo and Example Components**:
  - `FloatingToolbarDemo.tsx` - Demonstration of floating toolbar variants
  - `AutoSaveDemo.tsx` - Auto-save functionality demonstration
  - `MobileEditorDemo.tsx` - Mobile editor features demonstration
  - `MultiModeEditorDemo.tsx` - Multi-mode editor demonstration
  - `AutoSaveExample.tsx` - Auto-save implementation example

##### Dashboard Components (`components/dashboard/`)
- **dashboard-sidebar.tsx** - Main navigation sidebar with collapsible design, theme selection dropdown, and user profile management
- **RecentActivityDisplay.tsx** - Recent activity widget for dashboard overview
- **AutoSaveStatusProvider.tsx** - Context provider for global auto-save status management
- **FloatingAutoSaveStatus.tsx** - Bottom-right positioned auto-save status indicator with real-time updates
- **SidebarProvider.tsx** - Context provider for sidebar state management (collapsed/expanded)

#### Layout Components (`components/` root)
- **dashboard-sidebar.tsx** - Collapsible sidebar with navigation, user profile, and settings dropdown
- **ErrorBoundary.tsx** - Comprehensive error boundary with specialized fallbacks (PDFErrorBoundary, UploadErrorBoundary)
- **SyncfusionLicenseProvider.tsx** - Syncfusion license registration provider for PDF viewer

#### Export Pattern
- Use `index.ts` files in feature directories for clean imports
- Export all components and utilities from feature directories
- Maintain consistent naming conventions across exports

### Editor Components

- **Editor Core**: `components/editor/` - TipTap-based rich text editor system
  - `NotionEditor.tsx` - Main editor component with full TipTap integration
  - `EditorProvider.tsx` - Context provider for editor state management
  - `FloatingToolbar.tsx` - Context-aware formatting toolbar
  - `AdvancedFloatingToolbar.tsx` - Feature-rich editing toolbar
  - `PDFAnnotationToolbar.tsx` - Specialized toolbar for PDF annotations
- **Editor Extensions**: `components/editor/extensions/` - TipTap extensions
  - `SlashCommand.tsx` - Notion-style slash commands
  - `ImageUpload.tsx` - Drag-and-drop image upload
  - `EnhancedLink.tsx` - Advanced link handling
  - `KeyboardShortcuts.ts` - Standard keyboard shortcuts

### Pages & Routes

- **App Router**: Follow `app/[route]/page.tsx` pattern with proper nesting
- **API Routes**: `app/api/[resource]/route.ts` or `app/api/[resource]/[id]/route.ts`
- **Dynamic Routes**: Use `[id]` for single params, `[[...rest]]` for catch-all
- **Layouts**: Place `layout.tsx` at appropriate directory levels for shared UI
- **Note Routes**: `app/dashboard/notes/` for note management, `app/dashboard/notes/new/` for note creation, `app/dashboard/notes/[id]/` for note editing

### State & Logic

- **Redux Store**: `lib/store/` with feature slices (`annotationSlice.ts`, `apiSlice.ts`), typed hooks (`hooks.ts`), selectors (`selectors.ts`), and provider (`provider.tsx`)
- **Supabase Client**: `lib/supabaseClient.ts` for database and storage operations with RLS integration
- **Utilities**: Feature-specific utilities organized by domain:
  - `lib/utils/error-handling.ts` - Comprehensive error management system
  - `lib/utils/server-error-handling.ts` - Server-side error handling utilities
  - `lib/utils/supabase-helpers.ts` - Database and storage helper functions
  - `lib/utils/activity-tracking.ts` - User activity monitoring utilities
  - `lib/utils/pdfCoordinates.ts` - PDF coordinate calculation utilities
  - `lib/utils/crossTabNavigation.ts` - Cross-tab communication utilities
  - `lib/utils/dates.ts` - Date formatting and manipulation utilities
  - `lib/utils/notifications.ts` - User notification utilities
  - `lib/utils.ts` - Shared utility functions
- **Types**: Comprehensive type definitions:
  - `lib/types.ts` - Application-wide types and interfaces
  - `lib/types/database.ts` - Supabase database types
  - `lib/types/errors.ts` - Error handling types and interfaces

### Custom Hooks (`hooks/`)

#### Core Functionality Hooks
- **use-auto-save.ts** - Debounced auto-save functionality with status tracking (idle, saving, saved, error) and retry mechanisms
- **use-debounce.ts** - Generic debouncing utility for performance optimization and API call reduction
- **use-retry.ts** - Retry logic with exponential backoff for failed operations and network resilience

#### Error Handling Hooks
- **use-error-handling.ts** - Comprehensive error management with user-friendly messaging, recovery actions, and retry mechanisms
- **use-editor-error-recovery.ts** - Editor-specific error recovery with content preservation and state restoration
- **use-network-status.ts** - Network connectivity monitoring with offline/online state management

#### User Interface Hooks
- **use-keyboard-shortcuts.ts** - Keyboard shortcut handling for accessibility and power user features
- **use-focus-management.ts** - Focus management for accessibility compliance and keyboard navigation
- **use-mobile.ts** - Mobile device detection and responsive design utilities (isMobile, isTablet, hasTouch, orientation)
- **use-touch-gestures.ts** - Touch gesture recognition for mobile interactions (swipe, pinch, tap, long press)

#### Editor-Specific Hooks
- **use-mobile-editor.ts** - Mobile-optimized editor functionality with touch interactions and responsive behavior
- **use-mobile-keyboard.ts** - Mobile keyboard handling with virtual keyboard detection and input optimization
- **use-editor-keyboard-shortcuts.ts** - Editor-specific keyboard shortcuts for formatting and navigation

#### Activity and Sync Hooks
- **use-activity-tracking.ts** - User activity monitoring with debounced API calls, cache invalidation, and real-time updates
- **use-note-sync.ts** - Cross-tab note synchronization using BroadcastChannel and PostMessage APIs for real-time collaboration

#### Hook Architecture
- **Naming Convention**: `use-kebab-case.ts` format for consistency
- **TypeScript Integration**: Full type safety with proper interfaces and return types
- **Error Handling**: Comprehensive error handling with user-friendly messages
- **Performance Optimization**: Memoization, debouncing, and efficient dependency management
- **Testing**: Unit tests for all hooks with mock dependencies and edge case coverage

## Naming Conventions

### Files

- **Components**: `PascalCase.tsx` (e.g., `PDFAnnotationViewer.tsx`)
- **Hooks**: `use-kebab-case.ts`
- **Utils**: `kebab-case.ts` (e.g., `pdf-coordinates.ts`)
- **API Routes**: Always `route.ts`
- **Pages**: Always `page.tsx`

### Imports

- **Path Alias**: Always use `@/` prefix for internal imports
- **Import Order**: External packages → `@/components` → `@/lib` → `@/hooks` → types
- **Type-only**: Use `import type` when importing only for TypeScript

## Architecture Patterns

### Component Structure

```typescript
// Feature component example
export interface ComponentProps {
  // Props interface
}

export function ComponentName({ prop }: ComponentProps) {
  // Implementation
}
```

### State Management

- **Slices**: One per major feature, use RTK createSlice
- **Selectors**: Memoized in `lib/store/selectors.ts`
- **Hooks**: Use typed hooks from `lib/store/hooks.ts`

### API Routes

- **Pattern**: Export named functions for HTTP methods (GET, POST, PUT, DELETE) - implemented in all routes
- **Error Handling**: Use `withErrorHandling` wrapper for all API routes - implemented with comprehensive error logging
- **Validation**: Use TypeScript interfaces for request/response validation - implemented with server-side validation
- **Authentication**: Use Clerk `auth()` for user verification - implemented with JWT integration
- **Database**: Use `getAuthenticatedSupabaseClient()` for all operations - implemented with RLS policies
- **File Operations**: Implement proper cleanup on failures - implemented in upload route
- **Activity Tracking**: Record user activities for all operations - implemented for view, upload, delete
- **Rate Limiting**: Implement rate limiting for API endpoints - implemented with `checkRateLimit`

## Critical Rules

1. **Never** place components outside their designated directories
2. **Always** use `@/` imports for internal modules
3. **Always** export through `index.ts` files in feature directories
4. **Never** mix UI components with feature components in same directory
5. **Always** use proper TypeScript interfaces for props and API data
