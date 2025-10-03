# Custom Hooks - React Hooks Library

This directory contains a comprehensive collection of custom React hooks that provide reusable functionality across the Noto application, including auto-save, error handling, mobile optimization, and cross-tab synchronization.

## 🎯 Hook Categories

### Core Functionality Hooks

#### `use-auto-save.ts` ✅
Debounced auto-save functionality with comprehensive status tracking and error recovery.

**Features:**
- **Debounced Saving**: Configurable debounce delay to prevent excessive API calls
- **Status Tracking**: Real-time status (idle, typing, saving, saved, error) with visual feedback
- **Error Recovery**: Automatic retry mechanisms with exponential backoff
- **Content Preservation**: Prevents data loss during network issues and failures
- **Performance Optimization**: Efficient saving with minimal resource usage

**Usage:**
```typescript
import { useAutoSave } from '@/hooks/use-auto-save';

function NoteEditor({ noteId, initialContent }) {
  const [content, setContent] = useState(initialContent);
  
  const { saveStatus, error, retry } = useAutoSave({
    data: content,
    saveFunction: async (data) => {
      const response = await updateNote(noteId, { content: data });
      return response;
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

**Return Values:**
- `saveStatus: 'idle' | 'typing' | 'saving' | 'saved' | 'error'` - Current save status
- `error: Error | null` - Last error that occurred during saving
- `retry: () => void` - Function to retry failed save operation
- `forceSave: () => Promise<void>` - Function to force immediate save

#### `use-retry.ts` ✅
Retry logic with exponential backoff for failed operations and network resilience.

**Features:**
- **Exponential Backoff**: Intelligent retry timing with increasing delays
- **Configurable Attempts**: Customizable maximum retry attempts
- **Error Classification**: Different retry strategies based on error types
- **Circuit Breaker**: Automatic failure detection and recovery
- **Performance Monitoring**: Retry success rates and performance metrics

**Usage:**
```typescript
import { useRetry } from '@/hooks/use-retry';

function DataFetcher() {
  const { execute, isLoading, error, retryCount } = useRetry({
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 10000,
    backoffFactor: 2
  });

  const fetchData = () => {
    execute(async () => {
      const response = await fetch('/api/data');
      if (!response.ok) throw new Error('Fetch failed');
      return response.json();
    });
  };

  return (
    <div>
      <button onClick={fetchData} disabled={isLoading}>
        Fetch Data {retryCount > 0 && `(Retry ${retryCount})`}
      </button>
      {error && <div>Error: {error.message}</div>}
    </div>
  );
}
```

### Error Handling Hooks

#### `use-error-handling.ts` ✅
Comprehensive error management with user-friendly messaging and recovery actions.

**Features:**
- **Error Classification**: Automatic error type detection and categorization
- **User-Friendly Messages**: Conversion of technical errors to user-friendly messages
- **Recovery Actions**: Suggested recovery actions and retry mechanisms
- **Error Reporting**: Automatic error logging and reporting
- **Context Preservation**: Maintains application context during error recovery

**Usage:**
```typescript
import { useErrorHandling } from '@/hooks/use-error-handling';

function ApiComponent() {
  const { handleError, clearError, error, isRecovering } = useErrorHandling({
    onError: (error) => console.log('Error logged:', error),
    enableRetry: true,
    enableReporting: true
  });

  const performAction = async () => {
    try {
      await riskyApiCall();
    } catch (err) {
      handleError(err, {
        context: 'API call',
        recoveryActions: ['retry', 'refresh']
      });
    }
  };

  return (
    <div>
      <button onClick={performAction}>Perform Action</button>
      {error && (
        <div>
          <p>{error.userMessage}</p>
          <button onClick={clearError}>Dismiss</button>
          {isRecovering && <span>Recovering...</span>}
        </div>
      )}
    </div>
  );
}
```

#### `use-network-status.ts` ✅
Network connectivity monitoring with offline/online state management.

**Features:**
- **Connection Monitoring**: Real-time network connectivity detection
- **Offline Handling**: Graceful degradation during offline periods
- **Reconnection Logic**: Automatic reconnection and state recovery
- **Bandwidth Detection**: Network quality and speed assessment
- **Sync Management**: Automatic data synchronization when connection is restored

### User Interface Hooks

#### `use-mobile.ts` ✅
Mobile device detection and responsive design utilities with comprehensive device information.

**Features:**
- **Device Detection**: Accurate mobile, tablet, and desktop detection
- **Touch Capability**: Touch screen detection and interaction support
- **Orientation Tracking**: Device orientation changes and responsive adaptation
- **Screen Size Monitoring**: Real-time screen size and viewport tracking
- **Performance Optimization**: Device-specific performance optimizations

**Usage:**
```typescript
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
    <div className={`
      ${isMobile ? 'mobile-layout' : 'desktop-layout'}
      ${orientation === 'landscape' ? 'landscape' : 'portrait'}
    `}>
      <h1>Device: {isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'}</h1>
      <p>Touch Support: {hasTouch ? 'Yes' : 'No'}</p>
      <p>Screen: {screenSize.width}x{screenSize.height}</p>
    </div>
  );
}
```

**Return Values:**
- `isMobile: boolean` - True if device is mobile phone
- `isTablet: boolean` - True if device is tablet
- `isDesktop: boolean` - True if device is desktop/laptop
- `hasTouch: boolean` - True if device supports touch input
- `orientation: 'portrait' | 'landscape'` - Current device orientation
- `screenSize: { width: number; height: number }` - Current screen dimensions

#### `use-touch-gestures.ts` ✅
Touch gesture recognition for mobile interactions with comprehensive gesture support.

**Features:**
- **Gesture Recognition**: Swipe, pinch, tap, long press, and custom gestures
- **Multi-Touch Support**: Multiple simultaneous touch point handling
- **Gesture Customization**: Configurable gesture thresholds and parameters
- **Performance Optimization**: Efficient touch event handling and processing
- **Cross-Platform Compatibility**: Consistent behavior across different devices

**Usage:**
```typescript
import { useTouchGestures } from '@/hooks/use-touch-gestures';

function TouchInterface() {
  const { bind, gestures } = useTouchGestures({
    onSwipe: (direction) => console.log('Swiped:', direction),
    onPinch: (scale) => console.log('Pinched:', scale),
    onTap: (position) => console.log('Tapped:', position),
    onLongPress: (position) => console.log('Long pressed:', position),
    swipeThreshold: 50,
    pinchThreshold: 0.1
  });

  return (
    <div {...bind} className="touch-area">
      <p>Current gesture: {gestures.current}</p>
      <p>Touch points: {gestures.touchCount}</p>
    </div>
  );
}
```

#### `use-keyboard-shortcuts.ts` ✅
Keyboard shortcut handling for accessibility and power user features.

**Features:**
- **Shortcut Registration**: Easy registration of keyboard shortcuts with conflict detection
- **Context Awareness**: Context-specific shortcuts with priority management
- **Accessibility Compliance**: WCAG-compliant keyboard navigation support
- **Cross-Platform Support**: Consistent shortcuts across different operating systems
- **Help Integration**: Automatic help documentation generation

**Usage:**
```typescript
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

function EditorComponent() {
  useKeyboardShortcuts({
    'Ctrl+S': () => saveDocument(),
    'Ctrl+Z': () => undo(),
    'Ctrl+Y': () => redo(),
    'Escape': () => exitFullscreen(),
    'Ctrl+/': () => showHelp()
  }, {
    enabled: true,
    preventDefault: true,
    context: 'editor'
  });

  return <div>Editor with keyboard shortcuts</div>;
}
```

### Activity and Sync Hooks

#### `use-activity-tracking.ts` ✅
User activity monitoring with debounced API calls and real-time cache updates.

**Features:**
- **Activity Recording**: Automatic tracking of user interactions and behaviors
- **Debounced API Calls**: Efficient API usage with configurable debounce delays
- **Cache Integration**: Real-time cache invalidation and updates
- **Privacy Compliance**: GDPR-compliant activity tracking with user consent
- **Performance Analytics**: User behavior analytics and performance insights

**Usage:**
```typescript
import { useActivityTracking } from '@/hooks/use-activity-tracking';

function PDFViewer({ pdfId }) {
  const { trackActivity, recentActivity } = useActivityTracking({
    userId: 'user123',
    debounceDelay: 2000,
    enableAnalytics: true
  });

  const handlePDFView = () => {
    trackActivity({
      type: 'pdf_view',
      resourceId: pdfId,
      metadata: { timestamp: Date.now() }
    });
  };

  useEffect(() => {
    handlePDFView();
  }, [pdfId]);

  return (
    <div>
      <PDFComponent onView={handlePDFView} />
      <RecentActivity activities={recentActivity} />
    </div>
  );
}
```

#### `use-note-sync.ts` ✅
Cross-tab note synchronization using BroadcastChannel and PostMessage APIs.

**Features:**
- **Real-time Synchronization**: Instant updates across all open browser tabs
- **Conflict Resolution**: Intelligent conflict resolution with last-write-wins strategy
- **Cross-Origin Support**: PostMessage fallback for cross-origin communication
- **Performance Optimization**: Efficient synchronization with minimal overhead
- **Error Recovery**: Robust error handling and automatic recovery mechanisms

**Usage:**
```typescript
import { useNoteSync } from '@/hooks/use-note-sync';

function NoteEditor({ noteId }) {
  const [content, setContent] = useState('');
  
  const { broadcastUpdate, broadcastCreate, broadcastDelete } = useNoteSync({
    enableAutoNavigation: true,
    enableAutoUpdate: true,
    onUpdate: (noteId, updates) => {
      // Handle incoming updates from other tabs
      setContent(updates.content);
    }
  });

  const handleSave = async (newContent) => {
    await saveNote(noteId, { content: newContent });
    broadcastUpdate(noteId, { content: newContent });
  };

  return (
    <textarea 
      value={content}
      onChange={(e) => setContent(e.target.value)}
      onBlur={() => handleSave(content)}
    />
  );
}
```

### Editor-Specific Hooks

#### `use-editor-error-recovery.ts` ✅
Editor-specific error recovery with content preservation and state restoration.

**Features:**
- **Content Preservation**: Automatic content backup and recovery during errors
- **State Restoration**: Complete editor state recovery including cursor position
- **Error Classification**: Editor-specific error handling and recovery strategies
- **Performance Monitoring**: Editor performance metrics and optimization
- **User Notification**: User-friendly error messages and recovery guidance

#### `use-editor-keyboard-shortcuts.ts` ✅
Editor-specific keyboard shortcuts for formatting and navigation.

**Features:**
- **Rich Text Shortcuts**: Standard rich text formatting shortcuts (Bold, Italic, etc.)
- **Navigation Shortcuts**: Efficient text navigation and selection shortcuts
- **Custom Commands**: Editor-specific commands and actions
- **Context Awareness**: Different shortcuts for different editor modes
- **Help Integration**: Built-in help system for shortcut discovery

## 🏗️ Hook Architecture

### Design Principles
- **Reusability**: Hooks designed for maximum reusability across components
- **Performance**: Optimized for minimal re-renders and efficient resource usage
- **Type Safety**: Full TypeScript support with comprehensive type definitions
- **Error Handling**: Robust error handling with graceful degradation
- **Testing**: Comprehensive test coverage with mock dependencies

### Common Patterns

#### Hook Configuration
```typescript
interface HookConfig {
  enabled?: boolean;
  debounceDelay?: number;
  retryAttempts?: number;
  onError?: (error: Error) => void;
  onSuccess?: (result: any) => void;
}
```

#### Return Value Patterns
```typescript
interface HookReturn {
  // State
  isLoading: boolean;
  error: Error | null;
  data: any;
  
  // Actions
  execute: (...args: any[]) => Promise<any>;
  reset: () => void;
  retry: () => void;
  
  // Status
  status: 'idle' | 'loading' | 'success' | 'error';
}
```

### Performance Optimization

#### Memoization
- **useMemo**: Expensive calculations cached with proper dependencies
- **useCallback**: Event handlers and functions memoized to prevent re-renders
- **React.memo**: Component memoization for expensive child components
- **Dependency Arrays**: Carefully managed dependencies to prevent unnecessary updates

#### Resource Management
- **Cleanup**: Proper cleanup of event listeners, timers, and subscriptions
- **Memory Management**: Efficient memory usage with garbage collection awareness
- **Debouncing**: Debounced operations to reduce API calls and improve performance
- **Lazy Loading**: On-demand loading of resources and data

## 🧪 Testing Strategy

### Test Coverage
- **Unit Tests**: Individual hook logic and functionality testing
- **Integration Tests**: Hook interaction with components and APIs
- **Performance Tests**: Performance benchmarking and optimization validation
- **Edge Case Tests**: Comprehensive edge case and error scenario testing

### Testing Utilities
```typescript
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

    act(() => {
      result.current.forceSave();
    });

    expect(mockSave).toHaveBeenCalledWith('test');
  });
});
```

## 📚 Usage Examples

### Auto-Save Implementation
```typescript
import { useAutoSave } from '@/hooks/use-auto-save';
import { useUpdateNoteMutation } from '@/lib/store/apiSlice';

function AutoSaveEditor({ noteId, initialContent }) {
  const [content, setContent] = useState(initialContent);
  const [updateNote] = useUpdateNoteMutation();
  
  const { saveStatus, error } = useAutoSave({
    data: content,
    saveFunction: async (data) => {
      return updateNote({ id: noteId, content: data }).unwrap();
    },
    delay: 1000,
    enabled: !!noteId && content !== initialContent
  });

  return (
    <div>
      <textarea 
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Start typing..."
      />
      <div className="save-status">
        Status: {saveStatus}
        {error && <span className="error">Save failed</span>}
      </div>
    </div>
  );
}
```

### Mobile-Responsive Component
```typescript
import { useMobile } from '@/hooks/use-mobile';
import { useTouchGestures } from '@/hooks/use-touch-gestures';

function ResponsiveGallery({ images }) {
  const { isMobile, hasTouch } = useMobile();
  const [currentIndex, setCurrentIndex] = useState(0);
  
  const { bind } = useTouchGestures({
    onSwipe: (direction) => {
      if (direction === 'left') setCurrentIndex(i => Math.min(i + 1, images.length - 1));
      if (direction === 'right') setCurrentIndex(i => Math.max(i - 1, 0));
    },
    enabled: hasTouch
  });

  return (
    <div className={isMobile ? 'mobile-gallery' : 'desktop-gallery'}>
      <div {...(hasTouch ? bind : {})} className="image-container">
        <img src={images[currentIndex]} alt="Gallery image" />
      </div>
      {!isMobile && (
        <div className="navigation-buttons">
          <button onClick={() => setCurrentIndex(i => Math.max(i - 1, 0))}>
            Previous
          </button>
          <button onClick={() => setCurrentIndex(i => Math.min(i + 1, images.length - 1))}>
            Next
          </button>
        </div>
      )}
    </div>
  );
}
```

### Error Handling with Recovery
```typescript
import { useErrorHandling } from '@/hooks/use-error-handling';
import { useRetry } from '@/hooks/use-retry';

function RobustDataFetcher({ url }) {
  const [data, setData] = useState(null);
  const { handleError, error, clearError } = useErrorHandling();
  const { execute, isLoading, retryCount } = useRetry({ maxAttempts: 3 });

  const fetchData = () => {
    execute(async () => {
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const result = await response.json();
      setData(result);
      clearError(); // Clear any previous errors
    }).catch(handleError);
  };

  useEffect(() => {
    fetchData();
  }, [url]);

  if (error) {
    return (
      <div className="error-container">
        <p>Failed to load data: {error.userMessage}</p>
        <button onClick={fetchData}>
          Retry {retryCount > 0 && `(Attempt ${retryCount + 1})`}
        </button>
      </div>
    );
  }

  if (isLoading) return <div>Loading...</div>;
  if (!data) return <div>No data available</div>;

  return <div>{JSON.stringify(data, null, 2)}</div>;
}
```

## 🔮 Future Enhancements

### Planned Features
- **Advanced Analytics**: Machine learning-powered usage analytics and optimization
- **Real-time Collaboration**: Enhanced real-time collaboration hooks and utilities
- **Offline Support**: Comprehensive offline functionality with sync capabilities
- **Performance Monitoring**: Advanced performance monitoring and optimization hooks

### Performance Improvements
- **Web Workers**: Background processing hooks for CPU-intensive operations
- **Service Workers**: Enhanced offline capabilities and caching strategies
- **Streaming**: Real-time data streaming and processing hooks
- **Edge Computing**: Edge-based processing and optimization hooks

## 🤝 Contributing

### Development Guidelines
- Follow established hook patterns and naming conventions
- Maintain comprehensive TypeScript type definitions
- Include thorough error handling and edge case coverage
- Write comprehensive tests with high coverage
- Update documentation with changes and improvements

### Code Standards
- Use TypeScript strict mode for type safety
- Implement proper cleanup and resource management
- Follow React hooks rules and best practices
- Use semantic naming and clear interfaces
- Optimize for performance and memory usage

---

**Status**: ✅ Production Ready  
**Last Updated**: January 2025  
**Version**: 1.2.0

The hooks library is fully implemented and production-ready, providing comprehensive reusable functionality for auto-save, error handling, mobile optimization, cross-tab synchronization, and user interface enhancements.