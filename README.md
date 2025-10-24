# Noto - AI-Powered PDF Annotation Platform

Noto is a modern PDF annotation platform built with Next.js 15 and React 19. It combines enterprise-grade document processing, intelligent PDF annotation tools, and rich text editing to create a comprehensive document management solution.

> **Status**: ✅ **Production Ready** - Complete implementation with advanced PDF annotation system featuring multi-mode highlighting, glassmorphism UI, rich text editing with auto-save, comprehensive theme integration, mobile optimization, and robust error handling. All core systems implemented and tested with enhanced annotation tools and debug infrastructure.

## ✨ Key Features

### 🤖 AI-Powered Intelligence

- **Intelligent Content Analysis**: Advanced document processing with OCR fallback system and semantic text extraction
- **Smart Annotation System**: Context-aware highlighting with coordinate-based positioning and cross-tab synchronization

### 📄 Advanced Document Processing
- **Enterprise-Grade PDF Viewing**: Syncfusion PDF Viewer integration for superior rendering and text extraction
- **OCR Fallback System**: Automatic fallback to node-tesseract-ocr for scanned documents with confidence thresholds
- **Intelligent Text Processing**: Advanced text extraction with layout preservation and metadata retention
- **Multi-Language Support**: Comprehensive language detection and processing for international documents
- **Secure File Management**: Supabase Storage integration with signed URLs and automatic cleanup

### 🎯 Enhanced PDF Annotation System
- **Multi-Mode Highlighting**: Three distinct highlighting modes with color-coded visual feedback
  - 🟡 **Quick Highlight**: Instant highlighting without note creation (yellow)
  - 🟠 **Inline Comment**: Highlighting with hover-based comment display (orange)  
  - 🔵 **Linked Note**: Full note creation with highlight linkage (blue)
- **Advanced Highlight Management**: Complete highlight lifecycle management with HighlightContextMenu and HighlightHoverTrigger
  - **Color Customization**: 8 predefined colors with visual color picker interface
  - **Opacity Control**: Adjustable opacity from 10% to 100% with real-time slider feedback
  - **Highlight Deletion**: Safe highlight removal with confirmation and proper cleanup
  - **Hover Interactions**: Smart hover triggers that appear on highlight mouseover
- **Sophisticated Text Selection**: Advanced coordinate-based positioning with PDF-to-screen conversion and viewport boundary handling
- **Glassmorphism UI Design**: Modern floating header with backdrop blur effects, transparency, and gradient overlays for professional appearance
- **Dynamic Tool Selection**: Context-aware dropdown menus with nested highlighting options and real-time visual indicators
- **Smart Tooltip Adaptation**: AnnotationTooltip dynamically updates based on selected tool and highlighting mode with intelligent content adaptation
- **Focus Mode Integration**: Seamless tool access in both normal and distraction-free focus viewing modes with enhanced "Show Header" button styling
- **Cross-tab Synchronization**: Real-time updates across browser tabs using BroadcastChannel and PostMessage APIs
- **Mobile-Optimized Interface**: Touch-friendly interactions with responsive design and gesture support
- **Enhanced Annotation System**: Proper Syncfusion bounds format handling with {x, y, width, height} coordinates for reliable highlighting
- **Comprehensive Validation**: PDF viewer readiness checks and annotation module availability validation before highlight creation
- **Debug Infrastructure**: Real-time logging, bounds processing validation, and comprehensive test utilities for troubleshooting
- **Portal-Based Rendering**: React Portal usage for proper z-index management and floating component positioning

### ✍️ Notion-Style Editor
- **Block-Based Rich Text Editor**: Complete TipTap integration with floating toolbars, slash commands, and advanced formatting
- **Internal Auto-Save Architecture**: Editor-managed automatic saving using RTK Query with debounced updates and visual feedback
- **Cross-Component Integration**: Seamless integration with PDF annotation workflow and note management system
- **Mobile-Responsive Design**: Touch-optimized editing experience with adaptive UI components
- **Keyboard Shortcuts**: Comprehensive accessibility features with power user shortcuts

### 🎨 User Experience & Design
- **Complete Theme System**: Light/dark mode with system preference detection, persistent storage, and cross-tab synchronization
- **Modern Dashboard**: Collapsible sidebar with theme selection, user profile management, and intuitive navigation
- **Mobile-First Design**: Touch-friendly interactions, responsive layouts, and gesture-based navigation
- **Enhanced File Management**: Grid, list, and compact view modes with advanced filtering, sorting, and search capabilities
- **Visual Feedback System**: Real-time status indicators, loading states, hover previews, and theme-aware styling
- **Accessibility Features**: WCAG compliance, keyboard navigation, screen reader support, and focus management

### 🔒 Security & Performance
- **Enterprise Security**: Clerk authentication with JWT integration and automatic user data isolation via Supabase RLS
- **Comprehensive File Validation**: Security checks, malicious pattern detection, and type/size validation
- **Performance Optimization**: Debounced operations, lazy loading, memoization, and efficient rendering
- **Real-time Activity Tracking**: User activity monitoring with automatic cache invalidation and recent activity display
- **Signed URL Management**: Automatic URL refresh, expiration handling, and secure file access with cleanup

## 📚 Documentation

### Complete Documentation Index

For comprehensive documentation covering all aspects of the Noto application, see the **[Documentation Index](./DOCUMENTATION_INDEX.md)** which provides organized access to all documentation resources.

### Quick Access Documentation

- **[API Documentation](./docs/API_DOCUMENTATION.md)** - Complete API reference with Supabase integration
- **[Project Overview](./docs/PROJECT_OVERVIEW.md)** - Comprehensive project vision and architecture
- **[Project Status](./docs/PROJECT_STATUS.md)** - Current implementation status and progress
- **[Supabase Setup](./docs/SUPABASE_SETUP.md)** - Database and storage configuration guide

### Component & Implementation Guides

- **[PDF Components](./components/pdf/README.md)** - PDF viewer and annotation component suite
- **[Editor Components](./components/editor/README.md)** - Rich text editor and floating toolbar system
- **[Theme Components](./components/theme/README.md)** - Complete theme management system
- **[Store Documentation](./lib/store/README.md)** - Redux state management and RTK Query
- **[Error Handling](./docs/ERROR_HANDLING.md)** - Comprehensive error handling patterns

### Development Guidelines

- **[Technical Guidelines](./.kiro/steering/tech.md)** - Code standards and best practices
- **[Project Structure](./.kiro/steering/structure.md)** - File organization and naming conventions
- **[Product Context](./.kiro/steering/product.md)** - Feature requirements and UX principles

## 🚀 System Architecture

### 🧠 Document Processing Pipeline
- **Advanced Text Extraction**: Syncfusion PDF Viewer integration with OCR fallback for comprehensive document processing
- **Intelligent Annotation System**: Coordinate-based highlighting with real-time synchronization and cross-tab updates
- **Smart Content Analysis**: Automated text processing with layout preservation and metadata extraction
- **Quality Assurance**: Comprehensive validation and error handling with user-friendly recovery mechanisms
- **Performance Optimization**: Efficient rendering, caching, and real-time updates for optimal user experience

### 🏗️ Technical Infrastructure
- **Modern Stack**: Next.js 15 + React 19 with TypeScript strict mode for type safety and performance
- **State Management**: Redux Toolkit with RTK Query for consistent API integration and real-time caching
- **Database**: Supabase with Row Level Security (RLS) for automatic user data isolation and security
- **Authentication**: Clerk integration with JWT-based authentication and seamless user management
- **File Storage**: Supabase Storage with signed URLs, automatic expiration, and comprehensive security validation
- **PDF Processing**: Syncfusion PDF Viewer with enterprise-grade text extraction and coordinate-based annotations

### 🎯 Component Architecture
- **Modular Design**: Feature-based component organization with clean separation of concerns
- **Theme System**: Comprehensive light/dark mode with system preference detection and cross-tab synchronization
- **Mobile Optimization**: Touch-friendly interfaces with responsive design and gesture support
- **Error Handling**: Comprehensive error boundaries with recovery mechanisms and user-friendly messaging
- **Performance**: Lazy loading, memoization, debounced operations, and efficient rendering strategies

### 📊 Production-Ready Features
- **Complete Implementation**: All core PDF annotation and note-taking features fully implemented and tested
- **Scalable Architecture**: Designed for enterprise-scale deployment with performance optimization
- **Security Compliance**: Enterprise-grade security with comprehensive validation and data protection
- **Mobile Excellence**: Touch-optimized interfaces with responsive design and gesture support
- **Real-time Capabilities**: Cross-tab synchronization, live updates, and instant feedback systems

## ⚡ Quick Start

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase project with database and storage configured
- Clerk authentication project
- Syncfusion license key (for PDF viewer)

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd noto
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Environment Setup**

   Copy `.env.local.example` to `.env.local` and configure:

   ```env
   # Supabase Configuration
   PROJECT_URL=https://your-project.supabase.co
   SUPABASE_KEY=your-anon-key

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-publishable-key
   CLERK_SECRET_KEY=your-secret-key

   # Syncfusion License
   SYNCFUSION_LICENSE_KEY=your-license-key
   ```

4. **Database Setup**

   Run the Supabase migrations:

   ```bash
   # Copy contents of supabase/migrations/001_initial_schema.sql
   # to your Supabase SQL editor and execute
   ```

5. **Start Development Server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🏗️ Architecture

### Tech Stack

- **Framework**: Next.js 15 with App Router
- **React**: Version 19 with modern hooks and concurrent features
- **TypeScript**: Strict mode for type safety
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: Redux Toolkit with RTK Query
- **Authentication**: Clerk with JWT integration
- **Database**: Supabase with Row Level Security (RLS)
- **File Storage**: Supabase Storage with signed URLs
- **PDF Rendering**: Syncfusion PDF Viewer (licensed)
- **Document Processing**: Advanced text extraction with OCR fallback system
- **Rich Text Editor**: TipTap with custom extensions for block-based editing
- **Testing**: Vitest with React Testing Library

### Project Structure

```
├── app/                    # Next.js App Router (pages & API routes)
│   ├── api/               # RESTful API endpoints (PDFs, notes)
│   ├── dashboard/         # Main application interface
│   └── sign-in/          # Authentication pages
├── components/            # React component library
│   ├── ui/               # Base UI components (shadcn/ui)
│   ├── pdf/              # PDF viewer & annotation system
│   ├── editor/           # Rich text editor (TipTap-based)

│   ├── theme/            # Theme system components
│   └── dashboard/        # Navigation & layout components
├── lib/                   # Core utilities & configurations
│   ├── services/         # Document processing & AI services
│   ├── store/            # Redux store with RTK Query
│   ├── types/            # TypeScript definitions
│   └── utils/            # Helper functions & utilities
├── hooks/                 # Custom React hooks
├── supabase/             # Database schema & migrations
└── docs/                 # Comprehensive documentation
```

### Key Components

#### 🤖 Document Processing
- **Document Processor**: Syncfusion text extraction with OCR fallback for comprehensive document support
- **Content Analyzer**: Intelligent text processing with layout preservation and metadata extraction
- **File Management**: Secure upload, storage, and retrieval with automatic cleanup and validation

#### 📄 PDF Annotation System
- **PDFAnnotationViewer**: Enterprise PDF viewer with Syncfusion integration and coordinate-based annotations
- **AnnotationTooltip**: Smart text selection interface with PDF-to-screen coordinate conversion
- **NoteCreationModal**: Rich text note creation with TipTap editor integration
- **Cross-tab Sync**: Real-time annotation updates across browser tabs

#### ✍️ Rich Text Editor
- **NotionEditor**: Block-based editor with internal auto-save and RTK Query integration
- **FloatingToolbar Suite**: Context-aware toolbars (basic, advanced, PDF annotation)
- **SlashCommand System**: Notion-style commands for quick formatting and block creation
- **EditorProvider**: State management and cross-component communication



#### 🎨 Theme & UI System
- **ThemeProvider**: Complete light/dark mode with system preference detection
- **Dashboard**: Modern interface with collapsible sidebar and activity tracking
- **Mobile Optimization**: Touch-friendly interactions and responsive design
- **Error Boundaries**: Comprehensive error handling with user-friendly recovery

## 📱 User Experience

### 💻 Desktop Workflow

1. **Document Upload**: Drag-and-drop PDFs with automatic processing and text extraction
2. **PDF Annotation**: Select text to create rich annotations with coordinate-based positioning
3. **Note Management**: Create and edit notes with Notion-style block editor and auto-save
5. **Cross-tab Sync**: Real-time updates across browser tabs with seamless synchronization
6. **Theme Switching**: Toggle between light/dark modes with system preference detection

### 📱 Mobile Workflow

1. **Touch Upload**: Mobile-optimized PDF upload with progress tracking
2. **Touch Annotations**: Long-press text selection with mobile-optimized dialogs
3. **Responsive Editor**: Full-screen rich text editing with gesture support
4. **Mobile Navigation**: Swipe and tap navigation with adaptive UI components

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Testing
npm run test            # Run tests in watch mode
npm run test:run        # Run all tests once
npm run test:ui         # Run tests with UI
npm run test:coverage   # Run tests with coverage

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript checks

# Database
npm run setup:supabase  # Verify Supabase setup
```

### Key Development Files

- **API Routes**: `app/api/` - Complete RESTful API (PDFs, notes)
- **PDF System**: `components/pdf/` - Complete PDF viewer and annotation system
- **Editor System**: `components/editor/` - Rich text editor with auto-save and floating toolbars
- **State Management**: `lib/store/` - Redux store with RTK Query and typed hooks
- **Type System**: `lib/types/` - Comprehensive TypeScript definitions organized by feature
- **Testing Suite**: Comprehensive test coverage with Vitest and React Testing Library

## 🔒 Security

### Authentication & Authorization

- Clerk handles user authentication and session management
- JWT tokens passed to Supabase for Row Level Security
- All API endpoints require authentication
- User data automatically isolated via RLS policies

### File Security

- PDF files validated for type, size, and malicious content
- Files stored in private Supabase Storage buckets
- Time-limited signed URLs for file access
- Filename sanitization and security checks

### Data Protection

- All database operations use parameterized queries
- Input validation on both client and server
- CORS policies configured for API endpoints
- Error messages sanitized to prevent information leakage

## 🧪 Testing

### Test Coverage

- **Unit Tests**: Utility functions, state management, and components
- **Integration Tests**: Component interactions and API endpoints
- **E2E Tests**: Complete user workflows and cross-browser testing
- **Mobile Tests**: Touch interactions and responsive behavior

### Testing Strategy

- Mock external dependencies (Syncfusion, Supabase, Clerk)
- Test user interactions and edge cases
- Performance testing with large datasets
- User experience testing across devices

## 📚 Documentation

### Complete Documentation Index

For comprehensive documentation covering all aspects of the Noto application, see the **[Documentation Index](./DOCUMENTATION_INDEX.md)** which provides organized access to all documentation resources including setup guides, API references, component documentation, and development guidelines.

### Quick Access Documentation

- **[API Documentation](./docs/API_DOCUMENTATION.md)** - Complete API reference with Supabase integration
- **[Project Overview](./docs/PROJECT_OVERVIEW.md)** - Comprehensive project vision and architecture
- **[Project Status](./docs/PROJECT_STATUS.md)** - Current implementation status and progress
- **[Supabase Setup](./docs/SUPABASE_SETUP.md)** - Database and storage configuration guide

### Component & Implementation Guides

- **[PDF Components](./components/pdf/README.md)** - PDF viewer and annotation component suite
- **[Editor Components](./components/editor/README.md)** - Rich text editor and floating toolbar system
- **[Theme Components](./components/theme/README.md)** - Complete theme management system
- **[Store Documentation](./lib/store/README.md)** - Redux state management and RTK Query
- **[Hooks Documentation](./hooks/README.md)** - Custom React hooks library

### Development Guidelines

- **[Technical Guidelines](./.kiro/steering/tech.md)** - Code standards and best practices
- **[Project Structure](./.kiro/steering/structure.md)** - File organization and naming conventions
- **[Product Context](./.kiro/steering/product.md)** - Feature requirements and UX principles

## 🚀 Production Deployment

### ✅ Production Ready Status

Noto is **fully production-ready** with:
- Complete PDF annotation and note-taking implementation
- Enterprise-grade security and performance optimization
- Comprehensive error handling and recovery mechanisms
- Mobile-responsive design with accessibility compliance
- Real-time synchronization and cross-tab updates

### Deployment Options

#### Vercel (Recommended)
```bash
npm run build
vercel --prod
```

#### Docker Deployment
```bash
docker build -t noto-app .
docker run -p 3000:3000 noto-app
```

#### Environment Variables
```env
# Core Services
PROJECT_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-clerk-key
CLERK_SECRET_KEY=your-clerk-secret
SYNCFUSION_LICENSE_KEY=your-syncfusion-license

# Optional: AI Services
OPENAI_API_KEY=your-openai-key
EMBEDDING_MODEL_URL=your-embedding-service
```

## 🤝 Contributing

### Current Development Status

Noto is **feature-complete and production-ready**. Future contributions should focus on:

#### 🎯 Enhancement Areas
- **Performance Optimization**: Advanced caching, virtual scrolling, edge computing
- **Collaboration Features**: Real-time collaborative editing, shared workspaces
- **Enterprise Features**: Team workspaces, advanced permissions, audit logging
- **Accessibility**: Enhanced WCAG compliance and assistive technology support

### Development Guidelines

- **TypeScript**: Strict mode with comprehensive type safety
- **Testing**: Maintain 80%+ test coverage with comprehensive edge case testing
- **Performance**: Consider mobile performance and Core Web Vitals optimization
- **Security**: Follow established security patterns and validation requirements
- **Documentation**: Update documentation for all new features and changes

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## 🆘 Support

For questions, issues, or contributions:

- Check existing [GitHub Issues](./issues)
- Review the [documentation](./docs)
- Contact the development team

---

**Noto** - AI-powered PDF annotation platform. Transforming document interaction through intelligent annotation tools and seamless note-taking workflows.

**Status**: ✅ Production Ready | **Version**: 1.0.0 | **Last Updated**: January 2025
