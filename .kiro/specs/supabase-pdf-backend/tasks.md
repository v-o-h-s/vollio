# Implementation Plan

- [x] 1. Set up Supabase database schema and storage

  - Create database tables for PDFs and user activity with proper RLS policies
  - Set up Supabase Storage bucket for PDF files with security policies
  - Create database functions for Clerk user ID extraction
  - _Requirements: 1.1, 1.4, 1.5, 2.5, 4.1, 4.2, 4.3_

- [x] 2. Update Supabase client configuration

  - Modify existing supabaseClient.ts to support authenticated requests with Clerk tokens
  - Create helper functions for getting authenticated Supabase client instances
  - Add TypeScript interfaces for database tables and API responses
  - _Requirements: 4.1, 4.2, 5.1_

- [x] 3. Implement PDF upload API endpoint
- [x] 3.1 Create server-side PDF upload handler

  - Write API route at `/api/pdfs/upload` with file validation and Supabase Storage integration
  - Implement file type validation, size limits, and security checks
  - Add progress tracking and error handling for upload operations
  - _Requirements: 1.1, 1.2, 1.3, 5.1, 5.2, 5.3, 5.4_

- [x] 3.2 Integrate database metadata storage

  - Store PDF metadata in Supabase database after successful upload
  - Record upload activity in user_activity table
  - Generate and return signed URLs for immediate file access
  - _Requirements: 1.4, 2.4, 3.1, 3.2_

- [ ] 4. Implement PDF listing and access APIs
- [ ] 4.1 Create PDF listing endpoint

  - Write API route at `/api/pdfs` to fetch user's uploaded PDFs
  - Implement recent activity retrieval with proper sorting
  - Generate fresh signed URLs for file access
  - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3_

- [ ] 4.2 Create individual PDF access endpoint

  - Write API route at `/api/pdfs/[id]` for accessing specific PDFs
  - Record view activity when PDF is accessed
  - Return fresh signed URLs with proper expiration
  - _Requirements: 2.3, 3.1, 3.4, 4.1, 4.2_

- [ ] 5. Update dashboard UI components
- [ ] 5.1 Modify PDF upload component

  - Replace mock upload logic with real Supabase API calls
  - Add upload progress indicators and better error handling
  - Implement drag-and-drop with proper validation feedback
  - _Requirements: 1.1, 1.2, 1.3, 5.1, 5.2, 6.1, 6.2, 6.3, 6.4_

- [ ] 5.2 Create PDF list display component

  - Build UI component to display all user's uploaded PDFs
  - Show file metadata (name, size, upload date) in organized layout
  - Add empty state for users with no uploaded files
  - _Requirements: 2.1, 2.2, 2.4, 6.5_

- [ ] 5.3 Implement recent activity display

  - Create component to show user's last opened PDF prominently
  - Display last accessed time and provide quick access link
  - Handle cases where no recent activity exists
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [ ] 6. Update PDF viewer integration
- [ ] 6.1 Modify PDF viewer to use Supabase URLs

  - Update PDFAnnotationViewer to work with signed URLs from Supabase
  - Replace blob URL handling with proper Supabase file access
  - Ensure PDF viewer works with time-limited signed URLs
  - _Requirements: 2.3, 4.3_

- [ ] 6.2 Implement activity tracking on PDF access

  - Record user activity when PDF is opened in viewer
  - Update recent activity data in real-time
  - Handle activity tracking errors gracefully
  - _Requirements: 3.1, 3.2, 5.5_

- [ ] 7. Update Redux Toolkit and RTK Query integration
- [ ] 7.1 Create new RTK Query API slice for PDFs

  - Create `pdfApiSlice.ts` with RTK Query endpoints for upload, list, and access operations
  - Add mutations for PDF upload with progress tracking and optimistic updates
  - Add queries for PDF listing and individual PDF access with proper caching strategies
  - _Requirements: 2.1, 2.5, 4.4, 5.1_

- [ ] 7.2 Update Redux store to handle PDF and activity state

  - Modify existing annotation slice to work with Supabase PDF IDs instead of blob URLs
  - Add new state slices for PDF management and user activity tracking
  - Integrate RTK Query cache invalidation for real-time dashboard updates
  - _Requirements: 2.1, 2.3, 3.1, 3.2_

- [ ] 7.3 Replace mock database calls with RTK Query hooks

  - Update all components to use new RTK Query hooks instead of mock database calls
  - Replace existing API calls in PDF upload and dashboard components
  - Ensure proper loading states, error handling, and cache management through RTK Query
  - _Requirements: 2.1, 2.5, 4.4, 5.1_

- [ ] 8. Implement comprehensive error handling
- [ ] 8.1 Add client-side error handling

  - Create error boundary components for upload and file access failures
  - Implement retry mechanisms for recoverable errors
  - Add user-friendly error messages with actionable guidance
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [ ] 8.2 Add server-side error handling and logging

  - Implement proper error responses for all API endpoints
  - Add logging for debugging upload and access issues
  - Handle authentication errors and provide clear feedback
  - _Requirements: 4.4, 4.5, 5.1, 5.2, 5.3, 5.4_

- [ ] 9. Add security enhancements
- [ ] 9.1 Implement file validation and security checks

  - Add server-side PDF validation beyond MIME type checking
  - Implement file size limits and quota management
  - Add rate limiting for upload operations
  - _Requirements: 1.2, 1.3, 4.1, 4.2, 4.3, 5.1_

- [ ] 9.2 Enhance authentication and authorization

  - Verify Clerk authentication on all API endpoints
  - Test Row Level Security policies with different user scenarios
  - Implement proper session handling and token refresh
  - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [ ] 10. Create comprehensive tests
- [ ] 10.1 Write unit tests for API endpoints

  - Test PDF upload endpoint with various file types and sizes
  - Test PDF listing and access endpoints with different user scenarios
  - Test error handling and validation logic
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 2.3, 4.1, 4.2, 5.1, 5.2_

- [ ] 10.2 Write integration tests for complete workflows
  - Test complete upload-to-dashboard workflow
  - Test PDF access and activity tracking flow
  - Test error scenarios and recovery mechanisms
  - _Requirements: 1.4, 2.4, 3.1, 3.2, 3.3, 3.4, 5.3, 5.4, 5.5_
