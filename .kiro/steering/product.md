---
inclusion: always
---

# Product Context: Noto PDF Annotation App

## Core Product Requirements

**Noto** is a PDF annotation and note-taking application with these essential features:

- **PDF Upload & Viewing**: Users upload PDFs via `/api/pdfs/upload` and view them with Syncfusion PDF Viewer
- **Text Selection & Annotation**: Click-drag text selection creates annotations with coordinate-based positioning
- **Annotation Management**: CRUD operations for annotations via `/api/annotations` endpoint
- **Cross-Document Navigation**: Users can navigate between PDFs and their associated annotations
- **Responsive Interface**: Mobile-first design with touch-friendly annotation interactions

## User Experience Principles

- **Intuitive Annotation Flow**: Select text → Add note → Save annotation (minimal clicks)
- **Visual Feedback**: Highlight annotated text, show tooltips on hover, preview cards for context
- **Seamless Navigation**: Dashboard shows all PDFs and annotations, easy switching between documents
- **Authentication Required**: All features require Clerk authentication, redirect unauthenticated users

## Technical Constraints

- **PDF Rendering**: Must use Syncfusion PDF Viewer component (licensed)
- **Coordinate System**: Annotations tied to PDF page coordinates, not DOM elements
- **State Persistence**: All annotations saved to backend, synced via Redux store
- **Mobile Support**: Touch gestures for text selection, responsive annotation dialogs
- **Performance**: Handle large PDFs efficiently, lazy load annotations

## Feature Boundaries

**In Scope:**

- PDF viewing and text annotation only
- Basic note-taking (text only, no rich formatting)
- User authentication and data persistence
- Cross-tab synchronization of annotations

**Out of Scope:**

- PDF editing or modification
- Collaborative features or sharing
- Advanced formatting or multimedia notes
- Offline functionality

## User Workflow Patterns

1. **New User**: Sign up → Upload PDF → Select text → Create first annotation
2. **Returning User**: Dashboard → Select PDF → Review/add annotations → Navigate between documents
3. **Mobile User**: Touch-select text → Mobile dialog → Save annotation → Continue reading

When implementing features, prioritize these core workflows and ensure they remain smooth and intuitive.
