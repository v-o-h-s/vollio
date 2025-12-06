# Google Classroom Integration

## Overview

The Google Classroom integration allows users to seamlessly import documents from their Google Classroom courses into the application's PDF management system.

## Features

### 1. Smart Authentication Flow
- **Initial State**: Button displays "Add Classroom" when not authenticated
- **One-Click Auth**: Clicking the button initiates Google OAuth flow
- **Connected State**: Button changes to "Get from Classroom" after successful authentication
- **Persistent Connection**: Token status is validated before showing courses

### 2. Course Selection
- View all available Google Classroom courses
- Display course metadata (name, state, last update)
- Visual indicators for course status (ACTIVE, ARCHIVED, etc.)
- Empty state handling when no courses are available

### 3. Document Selection
- Browse all documents from selected course
- Includes materials from:
  - Course announcements
  - Course work assignments
  - Course materials
- Document thumbnails when available
- Fallback icons for documents without thumbnails

### 4. File Import
- One-click document import to PDF collection
- Automatic file processing from Google Drive
- Success/error feedback via toast notifications
- Loading states during file transfer

## Component Architecture

### GoogleClassroomButton Component

**Location**: `/client/components/pdf/GoogleClassroomButton.tsx`

**Dependencies**:
- RTK Query hooks for API communication
- Radix UI Dialog for modal interactions
- Shadcn UI components (Button, ScrollArea)
- React Hot Toast for notifications

**State Management**:
```typescript
- isDialogOpen: Controls modal visibility
- isConnected: Tracks Google Classroom connection status
- isCheckingConnection: Loading state during token validation
- selectedCourse: Currently selected course
- dialogView: Switches between "courses" and "documents" views
```

**API Integration**:
- `useCheckGoogleClassroomTokenStatusQuery`: Validates authentication
- `useGetGoogleClassroomCoursesListQuery`: Fetches available courses
- `useGetGoogleClassroomCourseContentQuery`: Retrieves course materials
- `useAddFileFromGoogleDriveMutation`: Imports selected document

## User Flow

1. **Initial Click**
   - User clicks "Add Classroom" button
   - System checks for existing authentication
   - If not authenticated, redirects to Google OAuth
   - If authenticated, opens course selection dialog

2. **Course Selection**
   - User sees list of all available courses
   - Each course shows name, state, and last update
   - Clicking a course loads its documents

3. **Document Selection**
   - User sees all materials from the selected course
   - Documents show thumbnail (if available) and title
   - Clicking a document initiates import

4. **Import Completion**
   - File is added to Google Drive files collection
   - Success message confirms import
   - Dialog closes automatically
   - File appears in PDFs page

## Design System Compliance

The component follows the application's design system:

### Color Palette
- Uses theme tokens (`primary`, `accent`, `muted`, etc.)
- Supports dark mode automatically
- Consistent with OKLCH color values

### Typography
- Follows font hierarchy (headings, body text)
- Proper text sizing and weights
- Consistent spacing and line heights

### Components
- Radix UI primitives for accessibility
- Shadcn UI styling conventions
- Smooth transitions and animations
- Focus states and keyboard navigation

### Layout
- Responsive modal sizing (`max-w-2xl`, `max-h-[85vh]`)
- ScrollArea for content overflow
- Proper spacing and padding
- Grid/flex layouts for alignment

### Interactive States
- Hover effects with color transitions
- Loading spinners for async operations
- Disabled states during processing
- Focus rings for keyboard users

### Empty States
- Clear messaging when no data
- Helpful icons for visual context
- Suggestions for next actions

## API Endpoints Used

### 1. Check Token Status
```
GET /api/v1/integrations/lms/google-classroom/check
```
Validates current Google Classroom authentication token.

### 2. Connect (OAuth)
```
GET /api/v1/integrations/lms/google-classroom/connect
```
Initiates Google OAuth flow for authentication.

### 3. List Courses
```
GET /api/v1/integrations/lms/google-classroom/courses/list
```
Retrieves all available courses for the authenticated user.

### 4. Get Course Content
```
GET /api/v1/integrations/lms/google-classroom/courses/:courseId/content
```
Fetches all materials for a specific course.

### 5. Add File
```
POST /api/v1/files
Body: { fileGoogleDriveId: string }
```
Imports a file from Google Drive to the application.

## Error Handling

- **Network Errors**: Toast notification with retry option
- **Authentication Failures**: Automatic redirect to OAuth
- **Empty Results**: Clear empty state messages
- **File Import Errors**: Specific error messages from API
- **Loading States**: Spinners prevent duplicate actions

## Accessibility

- **Keyboard Navigation**: Full keyboard support for all interactions
- **Focus Management**: Proper focus states and rings
- **Screen Readers**: Semantic HTML and ARIA labels
- **Color Contrast**: WCAG AA compliant color combinations
- **Loading Indicators**: Announce loading states to screen readers

## Future Enhancements

- [ ] Batch file import (select multiple documents)
- [ ] Course filtering and search
- [ ] Document preview before import
- [ ] Recent courses quick access
- [ ] Auto-sync new course materials
- [ ] Folder organization for imported files
- [ ] File type filtering (PDFs only)
- [ ] Import history and tracking

## Troubleshooting

### Button doesn't change state after OAuth
- Check token status endpoint is returning valid data
- Verify cookies are enabled for session persistence
- Check browser console for authentication errors

### Courses not loading
- Ensure user has enrolled courses in Google Classroom
- Verify API permissions for Classroom scope
- Check network tab for API response errors

### Documents not appearing
- Confirm course has materials with Google Drive files
- Check that materials are published (not drafts)
- Verify Drive file permissions

### Import fails
- Ensure user has access to the Google Drive file
- Check file size limits
- Verify storage quota availability
- Review server logs for detailed errors
