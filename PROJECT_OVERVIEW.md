# Noto PDF Annotation Application - Project Overview

## 🎯 Project Vision

Noto is a modern, secure, and responsive PDF annotation application that enables users to upload PDFs, select text, and create rich annotations with seamless cross-device functionality. Built with cutting-edge web technologies, it provides an intuitive annotation experience while maintaining enterprise-grade security and performance.

## 📊 Current Project Status

### ✅ Completed Features (Production Ready)

#### Backend Infrastructure

- **Supabase Integration**: Complete database schema with Row Level Security (RLS) and JWT integration
- **File Storage**: Secure PDF storage with user-organized paths, signed URLs, and automatic cleanup
- **Authentication**: Clerk integration with JWT-based RLS policies for automatic user data isolation
- **API Endpoints**: Complete PDF upload, listing, and individual access endpoints with comprehensive error handling
- **Database Operations**: Full CRUD operations with retry logic, error mapping, and activity tracking
- **Security**: File validation, malicious pattern detection, rate limiting, and user isolation

#### Frontend Components

- **PDF Viewer**: Complete Syncfusion PDF Viewer integration with Supabase backend and activity tracking
- **Annotation System**: Full suite of annotation components (tooltips, dialogs, overlays, previews)
- **Mobile Support**: Touch-friendly interfaces with responsive design and proper touch targets
- **State Management**: Redux Toolkit with RTK Query for API calls, caching, and real-time updates
- **Cross-tab Communication**: PostMessage-based navigation between browser tabs
- **Error Handling**: Comprehensive error boundaries with recovery mechanisms and user guidance
- **Dashboard**: PDF management interface with recent activity display and file operations

#### Security & Performance

- **File Validation**: Comprehensive PDF validation with security checks and malicious pattern detection
- **Error Handling**: User-friendly error boundaries, retry mechanisms, and graceful error recovery
- **Performance Optimization**: Memoization, lazy loading, efficient rendering, and debounced operations
- **Accessibility**: ARIA labels, keyboard navigation, screen reader support, and semantic HTML
- **Signed URL Management**: Automatic URL refresh, expiration handling, and secure file access

### 🚧 In Progress (Near Completion)

#### API Development

- **PDF Listing Endpoint**: `/api/pdfs` for fetching user's uploaded PDFs
- **Individual PDF Access**: `/api/pdfs/[id]` for specific PDF retrieval
- **Dashboard Integration**: Connecting UI components with Supabase backend

#### Data Integration

- **RTK Query Migration**: Replacing mock data with real API calls
- **Real-time Updates**: Live annotation synchronization across components
- **Activity Tracking**: User interaction logging and recent activity display

### 📋 Planned Features (Next Phase)

#### Advanced Functionality

- **Search System**: Full-text search across PDFs and annotations
- **Annotation Types**: Support for highlights, drawings, and rich media
- **Export Features**: PDF export with annotations, various format support
- **Collaborative Editing**: Real-time multi-user annotation capabilities

## 🏗️ Technical Architecture

### Technology Stack

```
Frontend:
├── Next.js 15 (App Router)
├── React 19 (Concurrent Features)
├── TypeScript (Strict Mode)
├── Tailwind CSS + shadcn/ui
├── Redux Toolkit + RTK Query
├── Syncfusion PDF Viewer
└── Clerk Authentication

Backend:
├── Supabase (Database + Storage)
├── Row Level Security (RLS)
├── JWT Authentication
├── Signed URLs for File Access
└── Comprehensive Error Handling

Testing:
├── Vitest (Unit Testing)
├── React Testing Library
├── E2E Testing Framework
└── Mobile Testing Suite
```

### Project Structure

```
noto-pdf-annotation/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints
│   │   ├── pdfs/         # PDF management
│   │   └── annotations/  # Annotation CRUD
│   ├── dashboard/        # Main application pages
│   └── sign-in/         # Authentication
├── components/           # React components
│   ├── ui/              # shadcn/ui components
│   ├── pdf/             # PDF-specific components
│   └── note/            # Note-taking components
├── lib/                 # Core utilities
│   ├── store/          # Redux store configuration
│   ├── types/          # TypeScript definitions
│   └── utils/          # Helper functions
├── hooks/              # Custom React hooks
├── supabase/          # Database schema & migrations
├── test/              # Comprehensive test suite
└── .kiro/             # Development configuration
    ├── specs/         # Feature specifications
    └── steering/      # Development guidelines
```

## 🔒 Security Architecture

### Authentication Flow

1. **User Authentication**: Clerk handles sign-up/sign-in with secure session management
2. **JWT Generation**: Clerk generates JWT tokens with user identity
3. **RLS Integration**: Supabase extracts user ID from JWT for automatic data isolation
4. **API Security**: All endpoints validate authentication before processing

### Data Protection

- **Row Level Security**: Automatic user data isolation at database level
- **File Validation**: Comprehensive PDF validation with malicious content detection
- **Signed URLs**: Time-limited file access with automatic expiration
- **Input Sanitization**: All user inputs validated and sanitized
- **Error Handling**: Sanitized error messages prevent information leakage

### Storage Security

- **User-Organized Paths**: Files stored in user-specific directories
- **Private Buckets**: All storage buckets configured as private
- **Access Control**: File access only through authenticated signed URLs
- **Cleanup Mechanisms**: Automatic cleanup of failed uploads and orphaned files

## 📱 User Experience Design

### Desktop Experience

- **Precision Interactions**: Pixel-perfect text selection and annotation
- **Keyboard Navigation**: Complete keyboard accessibility with shortcuts
- **Multi-Window Support**: Cross-tab communication for seamless workflow
- **Hover Interfaces**: Tooltip-based annotation creation and previews

### Mobile Experience

- **Touch-Optimized**: Minimum 44px touch targets throughout
- **Full-Screen Dialogs**: Mobile-specific annotation creation interface
- **Gesture Support**: Touch-based PDF navigation and text selection
- **Responsive Design**: Adaptive layouts for various screen sizes

### Accessibility Features

- **Screen Reader Support**: Comprehensive ARIA labels and descriptions
- **Keyboard Navigation**: Complete keyboard-only operation capability
- **High Contrast Support**: Accessible color schemes and contrast ratios
- **Focus Management**: Proper focus handling for complex interactions

## 🚀 Performance Characteristics

### Frontend Performance

- **Component Optimization**: React.memo and useMemo for expensive operations
- **Lazy Loading**: Components and resources loaded on demand
- **Efficient Rendering**: Optimized PDF viewer with viewport management
- **State Management**: RTK Query caching reduces unnecessary API calls

### Backend Performance

- **Database Optimization**: Indexed queries and efficient schema design
- **File Storage**: CDN-backed storage with global distribution
- **Caching Strategy**: Multi-level caching for frequently accessed data
- **Error Recovery**: Retry logic with exponential backoff for resilience

### Mobile Performance

- **Memory Management**: Efficient handling of large PDF files on mobile
- **Network Awareness**: Adaptive loading based on connection quality
- **Battery Optimization**: Reduced animations and efficient rendering
- **Touch Response**: Optimized touch event handling for smooth interactions

## 🧪 Quality Assurance

### Testing Strategy

- **Unit Tests**: 90%+ coverage for utility functions and state management
- **Integration Tests**: Component interaction and API endpoint testing
- **E2E Tests**: Complete user workflow validation across browsers
- **Mobile Testing**: Touch interaction and responsive behavior validation

### Code Quality

- **TypeScript Strict Mode**: Comprehensive type safety throughout
- **ESLint Configuration**: Consistent code style and quality rules
- **Prettier Integration**: Automated code formatting
- **Git Hooks**: Pre-commit validation and testing

### Performance Monitoring

- **Bundle Analysis**: Regular bundle size monitoring and optimization
- **Performance Metrics**: Core Web Vitals tracking and improvement
- **Error Tracking**: Comprehensive error logging and monitoring
- **User Analytics**: Usage patterns and performance insights

## 📈 Development Roadmap

### Phase 1: Core Completion (Current)

- **Timeline**: 2-3 weeks
- **Focus**: Complete API endpoints and dashboard integration
- **Deliverables**: Fully functional PDF upload, annotation, and viewing system

### Phase 2: Advanced Features (Next)

- **Timeline**: 4-6 weeks
- **Focus**: Search, export, and enhanced annotation types
- **Deliverables**: Production-ready application with advanced features

### Phase 3: Collaboration & Scale (Future)

- **Timeline**: 8-12 weeks
- **Focus**: Multi-user features and enterprise capabilities
- **Deliverables**: Collaborative annotation platform with team features

## 🔧 Development Environment

### Setup Requirements

- **Node.js**: Version 18+ with npm/yarn/pnpm
- **Supabase**: Project with database and storage configured
- **Clerk**: Authentication project with JWT template
- **Syncfusion**: Valid license key for PDF viewer component

### Development Tools

- **IDE**: VS Code with recommended extensions
- **Database**: Supabase Studio for database management
- **Testing**: Vitest with UI for interactive testing
- **Deployment**: Vercel for seamless Next.js deployment

### Environment Configuration

```env
# Core Services
PROJECT_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your-publishable-key
CLERK_SECRET_KEY=your-secret-key
SYNCFUSION_LICENSE_KEY=your-license-key

# Optional Services
VERCEL_URL=your-deployment-url
ANALYTICS_ID=your-analytics-id
```

## 📚 Documentation Ecosystem

### Technical Documentation

- **[README.md](./README.md)**: Main project documentation and quick start
- **[API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**: Complete API reference
- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)**: Database configuration guide

### Component Documentation

- **[PDF Components](./components/pdf/README.md)**: PDF viewer and annotation components
- **[Store Documentation](./lib/store/README.md)**: Redux state management guide
- **[Test Documentation](./test/README.md)**: Testing strategy and coverage

### Implementation Guides

- **[Cross-Tab Implementation](./CROSS_TAB_IMPLEMENTATION_SUMMARY.md)**: Multi-tab navigation
- **[Supabase Backend Spec](./.kiro/specs/supabase-pdf-backend/)**: Backend implementation plan

### Development Guidelines

- **[Technical Guidelines](./.kiro/steering/tech.md)**: Code standards and patterns
- **[Project Structure](./.kiro/steering/structure.md)**: File organization rules
- **[Product Context](./.kiro/steering/product.md)**: Feature requirements and UX principles

## 🤝 Contributing Guidelines

### Code Standards

- **TypeScript**: Strict mode compliance required
- **Testing**: New features must include comprehensive tests
- **Documentation**: Update relevant documentation with changes
- **Accessibility**: Ensure WCAG 2.1 AA compliance for UI changes

### Development Process

1. **Feature Planning**: Create specification in `.kiro/specs/`
2. **Implementation**: Follow established patterns and guidelines
3. **Testing**: Write unit, integration, and E2E tests
4. **Documentation**: Update relevant README files
5. **Review**: Code review focusing on security and performance

### Git Workflow

- **Branches**: Feature branches from main with descriptive names
- **Commits**: Semantic commit messages with clear descriptions
- **Pull Requests**: Comprehensive descriptions with testing notes
- **Reviews**: Required reviews focusing on security and UX

## 🎯 Success Metrics

### User Experience Metrics

- **Upload Success Rate**: >99% successful PDF uploads
- **Annotation Creation Time**: <3 seconds from text selection to save
- **Mobile Responsiveness**: <300ms touch response time
- **Cross-Device Sync**: <1 second synchronization across tabs

### Technical Performance Metrics

- **Page Load Time**: <2 seconds for initial load
- **PDF Rendering**: <5 seconds for documents up to 50MB
- **API Response Time**: <500ms for all CRUD operations
- **Error Rate**: <1% for all user-facing operations

### Security & Reliability Metrics

- **Authentication Success**: >99.9% successful authentication attempts
- **Data Isolation**: 100% user data isolation via RLS
- **File Security**: 0 security incidents with uploaded files
- **Uptime**: >99.9% application availability

---

## 🚀 Getting Started

Ready to contribute to Noto? Start with our [Quick Start Guide](./README.md#quick-start) and explore the comprehensive documentation ecosystem. Whether you're setting up the development environment, implementing new features, or improving existing functionality, our documentation provides the guidance you need.

**Key Resources:**

- **Setup**: [README.md](./README.md) for installation and configuration
- **Architecture**: This document for overall project understanding
- **API**: [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for endpoint details
- **Components**: [Component READMEs](./components/) for UI implementation
- **Testing**: [Test Documentation](./test/README.md) for quality assurance

Welcome to the Noto development team! 🎉

---

_Last Updated: January 2025_
_Project Version: 1.0.0_
_Documentation Version: 1.0.0_
