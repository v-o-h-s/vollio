---
inclusion: always
---

---
inclusion: always
---

# Error Handling and Problem Resolution

## Debugging Approach

When encountering errors or implementation challenges:

1. **Analyze first**: Check error messages, stack traces, and console logs
2. **Use existing patterns**: Reference `@/lib/utils/error-handling.ts` and `@/components/ErrorBoundary.tsx`
3. **Test incrementally**: Apply small, isolated changes
4. **Verify core flows**: Ensure fixes don't break PDF upload → annotation → navigation

## Framework-Specific Issues

### Next.js 15 + App Router
- Import resolution: Use `@/` prefix consistently, check `tsconfig.json` paths
- Route handlers: Export named functions (GET, POST) in `route.ts` files
- Client/Server boundaries: Use `"use client"` directive for interactive components

### React 19 + TypeScript
- Strict mode: Define proper interfaces for all props and API responses
- Hook dependencies: Include all dependencies in useEffect/useMemo arrays
- Type imports: Use `import type` for TypeScript-only imports

### Authentication (Clerk)
- Protected routes: Use `auth()` in server components, `useAuth()` in client components
- JWT integration: Ensure Supabase RLS policies match Clerk JWT structure
- Redirect handling: Use `redirect()` from `next/navigation` for unauthenticated users

## Common Error Patterns

### Theme System Issues
- **Theme not persisting**: Check localStorage permissions and ensure ThemeProvider is not remounting
- **Theme flashing**: Verify theme script runs before React hydration and CSS includes both theme variants
- **Components not theme-aware**: Ensure components use theme tokens (`bg-muted`, `text-foreground`) instead of hardcoded colors
- **Skeleton loading issues**: Verify skeleton components use `bg-muted` and loading-shimmer uses theme-aware CSS custom properties

### Database Operations
- **RLS violations**: Check user authentication and policy configuration
- **Type mismatches**: Validate database row structure with type guards
- **Connection issues**: Use `getAuthenticatedSupabaseClient()` consistently

### RTK Query Issues
- **Cache Management**: Ensure proper cache invalidation with appropriate tags
- **Mutation Errors**: Use `.unwrap()` in try-catch blocks for proper error handling
- **Loading States**: Extract `isLoading` from mutation hooks for UI feedback
- **Type Safety**: Properly type all mutations and queries with interfaces

### UI Component Issues
- **Confirmation Dialogs**: Use custom `DeleteConfirmationDialog` instead of browser `window.confirm()`
- **Auto-Save Status**: Ensure `AutoSaveStatusProvider` is wrapped around components that need status
- **Context Errors**: Check that context hooks are used within their respective providers
- **Loading States**: Always show loading spinners during async operations

### File Operations
- **Upload failures**: Implement cleanup in catch blocks to prevent orphaned files
- **Storage access**: Generate fresh signed URLs, don't cache expired ones
- **File validation**: Check size, type, and content before processing

### State Management
- **RTK Query errors**: Handle loading/error states in components
- **Cross-tab sync**: Use PostMessage API for real-time updates
- **Stale data**: Implement proper cache invalidation strategies

## Error Handling Standards

### User-Facing Errors
- Use `@/components/ui/error-notification.tsx` for consistent error display
- Provide actionable error messages with retry options
- Log detailed errors server-side while showing simplified messages to users

### API Error Responses
```typescript
// Standard error response format
return NextResponse.json(
  { error: 'User-friendly message', details: 'Technical details' },
  { status: 400 }
);
```

### Component Error Boundaries
- Wrap feature components with `<ErrorBoundary>`
- Implement fallback UI for graceful degradation
- Use `useErrorHandling()` hook for consistent error state management

## Critical Verification Points

After any changes, verify these core flows work:
- **Authentication**: Sign-in → Dashboard access → Protected API calls
- **PDF workflow**: Upload → View → Annotate → Save → Cross-tab sync
- **Note workflow**: Create → Edit → Auto-save → Navigation → Persistence
- **Mobile experience**: Touch selection → Annotation dialog → Note editing → Save
- **Auto-save functionality**: Content changes → Debounced save → Status feedback → Error recovery
- **Error recovery**: Network failures → Retry mechanisms → User feedback

## Current Development Context

### Active Features
- **Note System**: Complete frontend with auto-save, needs API endpoints and database schema
- **Rich Text Editor**: Full TipTap integration with NotionEditor, auto-save, and keyboard shortcuts
- **Auto-Save Hook**: `useAutoSave` with debounced saves, status tracking, and error handling

### Common Issues to Check
- **Import Paths**: Ensure all `@/` imports are correct and components exist
- **TypeScript Errors**: Fix implicit `any` types and deprecated API usage
- **RTK Query Usage**: Verify all server communication uses RTK Query mutations/queries instead of direct fetch
- **Auto-Save Architecture**: Ensure editors handle auto-save internally without complex parent callbacks
- **Component Simplification**: Remove unnecessary callback props and complex state management between components
- **Mobile Responsiveness**: Test touch interactions and responsive layouts
- **Error Boundaries**: Ensure proper error handling and recovery mechanisms

## RTK Query Implementation Checklist

When implementing or refactoring API calls:
- ✅ Use `useCreateNoteMutation` instead of direct fetch to `/api/notes`
- ✅ Use `useUpdateNoteMutation` instead of manual PUT requests
- ✅ Use `useGetNotesQuery` for fetching note lists with automatic caching
- ✅ Leverage RTK Query's automatic loading and error states
- ✅ Use `invalidatesTags` for cache synchronization after mutations
- ❌ Avoid direct fetch calls unless absolutely necessary (file uploads, etc.)

## Auto-Save Architecture Checklist

When working with editor components:
- ✅ Auto-save should be handled internally by NotionEditor components
- ✅ Use RTK Query mutations for create/update operations in auto-save
- ✅ Provide simple `onSaveSuccess` callbacks for parent notifications if needed
- ✅ Remove complex `onAutoSave`, `onNoteIdChange` callback props
- ✅ Extract titles automatically from editor content for new notes
- ❌ Avoid passing save functions down from parent components
- ❌ Avoid complex state management between editor and parent for saving
