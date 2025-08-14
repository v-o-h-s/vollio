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

- [x] 4. Implement PDF listing and access APIs
- [x] 4.1 Create PDF listing endpoint

  - Write API route at `/api/pdfs/route.ts` to fetch user's uploaded PDFs with GET method
  - Implement recent activity retrieval with proper sorting and pagination
  - Generate fresh signed URLs for file access with proper expiration handling
  - _Requirements: 2.1, 2.2, 3.1, 3.2, 3.3_

- [x] 4.2 Update individual PDF access endpoint

  - Replace mock database calls in `/api/pdfs/[id]/route.ts` with Supabase integration
  - Record view activity when PDF is accessed using authenticated Supabase client
  - Return fresh signed URLs with proper expiration and error handling
  - _Requirements: 2.3, 3.1, 3.4, 4.1, 4.2_

- [x] 5. Update RTK Query API slice for Supabase integration
- [x] 5.1 Update RTK Query endpoints for PDF operations

  - Modify existing `uploadPDF` mutation to use Supabase upload endpoint
  - Create new `getPDFs` query to fetch user's PDFs from `/api/pdfs`
  - Add `getPDF` query for individual PDF access from `/api/pdfs/[id]`
  - Update response transformers to handle Supabase API responses
  - _Requirements: 2.1, 2.3, 2.5, 4.4, 5.1_

- [x] 5.2 Update dashboard UI components to use real APIs

  - Replace mock upload logic in PDF upload component with RTK Query mutation
  - Update dashboard page to use `getPDFs` query instead of static content
  - Add loading states and error handling for all API operations
  - Implement proper cache invalidation for real-time updates
  - _Requirements: 1.1, 1.2, 1.3, 2.1, 2.2, 5.1, 5.2, 6.1, 6.2, 6.3, 6.4_

- [x] 5.3 Create modern PDF list display component

  - Build modern UI component to display all user's uploaded PDFs using RTK Query
  - Show file metadata (name, size, upload date) in organized card/grid layout with modern styling
  - Add prominent "Upload PDF" button with drag-and-drop functionality
  - Add empty state for users with no uploaded files with clear call-to-action
  - Implement click handlers to open PDFs in annotation viewer
  - Use modern design patterns with proper spacing, shadows, and hover effects
  - _Requirements: 2.1, 2.2, 2.4, 6.1, 6.5_

- [x] 5.4 Implement recent activity display

  - Create component to show user's last opened PDF prominently
  - Display last accessed time and provide quick access link
  - Handle cases where no recent activity exists
  - Integrate with RTK Query for real-time activity updates
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

- [x] 6. Update PDF viewer integration
- [x] 6.1 Modify PDF viewer to use Supabase URLs

  - Update PDFAnnotationViewer to work with signed URLs from Supabase
  - Replace blob URL handling with proper Supabase file access
  - Ensure PDF viewer works with time-limited signed URLs
  - _Requirements: 2.3, 4.3_

- [x] 6.2 Implement activity tracking on PDF access

  - Record user activity when PDF is opened in viewer
  - Update recent activity data in real-time
  - Handle activity tracking errors gracefully
  - _Requirements: 3.1, 3.2, 5.5_

- [x] 8. Implement comprehensive error handling
- [x] 8.1 Add client-side error handling

  - Create error boundary components for upload and file access failures
  - Implement retry mechanisms for recoverable errors
  - Add user-friendly error messages with actionable guidance
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_

- [x] 8.2 Add server-side error handling and logging

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
