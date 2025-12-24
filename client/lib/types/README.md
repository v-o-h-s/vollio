# Types Organization

This directory contains all TypeScript type definitions for the Vollio PDF annotation application, organized by subject matter for better maintainability and discoverability.

## File Structure

```
lib/types/
├── README.md                    # This file
├── index.ts                     # Main export file - exports all types
├── api.ts                       # Generic API response types
├── auth.ts                      # Authentication and authorization types
├── dashboard.ts                 # Dashboard UI and data aggregation types
├── database.ts                  # Supabase database schema types
├── document-processing.ts       # Document processing, chunking, and RAG types
├── editor.ts                    # TipTap editor and note types
├── errors.ts                    # Comprehensive error handling types
├── pdf.ts                       # PDF document and annotation types

└── theme.ts                     # Theme system types
```

## Usage

### Importing Types

You can import types in several ways:

```typescript
// Import from main types file (recommended for backward compatibility)
import { PDFDocument, Note } from "@/lib/types";

// Import from specific type modules (recommended for new code)
import { PDFDocument, Annotation } from "@/lib/types/pdf";
import { Note, NotionEditorProps } from "@/lib/types/editor";


// Import from index file (alternative approach)
import { PDFDocument, Note } from "@/lib/types/index";
```

### Backward Compatibility

The main `lib/types.ts` file re-exports all types from the organized modules, ensuring that existing imports continue to work without modification.

## Type Categories

### PDF Types (`pdf.ts`)

- PDF document metadata and storage
- Annotation and highlight structures
- Text selection and coordinate types
- File upload and validation types
- PDF-specific API responses

### Editor Types (`editor.ts`)

- TipTap editor configuration and state
- Note content and management
- Rich text editing interfaces
- Auto-save functionality types



### Document Processing Types (`document-processing.ts`)

- Text extraction and OCR processing
- Document chunking for vector storage
- Search and retrieval interfaces
- Processing status tracking

### Database Types (`database.ts`)

- Supabase schema definitions
- Row, Insert, and Update types for all tables
- Database enums and constraints
- Helper types for easier usage

### Error Types (`errors.ts`)

- Comprehensive error categorization
- Error severity and recovery actions
- User-friendly error messages
- Retry configuration and error boundaries

### API Types (`api.ts`)

- Generic API response wrappers
- Pagination and bulk operation types
- Database and storage operation results

### Authentication Types (`auth.ts`)

- User authentication state
- JWT token validation
- Supabase client authentication

### Dashboard Types (`dashboard.ts`)

- Dashboard data aggregation
- Activity tracking and statistics
- UI state management

### Theme Types (`theme.ts`)

- Light/dark mode system
- Theme provider configuration
- Theme state management

## Best Practices

### When Adding New Types

1. **Choose the Right File**: Add types to the most appropriate subject-based file
2. **Export from Index**: Add new exports to `index.ts` for discoverability
3. **Document Complex Types**: Add JSDoc comments for complex interfaces
4. **Maintain Consistency**: Follow existing naming conventions and patterns

### Import Guidelines

1. **Use Specific Imports**: Import from specific type files when possible for better tree-shaking
2. **Maintain Compatibility**: Keep using main `@/lib/types` imports for existing code
3. **Group Related Imports**: Import related types from the same module together

### Type Naming Conventions

- **Interfaces**: Use PascalCase (e.g., `PDFDocument`, `Annotation`)
- **Types**: Use PascalCase for type aliases (e.g., `HighlightType`)
- **Enums**: Use PascalCase with descriptive names (e.g., `ErrorType`, `ErrorSeverity`)
- **Generic Types**: Use descriptive names (e.g., `APIResponse<T>`, `DatabaseOperationResult<T>`)

## Migration Notes

This organization was created from a single large `types.ts` file to improve:

- **Maintainability**: Easier to find and modify related types
- **Discoverability**: Clear categorization of type definitions
- **Performance**: Better tree-shaking and import optimization
- **Collaboration**: Reduced merge conflicts in type definitions

All existing imports continue to work without modification due to the re-export structure in the main types file.
