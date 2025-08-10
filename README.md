# Noto - PDF Annotation Application

Noto is a modern, responsive PDF annotation application built with Next.js 15 and React 19. It allows users to upload PDFs, select text, and create annotations with a seamless experience across desktop and mobile devices.

## ✨ Features

### Core Functionality

- **PDF Upload & Storage**: Secure PDF upload to Supabase Storage with signed URLs
- **Text Selection**: Precise text selection with coordinate-based positioning
- **Annotation Management**: Create, edit, delete, and view annotations with rich metadata
- **Cross-Document Navigation**: Navigate between PDFs and their associated annotations
- **Real-time Sync**: Redux Toolkit with RTK Query for state management and API caching

### User Experience

- **Responsive Design**: Mobile-first design with touch-friendly interactions
- **Keyboard Shortcuts**: Desktop keyboard navigation and shortcuts
- **Visual Feedback**: Annotation highlights, hover previews, and tooltips
- **Authentication**: Secure user authentication with Clerk
- **Error Handling**: Comprehensive error boundaries and user-friendly error messages

### Technical Features

- **Row Level Security**: Automatic user data isolation with Supabase RLS
- **File Validation**: Comprehensive PDF validation with security checks
- **Performance Optimized**: Lazy loading, memoization, and efficient rendering
- **Accessibility**: ARIA labels, keyboard navigation, and screen reader support

## 🚀 Quick Start

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
- **Authentication**: Clerk for user management
- **Database**: Supabase with Row Level Security
- **PDF Rendering**: Syncfusion PDF Viewer (licensed)
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
│   └── note/             # Note-taking components
├── lib/                   # Utilities and configurations
│   ├── store/            # Redux store and slices
│   ├── types/            # TypeScript type definitions
│   └── utils/            # Utility functions
├── hooks/                 # Custom React hooks
├── supabase/             # Database migrations and policies
└── test/                 # Test files and configurations
```

### Key Components

- **PDFAnnotationViewer**: Main PDF viewer with annotation capabilities
- **AnnotationOverlay**: Renders annotation highlights over PDF pages
- **AnnotationTooltip**: Desktop text selection interface
- **MobileAnnotationDialog**: Mobile-optimized annotation creation
- **Dashboard**: PDF management and recent activity display

## 📱 User Experience

### Desktop Workflow

1. Upload PDF via drag-and-drop or file picker
2. PDF loads in Syncfusion viewer with full navigation
3. Select text to show annotation tooltip
4. Create annotation with note content
5. View existing annotations with hover previews
6. Navigate between PDFs from dashboard

### Mobile Workflow

1. Upload PDF with touch-friendly interface
2. PDF displays with mobile-optimized viewer
3. Touch-select text to open annotation dialog
4. Create annotation in full-screen modal
5. Tap existing annotations to view/edit
6. Swipe navigation between documents

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server

# Testing
npm run test:run        # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:ui         # Run tests with UI
npm run test:coverage   # Run tests with coverage

# Code Quality
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript checks
```

### Key Development Files

- **API Routes**: `app/api/pdfs/upload/route.ts` - PDF upload endpoint
- **Store Configuration**: `lib/store/index.ts` - Redux store setup
- **Type Definitions**: `lib/types.ts` - Application-wide types
- **Supabase Client**: `lib/supabaseClient.ts` - Database configuration
- **Test Setup**: `test/setup.ts` - Testing environment configuration

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
- Accessibility testing with screen readers

## 📚 Documentation

### Additional Documentation

- [API Documentation](./API_DOCUMENTATION.md) - Complete API reference
- [Supabase Setup](./SUPABASE_SETUP.md) - Database configuration guide
- [PDF Components](./components/pdf/README.md) - PDF component documentation
- [Store Documentation](./lib/store/README.md) - Redux store guide
- [Test Documentation](./test/README.md) - Testing strategy and coverage

### Implementation Guides

- [Cross-Tab Implementation](./CROSS_TAB_IMPLEMENTATION_SUMMARY.md) - Multi-tab navigation
- [Supabase Backend Spec](./.kiro/specs/supabase-pdf-backend/) - Backend implementation plan

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
- Ensure mobile responsiveness and accessibility compliance

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
