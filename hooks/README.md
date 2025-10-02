# Custom Hooks Documentation

This directory contains custom React hooks that provide reusable functionality across the Noto PDF annotation application. These hooks handle common patterns like auto-save, error handling, activity tracking, and mobile interactions.

## 🔄 Auto-Save Architecture

### useAutoSave Hook ✅ INTEGRATED

**File**: `hooks/use-auto-save.ts`

The `useAutoSave` hook provides intelligent debounced auto-save functionality and is now integrated directly within NotionEditor components for simplified architecture.

#### Features

- **Editor-Internal Integration**: Used internally by NotionEditor components with simplified architecture, not directly by parent components
- **RTK Query Integration**: Uses RTK Query mutations for all save operations with automatic caching and synchronization
- **Debounced Saving**: Prevents excessive API calls by debouncing save operations with intelligent timing
- **Status Tracking**: Real-time status updates (idle, typing, saving, saved, error) with visual feedback
- **Error Recovery**: Handles save failures with retry mechanisms and user-friendly error messages
- **Automatic Note Creation**: Seamlessly creates new notes when content is added without manual intervention
- **Title Extraction**: Automatically extracts titles from editor content with intelligent parsing
- **Cross-tab Synchronization**: Real-time updates across browser tabs using RTK Query cache invalidation
- **Content Preservation**: Automatic content preservation during network issues and editor errors

#### Internal Usage (within NotionEditor)

```typescript
import { useAutoSave } from '@/hooks/use-auto-save';
import { useCreateNoteMutation, useUpdateNoteMutation } from '@/lib/store/apiSlice';

function NotionEditor({ initialNoteId, onSaveSuccess }: NotionEditorProps) {
  const [createNote] = useCreateNoteMutation();
  const [updateNote] = useUpdateNoteMutation();
  
  const { status, lastSaved, error, updateContent } = useAutoSave({
    onSave: async (content) => {
      if (currentNoteId) {
        await updateNote({ id: currentNoteId, content }).unwrap();
      } else {
        const newNote = await createNote({ content }).unwrap();
        setCurrentNoteId(newNote.id);
      }
      onSaveSuccess?.();
    },
    delay: 500,
    enabled: true,
  });

  // Editor handles all auto-save internally with RTK Query mutations
  // Parent components no longer need to manage save operations
  
  return (
    <div className="notion-editor">
      <TipTapEditor 
        content={content}
        onChange={updateContent}
      />
      <AutoSaveStatus status={status} lastSaved={lastSaved} error={error} />
    </div>
  );
}
```

#### API Reference

```typescript
interface UseAutoSaveOptions {
  onSave: (content: any) => Promise<void>;
  delay?: number; // Default: 500ms
  enabled?: boolean; // Default: true
}

interface UseAutoSaveReturn {
  status: "idle" | "typing" | "saving" | "saved" | "error";
  lastSaved: Date | null;
  error: string | null;
  updateContent: (content: any) => void;
}
```

#### Status Flow

1. **idle**: Initial state, no recent activity
2. **typing**: User is actively editing content
3. **saving**: Auto-save operation in progress
4. **saved**: Content successfully saved (shows for 2 seconds)
5. **error**: Save operation failed, error message available

#### Implementation Details

- **Debouncing**: Uses lodash.debounce to prevent excessive API calls
- **Ref Usage**: Content stored in ref to avoid unnecessary re-renders
- **Cleanup**: Automatically cancels pending saves on unmount
- **Error Handling**: Comprehensive error catching and user feedback

## 📱 Mobile & Device Detection

### useMobile Hook

**File**: `hooks/use-mobile.ts`

Provides device detection and responsive behavior utilities.

#### Features

- **Device Detection**: Identifies mobile, tablet, and desktop devices
- **Touch Support**: Detects touch capability
- **Orientation**: Monitors device orientation changes
- **Responsive Behavior**: Adapts UI based on device characteristics

#### Usage

```typescript
import { useMobile } from '@/hooks/use-mobile';

function ResponsiveComponent() {
  const { isMobile, isTablet, hasTouch, orientation } = useMobile();

  return (
    <div className={`${isMobile ? 'mobile-layout' : 'desktop-layout'}`}>
      {hasTouch ? <TouchInterface /> : <MouseInterface />}
    </div>
  );
}
```

## 🎯 Activity Tracking

### useActivityTracking Hook

**File**: `hooks/use-activity-tracking.ts`

Monitors user activity and provides real-time activity updates.

#### Features

- **Debounced Tracking**: Prevents excessive activity logging
- **Cache Invalidation**: Automatically updates activity cache
- **Real-time Updates**: Provides live activity information
- **Non-blocking**: Activity tracking doesn't block main operations

#### Usage

```typescript
import { useActivityTracking } from '@/hooks/use-activity-tracking';

function PDFViewer({ pdfId }: { pdfId: string }) {
  const { trackActivity, recentActivity } = useActivityTracking();

  useEffect(() => {
    trackActivity('view', pdfId);
  }, [pdfId, trackActivity]);

  return (
    <div>
      <PDFContent />
      <RecentActivityDisplay activities={recentActivity} />
    </div>
  );
}
```

## ⌨️ Keyboard Shortcuts

### useKeyboardShortcuts Hook

**File**: `hooks/use-keyboard-shortcuts.ts`

Provides keyboard shortcut handling for accessibility and power user features.

#### Features

- **Cross-platform**: Handles Ctrl/Cmd key differences
- **Accessibility**: WCAG compliant keyboard navigation
- **Customizable**: Configurable shortcut mappings
- **Context-aware**: Different shortcuts for different contexts

#### Usage

```typescript
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

function Editor() {
  useKeyboardShortcuts({
    'Ctrl+S': () => saveDocument(),
    'Ctrl+B': () => toggleBold(),
    'Escape': () => exitFullscreen(),
  });

  return <EditorContent />;
}
```

## 🔧 Error Handling

### useErrorHandling Hook

**File**: `hooks/use-error-handling.ts`

Provides comprehensive error management with user-friendly messaging and recovery actions.

#### Features

- **Error Boundaries**: Integrates with React error boundaries
- **Recovery Actions**: Provides retry and recovery mechanisms
- **User-friendly Messages**: Converts technical errors to user-friendly messages
- **Logging**: Comprehensive error logging for debugging

#### Usage

```typescript
import { useErrorHandling } from '@/hooks/use-error-handling';

function DataComponent() {
  const { handleError, clearError, error, retry } = useErrorHandling();

  const fetchData = async () => {
    try {
      const data = await api.getData();
      return data;
    } catch (err) {
      handleError(err, 'Failed to load data');
    }
  };

  if (error) {
    return <ErrorDisplay error={error} onRetry={retry} />;
  }

  return <DataDisplay />;
}
```

## 🔄 Cross-tab Synchronization

### useNoteSync Hook

**File**: `hooks/use-note-sync.ts`

Provides real-time note synchronization across browser tabs using BroadcastChannel and PostMessage APIs.

#### Features

- **Real-time Updates**: Instant synchronization across tabs
- **Conflict Resolution**: Handles concurrent edits gracefully
- **Fallback Support**: PostMessage fallback for older browsers
- **Auto-Save Integration**: Works seamlessly with auto-save system

#### Usage

```typescript
import { useNoteSync } from '@/hooks/use-note-sync';

function NoteEditor({ noteId }: { noteId: string }) {
  const { syncNote, onNoteUpdate } = useNoteSync();

  const handleContentChange = (content: any) => {
    syncNote(noteId, content);
  };

  useEffect(() => {
    return onNoteUpdate(noteId, (updatedContent) => {
      // Update editor with content from other tabs
      editor.commands.setContent(updatedContent);
    });
  }, [noteId, onNoteUpdate]);

  return <Editor onChange={handleContentChange} />;
}
```

## 🎨 Focus Management

### useFocusManagement Hook

**File**: `hooks/use-focus-management.ts`

Provides focus management for accessibility compliance and keyboard navigation.

#### Features

- **Accessibility**: WCAG compliant focus management
- **Keyboard Navigation**: Proper tab order and focus trapping
- **Focus Restoration**: Restores focus after modal interactions
- **Screen Reader Support**: Announces focus changes to screen readers

## 🔄 Network Status

### useNetworkStatus Hook

**File**: `hooks/use-network-status.ts`

Monitors network connectivity and provides offline/online state management.

#### Features

- **Connection Monitoring**: Real-time network status updates
- **Offline Handling**: Graceful degradation during network issues
- **Retry Logic**: Automatic retry when connection is restored
- **User Feedback**: Visual indicators for network status

## 📱 Touch Gestures

### useTouchGestures Hook

**File**: `hooks/use-touch-gestures.ts`

Provides touch gesture recognition for mobile interactions.

#### Features

- **Gesture Recognition**: Swipe, pinch, tap, long press detection
- **Mobile Optimization**: Optimized for touch devices
- **Customizable**: Configurable gesture thresholds
- **Performance**: Efficient event handling and cleanup

## 🧪 Testing

All hooks include comprehensive unit tests with:

- **Mock Dependencies**: Proper mocking of external dependencies
- **Edge Cases**: Testing of error conditions and edge cases
- **Performance**: Testing of debouncing and optimization features
- **Accessibility**: Testing of keyboard and screen reader interactions

### Test Files

- `test/hooks/use-auto-save.test.ts` - Auto-save functionality tests
- `test/hooks/use-mobile.test.ts` - Mobile detection tests
- `test/hooks/use-activity-tracking.test.ts` - Activity tracking tests
- `test/hooks/use-keyboard-shortcuts.test.ts` - Keyboard shortcut tests
- `test/hooks/use-error-handling.test.ts` - Error handling tests

## 🔧 Development Guidelines

### Hook Creation Standards

1. **TypeScript**: Use strict TypeScript with proper interfaces
2. **Error Handling**: Include comprehensive error handling
3. **Cleanup**: Implement proper cleanup in useEffect
4. **Performance**: Use useMemo and useCallback appropriately
5. **Testing**: Write comprehensive unit tests

### Naming Conventions

- Use `use-kebab-case.ts` for hook files
- Export hook function with `use` prefix
- Include TypeScript interfaces for options and return values
- Document all public APIs with JSDoc comments

### Integration Patterns

- Hooks should be composable and reusable
- Avoid tight coupling to specific components
- Provide sensible defaults for all options
- Include error boundaries and fallback behavior

---

**Last Updated**: January 2025  
**Hook System Version**: 1.0.0

For questions about hooks or to suggest improvements, please refer to the main project documentation or contact the development team.