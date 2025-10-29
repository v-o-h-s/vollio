# Custom React Hooks ✅ PRODUCTION READY

This directorve collection of custom React hooks that provide reusable functionality across the Noto PDF annotation application. These hooks handle everything from auto-save functionality to mobile device detection and error handling.

## 🎯 Hook Categories

### Core Functionality Hooks

#### `use-auto-save.ts` ✅
Debounced auto-save functionality with comprehensive status tracking and error handling.

**Features:**
- **Debounced Saves**: Configurable debounce delay (default: 1000ms)
- **Status Tracking**: Idle, typing, saving, saved, error states
- **Retry Mechanisms**: Automatic retry on failure with exponential backoff
- **Error Recovery**: Comprehensive error handling with user feedback
- **Performance Optimized**: Efficient debouncing to reduce API calls

**Usage:**
```tsx
import { useAutoSave } from '@/hooks/use-auto-save';

function MyEditor() {
  const [content, setContent] = useState('');
  
  const { status, error, retry } = useAutoSave({
    data: content,
    saveFunction: async (data) => {
      await updateNote({ id: noteId, content: data });
    },
    delay: 1000,
    enabled: true,
  });

  return (
    <div>
      <textarea 
        value={content} 
        onChange={(e) => setContent(e.target.value)} 
      />
      <div>Status: {status}</div>
      {error && <button onClick={retry}>Retry</button>}
    </div>
  );
}
```

**API:**
```tsx
interface UseAutoSaveOptions<T> {
  data: T;
  saveFunction: (data: T) => Promise<void>;
  delay?: number;
  enabled?: boolean;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface UseAutoSaveReturn {
  status: 'idle' | 'typing' | 'saving' | 'saved' | 'error';
  error: Error | null;
  retry: () => void;
  forceSave: () => Promise<void>;
}
```

#### `use-retry.ts` ✅
Retry logic with exponential backoff for failed operations and network resilience.

**Features:**
- **Exponential Backoff**: Configurable backoff multiplier and initial delay
- **Max Retries**: Configurable maximum retry attempts
- **Error Filtering**: Only retry specific error types
- **Status Tracking**: Track retry attempts and current status
- **Manual Retry**: Force retry operations manually

**Usage:**
```tsx
import { useRetry } from '@/hooks/use-retry';

function DataFetcher() {
  const { execute, status, error, retryCount } = useRetry({
    maxRetries: 3,
    initialDelay: 1000,
    backoffMultiplier: 2,
    retryableErrors: ['NETWORK_ERROR', 'TIMEOUT'],
  });

  const fetchData = async () => {
    await execute(async () => {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('NETWORK_ERROR');
      return response.json();
    });
  };

  return (
    <div>
      <button onClick={fetchData}>Fetch Data</button>
      <div>Status: {status}</div>
      <div>Retry Count: {retryCount}</div>
      {error && <div>Error: {error.message}</div>}
    </div>
  );
}
```

### Error Handling Hooks

#### `use-error-handling.ts` ✅
Comprehensive error management with user-friendly messaging and recovery actions.

**Features:**
- **Error Classification**: Categorize errors by type and severity
- **User-Friendly Messages**: Convert technical errors to user-friendly messages
- **Recovery Actions**: Provide actionable recovery options
- **Error Reporting**: Optional error reporting to analytics services
- **Toast Integration**: Automatic toast notifications for errors

**Usage:**
```tsx
import { useErrorHandling } from '@/hooks/use-error-handling';

function MyComponent() {
  const { handleError, clearError, error } = useErrorHandling({
    showToast: true,
    reportErrors: true,
  });

  const performAction = async () => {
    try {
      await riskyOperation();
    } catch (err) {
      handleError(err, {
        context: 'performAction',
        recoveryAction: () => performAction(),
      });
    }
  };

  return (
    <div>
      <button onClick={performAction}>Perform Action</button>
      {error && (
        <div className="error-banner">
          <p>{error.userMessage}</p>
          <button onClick={error.recoveryAction}>Retry</button>
          <button onClick={clearError}>Dismiss</button>
        </div>
      )}
    </div>
  );
}
```

#### `use-editor-error-recovery.ts` ✅
Editor-specific error recovery with content preservation and state restoration.

**Features:**
- **Content Preservation**: Automatically save content before errors
- **State Restoration**: Restore editor state after recovery
- **Graceful Degradation**: Fallback to basic text editing on errors
- **Auto-Recovery**: Attempt automatic recovery from common errors
- **User Notification**: Clear communication about recovery actions

### User Interface Hooks

#### `use-mobile.ts` ✅
Mobile device detection and responsive design utilities.

**Features:**
- **Device Detection**: Detect mobile, tablet, and desktop devices
- **Touch Support**: Detect touch capability and gesture support
- **Orientation**: Track device orientation changes
- **Screen Size**: Responsive breakpoint detection
- **Performance**: Efficient detection with minimal overhead

**Usage:**
```tsx
import { useMobile } from '@/hooks/use-mobile';

function ResponsiveComponent() {
  const { 
    isMobile, 
    isTablet, 
    isDesktop, 
    hasTouch, 
    orientation,
    screenSize 
  } = useMobile();

  return (
    <div>
      {isMobile && <MobileInterface />}
      {isTablet && <TabletInterface />}
      {isDesktop && <DesktopInterface />}
      
      {hasTouch && <TouchControls />}
      
      <div className={`orientation-${orientation}`}>
        Content adapts to {orientation}
      </div>
    </div>
  );
}
```

**API:**
```tsx
interface UseMobileReturn {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasTouch: boolean;
  orientation: 'portrait' | 'landscape';
  screenSize: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}
```

#### `use-touch-gestures.ts` ✅
Touch gesture recognition for mobile interactions.

**Features:**
- **Gesture Recognition**: Swipe, pinch, tap, long press detection
- **Configurable Thresholds**: Customizable sensitivity and timing
- **Multi-Touch Support**: Handle multiple simultaneous touches
- **Gesture Combinations**: Support for complex gesture sequences
- **Performance Optimized**: Efficient event handling and cleanup

**Usage:**
```tsx
import { useTouchGestures } from '@/hooks/use-touch-gestures';

function TouchInterface() {
  const { bind, gestures } = useTouchGestures({
    onSwipeLeft: () => console.log('Swiped left'),
    onSwipeRight: () => console.log('Swiped right'),
    onPinch: (scale) => console.log('Pinched:', scale),
    onLongPress: () => console.log('Long pressed'),
    swipeThreshold: 50,
    longPressDelay: 500,
  });

  return (
    <div {...bind} className="touch-area">
      <p>Current gesture: {gestures.current}</p>
      <p>Swipe direction: {gestures.swipeDirection}</p>
      <p>Pinch scale: {gestures.pinchScale}</p>
    </div>
  );
}
```

### Activity and Sync Hooks

#### `use-note-sync.ts` ✅
Cross-tab note synchronization using BroadcastChannel and PostMessage APIs.

**Features:**
- **Real-Time Sync**: Instant synchronization across browser tabs
- **BroadcastChannel**: Primary sync mechanism for same-origin tabs
- **PostMessage Fallback**: Cross-origin communication support
- **Conflict Resolution**: Last-write-wins strategy with user notifications
- **Cache Management**: Automatic RTK Query cache updates and invalidation

**Usage:**
```tsx
import { useNoteSync } from '@/hooks/use-note-sync';

function NoteEditor() {
  const { broadcastUpdate, broadcastCreate, broadcastDelete } = useNoteSync({
    enableAutoNavigation: true,
    enableAutoUpdate: true,
  });

  const handleSave = async (noteId: string, content: any) => {
    await updateNote({ id: noteId, content });
    broadcastUpdate(noteId, { content });
  };

  const handleCreate = async (noteData: any) => {
    const newNote = await createNote(noteData);
    broadcastCreate(newNote);
  };

  const handleDelete = async (noteId: string) => {
    await deleteNote(noteId);
    broadcastDelete(noteId);
  };

  return (
    <div>
      {/* Editor interface */}
    </div>
  );
}
```

### Theme and Accessibility Hooks

#### `use-theme.ts` ✅
Theme management with system preference detection and persistence.

**Features:**
- **Theme Switching**: Light, dark, and system preference modes
- **System Integration**: Automatic system preference detection
- **Persistence**: localStorage with cross-tab synchronization
- **SSR Safe**: Prevents theme flashing during server-side rendering
- **Type Safety**: Full TypeScript support with proper interfaces

**Usage:**
```tsx
import { useTheme } from '@/hooks/use-theme';

function ThemeToggle() {
  const { theme, setTheme, resolvedTheme, systemTheme } = useTheme();

  return (
    <div>
      <p>Current theme: {theme}</p>
      <p>Resolved theme: {resolvedTheme}</p>
      <p>System theme: {systemTheme}</p>
      
      <button onClick={() => setTheme('light')}>Light</button>
      <button onClick={() => setTheme('dark')}>Dark</button>
      <button onClick={() => setTheme('system')}>System</button>
    </div>
  );
}
```

#### `use-accessibility-mode.ts` ✅
Accessibility features and compliance utilities.

**Features:**
- **High Contrast**: Enhanced contrast mode detection and application
- **Reduced Motion**: Respect user's motion preferences
- **Screen Reader**: Screen reader detection and optimization
- **Keyboard Navigation**: Enhanced keyboard navigation support
- **Focus Management**: Intelligent focus management and indicators

**Usage:**
```tsx
import { useAccessibilityMode } from '@/hooks/use-accessibility-mode';

function AccessibleComponent() {
  const {
    highContrast,
    reducedMotion,
    screenReader,
    keyboardNavigation,
    focusVisible,
  } = useAccessibilityMode();

  return (
    <div 
      className={cn(
        'component',
        highContrast && 'high-contrast',
        reducedMotion && 'reduced-motion',
        focusVisible && 'focus-visible'
      )}
    >
      {screenReader && <span className="sr-only">Screen reader content</span>}
      {/* Component content */}
    </div>
  );
}
```

### Integration Hooks

#### `use-floating-sidebar.ts` ✅
Integration hook for FloatingSidebar component interactions.

**Features:**
- **Page-Specific Actions**: Different actions based on current route
- **Event Integration**: Custom event system for loose coupling
- **Keyboard Shortcuts**: Support for common keyboard shortcuts
- **Action Mapping**: Map sidebar actions to page functionality
- **Type Safety**: Fully typed action interfaces

**Usage:**
```tsx
import { useFloatingSidebarIntegration } from '@/hooks/use-floating-sidebar';

function PDFsPage() {
  const searchInputRef = useRef<HTMLInputElement>(null);

  useFloatingSidebarIntegration({
    uploadPDF: () => {
      const uploadEvent = new CustomEvent('pdf-upload-trigger');
      document.dispatchEvent(uploadEvent);
    },
    searchFiles: () => {
      if (searchInputRef.current) {
        searchInputRef.current.focus();
        searchInputRef.current.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center' 
        });
      }
    },
    createFolder: () => {
      const folderEvent = new CustomEvent('pdf-folder-create');
      document.dispatchEvent(folderEvent);
    },
  });

  return (
    <div>
      <input ref={searchInputRef} placeholder="Search files..." />
      {/* Page content */}
    </div>
  );
}
```

## 🔧 Hook Development Guidelines

### Naming Convention
- Use `use-kebab-case.ts` format for consistency
- Prefix all hooks with `use` following React conventions
- Use descriptive names that indicate functionality

### TypeScript Integration
- Full type safety with proper interfaces and return types
- Export both hook function and related types
- Use generic types where appropriate for reusability

### Error Handling
- Comprehensive error handling with user-friendly messages
- Graceful degradation when features are unavailable
- Proper cleanup of resources and event listeners

### Performance Optimization
- Memoization with `useMemo` and `useCallback` where appropriate
- Efficient dependency management in `useEffect`
- Debouncing for expensive operations
- Cleanup functions for all side effects

### Testing
- Unit tests for all hooks with mock dependencies
- Edge case coverage including error scenarios
- Performance testing for hooks with heavy operations
- Integration testing with React components

## 📱 Mobile-Specific Hooks

### Mobile Editor Hooks
- **use-mobile-editor.ts**: Mobile-optimized editor functionality
- **use-mobile-keyboard.ts**: Virtual keyboard handling and input optimization
- **use-editor-keyboard-shortcuts.ts**: Editor-specific keyboard shortcuts

### Mobile Interaction Hooks
- **use-touch-gestures.ts**: Touch gesture recognition and handling
- **use-mobile.ts**: Device detection and responsive utilities
- **use-focus-management.ts**: Mobile-friendly focus management

## 🚀 Performance Considerations

### Efficient Hook Design
- Minimize re-renders with proper memoization
- Use `useCallback` for stable function references
- Implement proper dependency arrays
- Avoid unnecessary effect triggers

### Memory Management
- Clean up event listeners in effect cleanup functions
- Cancel pending operations on component unmount
- Dispose of resources properly (timers, subscriptions)
- Use weak references where appropriate

### Bundle Size Optimization
- Tree-shakeable exports for individual hooks
- Minimal external dependencies
- Lazy loading for heavy functionality
- Code splitting for optional features

## 🧪 Testing Strategy

### Unit Testing
```tsx
import { renderHook, act } from '@testing-library/react';
import { useAutoSave } from '@/hooks/use-auto-save';

test('auto-save functionality', async () => {
  const mockSave = jest.fn();
  const { result } = renderHook(() => 
    useAutoSave({
      data: 'test content',
      saveFunction: mockSave,
      delay: 100,
    })
  );

  expect(result.current.status).toBe('idle');
  
  // Test debounced save
  await act(async () => {
    await new Promise(resolve => setTimeout(resolve, 150));
  });
  
  expect(mockSave).toHaveBeenCalledWith('test content');
  expect(result.current.status).toBe('saved');
});
```

### Integration Testing
- Test hooks with actual React components
- Verify cross-hook interactions and dependencies
- Test error scenarios and recovery mechanisms
- Validate performance under realistic conditions

## 🤝 Contributing

### Adding New Hooks
1. Follow the established naming convention (`use-kebab-case.ts`)
2. Include comprehensive TypeScript types and interfaces
3. Implement proper error handling and cleanup
4. Add unit tests with good coverage
5. Update this documentation with usage examples

### Code Standards
- Use TypeScript strict mode for type safety
- Follow React hooks rules and best practices
- Implement proper cleanup for all side effects
- Use semantic naming for functions and variables
- Optimize for performance with memoization

---

**Status**: ✅ Production Ready  
**Last Updated**: January 2025  
**Version**: 1.0.0

The custom hooks system provides comprehensive functionality for the Noto application, covering everything from auto-save and error handling to mobile interactions and cross-tab synchronization.