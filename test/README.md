# PDF Annotation System Test Suite

This directory contains comprehensive tests for the PDF annotation system, covering all major functionality and edge cases.

## Test Structure

### Unit Tests

#### `test/utils/pdfCoordinates.test.ts`

Tests for PDF coordinate calculation utilities:

- Selection bounds calculation relative to PDF pages
- Text extraction from browser selections
- Page number detection from DOM elements
- Coordinate transformations for zoom and scroll
- PDF page element detection
- Error handling for DOM manipulation

#### `test/utils/crossTabNavigation.test.ts`

Tests for cross-tab communication functionality:

- Navigation hash creation and parsing
- PostMessage communication between tabs
- Message validation and error handling
- Event listener setup and cleanup
- Integration scenarios

#### `test/store/annotationSlice.test.ts`

Tests for Redux state management:

- PDF document state management
- Annotation CRUD operations
- Text selection state
- UI state (tooltips, preview cards, hover states)
- Complex state interactions
- State persistence and updates

### Integration Tests

#### `test/components/PDFAnnotationViewer.test.tsx`

Integration tests for the main PDF viewer component:

- PDF viewer rendering with Syncfusion integration and Supabase URLs
- Activity tracking functionality and cache invalidation
- Signed URL handling and automatic refresh
- Annotation overlay functionality with hover states
- Text selection and annotation creation workflow
- Annotation interactions (hover, click, edit, delete)
- Multiple annotation handling and performance optimization
- Error handling for URL expiration and corrupted data
- Mobile responsive behavior and touch interactions

#### `test/components/AnnotationOverlay.test.tsx`

Tests for the annotation overlay component:

- Annotation rendering and positioning
- Mouse and keyboard interactions
- Hover state management
- Accessibility features (ARIA attributes, keyboard navigation)
- Performance optimization
- Edge cases (overlapping annotations, zero dimensions)

### End-to-End Tests

#### `test/e2e/annotation-workflow.test.tsx`

Complete workflow testing:

- File upload → PDF loading → text selection → annotation creation → viewing
- Workflow cancellation and error recovery
- File validation and upload error handling
- Note creation and editing
- Performance and responsiveness testing

### Mobile and Responsive Tests

#### `test/mobile/responsive-behavior.test.tsx`

Mobile-specific functionality testing:

- Desktop vs mobile layout rendering
- Touch-based text selection
- Mobile annotation dialog interactions
- Touch gesture handling (pinch-to-zoom, scroll vs selection)
- Viewport size changes and orientation
- Cross-device compatibility
- Mobile accessibility features
- Performance optimization for mobile devices

## Test Coverage Areas

### Core Functionality

- ✅ PDF document upload and loading with Supabase integration
- ✅ Signed URL handling and automatic refresh
- ✅ Activity tracking with real-time updates
- ✅ Text selection in PDF viewer with coordinate calculation
- ✅ Annotation creation, editing, and deletion
- ✅ Annotation positioning and coordinate calculations
- ✅ Cross-tab navigation and communication
- ✅ State management with Redux and RTK Query

### User Interface

- ✅ Responsive design (desktop and mobile)
- ✅ Annotation tooltips and preview cards
- ✅ Mobile-specific dialogs and interactions
- ✅ Hover effects and visual feedback
- ✅ Keyboard navigation and accessibility

### Error Handling

- ✅ File upload validation and errors
- ✅ Corrupted annotation data handling
- ✅ DOM manipulation errors
- ✅ Network communication failures
- ✅ Cross-tab communication errors

### Performance

- ✅ Large numbers of annotations (100+ annotations tested)
- ✅ Rapid user interactions
- ✅ Mobile touch event handling
- ✅ Memory management and cleanup
- ✅ Rendering optimization

### Edge Cases

- ✅ Empty or invalid selections
- ✅ Overlapping annotations
- ✅ Extreme coordinate values
- ✅ Malformed data inputs
- ✅ Browser compatibility scenarios

## Running Tests

```bash
# Run all tests
npm run test:run

# Run tests in watch mode
npm run test:watch

# Run tests with UI
npm run test:ui

# Run tests with coverage
npm run test:coverage

# Run specific test file
npx vitest run test/utils/pdfCoordinates.test.ts

# Run tests for specific component
npx vitest run test/components/PDFAnnotationViewer.test.tsx
```

## Test Configuration

Tests are configured using Vitest with:

- **Environment**: jsdom for DOM testing
- **Setup**: `test/setup.ts` with mocks for browser APIs
- **Mocking**: Comprehensive mocks for Syncfusion PDF Viewer, file APIs, and browser features
- **Coverage**: V8 coverage provider for detailed code coverage reports

## Mocking Strategy

### External Dependencies

- **Syncfusion PDF Viewer**: Mocked with essential functionality for testing
- **File APIs**: `URL.createObjectURL`, `FileReader` mocked for upload testing
- **Browser APIs**: `ResizeObserver`, `IntersectionObserver`, `matchMedia` mocked
- **Navigation**: Next.js router and navigation hooks mocked
- **RTK Query**: API endpoints mocked for testing without backend
- **Activity Tracking**: Activity tracking hooks mocked for isolated testing

### Component Mocking

- PDF viewer components mocked to focus on integration logic
- UI components mocked to test interaction patterns
- Mobile-specific components conditionally mocked based on device type

## Coverage Goals

- **Unit Tests**: 90%+ coverage for utility functions and state management
- **Integration Tests**: 80%+ coverage for component interactions
- **E2E Tests**: 70%+ coverage for complete user workflows
- **Mobile Tests**: 80%+ coverage for responsive and touch functionality

## Continuous Integration

Tests are designed to run in CI environments with:

- Headless browser support
- Deterministic timing for async operations
- Proper cleanup to prevent test interference
- Comprehensive error reporting and debugging information
