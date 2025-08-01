# Implementation Plan

- [x] 1. Set up project dependencies and core types

  - Install required packages: @syncfusion/ej2-react-pdfviewer, @tiptap/react, @tiptap/starter-kit, @tiptap/extension-link
  - Create TypeScript interfaces for Annotation, PDFDocument, TextSelection, and Rectangle types in lib/types.ts
  - Set up basic file structure for PDF annotation components in components/pdf/
  - _Requirements: 1.1, 1.2, 3.1, 6.1_

- [x] 2. Create Redux store for annotation state management

  - Set up Redux store configuration with @reduxjs/toolkit in lib/store/
  - Create annotation slice with state for currentPdf, annotations, activeSelection, and UI states
  - Add actions for tooltip visibility, preview card state, and annotation CRUD operations
  - Create selectors for efficient component data access and integrate with existing app structure
  - _Requirements: 6.3, 6.4_

- [ ] 3. Replace static PDF Notes page with functional PDF upload component

  - Replace the current static UI in app/dashboard/pdf-notes/page.tsx with functional PDF upload
  - Implement file selection dialog with drag-and-drop support and PDF validation
  - Add file size validation (50MB limit) and proper error handling
  - Create PDF file handling with URL.createObjectURL and proper cleanup on unmount
  - _Requirements: 1.1, 1.2, 1.4_

- [ ] 4. Create PDFAnnotationViewer component with Syncfusion integration

  - Build PDFAnnotationViewer component using @syncfusion/ej2-react-pdfviewer
  - Implement basic PDF rendering with text layer support for selection
  - Add component to dashboard layout with full-width display and proper styling
  - Handle PDF loading states and error boundaries for failed loads
  - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 5. Implement text selection and coordinate capture system

  - Add text layer event listeners using Syncfusion's textSelectionStart and textSelectionEnd events
  - Create utility functions to calculate bounding rectangle coordinates relative to PDF pages
  - Implement text extraction logic using Syncfusion's getSelectedText() API
  - Add page number tracking for multi-page PDF support with proper coordinate transformation
  - _Requirements: 2.5, 6.4_

- [ ] 6. Build annotation tooltip system with Radix UI

  - Create AnnotationTooltip component using @radix-ui/react-tooltip with "Create note" button
  - Implement hover detection and tooltip positioning logic with viewport edge detection
  - Add blue accent styling (#3B82F6) and drop shadow effects matching design system
  - Implement smooth fade-in/fade-out animations with transition-opacity duration-200
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 5.1, 5.4_

- [ ] 7. Create note editor routes and TipTap integration

  - Create app/note/new/page.tsx and app/note/[id]/page.tsx routes using Next.js App Router
  - Set up TipTap editor with @tiptap/starter-kit and @tiptap/extension-link extensions
  - Implement note editor component with rich-text editing capabilities and toolbar
  - Add "Back to PDF" navigation link and "Save & Close" functionality with proper tab management
  - Handle URL parameters and localStorage for passing selected text and PDF reference data
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 3.6_

- [ ] 8. Build annotation overlay and highlighting system

  - Create annotation highlight rendering system with absolute positioning over PDF pages
  - Implement visual styling for annotated text with blue underline and background highlight
  - Add coordinate transformation logic to handle PDF zoom and scroll states using Syncfusion APIs
  - Create smooth highlight animations using transition-all for color changes
  - _Requirements: 4.1, 4.5, 5.2_

- [ ] 9. Implement annotation preview card system

  - Create AnnotationPreviewCard component using @radix-ui/react-popover to display note previews on hover
  - Add logic to show first ~100 characters of note content in preview with proper truncation
  - Implement smooth fade-in animations and click-to-edit functionality
  - Add preview card positioning and viewport boundary handling with automatic repositioning
  - _Requirements: 4.2, 4.3, 4.4, 5.1, 5.4_

- [ ] 10. Create database API endpoints (prototype)

  - Set up app/api/annotations/route.ts for annotation CRUD operations: GET, POST, PUT, DELETE
  - Create app/api/pdfs/upload/route.ts and app/api/pdfs/[id]/route.ts for PDF management
  - Implement mock data storage using in-memory arrays or JSON files for prototype
  - Add proper error handling, response formatting, and Clerk user authentication integration
  - _Requirements: 6.1, 6.2, 6.5_

- [ ] 11. Integrate annotation persistence with API

  - Connect annotation creation workflow to POST /api/annotations endpoint with Redux actions
  - Implement annotation loading from GET /api/annotations on PDF load with proper caching
  - Add annotation updates and deletions through PUT and DELETE endpoints
  - Handle API errors gracefully with user feedback using toast notifications and retry mechanisms
  - _Requirements: 6.1, 6.2, 6.3, 6.6_

- [ ] 12. Add mobile responsiveness and touch interactions

  - Implement tap-to-select functionality for mobile devices instead of hover using touch events
  - Create full-screen modal for "Create note" on mobile using existing @radix-ui/react-dialog
  - Add touch-friendly sizing for annotation previews and interactive elements (min 44px touch targets)
  - Test and optimize PDF viewer performance on mobile devices with proper viewport handling
  - _Requirements: 5.3, 5.4_

- [ ] 13. Implement cross-tab communication and navigation

  - Add URL parameter handling for PDF location links (#pdf?page=3&x=120&y=450&width=200&height=18)
  - Implement automatic PDF navigation to specific coordinates using Syncfusion's navigation APIs
  - Add proper browser tab management for editor-to-viewer navigation with window.opener
  - Handle edge cases where PDF or annotations might not be available with graceful fallbacks
  - _Requirements: 3.3, 4.4_

- [ ] 14. Add comprehensive error handling and user feedback

  - Implement error boundaries for PDF loading failures and display user-friendly messages
  - Add loading states and progress indicators for PDF upload and rendering using existing UI patterns
  - Create fallback UI for cases where text selection or annotation creation fails
  - Add success/error notifications for annotation save operations using toast system
  - _Requirements: 1.4, 6.5_

- [ ] 15. Create comprehensive test suite

  - Write unit tests for text selection logic, coordinate calculations, and Redux state management
  - Create integration tests for PDF viewer with annotation overlay functionality
  - Add end-to-end tests for complete annotation workflow: upload → select → create → view
  - Test responsive behavior and mobile interactions across different devices and browsers
  - _Requirements: All requirements validation_

- [ ] 16. Polish animations and final UI refinements
  - Fine-tune all transition animations for smooth user experience matching existing design system
  - Add loading skeletons and micro-interactions for better perceived performance
  - Implement keyboard shortcuts for common annotation actions (Ctrl+N for new note, etc.)
  - Add accessibility features including keyboard navigation, screen reader support, and ARIA labels
  - Perform final testing and bug fixes across different browsers and devices
  - _Requirements: 5.1, 5.2, 5.3, 5.4_
