# Custom Hooks

This directory contains custom React hooks that provide reusable functionality across the Noto PDF annotation application.

## 📁 Hook Overview

### Activity Tracking

#### `use-activity-tracking.ts` - User Activity Monitoring

**Purpose**: Provides React integration for user activity tracking with debounced API calls and cache invalidation.

**Key Features**:
- Debounced activity tracking to prevent excessive API calls
- Automatic cache invalidation for real-time updates
- Error handling with retry mechanisms
- Integration with Redux store and RTK Query

**Usage**:
```tsx
import { useActivityTracking } from '@/hooks/use-activity-tracking';

function PDFViewer({ pdfId }: { pdfId: string }) {
  const { trackActivity, isTracking, error } = useActivityTracking();

  const handlePDFView = async () => {
    await trackActivity({
      pdfId,
      activityType: 'view'
    });
  };

  return (
    <div>
      {/* PDF viewer content */}
      {isTracking && <LoadingSpinner />}
      {error && <ErrorMessage error={error} />}
    </div>
  );
}
```

**Key Methods**:
- `trackActivity(params)` - Track user activity with debouncing
- `isTracking` - Boolean indicating if tracking is in progress
- `error` - Error state for failed tracking attempts

---

### Error Handling

#### `use-error-handling.ts` - Comprehensive Error Management

**Purpose**: Provides standardized error handling patterns with recovery mechanisms and user-friendly messaging.

**Key Features**:
- Centralized error state management
- User-friendly error message formatting
- Retry mechanisms with exponential backoff
- Integration with error boundaries and notifications

**Usage**:
```tsx
import { useErrorHandling } from '@/hooks/use-error-handling';

function FileUploadComponent() {
  const { 
    error, 
    setError, 
    clearError, 
    retryOperation,
    isRetrying 
  } = useErrorHandling();

  const handleUpload = async (file: File) => {
    try {
      clearError();
      await uploadFile(file);
    } catch (err) {
      setError(err);
    }
  };

  const handleRetry = () => {
    retryOperation(() => handleUpload(selectedFile));
  };

  return (
    <div>
      {error && (
        <ErrorNotification 
          error={error} 
          onRetry={handleRetry}
          isRetrying={isRetrying}
        />
      )}
      {/* Upload UI */}
    </div>
  );
}
```

**Key Methods**:
- `setError(error)` - Set error state with user-friendly formatting
- `clearError()` - Clear current error state
- `retryOperation(operation)` - Retry failed operation with backoff
- `isRetrying` - Boolean indicating if retry is in progress

---

### User Interface

#### `use-keyboard-shortcuts.ts` - Keyboard Navigation

**Purpose**: Provides keyboard shortcut handling for enhanced accessibility and power user features.

**Key Features**:
- Configurable keyboard shortcuts
- Context-aware shortcut activation
- Accessibility compliance (ARIA integration)
- Cross-browser compatibility

**Usage**:
```tsx
import { useKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts';

function AnnotationEditor() {
  const shortcuts = useKeyboardShortcuts({
    'Ctrl+S': handleSave,
    'Ctrl+B': toggleBold,
    'Ctrl+I': toggleItalic,
    'Escape': handleCancel,
  });

  return (
    <div {...shortcuts.getProps()}>
      {/* Editor content */}
    </div>
  );
}
```

**Key Features**:
- `useKeyboardShortcuts(shortcuts)` - Register keyboard shortcuts
- `getProps()` - Get props for keyboard event handling
- Context-aware activation and deactivation
- Help system integration for shortcut discovery

#### `use-mobile.ts` - Mobile Device Detection

**Purpose**: Provides responsive design utilities and mobile device detection for adaptive UI behavior.

**Key Features**:
- Accurate mobile device detection
- Screen size and orientation tracking
- Touch capability detection
- Responsive breakpoint utilities

**Usage**:
```tsx
import { useMobile } from '@/hooks/use-mobile';

function ResponsiveComponent() {
  const { 
    isMobile, 
    isTablet, 
    isDesktop, 
    orientation,
    screenSize,
    hasTouch 
  } = useMobile();

  return (
    <div>
      {isMobile ? (
        <MobileAnnotationDialog />
      ) : (
        <DesktopAnnotationTooltip />
      )}
      
      {hasTouch && <TouchOptimizedControls />}
      
      {orientation === 'landscape' && <LandscapeLayout />}
    </div>
  );
}
```

**Key Properties**:
- `isMobile` - Boolean for mobile device detection
- `isTablet` - Boolean for tablet device detection
- `isDesktop` - Boolean for desktop device detection
- `orientation` - Current device orientation ('portrait' | 'landscape')
- `screenSize` - Current screen dimensions
- `hasTouch` - Boolean for touch capability detection

## 🏗️ Hook Architecture

### Design Principles

1. **Single Responsibility**: Each hook focuses on one specific concern
2. **Reusability**: Hooks are designed to be used across multiple components
3. **Type Safety**: Full TypeScript integration with proper type definitions
4. **Error Handling**: Comprehensive error handling with user-friendly messages
5. **Performance**: Optimized with proper dependency management and memoization

### Integration Patterns

#### Redux Integration
```tsx
// Hooks integrate seamlessly with Redux store
const { trackActivity } = useActivityTracking();
const dispatch = useAppDispatch();
const state = useAppSelector(selectAnnotationState);
```

#### Error Boundary Integration
```tsx
// Hooks work with error boundaries for comprehensive error handling
const { error, setError } = useErrorHandling();

// Error boundaries catch and handle hook errors
<ErrorBoundary fallback={<ErrorFallback />}>
  <ComponentWithHooks />
</ErrorBoundary>
```

#### RTK Query Integration
```tsx
// Hooks integrate with RTK Query for API calls and caching
const { trackActivity } = useActivityTracking();
const [uploadPDF] = useUploadPDFMutation();
const { data: pdfs } = useGetPDFsQuery();
```

## 🎨 Usage Patterns

### Activity Tracking Pattern
```tsx
function PDFComponent({ pdfId }: { pdfId: string }) {
  const { trackActivity } = useActivityTracking();

  useEffect(() => {
    // Track PDF view on component mount
    trackActivity({ pdfId, activityType: 'view' });
  }, [pdfId, trackActivity]);

  const handleAnnotationCreate = async (annotation: Annotation) => {
    // Track annotation creation
    await trackActivity({ 
      pdfId, 
      activityType: 'annotate',
      metadata: { annotationId: annotation.id }
    });
  };
}
```

### Error Handling Pattern
```tsx
function FileOperationComponent() {
  const { error, setError, clearError, retryOperation } = useErrorHandling();

  const performFileOperation = async () => {
    try {
      clearError();
      await riskyFileOperation();
    } catch (err) {
      setError(err);
    }
  };

  return (
    <div>
      {error && (
        <ErrorDisplay 
          error={error}
          onRetry={() => retryOperation(performFileOperation)}
          onDismiss={clearError}
        />
      )}
    </div>
  );
}
```

### Responsive Design Pattern
```tsx
function AdaptiveComponent() {
  const { isMobile, hasTouch } = useMobile();
  const shortcuts = useKeyboardShortcuts({
    'Ctrl+S': handleSave,
    'Escape': handleCancel,
  });

  return (
    <div {...(!isMobile ? shortcuts.getProps() : {})}>
      {isMobile ? (
        <MobileInterface hasTouch={hasTouch} />
      ) : (
        <DesktopInterface />
      )}
    </div>
  );
}
```

## 🧪 Testing Hooks

### Testing Strategy
- **Unit Tests**: Test hook logic in isolation
- **Integration Tests**: Test hooks with components
- **Mock Dependencies**: Mock external dependencies (APIs, browser APIs)
- **Edge Cases**: Test error conditions and edge cases

### Example Test
```tsx
import { renderHook, act } from '@testing-library/react';
import { useActivityTracking } from '@/hooks/use-activity-tracking';

describe('useActivityTracking', () => {
  it('should track activity with debouncing', async () => {
    const { result } = renderHook(() => useActivityTracking());

    await act(async () => {
      await result.current.trackActivity({
        pdfId: 'test-pdf',
        activityType: 'view'
      });
    });

    expect(result.current.isTracking).toBe(false);
    // Verify API call was made
  });
});
```

## 🔧 Development Guidelines

### Creating New Hooks

1. **File Naming**: Use `use-kebab-case.ts` format
2. **TypeScript**: Include proper type definitions and interfaces
3. **Documentation**: Add comprehensive JSDoc comments
4. **Testing**: Include unit tests for all hook functionality
5. **Error Handling**: Implement proper error handling and recovery

### Hook Template
```tsx
import { useState, useEffect, useCallback } from 'react';

interface UseCustomHookOptions {
  // Hook options interface
}

interface UseCustomHookReturn {
  // Hook return type interface
}

/**
 * Custom hook description
 * @param options - Hook configuration options
 * @returns Hook return object with methods and state
 */
export function useCustomHook(options: UseCustomHookOptions): UseCustomHookReturn {
  const [state, setState] = useState(initialState);

  const method = useCallback(() => {
    // Hook logic
  }, [dependencies]);

  useEffect(() => {
    // Side effects
    return () => {
      // Cleanup
    };
  }, [dependencies]);

  return {
    state,
    method,
    // Other return values
  };
}
```

## 🚀 Performance Considerations

### Optimization Strategies
- **Memoization**: Use `useCallback` and `useMemo` appropriately
- **Dependency Arrays**: Minimize dependencies to prevent unnecessary re-renders
- **Cleanup**: Proper cleanup of event listeners and subscriptions
- **Debouncing**: Debounce expensive operations (API calls, calculations)

### Memory Management
- Clean up event listeners in `useEffect` cleanup functions
- Cancel pending API requests when components unmount
- Use weak references for DOM element references
- Avoid memory leaks in long-running operations

## 🔮 Future Enhancements

### Planned Hooks
- `use-pdf-coordinates` - PDF coordinate calculation utilities
- `use-annotation-state` - Annotation-specific state management
- `use-cross-tab-sync` - Cross-tab communication utilities
- `use-offline-sync` - Offline functionality and synchronization

### Enhancement Opportunities
- **Performance Monitoring**: Add performance tracking to hooks
- **Analytics Integration**: Built-in analytics tracking
- **A/B Testing**: Hook-based feature flag support
- **Accessibility**: Enhanced accessibility utilities

---

## 📞 Support

For questions about custom hooks or to contribute new hooks:

- **Documentation**: This README and inline JSDoc comments
- **Examples**: See component usage throughout the application
- **Testing**: Refer to `test/hooks/` for testing examples
- **Issues**: Report bugs or request features via GitHub Issues

---

_Last Updated: January 2025_
_Version: 1.0.0_