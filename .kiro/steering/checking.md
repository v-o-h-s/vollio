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

### Database Operations
- **RLS violations**: Check user authentication and policy configuration
- **Type mismatches**: Validate database row structure with type guards
- **Connection issues**: Use `getAuthenticatedSupabaseClient()` consistently

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
- **Auto-Save Integration**: Verify debounced saves work correctly with status feedback
- **Mobile Responsiveness**: Test touch interactions and responsive layouts
- **Error Boundaries**: Ensure proper error handling and recovery mechanisms
