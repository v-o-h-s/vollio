# Project Structure

## Root Directory Organization

```
├── app/                    # Next.js App Router pages and API routes
├── components/             # Reusable React components
├── lib/                   # Utilities, types, and business logic
├── hooks/                 # Custom React hooks
├── public/                # Static assets
└── .kiro/                 # Kiro IDE configuration
```

## App Directory (Next.js App Router)

```
app/
├── api/                   # API route handlers
│   ├── annotations/       # Annotation CRUD operations
│   └── pdfs/             # PDF upload and management
├── dashboard/            # Main application pages
│   ├── layout.tsx        # Dashboard layout with sidebar
│   ├── page.tsx          # Dashboard home
│   ├── pdf-notes/        # PDF annotation interface
│   └── note/             # Individual note management
├── sign-in/              # Clerk authentication pages
├── sign-up/
├── layout.tsx            # Root layout
└── globals.css           # Global styles
```

## Components Organization

```
components/
├── ui/                   # shadcn/ui base components
├── pdf/                  # PDF-specific components
│   ├── PDFAnnotationViewer.tsx    # Main PDF viewer
│   ├── AnnotationOverlay.tsx      # Annotation highlights
│   ├── AnnotationTooltip.tsx      # Hover tooltips
│   └── AnnotationPreviewCard.tsx  # Annotation previews
├── note/                 # Note editing components
└── dashboard-sidebar.tsx # Navigation sidebar
```

## Library Structure

```
lib/
├── store/                # Redux store configuration
│   ├── annotationSlice.ts # Annotation state management
│   ├── apiSlice.ts       # API state management
│   ├── hooks.ts          # Typed Redux hooks
│   └── selectors.ts      # Memoized selectors
├── api/                  # API client functions
├── utils/                # Utility functions
│   └── pdfCoordinates.ts # PDF coordinate calculations
├── types.ts              # TypeScript type definitions
├── mock-db.ts            # In-memory database for prototype
└── utils.ts              # General utilities
```

## Key Conventions

- **File Naming**: Use kebab-case for directories, PascalCase for React components
- **Import Paths**: Use `@/` alias for imports from project root
- **Component Structure**: Each major feature has its own component directory
- **API Routes**: Follow RESTful conventions in `/api` directory
- **State Management**: Centralized in `/lib/store` with feature-based slices
- **Types**: Shared types in `lib/types.ts`, component-specific types inline
- **Styling**: Tailwind classes, component-level CSS modules when needed

## Special Directories

- **`.kiro/`**: Kiro IDE configuration, specs, and steering documents
- **`public/lib/`**: Syncfusion PDF viewer WASM files
- **`.next/`**: Next.js build output (auto-generated)
- **`node_modules/`**: Dependencies (auto-generated)
