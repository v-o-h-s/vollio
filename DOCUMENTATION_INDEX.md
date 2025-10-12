# Noto Documentation Index 📚

Welcome to the comprehensive documentation for Noto, the AI-powered PDF annotation and quiz generation platform. This index provides organized access to all documentation resources, from quick start guides to detailed technical references.

## 🚀 Quick Start

### Essential Getting Started Guides
- **[Main README](./README.md)** - Project overview, features, and quick start guide
- **[Project Overview](./docs/PROJECT_OVERVIEW.md)** - Comprehensive project vision and architecture
- **[Supabase Setup](./docs/SUPABASE_SETUP.md)** - Database and storage configuration guide
- **[Project Status](./docs/PROJECT_STATUS.md)** - Current implementation status and progress

### Installation & Setup
1. **Prerequisites**: Node.js 18+, Supabase project, Clerk authentication, Syncfusion license
2. **Environment Setup**: Configure `.env.local` with required API keys and URLs
3. **Database Setup**: Run Supabase migrations and configure RLS policies
4. **Development Server**: `npm run dev` to start local development

## 🏗️ Architecture & Technical Documentation

### Core System Architecture
- **[Technical Guidelines](./.kiro/steering/tech.md)** - Code standards, patterns, and best practices
- **[Project Structure](./.kiro/steering/structure.md)** - File organization and naming conventions
- **[Product Context](./.kiro/steering/product.md)** - Feature requirements and UX principles
- **[API Documentation](./docs/API_DOCUMENTATION.md)** - Complete API reference with Supabase integration

### Development Guidelines
- **[Error Handling](./docs/ERROR_HANDLING.md)** - Comprehensive error handling patterns and strategies
- **[Recent Activity](./docs/RECENT_ACTIVITY.md)** - Latest development updates and changes

## 🧩 Component Documentation

### PDF System Components
- **[PDF Components](./components/pdf/README.md)** - Complete PDF viewer and annotation system
  - Multi-mode highlighting (Quick, Comment, Note)
  - Glassmorphism UI design and dynamic tool selection
  - Coordinate-based positioning and cross-tab synchronization
  - File management with drag & drop support

### Rich Text Editor System
- **[Editor Components](./components/editor/README.md)** - Notion-like block editor system
  - TipTap-based rich text editing with auto-save
  - Floating toolbars and slash command system
  - Cross-tab synchronization and mobile optimization
  - PDF annotation integration

### AI Quiz Generation System
- **[Quiz Components](./components/quiz/README.md)** - AI-powered quiz generation system
  - RAG-based intelligent quiz creation
  - Multi-document support and content analysis
  - Interactive quiz player with mobile optimization
  - Performance monitoring and quality assurance

### RAG & AI System
- **[RAG Components](./components/rag/README.md)** - Retrieval-augmented generation system
  - Intelligent content retrieval and semantic search
  - Performance monitoring and user feedback collection
  - Advanced search capabilities with relevance scoring

### Theme & UI System
- **[Theme Components](./components/theme/README.md)** - Complete theme management system
  - Dark/light mode with system preference detection
  - Cross-tab synchronization and persistent storage
  - Accessibility features and responsive design

## 🔧 Backend & Services Documentation

### State Management & API Integration
- **[Store Documentation](./lib/store/README.md)** - Redux store and RTK Query integration
- **[Quiz Hooks Documentation](./lib/store/README-quiz-hooks.md)** - Quiz-specific state management

### Backend Services
- **[Services Documentation](./lib/services/README.md)** - Backend services and AI integration
- **[Document Processing](./lib/services/README-chunk-management.md)** - Document processing and chunking
- **[Embedding Service](./lib/services/README-embedding.md)** - Vector embeddings and semantic search
- **[RAG Quiz Generation](./lib/services/README-rag-quiz-generation.md)** - AI-powered quiz generation
- **[Vector Search](./lib/services/README-vector-search.md)** - Advanced vector search capabilities

### Utilities & Helpers
- **[Library Documentation](./lib/README.md)** - Core utilities and configurations
- **[Types Documentation](./lib/types/README.md)** - TypeScript type definitions and interfaces

### Custom Hooks
- **[Hooks Documentation](./hooks/README.md)** - Custom React hooks library
  - Auto-save, error handling, and retry mechanisms
  - Mobile detection, touch gestures, and accessibility
  - Activity tracking, cross-tab sync, and network status
  - Theme management and keyboard shortcuts

## 📱 User Experience & Design

### User Interface Guidelines
- **Mobile-First Design**: Touch-friendly interactions and responsive layouts
- **Accessibility Compliance**: WCAG 2.1 AA compliance with screen reader support
- **Theme Integration**: Complete dark/light mode with system preference detection
- **Performance Optimization**: Lazy loading, memoization, and efficient rendering

### User Workflows
1. **PDF Annotation Workflow**: Upload → View → Annotate → Save → Cross-tab sync
2. **AI Quiz Generation**: Document selection → Processing → Quiz creation → Interactive player
3. **Note Management**: Create → Edit → Auto-save → Cross-component integration
4. **Mobile Experience**: Touch selection → Mobile dialogs → Gesture navigation

## 🧪 Testing & Quality Assurance

### Testing Documentation
- **Unit Tests**: Component logic and utility functions with comprehensive coverage
- **Integration Tests**: API integration and data flow validation
- **E2E Tests**: Complete user workflows and cross-browser compatibility
- **Performance Tests**: Load testing and optimization validation

### Quality Standards
- **Code Coverage**: 80%+ test coverage for critical functionality
- **Performance**: Loading times under 2 seconds for typical operations
- **Accessibility**: WCAG 2.1 AA compliance verification
- **Browser Support**: Modern browsers with ES2020 support

## 🔒 Security & Authentication

### Security Documentation
- **Authentication**: Clerk integration with JWT-based RLS policies
- **Data Protection**: Row Level Security (RLS) for automatic user data isolation
- **File Security**: Comprehensive validation, signed URLs, and malicious pattern detection
- **Input Validation**: Server-side validation and sanitization for all user inputs

### Privacy & Compliance
- **Data Isolation**: Automatic user data separation via Supabase RLS
- **Activity Tracking**: Privacy-compliant user activity monitoring
- **File Storage**: Secure file organization and access control
- **Error Handling**: Sanitized error messages to prevent information leakage

## 🚀 Deployment & Production

### Production Deployment
- **Environment Configuration**: Production environment variables and secrets
- **Database Migrations**: Supabase schema management and version control
- **Performance Optimization**: CDN integration, caching strategies, and monitoring
- **Monitoring & Analytics**: Error tracking, performance monitoring, and user analytics

### Scaling Considerations
- **Horizontal Scaling**: Load balancing and distributed processing
- **Database Optimization**: Query optimization and connection pooling
- **File Storage**: CDN integration and global distribution
- **Performance Monitoring**: Real-time performance tracking and alerting

## 🔮 Future Development

### Planned Enhancements
- **Advanced AI Features**: Enhanced models, personalized learning paths, adaptive difficulty
- **Collaboration Features**: Real-time collaborative editing and shared workspaces
- **Enterprise Features**: Team management, advanced permissions, audit logging
- **Performance Improvements**: Edge computing, advanced caching, WebAssembly integration

### Contributing Guidelines
- **Development Standards**: TypeScript strict mode, comprehensive testing, documentation
- **Code Review Process**: Pull request guidelines, quality checks, performance validation
- **Feature Development**: Design patterns, architecture principles, user experience guidelines

## 📞 Support & Resources

### Getting Help
- **GitHub Issues**: Bug reports, feature requests, and technical questions
- **Documentation Updates**: Contributing to documentation and knowledge base
- **Community Support**: Developer community and knowledge sharing

### Development Resources
- **Code Examples**: Comprehensive usage examples and implementation patterns
- **Best Practices**: Established patterns, performance optimization, security guidelines
- **Troubleshooting**: Common issues, debugging guides, and solution patterns

## 📋 Documentation Status

### Completion Status
- ✅ **Core Documentation**: Complete and up-to-date
- ✅ **Component Documentation**: Comprehensive coverage of all major components
- ✅ **API Documentation**: Complete REST API reference with examples
- ✅ **Development Guidelines**: Established patterns and best practices
- ✅ **User Guides**: Complete user workflows and feature documentation

### Recent Updates
- **December 2025**: Comprehensive steering files and documentation update
  - **Advanced Highlight Management**: HighlightContextMenu and HighlightHoverTrigger integration
  - **Supabase Helpers**: Complete documentation of database utility functions
  - **Technical Guidelines**: Updated with latest highlight management patterns
- **January 2025**: Complete documentation refresh and reorganization
- **Component READMEs**: Updated all component documentation with current features
- **API Reference**: Enhanced API documentation with comprehensive examples
- **Development Guidelines**: Updated technical guidelines and best practices

---

## 🗺️ Navigation Quick Reference

### By Role
- **Developers**: [Tech Guidelines](./.kiro/steering/tech.md) → [API Docs](./docs/API_DOCUMENTATION.md) → [Component Docs](./components/)
- **Designers**: [Product Context](./.kiro/steering/product.md) → [Theme System](./components/theme/README.md) → [UI Components](./components/ui/)
- **Product Managers**: [Project Overview](./docs/PROJECT_OVERVIEW.md) → [Project Status](./docs/PROJECT_STATUS.md) → [Feature Documentation](./components/)
- **DevOps**: [Supabase Setup](./docs/SUPABASE_SETUP.md) → [API Documentation](./docs/API_DOCUMENTATION.md) → [Error Handling](./docs/ERROR_HANDLING.md)

### By Feature
- **PDF Annotation**: [PDF Components](./components/pdf/README.md) → [Editor Components](./components/editor/README.md)
- **AI Quiz Generation**: [Quiz Components](./components/quiz/README.md) → [RAG Components](./components/rag/README.md) → [Services](./lib/services/README.md)
- **Theme System**: [Theme Components](./components/theme/README.md) → [Hooks](./hooks/README.md)
- **State Management**: [Store Documentation](./lib/store/README.md) → [API Integration](./docs/API_DOCUMENTATION.md)

### By Development Phase
- **Setup**: [README](./README.md) → [Supabase Setup](./docs/SUPABASE_SETUP.md) → [Tech Guidelines](./.kiro/steering/tech.md)
- **Development**: [Structure Guidelines](./.kiro/steering/structure.md) → [Component Docs](./components/) → [Hooks](./hooks/README.md)
- **Testing**: [Error Handling](./docs/ERROR_HANDLING.md) → [Testing Guidelines](./.kiro/steering/tech.md#testing-standards)
- **Deployment**: [API Documentation](./docs/API_DOCUMENTATION.md) → [Production Guidelines](./README.md#production-deployment)

---

**Last Updated**: January 2025  
**Documentation Version**: 1.0.0  
**Project Status**: ✅ Production Ready

For the most current information, always refer to the individual documentation files as they are updated more frequently than this index.