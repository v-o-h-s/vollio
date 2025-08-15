---
inclusion: always
---

# Project Structure & File Organization

## File Placement Rules

### Components

- **UI Components**: `components/ui/` - shadcn/ui components only (button, dialog, etc.)
- **Feature Components**: `components/[feature]/` - PDF (`components/pdf/`), notes (`components/note/`)
- **Layout Components**: `components/` root - shared layouts like `dashboard-sidebar.tsx`
- **Export Pattern**: Use `index.ts` files in feature directories for clean imports

### Pages & Routes

- **App Router**: Follow `app/[route]/page.tsx` pattern with proper nesting
- **API Routes**: `app/api/[resource]/route.ts` or `app/api/[resource]/[id]/route.ts`
- **Dynamic Routes**: Use `[id]` for single params, `[[...rest]]` for catch-all
- **Layouts**: Place `layout.tsx` at appropriate directory levels for shared UI

### State & Logic

- **Redux Store**: `lib/store/` with feature slices (`annotationSlice.ts`, `apiSlice.ts`), typed hooks (`hooks.ts`), selectors (`selectors.ts`), and provider (`provider.tsx`)
- **Supabase Client**: `lib/supabaseClient.ts` for database and storage operations with RLS integration
- **Utilities**: Feature-specific utilities organized by domain:
  - `lib/utils/error-handling.ts` - Comprehensive error management system
  - `lib/utils/server-error-handling.ts` - Server-side error handling utilities
  - `lib/utils/supabase-helpers.ts` - Database and storage helper functions
  - `lib/utils/activity-tracking.ts` - User activity monitoring utilities
  - `lib/utils/pdfCoordinates.ts` - PDF coordinate calculation utilities
  - `lib/utils/crossTabNavigation.ts` - Cross-tab communication utilities
  - `lib/utils/dates.ts` - Date formatting and manipulation utilities
  - `lib/utils/notifications.ts` - User notification utilities
  - `lib/utils.ts` - Shared utility functions
- **Types**: Comprehensive type definitions:
  - `lib/types.ts` - Application-wide types and interfaces
  - `lib/types/database.ts` - Supabase database types
  - `lib/types/errors.ts` - Error handling types and interfaces

### Custom Hooks

- **Location**: `hooks/` directory only
- **Naming**: `use-kebab-case.ts` (e.g., `use-keyboard-shortcuts.ts`)

## Naming Conventions

### Files

- **Components**: `PascalCase.tsx` (e.g., `PDFAnnotationViewer.tsx`)
- **Hooks**: `use-kebab-case.ts`
- **Utils**: `kebab-case.ts` (e.g., `pdf-coordinates.ts`)
- **API Routes**: Always `route.ts`
- **Pages**: Always `page.tsx`

### Imports

- **Path Alias**: Always use `@/` prefix for internal imports
- **Import Order**: External packages → `@/components` → `@/lib` → `@/hooks` → types
- **Type-only**: Use `import type` when importing only for TypeScript

## Architecture Patterns

### Component Structure

```typescript
// Feature component example
export interface ComponentProps {
  // Props interface
}

export function ComponentName({ prop }: ComponentProps) {
  // Implementation
}
```

### State Management

- **Slices**: One per major feature, use RTK createSlice
- **Selectors**: Memoized in `lib/store/selectors.ts`
- **Hooks**: Use typed hooks from `lib/store/hooks.ts`

### API Routes

- **Pattern**: Export named functions for HTTP methods (GET, POST, PUT, DELETE) - implemented in all routes
- **Error Handling**: Use `withErrorHandling` wrapper for all API routes - implemented with comprehensive error logging
- **Validation**: Use TypeScript interfaces for request/response validation - implemented with server-side validation
- **Authentication**: Use Clerk `auth()` for user verification - implemented with JWT integration
- **Database**: Use `getAuthenticatedSupabaseClient()` for all operations - implemented with RLS policies
- **File Operations**: Implement proper cleanup on failures - implemented in upload route
- **Activity Tracking**: Record user activities for all operations - implemented for view, upload, delete
- **Rate Limiting**: Implement rate limiting for API endpoints - implemented with `checkRateLimit`

## Critical Rules

1. **Never** place components outside their designated directories
2. **Always** use `@/` imports for internal modules
3. **Always** export through `index.ts` files in feature directories
4. **Never** mix UI components with feature components in same directory
5. **Always** use proper TypeScript interfaces for props and API data
