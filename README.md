# Noto - PDF Annotation Application

Noto is a modern, secure PDF annotation application built with Next.js 15 and React 19. It enables users to upload PDFs, select text, and create rich annotations with seamless cross-device functionality, enterprise-grade security, and comprehensive theme support.

> **Status**: Production-ready core features with PDF viewing, text selection, annotation creation, rich text editing, and complete dark/light theme system. Full backend integration with Supabase, comprehensive error handling, and mobile-responsive design implemented.

## ✨ Features

### Core Functionality

- **Secure PDF Upload & Storage**: Complete Supabase Storage integration with comprehensive file validation, signed URLs, and automatic expiration handling
- **Advanced PDF Viewer**: Full Syncfusion PDF Viewer integration with text selection, zoom, search, navigation, and coordinate-based positioning
- **Notion-like Rich Text Editor**: Complete TipTap-based block editor with floating toolbars, slash commands, advanced formatting, cross-tab synchronization, and seamless PDF annotation integration
- **Intelligent Text Selection**: Precise coordinate calculation for desktop tooltips and mobile-optimized annotation dialogs
- **Real-time Activity Tracking**: Debounced user activity monitoring with automatic cache invalidation and recent activity display
- **Cross-Document Navigation**: Seamless navigation between PDFs, annotations, and notes with cross-tab communication via PostMessage API and BroadcastChannel
- **Note Management System**: Complete note creation, editing, and management with rich text content, PDF linking, and real-time synchronization
- **Comprehensive Error Handling**: Retry mechanisms, fallback UI components, and graceful error recovery
- **Complete Theme System**: Light/dark mode support with system preference detection, persistent storage, and theme-aware skeleton loading states

### User Experience

- **Responsive Design**: Mobile-first design with touch-friendly interactions and adaptive UI components
- **Modern Dashboard**: Collapsible sidebar with theme selection, user profile management, and intuitive navigation
- **Enhanced Notes Interface**: Grid, list, and compact view modes with advanced filtering, sorting, and search capabilities
- **Theme Support**: Comprehensive dark/light mode implementation with custom theme toggle in dashboard sidebar
- **Keyboard Shortcuts**: Desktop keyboard shortcuts for efficient workflow
- **Visual Feedback**: Annotation highlights, hover previews, tooltips, and loading states with theme-aware styling
- **Authentication**: Secure user authentication with Clerk and JWT-based RLS
- **Error Handling**: Comprehensive error boundaries, retry mechanisms, and user-friendly error messages
- **Real-time Updates**: Automatic signed URL refresh and activity synchronization

### Technical Features

- **Row Level Security**: Automatic user data isolation with Supabase RLS policies
- **File Validation**: Comprehensive PDF validation with security checks and malicious pattern detection
- **Performance Optimized**: Debounced activity tracking, lazy loading, memoization, and efficient rendering
- **User Experience**: Intuitive interfaces and efficient workflows
- **Signed URL Management**: Automatic URL refresh, expiration handling, and secure file access

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
- **[Store Documentation](./lib/store/README.md)** - Redux state management and RTK Query
- **[Test Documentation](./test/README.md)** - Testing strategy and comprehensive coverage
- **[Error Handling](./docs/ERROR_HANDLING.md)** - Comprehensive error handling patterns

### Development Guidelines

- **[Technical Guidelines](./.kiro/steering/tech.md)** - Code standards and best practices
- **[Project Structure](./.kiro/steering/structure.md)** - File organization and naming conventions
- **[Product Context](./.kiro/steering/product.md)** - Feature requirements and UX principles

## 🆕 Recent Major Improvements

### Complete Theme System
- **Dark/Light Mode**: Full theme support with system preference detection
- **Custom Theme Toggle**: Integrated theme selection in dashboard sidebar dropdown
- **Theme-Aware Components**: All UI elements including loading skeletons adapt to current theme
- **Cross-tab Synchronization**: Theme changes synchronized across all open browser tabs

### Enhanced Dashboard Experience  
- **Collapsible Sidebar**: Modern sidebar design with user profile management
- **Advanced Notes Interface**: Grid, list, and compact view modes with filtering and search
- **Mobile-First Design**: Optimized touch interactions and responsive layouts
- **Performance Optimized**: Theme-aware skeleton loading states and smooth animations

### Improved Note Management
- **Multiple View Modes**: Choose between grid, list, or compact display formats
- **Advanced Filtering**: Filter by linked PDFs, recent activity, word count, and content status
- **Real-time Search**: Instant search across note titles and content
- **Rich Editor Integration**: Complete TipTap editor with auto-save and theme support

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
- **Rich Text Editor**: TipTap with custom extensions for block-based editing
- **Testing**: Vitest with React Testing Library

### Project Structure

```
├── app/                    # Next.js App Router pages and API routes
│   ├── api/               # API endpoints (PDFs, annotations)
│   ├── dashboard/         # Dashboard pages and layouts
│   └── sign-in/          # Authentication pages
├── components/            # React components
│   ├── ui/               # shadcn/ui components
│   ├── pdf/              # PDF-related components
│   ├── editor/           # Notion-like rich text editor components
│   └── dashboard/        # Dashboard and navigation components
├── lib/                   # Utilities and configurations
│   ├── store/            # Redux store and slices
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── hooks/                 # Custom React hooks
├── supabase/             # Database migrations and policies
└── test/                 # Test files and configurations
```

### Key Components

#### PDF System
- **PDFAnnotationViewer**: Main PDF viewer with Syncfusion integration, Supabase URL handling, and activity tracking
- **AnnotationOverlay**: Renders interactive annotation highlights with hover states and click handling
- **AnnotationTooltip**: Text selection interface with smart positioning
- **AnnotationPreviewCard**: Hover preview cards with annotation content and edit/delete actions

#### Notion-like Editor System
- **NotionEditor**: Complete block-based rich text editor with TipTap integration
- **EditorProvider**: Context provider for editor state management and cross-component communication
- **FloatingToolbar Suite**: Multiple toolbar variants (basic, advanced, PDF annotation) with intelligent positioning
- **SlashCommand Extension**: Notion-style slash commands for quick block creation and formatting
- **ImageUpload Extension**: Drag-and-drop image upload with Supabase storage integration
- **EnhancedLink Extension**: Advanced link handling with validation and auto-detection
- **KeyboardShortcuts Extension**: Essential keyboard shortcuts for efficient editing
- **LazyNotionEditor**: Performance-optimized wrapper with lazy loading and skeleton states

#### Note Management System
- **Note Creation/Editing Pages**: Complete CRUD interface for note management with rich text editing
- **NoteCard**: Optimized note display component with preview and metadata
- **NoteSkeleton**: Loading states and skeleton UI for better perceived performance
- **Cross-tab Synchronization**: Real-time note updates across browser tabs using BroadcastChannel and PostMessage

#### Core Infrastructure
- **Activity Tracking System**: Real-time user activity monitoring with debounced tracking
- **Dashboard**: PDF and note management with recent activity display and signed URL integration
- **Error Boundaries**: Comprehensive error handling with recovery mechanisms and user-friendly messages
- **Toast Notification System**: User feedback for all operations with contextual messages

## 📱 User Experience

### Desktop Workflow

1. **PDF Management**: Upload PDF via drag-and-drop or file picker
2. **PDF Viewing**: PDF loads in Syncfusion viewer with full navigation and search
3. **Text Annotation**: Select text to show annotation tooltip with rich text editor
4. **Note Creation**: Create standalone notes with Notion-like block editor
5. **Rich Text Editing**: Use slash commands, floating toolbars, and keyboard shortcuts
6. **Cross-tab Sync**: Real-time updates across browser tabs and windows
7. **Navigation**: Seamless switching between PDFs, annotations, and notes

### Mobile Workflow

1. **Touch-friendly Upload**: Upload PDF with mobile-optimized interface
2. **Mobile PDF Viewer**: PDF displays with touch gestures and zoom controls
3. **Touch Text Selection**: Long-press text to open annotation dialog
4. **Mobile Editor**: Full-screen rich text editor with touch-optimized controls
5. **Gesture Navigation**: Swipe and tap navigation between documents and notes
6. **Responsive Design**: Adaptive UI that works seamlessly across all screen sizes

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

- **API Routes**: `app/api/pdfs/` - PDF upload, listing, and individual access endpoints
- **PDF Viewer**: `components/pdf/PDFAnnotationViewer.tsx` - Main PDF viewer with Supabase integration
- **Store Configuration**: `lib/store/index.ts` - Redux store with RTK Query setup
- **Type Definitions**: `lib/types.ts` - Application-wide types including Supabase response types
- **Supabase Client**: `lib/supabaseClient.ts` - Database configuration with RLS
- **Activity Tracking**: `lib/utils/activity-tracking.ts` - User activity monitoring utilities
- **Error Handling**: `lib/utils/error-handling.ts` - Comprehensive error management
- **Test Setup**: `test/setup.ts` - Testing environment with comprehensive mocks

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

For comprehensive documentation covering all aspects of the Noto application, see the **[Documentation Index](./DOCUMENTATION_INDEX.md)** which provides organized access to all documentation resources.

### Quick Access Documentation

- **[API Documentation](./docs/API_DOCUMENTATION.md)** - Complete API reference with Supabase integration
- **[Project Overview](./docs/PROJECT_OVERVIEW.md)** - Comprehensive project vision and architecture
- **[Project Status](./docs/PROJECT_STATUS.md)** - Current implementation status and progress
- **[Supabase Setup](./docs/SUPABASE_SETUP.md)** - Database and storage configuration guide

### Component & Implementation Guides

- **[PDF Components](./components/pdf/README.md)** - PDF viewer and annotation component suite
- **[Store Documentation](./lib/store/README.md)** - Redux state management and RTK Query
- **[Test Documentation](./test/README.md)** - Testing strategy and comprehensive coverage
- **[Error Handling](./docs/ERROR_HANDLING.md)** - Comprehensive error handling patterns

### Development Guidelines

- **[Technical Guidelines](./.kiro/steering/tech.md)** - Code standards and best practices
- **[Project Structure](./.kiro/steering/structure.md)** - File organization and naming conventions
- **[Product Context](./.kiro/steering/product.md)** - Feature requirements and UX principles

## 🚀 Deployment

### Production Deployment

1. **Build the application**

   ```bash
   npm run build
   ```

2. **Configure environment variables** in your deployment platform

3. **Deploy to Vercel** (recommended)
   ```bash
   vercel --prod
   ```

### Environment Configuration

Ensure all environment variables are configured in production:

- Supabase project URL and keys
- Clerk authentication keys
- Syncfusion license key
- Any additional API keys or configuration

## 🤝 Contributing

### Development Guidelines

- Follow TypeScript strict mode requirements
- Use Tailwind CSS for styling with shadcn/ui components
- Write tests for new features and bug fixes
- Follow the established project structure and naming conventions
- Ensure mobile responsiveness and intuitive user experience

### Code Style

- Use Prettier for code formatting
- Follow ESLint rules for code quality
- Use semantic commit messages
- Write comprehensive JSDoc comments for complex functions

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.

## 🆘 Support

For questions, issues, or contributions:

- Check existing [GitHub Issues](./issues)
- Review the [documentation](./docs)
- Contact the development team

---

**Noto** - Making PDF annotation simple, secure, and accessible across all devices.
