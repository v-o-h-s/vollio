# Noto - Advanced PDF Annotation & Note-Taking Platform

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Backend-green)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)](https://tailwindcss.com/)
[![Production Ready](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)](https://github.com)

**Noto** is a modern, enterprise-grade PDF annotation and note-taking application built with Next.js 15 and React 19. It provides intelligent document processing, sophisticated PDF annotation tools, comprehensive note management with real-time synchronization, and advanced learning features including AI-powered quiz generation and document summarization.

## 🚀 Key Features

### 📄 Advanced PDF Management
- **Enterprise PDF Viewer**: Syncfusion-powered PDF viewer with text selection, zoom, search, and navigation
- **Multi-Mode Highlighting**: Three distinct annotation modes (Quick Highlight, Inline Comment, Linked Note)
- **Intelligent Coordinate System**: Advanced PDF-to-screen coordinate conversion with viewport boundary handling
- **Document Processing**: Syncfusion text extraction with OCR fallback for scanned documents
- **Secure File Storage**: Supabase Storage integration with signed URLs and automatic cleanup
- **Folder Organization**: Hierarchical folder system with drag & drop support for PDF organization

### ✍️ Rich Text Editor System
- **Notion-Style Editor**: TipTap-based block editor with slash commands and floating toolbars
- **Auto-Save Architecture**: Real-time auto-save with RTK Query integration and visual feedback
- **Cross-Tab Synchronization**: Real-time updates using BroadcastChannel and PostMessage APIs
- **Mobile-Optimized**: Touch-friendly editing with responsive design and gesture support
- **Advanced Formatting**: Rich text formatting with image upload, links, and custom extensions

### 🎯 Quiz & Learning Tools
- **Quiz Management Center**: Comprehensive quiz dashboard with filtering and progress tracking
- **AI-Powered Generation**: Generate flashcards and quizzes from PDF content using advanced AI
- **Document Summarization**: AI-powered document summarization with multiple templates and styles
- **Progress Analytics**: Detailed learning analytics with completion rates and performance metrics
- **Flashcard System**: Interactive flashcard creation and study modes with spaced repetition

### 🔗 LMS Integration
- **Google Classroom**: Complete integration with courses, assignments, and student management
- **OAuth Security**: Encrypted token storage with automatic refresh and secure authentication
- **Multi-Platform Support**: Extensible architecture for future LMS platform integrations
- **Real-Time Sync**: Automatic synchronization of course data and assignments

### 🎨 Modern User Experience
- **Glassmorphism UI**: Modern floating navigation with backdrop blur effects and transparency
- **Complete Theme System**: Dark/light mode with system preference detection and cross-tab sync
- **Responsive Design**: Mobile-first approach with touch-optimized interactions and gestures
- **Accessibility**: WCAG-compliant with keyboard navigation and screen reader support
- **Floating Navigation**: Auto-hide navigation dock with context-aware sidebar for quick actions

## 🛠 Tech Stack

### Frontend
- **Framework**: Next.js 15 with App Router
- **UI Library**: React 19 with TypeScript
- **Styling**: Tailwind CSS + shadcn/ui components
- **State Management**: Redux Toolkit with RTK Query
- **Rich Text**: TipTap editor with custom extensions
- **PDF Viewer**: Syncfusion PDF Viewer (licensed)

### Backend & Database
- **Database**: Supabase with Row Level Security (RLS) and optimized indexes
- **Authentication**: Clerk with JWT integration and automatic user isolation
- **File Storage**: Supabase Storage with signed URLs and automatic cleanup
- **API**: Next.js API routes with comprehensive error handling and rate limiting
- **Document Processing**: Syncfusion + node-tesseract-ocr fallback with semantic chunking
- **LMS Integration**: Secure OAuth integration with encrypted token storage

### Development Tools
- **Language**: TypeScript with strict mode
- **Testing**: Vitest + React Testing Library
- **Linting**: ESLint with custom configuration
- **Deployment**: Vercel with automatic deployments

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account and project
- Clerk account for authentication
- Syncfusion license (for PDF viewer)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/noto.git
   cd noto
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   ```
   
   Configure your environment variables:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   
   # Syncfusion License
   SYNCFUSION_LICENSE_KEY=your_syncfusion_license
   
   # Encryption for OAuth tokens
   ENCRYPTION_KEY=your_256_bit_encryption_key
   
   # Google LMS Integration (Optional)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=your_redirect_uri
   
   # AI Services (Optional)
   DEEPSEEK_API_KEY=your_deepseek_api_key
   ```

4. **Database setup**
   ```bash
   # Run Supabase migrations
   npx supabase db reset
   ```

5. **Start development server**
   ```bash
   npm run dev
   ```

Visit `http://localhost:3000` to see the application.

## 📁 Project Structure

```
noto/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── pdfs/                 # PDF management endpoints
│   │   ├── notes/                # Note management endpoints
│   │   ├── highlights/           # Highlight management endpoints
│   │   ├── folders/              # Folder management endpoints
│   │   ├── flashcards/           # Flashcard generation endpoints
│   │   ├── quiz/                 # Quiz generation and management
│   │   ├── summarize/            # Document summarization endpoints
│   │   ├── school-lms/           # LMS integration endpoints
│   │   ├── google/               # Google OAuth endpoints
│   │   └── deepseek/             # AI service endpoints
│   ├── dashboard/                # Main application pages
│   │   ├── pdfs/                 # PDF management interface
│   │   ├── notes/                # Note management interface
│   │   ├── quizzes/              # Quiz management interface
│   │   ├── flashcards/           # Flashcard interface
│   │   ├── summarize/            # Document summarization
│   │   └── school-lms-test/      # LMS integration testing
│   └── (auth)/                   # Authentication pages
├── components/                   # React components
│   ├── ui/                       # Base UI components (shadcn/ui)
│   ├── pdf/                      # PDF-related components
│   ├── editor/                   # Rich text editor components
│   ├── navigation/               # Navigation components
│   ├── dashboard/                # Dashboard components
│   ├── quiz/                     # Quiz components
│   ├── flashcards/               # Flashcard components
│   ├── summarize/                # Summarization components
│   ├── theme/                    # Theme system components
│   ├── landing/                  # Landing page components
│   └── ai/                       # AI service components
├── lib/                          # Utilities and configuration
│   ├── store/                    # Redux store configuration
│   ├── types/                    # TypeScript type definitions
│   ├── utils/                    # Utility functions
│   ├── services/                 # Service layer (AI, OAuth)
│   ├── school-lms/               # LMS integration module
│   └── contexts/                 # React context providers
├── hooks/                        # Custom React hooks
├── supabase/                     # Database migrations and policies
└── docs/                         # Documentation
```

## 🔧 Core Features

### PDF Annotation System
- **Multi-Mode Highlighting**: Quick highlights, inline comments, and linked notes
- **Advanced Coordinate System**: Precise PDF-to-screen coordinate conversion
- **Context Menus**: Rich context menus with color picker and opacity controls
- **Real-Time Sync**: Cross-tab synchronization of annotations

### Rich Text Editor
- **Block-Based Editing**: Notion-style block editor with drag-and-drop
- **Floating Toolbars**: Context-aware formatting toolbars
- **Slash Commands**: Quick formatting with `/` commands
- **Auto-Save**: Debounced auto-save with visual feedback

### Document Processing
- **Text Extraction**: Syncfusion primary extraction with OCR fallback
- **Semantic Chunking**: Intelligent text segmentation for AI processing
- **Multi-Language Support**: Comprehensive language detection and processing
- **Background Processing**: Asynchronous document processing with progress tracking

### Quiz & Learning System
- **Quiz Management**: Comprehensive quiz dashboard with filtering
- **AI Generation**: Generate quizzes and flashcards from PDF content
- **Progress Tracking**: Detailed analytics and performance metrics
- **Document Summarization**: AI-powered summarization with templates

## 🎨 UI/UX Features

### Theme System
- **Dark/Light Mode**: Complete theme support with system preference detection
- **Theme Persistence**: Cross-tab theme synchronization with localStorage
- **Component Theming**: All components support theme switching
- **Custom Properties**: CSS custom properties for consistent theming

### Navigation
- **Floating Navigation**: Glassmorphism-based navigation dock with auto-hide
- **Context Sidebar**: Page-specific quick actions with keyboard shortcuts
- **Breadcrumb Navigation**: Hierarchical navigation for folder structures
- **Mobile Optimization**: Touch-friendly navigation with gesture support

### Responsive Design
- **Mobile-First**: Touch-optimized interfaces with responsive layouts
- **Adaptive Components**: Components that adapt to screen size and device type
- **Touch Gestures**: Swipe, pinch, and tap gesture support
- **Accessibility**: WCAG-compliant with keyboard navigation

## 🔒 Security & Authentication

### Authentication
- **Clerk Integration**: Secure authentication with JWT tokens
- **Row Level Security**: Automatic user data isolation with Supabase RLS
- **Session Management**: Secure session handling with automatic refresh
- **Multi-Factor Auth**: Optional MFA support through Clerk

### Data Security
- **File Validation**: Comprehensive file validation with security checks
- **Signed URLs**: Time-limited access to stored files
- **Input Sanitization**: All user inputs are validated and sanitized
- **CORS Policies**: Proper CORS configuration for API security

## ⚠️ Error Handling & Validation

Noto implements a comprehensive, 8-category error handling system with automatic validation and detailed logging:

### Error Categories

All API endpoints consistently handle errors across 8 categories:

1. **AuthError** - Authentication and authorization failures (401/403)
2. **ValidationError** - Invalid request data with detailed field information (400)
3. **DatabaseError** - Supabase operations with automatic error code mapping (500)
4. **FileError** - File operation failures with context (500)
5. **StorageError** - Cloud storage operation failures (500)
6. **NetworkError** - Network connectivity issues (503)
7. **AIError** - AI service failures (500)
8. **GeneralError** - Unexpected server errors (500)

### Request Validation

All POST/PUT endpoints automatically validate requests using:
- **Zod Schemas**: Type-safe schema validation
- **Automatic Validation**: Middleware wrapper validates before handler execution
- **Detailed Errors**: Field-level error information for client handling
- **Type Safety**: Validated data is fully typed through the handler

### Logging & Debugging

Comprehensive logging with visual indicators:
- **Emoji Indicators**: 📂 folders, 📝 notes, 🔐 auth, ✅ success, ❌ errors
- **Request Tracing**: Full context logging for debugging
- **Error Context**: Detailed context information for support teams
- **Performance Metrics**: Operation timing and performance insights

For detailed information, see [Error Handling Documentation](./docs/ERROR_HANDLING.md).

## 📊 Performance & Optimization

### Frontend Performance
- **Code Splitting**: Automatic code splitting with Next.js
- **Lazy Loading**: Lazy loading of heavy components and routes
- **Image Optimization**: Next.js Image component with optimization
- **Bundle Analysis**: Regular bundle size monitoring and optimization

### Backend Performance
- **Database Indexing**: Optimized database indexes for query performance
- **Caching Strategy**: RTK Query caching with intelligent invalidation
- **File Storage**: Efficient file storage with CDN integration
- **API Rate Limiting**: Rate limiting to prevent abuse

## 🧪 Testing

### Test Coverage
- **Unit Tests**: Comprehensive unit tests for utilities and hooks
- **Component Tests**: React Testing Library tests for components
- **Integration Tests**: End-to-end testing of critical user flows
- **API Tests**: API endpoint testing with mock data

### Testing Commands
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run E2E tests
npm run test:e2e
```

## 📚 Documentation

### Component Documentation
- **Storybook**: Interactive component documentation
- **API Documentation**: Comprehensive API endpoint documentation
- **Type Documentation**: TypeScript interface documentation
- **Usage Examples**: Code examples for common use cases

### Development Guides
- **Contributing Guide**: Guidelines for contributing to the project
- **Architecture Guide**: Detailed architecture documentation
- **Deployment Guide**: Step-by-step deployment instructions
- **Troubleshooting**: Common issues and solutions

## 🚀 Deployment

### Production Deployment
1. **Build the application**
   ```bash
   npm run build
   ```

2. **Deploy to Vercel**
   ```bash
   npx vercel --prod
   ```

3. **Configure environment variables** in Vercel dashboard

4. **Run database migrations** in production environment

### Environment Configuration
- **Development**: Local development with hot reload
- **Staging**: Staging environment for testing
- **Production**: Production environment with optimizations

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

### Code Standards
- **TypeScript**: Strict TypeScript with proper typing
- **ESLint**: Follow ESLint configuration
- **Prettier**: Code formatting with Prettier
- **Conventional Commits**: Use conventional commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

### Getting Help
- **Documentation**: Check the [docs](./docs) directory
- **Issues**: Report bugs on GitHub Issues
- **Discussions**: Join GitHub Discussions for questions
- **Discord**: Join our Discord community

### Common Issues
- **Syncfusion License**: Ensure valid Syncfusion license is configured
- **Database Connection**: Check Supabase configuration and RLS policies
- **Authentication**: Verify Clerk configuration and JWT setup
- **File Upload**: Check file size limits and storage configuration

## 🔮 Roadmap

### Upcoming Features
- **Collaboration**: Real-time collaborative editing
- **Advanced AI**: Enhanced AI-powered features
- **Mobile App**: Native mobile applications
- **Enterprise Features**: Team workspaces and advanced permissions
- **API Integrations**: Third-party service integrations

### Performance Improvements
- **Edge Computing**: Edge deployment for global performance
- **Advanced Caching**: Sophisticated caching strategies
- **Database Optimization**: Query optimization and indexing
- **Bundle Optimization**: Further bundle size reductions

---

**Built with ❤️ by the Noto Team**

For more information, visit our [documentation](./docs) or check out the [live demo](https://noto-demo.vercel.app).