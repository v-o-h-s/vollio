# Custom React Hooks ✅ COMPLETED

This directory contains custom React hooks that provide reusable functionality across the Noto PDF annotation application. These hooks encapsulate complex logic, state management, and side effects to promote code reuse and maintainability.

## 🎯 Hook Categories

### Core Functionality Hooks

#### `use-auto-save.ts` ✅
Debounced auto-save functionality with status tracking and error handling.

**Features:**
- Debounced save operations to reduce API calls
- Save status tracking (idle, saving, saved, error)
- Retry mechanisms for failed saves
- Configurable debounce delay and retry attempts
- Integration with RTK Query mutations

**Usage:**
```tsx
import { useAutoSave } from '@/hooks/use-auto-save';

function NoteEditor({ noteId, initialContent }) {
  const [content, setContent] = useState(initialContent);
  
  const { saveStatus, error, retry } = useAutoSave({
    data: content,
    saveFunction: async (data) => {
      await updateNote({ id: noteId, content: data });
    },
    delay: 1000, // 1 second debounce
    enabled: !!noteId
  });
  
  return (
    <div>
      <textarea 
        value={content} 
        onChange={(e) => setContent(e.target.value)} 
      />
      <div>Status: {saveStatus}</div>
      {error && <button onClick={retry}>Retry</button>}
    </div>
  );
}
```

#### `use-retry.ts` ✅
Retry logic with exponential backoff for failed operations.

**Features:**
- Configurable retry attempts and delays
- Exponential backoff strategy
- Error filtering for retryable vs non-retryable errors
- Loading state management
- Success/failure callbacks

**Usage:**
```tsx
import { useRetry } from '@/hooks/use-retry';

function FileUpload() {
  const { execute, isLoading, error, retryCount } = useRetry({
    maxRetries: 3,
    initialDelay: 1000,
    backoffMultiplier: 2,
    retryableErrors: ['NETWORK_ERROR', 'TIMEOUT_ERROR']
  });
  
  const handleUpload = async (file) => {
    await execute(() => uploadFile(file));
  };
  
  return (
    <div>
      <input type="file" onChange={(e) => handleUpload(e.target.files[0])} />
      {isLoading && <div>Uploading... (Attempt {retryCount + 1})</div>}
      {error && <div>Upload failed: {error.message}</div>}
    </div>
  );
}
```

### Error Handling Hooks

#### `use-error-handling.ts` ✅
Comprehensive error management with user-friendly messaging and recovery actions.

**Features:**
- Error boundary integration
- User-friendly error message mapping
- Recovery action suggestions
- Error reporting and logging
- Toast notification integration

**Usage:**
```tsx
import { useErrorHandling } from '@/hooks/use-error-handling';

function DataComponent() {
  const { handleError, clearError, error } = useErrorHandling({
    onError: (error) => console.log('Error logged:', error),
    showToast: true
  });
  
  const fetchData = async () => {
    try {
      const data = await api.getData();
      return data;
    } catch (err) {
      handleError(err, {
        context: 'data-fetch',
        userMessage: 'Failed to load data. Please try again.',
        recoveryActions: ['retry', 'refresh']
      });
    }
  };
  
  return (
    <div>
      {error && (
        <div className="error-banner">
          {error.userMessage}
          <button onClick={clearError}>Dismiss</button>
        </div>
      )}
      <button onClick={fetchData}>Load Data</button>
    </div>
  );
}
```

#### `use-editor-error-recovery.ts` ✅
Editor-specific error recovery with content preservation and state restoration.

**Features:**
- Content backup and restoration
- Editor state recovery
- Graceful degradation for editor failures
- Auto-recovery mechanisms
- User notification for recovery actions

### User Interface Hooks

#### `use-keyboard-shortcuts.ts` ✅
Keyboard shortcut handling for accessibility and power user features.

**Features:**
- Global and scoped keyboard shortcuts
- Modifier key combinations (Ctrl, Alt, Shift, Meta)
- Conflict resolution for overlapping shortcuts
- Accessibility compliance
- Dynamic shortcut registration

**Usage:**
```tsx
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

function Editor() {
  const [content, setContent] = useState('');
  
  useKeyboardShortcuts({
    'Ctrl+S': () => saveContent(content),
    'Ctrl+Z': () => undo(),
    'Ctrl+Y': () => redo(),
    'Escape': () => exitFullscreen()
  }, {
    scope: 'editor',
    preventDefault: true
  });
  
  return <textarea value={content} onChange={(e) => setContent(e.target.value)} />;
}
```

#### `use-mobile.ts` ✅
Mobile device detection and responsive design utilities.

**Features:**
- Device type detection (mobile, tablet, desktop)
- Touch capability detection
- Screen orientation monitoring
- Viewport size tracking
- Mobile-specific behavior flags

**Usage:**
```tsx
import { useMobile } from '@/hooks/use-mobile';

function ResponsiveComponent() {
  const { 
    isMobile, 
    isTablet, 
    hasTouch, 
    orientation, 
    viewport 
  } = useMobile();
  
  return (
    <div className={isMobile ? 'mobile-layout' : 'desktop-layout'}>
      {isMobile ? <MobileMenu /> : <DesktopMenu />}
      {hasTouch && <TouchGestures />}
      <div>Orientation: {orientation}</div>
      <div>Viewport: {viewport.width}x{viewport.height}</div>
    </div>
  );
}
```

#### `use-touch-gestures.ts` ✅
Touch gesture recognition for mobile interactions.

**Features:**
- Swipe gesture detection (up, down, left, right)
- Pinch-to-zoom gesture handling
- Tap and long-press detection
- Multi-touch support
- Gesture velocity and distance calculations

**Usage:**
```tsx
import { useTouchGestures } from '@/hooks/use-touch-gestures';

function TouchableComponent() {
  const { bind, gestures } = useTouchGestures({
    onSwipeLeft: () => navigateNext(),
    onSwipeRight: () => navigatePrevious(),
    onPinch: (scale) => setZoom(scale),
    onLongPress: () => showContextMenu()
  });
  
  return (
    <div {...bind} className="touchable-area">
      <div>Last gesture: {gestures.lastGesture}</div>
      <div>Velocity: {gestures.velocity}</div>
    </div>
  );
}
```

### Activity and Sync Hooks

#### `use-activity-tracking.ts` ✅
User activity monitoring with debounced API calls and cache invalidation.

**Features:**
- Debounced activity logging to reduce API calls
- Automatic cache invalidation for real-time updates
- Activity type categorization (view, edit, create, delete)
- Session tracking and analytics
- Privacy-compliant activity logging

**Usage:**
```tsx
import { useActivityTracking } from '@/hooks/use-activity-tracking';

function PDFViewer({ pdfId }) {
  const { trackActivity, recentActivity } = useActivityTracking();
  
  useEffect(() => {
    trackActivity({
      type: 'pdf_view',
      resourceId: pdfId,
      metadata: { timestamp: Date.now() }
    });
  }, [pdfId]);
  
  return (
    <div>
      <PDFContent />
      <RecentActivitySidebar activities={recentActivity} />
    </div>
  );
}
```

#### `use-note-sync.ts` ✅
Cross-tab note synchronization using BroadcastChannel and PostMessage APIs.

**Features:**
- Real-time cross-tab synchronization
- BroadcastChannel API for same-origin tabs
- PostMessage fallback for cross-origin communication
- Conflict resolution strategies
- Automatic cache invalidation

**Usage:**
```tsx
import { useNoteSync } from '@/hooks/use-note-sync';

function NoteEditor({ noteId }) {
  const { broadcastUpdate, broadcastCreate, broadcastDelete } = useNoteSync({
    enableAutoNavigation: true,
    enableAutoUpdate: true
  });
  
  const handleSave = async (content) => {
    await updateNote(noteId, content);
    broadcastUpdate(noteId, content);
  };
  
  const handleCreate = async (newNote) => {
    const created = await createNote(newNote);
    broadcastCreate(created);
  };
  
  return <Editor onSave={handleSave} onCreate={handleCreate} />;
}
```

### Network and Performance Hooks

#### `use-network-status.ts` ✅
Network connectivity monitoring with offline/online state management.

**Features:**
- Online/offline status detection
- Connection quality monitoring
- Automatic retry when connection restored
- Offline queue management
- Network change notifications

**Usage:**
```tsx
import { useNetworkStatus } from '@/hooks/use-network-status';

function DataSyncComponent() {
  const { 
    isOnline, 
    connectionType, 
    effectiveType, 
    saveOffline 
  } = useNetworkStatus();
  
  const handleSave = async (data) => {
    if (isOnline) {
      await saveToServer(data);
    } else {
      saveOffline(data);
    }
  };
  
  return (
    <div>
      <div className={isOnline ? 'online' : 'offline'}>
        Status: {isOnline ? 'Online' : 'Offline'}
      </div>
      {!isOnline && <div>Changes will sync when connection is restored</div>}
    </div>
  );
}
```

## 🎨 Theme and Accessibility Hooks

#### `use-theme.ts` ✅
Theme management with dark/light mode support and system preference detection.

**Features:**
- Light, dark, and system theme modes
- Persistent theme storage
- System preference detection
- Cross-tab theme synchronization
- Theme transition animations

**Usage:**
```tsx
import { useTheme } from '@/hooks/use-theme';

function ThemeToggle() {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  
  return (
    <div>
      <div>Current theme: {theme}</div>
      <div>Resolved theme: {resolvedTheme}</div>
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('system')}>System</button>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
}
```

#### `use-accessibility-mode.ts` ✅
Accessibility mode detection and management for enhanced user experience.

**Features:**
- High contrast mode detection
- Reduced motion preference
- Screen reader detection
- Font size preferences
- Accessibility feature toggles

**Usage:**
```tsx
import { useAccessibilityMode } from '@/hooks/use-accessibility-mode';

function AccessibleComponent() {
  const { 
    prefersReducedMotion, 
    prefersHighContrast, 
    screenReaderActive,
    fontSize 
  } = useAccessibilityMode();
  
  return (
    <div 
      className={`
        ${prefersHighContrast ? 'high-contrast' : ''}
        ${prefersReducedMotion ? 'reduced-motion' : ''}
      `}
      style={{ fontSize: `${fontSize}px` }}
    >
      {screenReaderActive && <div aria-live="polite">Content loaded</div>}
    </div>
  );
}
```

## 🧩 Specialized Hooks

### Editor-Specific Hooks

#### `use-editor-keyboard-shortcuts.ts` ✅
Editor-specific keyboard shortcuts for formatting and navigation.

**Features:**
- Rich text formatting shortcuts (Bold, Italic, Underline)
- Block-level shortcuts (Headings, Lists, Code blocks)
- Navigation shortcuts (Undo, Redo, Select All)
- Custom editor command integration
- Context-aware shortcut activation



#### `use-rag-monitoring.ts` ✅
RAG system monitoring and performance tracking.

**Features:**
- Real-time performance metrics
- Quality assessment tracking
- User feedback integration
- System health monitoring
- Performance optimization suggestions

## 🏗️ Hook Architecture

### Design Principles

1. **Single Responsibility**: Each hook has a focused, well-defined purpose
2. **Composability**: Hooks can be combined to create complex functionality
3. **Reusability**: Hooks are designed for use across multiple components
4. **Type Safety**: Full TypeScript support with proper type definitions
5. **Performance**: Optimized with proper dependency management and memoization

### Common Patterns

#### State Management Pattern
```tsx
export function useCustomHook(options: HookOptions) {
  const [state, setState] = useState(initialState);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const execute = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await operation();
      setState(result);
      return result;
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [dependencies]);
  
  return { state, loading, error, execute };
}
```

#### Effect Cleanup Pattern
```tsx
export function useEventListener(event: string, handler: Function) {
  useEffect(() => {
    const element = document;
    element.addEventListener(event, handler);
    
    return () => {
      element.removeEventListener(event, handler);
    };
  }, [event, handler]);
}
```

#### Memoization Pattern
```tsx
export function useExpensiveCalculation(data: any[]) {
  return useMemo(() => {
    return data.reduce((acc, item) => {
      // Expensive calculation
      return acc + complexOperation(item);
    }, 0);
  }, [data]);
}
```

## 🧪 Testing Hooks

### Testing Strategy

All hooks include comprehensive unit tests covering:
- Basic functionality and expected behavior
- Error conditions and edge cases
- Cleanup and memory leak prevention
- Performance characteristics
- TypeScript type safety

### Testing Example
```tsx
import { renderHook, act } from '@testing-library/react';
import { useAutoSave } from '@/hooks/use-auto-save';

describe('useAutoSave', () => {
  it('should debounce save operations', async () => {
    const mockSave = jest.fn();
    const { result } = renderHook(() => 
      useAutoSave({ 
        data: 'test', 
        saveFunction: mockSave, 
        delay: 100 
      })
    );
    
    // Multiple rapid changes should only trigger one save
    act(() => {
      result.current.trigger();
      result.current.trigger();
      result.current.trigger();
    });
    
    await waitFor(() => {
      expect(mockSave).toHaveBeenCalledTimes(1);
    });
  });
});
```

## 📚 Usage Guidelines

### Best Practices

1. **Use TypeScript**: Always provide proper type definitions
2. **Handle Cleanup**: Properly clean up subscriptions and event listeners
3. **Optimize Dependencies**: Use proper dependency arrays to prevent unnecessary re-renders
4. **Error Handling**: Include comprehensive error handling and recovery
5. **Documentation**: Provide clear JSDoc comments and usage examples

### Performance Considerations

1. **Memoization**: Use `useMemo` and `useCallback` for expensive operations
2. **Debouncing**: Implement debouncing for frequent operations
3. **Lazy Loading**: Load heavy dependencies only when needed
4. **Memory Management**: Properly clean up resources and subscriptions

### Common Pitfalls

1. **Stale Closures**: Be careful with closures in useEffect and useCallback
2. **Infinite Loops**: Avoid missing dependencies that cause infinite re-renders
3. **Memory Leaks**: Always clean up subscriptions and event listeners
4. **Over-optimization**: Don't memoize everything; measure performance impact

## 🔮 Future Enhancements

### Planned Hooks
- `use-virtual-scrolling.ts` - Virtual scrolling for large lists
- `use-drag-drop.ts` - Drag and drop functionality
- `use-websocket.ts` - WebSocket connection management
- `use-service-worker.ts` - Service worker integration
- `use-analytics.ts` - User analytics and tracking

### Performance Improvements
- Web Workers integration for heavy computations
- Streaming data processing hooks
- Advanced caching strategies
- Predictive prefetching hooks

---

For detailed information about specific hooks or to contribute new functionality, refer to the individual hook files or contact the development team.

---

**Status**: ✅ Production Ready  
**Last Updated**: January 2025  
**Version**: 1.0.0