# Library & Utilities

This directory contains the core library code, utilities, and configurations that power the Vollio PDF annotation application. It includes state management, database integration, type definitions, and helper functions.

## 📁 Directory Structure

```
lib/
├── store/              # Redux store and state management
├── types/              # TypeScript type definitions
├── utils/              # Utility functions and helpers
├── __tests__/          # Library unit tests
├── supabaseClient.ts   # Supabase client configuration
├── syncfusion-license.ts # Syncfusion license management
├── types.ts            # Main type definitions
└── utils.ts            # Core utility functions
```

## 🏪 State Management (`lib/store/`)

### Redux Store with RTK Query

The store directory contains a complete Redux Toolkit setup with RTK Query for API integration:

- **[Store Documentation](./store/README.md)** - Complete Redux store guide
- **index.ts** - Main store configuration with middleware
- **annotationSlice.ts** - Annotation state management
- **apiSlice.ts** - RTK Query API endpoints
- **hooks.ts** - Typed Redux hooks
- **selectors.ts** - Memoized state selectors
- **provider.tsx** - Redux Provider component

### Key Features
- Type-safe Redux store with TypeScript
- RTK Query for API calls and caching
- Real-time cache invalidation
- Optimistic updates for better UX
- Comprehensive error handling

## 🔧 Utilities (`lib/utils/`)

### Core Utilities

#### Error Handling System
- **error-handling.ts** - Comprehensive error management
- **server-error-handling.ts** - Server-side error utilities
- Features: Error boundaries, retry mechanisms, user-friendly messages

#### Supabase Integration
- **supabase-helpers.ts** - Database and storage utilities
- **auth-validation.ts** - Authentication validation helpers
- **security-validation.ts** - Input validation and security
- Features: RLS integration, signed URLs, file validation

#### Activity Tracking
- **activity-tracking.ts** - User activity monitoring
- **notifications.ts** - User notification system
- Features: Debounced tracking, real-time updates, cache invalidation

#### PDF & Coordinate Utilities
- **pdfCoordinates.ts** - PDF coordinate calculations
- **crossTabNavigation.ts** - Cross-tab communication
- Features: Precise positioning, multi-tab sync, coordinate transformations

#### General Utilities
- **dates.ts** - Date formatting and manipulation
- **utils.ts** - Core utility functions (cn, clsx integration)

### Utility Categories

#### Database & API Utilities
```typescript
// Supabase helpers
import { 
  getAuthenticatedSupabaseClient,
  generateStoragePath,
  createSignedUrl,
  mapSupabaseError 
} from '@/lib/utils/supabase-helpers';

// Error handling
import { 
  handleApiError,
  createErrorBoundary,
  withRetry 
} from '@/lib/utils/error-handling';
```

#### User Experience Utilities
```typescript
// Activity tracking
import { 
  trackUserActivity,
  debounceActivity,
  invalidateActivityCache 
} from '@/lib/utils/activity-tracking';

// Notifications
import { 
  showSuccessNotification,
  showErrorNotification,
  showLoadingNotification 
} from '@/lib/utils/notifications';
```

#### PDF & Coordinate Utilities
```typescript
// PDF coordinates
import { 
  calculateSelectionBounds,
  extractTextFromSelection,
  getPageNumberFromElement 
} from '@/lib/utils/pdfCoordinates';

// Cross-tab synchronization
import { 
  createNavigationHash,
  parseNavigationHash,
  sendCrossTabMessage 
} from '@/lib/utils/crossTabNavigation';
```

## 📝 Type Definitions (`lib/types/`)

### Type System Architecture

#### Main Types (`lib/types.ts`)
- Application-wide interfaces and types
- Component prop interfaces
- API response types
- State management types

#### Database Types (`lib/types/database.ts`)
- Supabase database schema types
- Row type definitions
- Query result types
- RLS policy types

#### Error Types (`lib/types/errors.ts`)
- Error handling interfaces
- Error boundary types
- API error response types
- User-facing error types

### Key Type Categories

#### Core Application Types
```typescript
// PDF and annotation types
interface PDFDocument {
  id: string;
  filename: string;
  signedUrl: string;
  uploadedAt: string;
  fileSize: number;
}

interface Annotation {
  id: string;
  documentId: string;
  content: string;
  coordinates: AnnotationCoordinates;
  createdAt: string;
}

// UI state types
interface TooltipState {
  visible: boolean;
  position: { x: number; y: number };
}
```

#### API Integration Types
```typescript
// Supabase response types
interface SupabaseUploadResponse {
  data: PDFDocument;
  signedUrl: string;
  error?: string;
}

interface SupabasePDFListResponse {
  data: PDFDocument[];
  recentActivity: UserActivity[];
  totalCount: number;
  error?: string;
}
```

#### Error Handling Types
```typescript
// Error management types
interface AppError {
  code: string;
  message: string;
  userMessage: string;
  retryable: boolean;
  context?: Record<string, any>;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}
```

## 🔌 Client Configurations

### Supabase Client (`lib/supabaseClient.ts`)

**Purpose**: Centralized Supabase client configuration with authentication integration.

**Key Features**:
- Clerk JWT integration for RLS
- Automatic token refresh
- Error handling and retry logic
- Type-safe database operations

**Usage**:
```typescript
import { supabase } from '@/lib/supabaseClient';
import { getAuthenticatedSupabaseClient } from '@/lib/utils/supabase-helpers';

// For authenticated operations (recommended)
const client = await getAuthenticatedSupabaseClient();
const { data, error } = await client
  .from('pdfs')
  .select('*');

// For public operations
const { data } = await supabase
  .from('public_data')
  .select('*');
```

### Syncfusion License (`lib/syncfusion-license.ts`)

**Purpose**: Syncfusion license key management and registration.

**Key Features**:
- License key validation
- Environment-based configuration
- Error handling for license issues
- Development vs production setup

**Usage**:
```typescript
import { registerSyncfusionLicense } from '@/lib/syncfusion-license';

// Automatically called in app initialization
registerSyncfusionLicense();
```

## 🧪 Testing (`lib/__tests__/`)

### Test Coverage

#### Unit Tests
- **supabaseClient.test.ts** - Supabase client functionality
- Utility function tests in respective directories
- Type validation and error handling tests

#### Testing Patterns
```typescript
// Example utility test
import { calculateSelectionBounds } from '@/lib/utils/pdfCoordinates';

describe('calculateSelectionBounds', () => {
  it('should calculate correct bounds for text selection', () => {
    const mockSelection = createMockSelection();
    const bounds = calculateSelectionBounds(mockSelection);
    
    expect(bounds).toEqual({
      x: 100,
      y: 200,
      width: 150,
      height: 20
    });
  });
});
```

## 🏗️ Architecture Patterns

### Dependency Injection
```typescript
// Utilities accept dependencies for testability
export function createApiHelper(client: SupabaseClient) {
  return {
    uploadFile: (file: File) => uploadToSupabase(client, file),
    getFiles: () => getFilesFromSupabase(client)
  };
}
```

### Error Handling Strategy
```typescript
// Consistent error handling across utilities
export async function withErrorHandling<T>(
  operation: () => Promise<T>,
  context: string
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    const appError = mapToAppError(error, context);
    logError(appError);
    throw appError;
  }
}
```

### Type Safety Patterns
```typescript
// Type guards for runtime validation
export function isPDFDocument(obj: any): obj is PDFDocument {
  return (
    typeof obj === 'object' &&
    typeof obj.id === 'string' &&
    typeof obj.filename === 'string' &&
    typeof obj.signedUrl === 'string'
  );
}
```

## 🚀 Performance Considerations

### Optimization Strategies

#### Memoization
```typescript
// Memoized selectors for Redux
export const selectAnnotationsByPdf = createSelector(
  [selectAnnotations, (state, documentId) => documentId],
  (annotations, documentId) => 
    Object.values(annotations).filter(a => a.documentId === documentId)
);
```

#### Debouncing
```typescript
// Debounced operations for performance
export const debouncedTrackActivity = debounce(
  trackUserActivity,
  1000,
  { leading: false, trailing: true }
);
```

#### Lazy Loading
```typescript
// Lazy-loaded utilities
export const getLazyPDFUtils = () => 
  import('./pdfCoordinates').then(module => module.default);
```

## 🔒 Security Considerations

### Input Validation
```typescript
// Comprehensive input validation
export function validatePDFUpload(file: File): ValidationResult {
  const errors: string[] = [];
  
  if (!file.type.includes('pdf')) {
    errors.push('File must be a PDF');
  }
  
  if (file.size > MAX_FILE_SIZE) {
    errors.push('File size exceeds limit');
  }
  
  return { isValid: errors.length === 0, errors };
}
```

### Data Sanitization
```typescript
// Sanitize user inputs
export function sanitizeAnnotationContent(content: string): string {
  return DOMPurify.sanitize(content, {
    ALLOWED_TAGS: ['p', 'strong', 'em', 'u'],
    ALLOWED_ATTR: []
  });
}
```

### Authentication Helpers
```typescript
// Secure authentication utilities
export async function validateUserAccess(
  userId: string,
  resourceId: string
): Promise<boolean> {
  const client = await getAuthenticatedSupabaseClient();
  const { data } = await client
    .from('pdfs')
    .select('user_id')
    .eq('id', resourceId)
    .single();
    
  return data?.user_id === userId;
}
```

## 🔮 Future Enhancements

### Planned Utilities
- **caching.ts** - Advanced caching strategies
- **analytics.ts** - User analytics and tracking
- **offline.ts** - Offline functionality support
- **collaboration.ts** - Real-time collaboration utilities

### Performance Improvements
- Web Workers for heavy computations
- Service Worker for caching and offline support
- Streaming for large file operations
- Virtual scrolling utilities

### Security Enhancements
- Content Security Policy utilities
- Advanced input validation
- Encryption utilities for sensitive data
- Audit logging utilities

## 📞 Support & Contributing

### Development Guidelines
1. **Type Safety**: All utilities must be fully typed
2. **Testing**: Include comprehensive unit tests
3. **Documentation**: Add JSDoc comments for all public functions
4. **Error Handling**: Implement proper error handling and recovery
5. **Performance**: Consider performance implications of new utilities

### Code Review Checklist
- [ ] TypeScript types are properly defined
- [ ] Error handling is comprehensive
- [ ] Unit tests cover all functionality
- [ ] Documentation is complete and accurate
- [ ] Performance impact is considered
- [ ] Security implications are addressed

---

For detailed information about specific utilities or to contribute new functionality, refer to the individual README files in each subdirectory or contact the development team.

---

_Last Updated: January 2025_
_Version: 1.0.0_