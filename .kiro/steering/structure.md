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

- **Redux Store**: `lib/store/` with feature slices (`annotationSlice.ts`, `apiSlice.ts`)
- **API Clients**: `lib/api/` for external service interactions
- **Utilities**: Feature-specific in `lib/utils/[feature].ts`, shared in `lib/utils.ts`
- **Types**: Shared in `lib/types.ts`, component-specific inline or co-located

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

- **Pattern**: Export named functions for HTTP methods (GET, POST, PUT, DELETE)
- **Validation**: Use TypeScript interfaces for request/response validation
- **Errors**: Return consistent error format with proper HTTP status codes

## Critical Rules

1. **Never** place components outside their designated directories
2. **Always** use `@/` imports for internal modules
3. **Always** export through `index.ts` files in feature directories
4. **Never** mix UI components with feature components in same directory
5. **Always** use proper TypeScript interfaces for props and API data
