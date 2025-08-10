---
inclusion: always
---

# Technical Guidelines

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **React**: Version 19
- **TypeScript**: Strict mode enabled
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Redux Toolkit with RTK Query
- **Authentication**: Clerk with JWT integration
- **Database**: Supabase with Row Level Security (RLS)
- **File Storage**: Supabase Storage with signed URLs
- **PDF Rendering**: Syncfusion PDF Viewer
- **Testing**: Vitest + React Testing Library

## Code Style & Conventions

### TypeScript

- Use strict TypeScript configuration
- Define interfaces for all data structures
- Prefer `type` for unions, `interface` for object shapes
- Use proper generic constraints and utility types
- Export types alongside components when needed

### React Components

- Use functional components with hooks
- Prefer named exports over default exports
- Use PascalCase for component names and files
- Keep components focused and single-responsibility
- Use proper TypeScript props interfaces

### File Naming

- Components: `PascalCase.tsx` (e.g., `PDFAnnotationViewer.tsx`)
- Hooks: `use-kebab-case.ts` (e.g., `use-keyboard-shortcuts.ts`)
- Utilities: `kebab-case.ts` (e.g., `pdf-coordinates.ts`)
- API routes: `route.ts` in appropriate directory structure

### Import Organization

- Use `@/` path alias for project root imports
- Group imports: external libraries, internal components, types
- Use named imports when possible
- Import types with `import type` when only used for typing

## Architecture Patterns

### State Management

- Use Redux Toolkit slices for feature-based state
- Implement RTK Query for API calls and caching
- Use typed hooks from `lib/store/hooks.ts`
- Keep selectors in dedicated files with memoization

### Component Structure

- Separate UI components (`components/ui/`) from feature components
- Use composition over inheritance
- Implement proper error boundaries
- Handle loading and error states consistently

### API Design

- Follow RESTful conventions in `/app/api/` routes
- Use proper HTTP status codes
- Implement consistent error response format
- Validate request data with TypeScript interfaces
- Use Supabase client with RLS for automatic security
- Implement proper error cleanup (e.g., remove uploaded files on database failures)

## Performance Guidelines

- Use React.memo() for expensive components
- Implement proper dependency arrays in useEffect/useMemo
- Lazy load heavy components when appropriate
- Optimize PDF rendering with proper viewport management
- Use RTK Query caching for API responses

## Error Handling

- Implement ErrorBoundary components for graceful failures
- Use try-catch blocks in async operations
- Provide meaningful error messages to users
- Log errors appropriately for debugging

## Testing Standards

- Write unit tests for utility functions
- Test component behavior, not implementation details
- Mock external dependencies (APIs, Syncfusion components)
- Use descriptive test names and organize with describe blocks
- Maintain good test coverage for critical paths

## Security Considerations

- Validate all user inputs with comprehensive file validation
- Use Clerk's authentication with JWT integration
- Implement Row Level Security (RLS) for automatic data isolation
- Sanitize data before rendering and storage
- Use signed URLs for secure file access with expiration
- Implement proper CORS policies
- Handle file uploads securely with size and type validation
- Organize storage by user ID to prevent cross-user access

## Supabase Integration Patterns

### Database Operations

- Use `getAuthenticatedSupabaseClient()` for all database operations
- Rely on RLS policies for automatic user data filtering
- Implement retry logic with `withRetry()` for critical operations
- Use type guards to validate database row structures
- Map database rows to application types with helper functions

### File Storage

- Organize files by user ID: `{userId}/{timestamp}_{filename}`
- Generate signed URLs only when needed (they expire)
- Implement cleanup on upload failures to prevent orphaned files
- Validate files comprehensively before upload
- Use proper MIME types and cache control headers

### Error Handling

- Map Supabase errors to application error types
- Implement proper cleanup on partial failures
- Use non-blocking operations for non-critical features (e.g., activity logging)
- Provide meaningful error messages to users
- Log detailed errors for debugging while hiding sensitive information

## Mobile Responsiveness

- Use Tailwind responsive prefixes consistently
- Test on mobile devices and various screen sizes
- Implement touch-friendly interactions
- Consider mobile-specific UI patterns for complex features
