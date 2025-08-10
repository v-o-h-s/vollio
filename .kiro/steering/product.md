---
inclusion: always
---

# Product Context: Noto PDF Annotation App

## Core Product Requirements

**Noto** is a PDF annotation and note-taking application with these essential features:

- **PDF Upload & Viewing**: Users upload PDFs via `/api/pdfs/upload` with Supabase Storage integration and view them with Syncfusion PDF Viewer
- **Text Selection & Annotation**: Click-drag text selection creates annotations with coordinate-based positioning
- **Annotation Management**: CRUD operations for annotations stored in Supabase with RLS protection
- **Cross-Document Navigation**: Users can navigate between PDFs and their associated annotations
- **Responsive Interface**: Mobile-first design with touch-friendly annotation interactions
- **Secure File Access**: Time-limited signed URLs for PDF access with automatic cleanup

## User Experience Principles

- **Intuitive Annotation Flow**: Select text → Add note → Save annotation (minimal clicks)
- **Visual Feedback**: Highlight annotated text, show tooltips on hover, preview cards for context
- **Seamless Navigation**: Dashboard shows all PDFs and annotations, easy switching between documents
- **Authentication Required**: All features require Clerk authentication, redirect unauthenticated users

## Technical Constraints

- **PDF Rendering**: Must use Syncfusion PDF Viewer component (licensed)
- **Coordinate System**: Annotations tied to PDF page coordinates, not DOM elements
- **State Persistence**: All annotations saved to Supabase backend, synced via Redux store
- **Mobile Support**: Touch gestures for text selection, responsive annotation dialogs
- **Performance**: Handle large PDFs efficiently, lazy load annotations
- **Security**: Row Level Security (RLS) enabled for automatic user data isolation
- **File Storage**: Supabase Storage with signed URLs for secure file access

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

## Current Implementation Status

### ✅ Completed Features

- **Supabase Integration**: Full backend integration with RLS-enabled database and storage
- **PDF Upload System**: Secure file upload with validation, signed URL generation, and metadata storage
- **User Authentication**: Clerk integration with JWT-based RLS policies and automatic user isolation
- **Database Schema**: Complete schema with PDFs, annotations, and user activity tables
- **File Storage**: Organized user-based storage with automatic cleanup and security policies
- **Error Handling**: Comprehensive error mapping, retry logic, and user-friendly error messages
- **PDF Annotation Interface**: Complete Syncfusion PDF Viewer integration with text selection
- **Annotation Components**: Full suite of annotation UI components (tooltips, dialogs, overlays, previews)
- **Mobile Responsiveness**: Touch-friendly annotation dialogs and responsive design
- **State Management**: Redux Toolkit with RTK Query for API calls and caching
- **Cross-tab Navigation**: PostMessage-based navigation between browser tabs
- **Keyboard Shortcuts**: Desktop keyboard navigation and annotation shortcuts

### 🚧 In Progress

- **API Endpoints**: Completing PDF listing and individual PDF access endpoints
- **Dashboard Integration**: Connecting UI components with Supabase backend APIs
- **RTK Query Integration**: Replacing mock data with real API calls throughout the application

### 📋 Planned Features

- **Advanced Search**: Full-text search across PDFs and annotations
- **Annotation Types**: Support for different annotation types (highlight, note, drawing)
- **Export Functionality**: Export annotations to various formats
- **Collaborative Features**: Real-time multi-user annotation editing (future consideration)
