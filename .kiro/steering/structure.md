---
inclusion: always
---

# Project Structure & File Organization

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

#### Feature Components (`components/[feature]/`)

##### Theme Components (`components/theme/`)
- **ThemeProvider.tsx** - Context provider for theme state management with localStorage persistence and system preference detection
- **ThemeDemo.tsx** - Interactive demo component showcasing theme functionality and features
- **ThemeToggleDemo.tsx** - Comprehensive demo of different ThemeToggle variants and configurations
- **README.md** - Complete documentation covering theme system features, API reference, and implementation guides

##### PDF Components (`components/pdf/`)
- **PDFAnnotationViewer.tsx** - Main PDF viewer with Syncfusion integration, Supabase backend, activity tracking, and annotation workflow
- **AnnotationOverlay.tsx** - Interactive annotation highlights over PDF pages with zoom-aware positioning
- **AnnotationTooltip.tsx** - Desktop text selection UI with floating tooltip and "Create note" button
- **MobileAnnotationDialog.tsx** - Mobile-optimized full-screen annotation creation dialog
- **AnnotationPreviewCard.tsx** - Hover preview of annotation content with edit functionality
- **PDFListDisplay.tsx** - PDF list component with recent activity and file operations
- **FallbackUI.tsx** - Error state components for PDF operations (TextSelectionFallback, PDFViewerFallback, etc.)

##### Editor Components (`components/editor/`)
- **Core Editor Components**:
  - `NotionEditor.tsx` - Main TipTap-based block editor with auto-save and keyboard shortcuts
  - `EditorProvider.tsx` - Context provider for editor state management and cross-tab sync
  - `LazyNotionEditor.tsx` - Performance-optimized wrapper with lazy loading and skeleton states
  - `ResponsiveNotionEditor.tsx` - Responsive editor that adapts to screen size
  - `RobustNotionEditor.tsx` - Editor with enhanced error handling and recovery
  - `MultiModeEditor.tsx` - Editor with multiple editing modes (rich text, markdown, etc.)
  - `NotionEditorWithAutoSave.tsx` - Editor with integrated auto-save functionality

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
##### Dashboard Components (`components/dashboard/`)
- **dashboard-sidebar.tsx** - Main navigation sidebar with collapsible design, theme selection dropdown, and user profile management
- **RecentActivityDisplay.tsx** - Recent activity widget for dashboard overview

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
