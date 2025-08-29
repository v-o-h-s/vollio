# Noto Documentation Index

This document provides a comprehensive index of all documentation resources for the Noto PDF annotation application. Use this as your starting point to find specific information about any aspect of the system.

## 📖 Getting Started

### Essential Reading
- **[README.md](./README.md)** - Main project overview, quick start guide, and feature summary
- **[Project Overview](./docs/PROJECT_OVERVIEW.md)** - Comprehensive project vision, architecture, and roadmap
- **[Project Status](./docs/PROJECT_STATUS.md)** - Current implementation status and development progress

### Setup & Installation
- **[Quick Start Guide](./README.md#quick-start)** - Environment setup and installation instructions
- **[Supabase Setup](./docs/SUPABASE_SETUP.md)** - Database configuration and migration guide
- **[Environment Configuration](./README.md#environment-configuration)** - Required environment variables and configuration

## 🏗️ Architecture & Technical Documentation

### System Architecture
- **[Technical Guidelines](./.kiro/steering/tech.md)** - Code standards, patterns, and best practices
- **[Project Structure](./.kiro/steering/structure.md)** - File organization and naming conventions
- **[API Documentation](./docs/API_DOCUMENTATION.md)** - Complete API reference and endpoint documentation

### Core Systems
- **[Error Handling System](./docs/ERROR_HANDLING.md)** - Comprehensive error management architecture
- **[Notes System](./docs/NOTES_SYSTEM.md)** - Complete note-taking system with auto-save functionality
- **[Recent Activity System](./docs/RECENT_ACTIVITY.md)** - Activity tracking and user experience features
- **[Security Enhancements](./SECURITY_ENHANCEMENTS.md)** - Security features and implementation details

## 🧩 Component Documentation

### Theme System ✅ COMPLETED
- **[Theme System Overview](./components/theme/README.md)** - Complete dark/light mode implementation
  - ThemeProvider - Context provider with localStorage persistence and system preference detection
  - ThemeToggle - Multiple variants (button, dropdown, switch) with accessibility support
  - Theme utilities and hooks for consistent theme integration
  - Cross-tab theme synchronization
  - SSR-safe theme initialization
  - WCAG compliant contrast ratios and screen reader support

### PDF System Components
- **[PDF Components Overview](./components/pdf/README.md)** - Complete PDF viewer and annotation system
  - PDFAnnotationViewer - Main PDF viewer with Supabase integration
  - AnnotationOverlay - Interactive annotation highlights
  - AnnotationTooltip - Text selection interface
  - AnnotationPreviewCard - Hover preview functionality
  - FallbackUI - Error state components

### Rich Text Editor System ✅ COMPLETED
- **[Editor Components Overview](./components/editor/README.md)** - Complete Notion-like block-based editor system with theme support
  - NotionEditor - Main block editor with TipTap integration and slash commands
  - EditorProvider - Context provider for editor state and cross-tab synchronization
  - FloatingToolbar - Context-aware formatting toolbar with intelligent positioning
  - AdvancedFloatingToolbar - Feature-rich editing toolbar with color picker
  - PDFAnnotationToolbar - Specialized toolbar for PDF annotation workflows
  - LazyNotionEditor - Performance-optimized wrapper with theme-aware loading states
  - SlashCommand Extension - Notion-style slash commands for quick formatting
  - ImageUpload Extension - Drag-and-drop image upload with Supabase integration
  - EnhancedLink Extension - Advanced link handling with validation
  - KeyboardShortcuts Extension - Essential keyboard shortcuts for efficient editing
  - Cross-tab Synchronization - Real-time updates using BroadcastChannel and PostMessage
  - Note Management System - Complete CRUD operations with rich text content

### UI Components
- **[UI Components](./components/ui/)** - shadcn/ui based component library with comprehensive theme support
  - Button, Dialog, Input, Card, Popover, Separator with dark mode variants
  - Skeleton components with theme-aware styling
  - Enhanced notes list with grid/list/compact views and theme integration
  - Loading states, Error notifications, Keyboard shortcuts help
  - Mobile-responsive and accessible design patterns

### Dashboard & Layout ✅ COMPLETED
- **[Dashboard Components](./components/dashboard/)** - Enhanced PDF and note management interface
  - DashboardSidebar - Collapsible sidebar with theme selection dropdown and user profile management
  - RecentActivityDisplay - User activity tracking and display
  - Theme-integrated navigation and responsive design

## 🔧 Development Resources

### State Management
- **[Redux Store Documentation](./lib/store/README.md)** - Complete state management guide
  - Store configuration with RTK Query
  - Annotation state management
  - API integration patterns
  - Typed hooks and selectors

### Utilities & Helpers
- **[Utility Functions](./lib/utils/)** - Core utility functions and helpers
  - Error handling utilities
  - Supabase integration helpers
  - Activity tracking utilities
  - PDF coordinate calculations
  - Cross-tab synchronization utilities

### Custom Hooks
- **[Custom Hooks](./hooks/)** - React hooks for common functionality
  - Activity tracking hooks
  - Error handling hooks
  - Keyboard shortcuts
  - Mobile detection

## 🧪 Testing Documentation

### Test Strategy & Coverage
- **[Test Documentation](./test/README.md)** - Comprehensive testing strategy and coverage
  - Unit tests for utilities and state management
  - Integration tests for component interactions
  - End-to-end workflow testing
  - Mobile and responsive behavior testing

### Test Files Organization
- **Unit Tests**: `test/utils/`, `test/store/`, `test/hooks/`
- **Component Tests**: `test/components/`
- **Integration Tests**: `test/e2e/`
- **Mobile Tests**: `test/mobile/`
- **Security Tests**: `test/security/`

## 🚀 Deployment & Operations

### Production Deployment
- **[Deployment Guide](./README.md#deployment)** - Production deployment instructions
- **[Environment Variables](./README.md#environment-configuration)** - Required configuration
- **[Performance Considerations](./docs/PROJECT_OVERVIEW.md#performance-characteristics)** - Optimization guidelines

### Database & Storage
- **[Database Schema](./supabase/)** - Complete database structure and migrations
  - Initial schema setup
  - Row Level Security policies
  - Storage bucket configurations
  - Verification scripts

## 📱 User Experience & Design

### Product Requirements
- **[Product Context](./.kiro/steering/product.md)** - Feature requirements and UX principles
- **[User Experience Design](./docs/PROJECT_OVERVIEW.md#user-experience-design)** - Desktop and mobile UX patterns

### User Experience & Mobile
- **[Mobile Responsiveness](./README.md#mobile-experience)** - Mobile-first design principles
- **[User Experience Features](./docs/PROJECT_OVERVIEW.md#user-experience-features)** - Intuitive and user-friendly design

## 🔒 Security Documentation

### Authentication & Authorization
- **[Security Architecture](./docs/PROJECT_OVERVIEW.md#security-architecture)** - Complete security overview
- **[Authentication Flow](./SECURITY_ENHANCEMENTS.md)** - Clerk integration and JWT handling
- **[Row Level Security](./supabase/README.md)** - Database security policies

### File Security
- **[File Upload Security](./docs/API_DOCUMENTATION.md)** - Secure file handling patterns
- **[Storage Security](./SECURITY_ENHANCEMENTS.md)** - Signed URLs and access control

## 🐛 Troubleshooting & Support

### Error Handling
- **[Error Handling Patterns](./docs/ERROR_HANDLING.md)** - Comprehensive error management
- **[Debugging Guide](./.kiro/steering/checking.md)** - Problem resolution and debugging approach
- **[Common Issues](./README.md#troubleshooting)** - Frequently encountered problems and solutions

### Development Support
- **[Contributing Guidelines](./README.md#contributing)** - How to contribute to the project
- **[Code Quality Standards](./README.md#code-style)** - Coding standards and best practices
- **[Git Workflow](./docs/PROJECT_OVERVIEW.md#git-workflow)** - Development process and review guidelines

## 📊 Monitoring & Analytics

### Performance Monitoring
- **[Performance Metrics](./docs/PROJECT_OVERVIEW.md#success-metrics)** - Key performance indicators
- **[Optimization Guidelines](./docs/PROJECT_OVERVIEW.md#performance-characteristics)** - Performance best practices

### User Analytics
- **[Activity Tracking](./docs/RECENT_ACTIVITY.md)** - User behavior monitoring
- **[Usage Patterns](./docs/PROJECT_STATUS.md)** - Feature usage and adoption metrics

## 🔮 Future Development

### Roadmap & Planning
- **[Development Roadmap](./docs/PROJECT_OVERVIEW.md#development-roadmap)** - Future feature planning
- **[Feature Specifications](./.kiro/specs/)** - Detailed feature specifications and implementation plans

### Enhancement Opportunities
- **[Future Enhancements](./components/pdf/README.md#future-enhancements)** - Planned improvements and new features
- **[Performance Improvements](./test/README.md#performance)** - Optimization opportunities

## 📞 Quick Reference

### Key Commands
```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run test            # Run test suite
npm run lint            # Code quality checks

# Database
npm run setup:supabase  # Verify Supabase setup
```

### Important File Locations
- **Main App**: `app/` - Next.js App Router pages and API routes
- **Components**: `components/` - React components organized by feature
- **State Management**: `lib/store/` - Redux store and RTK Query setup
- **Utilities**: `lib/utils/` - Helper functions and utilities
- **Tests**: `test/` - Comprehensive test suite
- **Database**: `supabase/` - Database schema and migrations
- **Configuration**: `.kiro/steering/` - Development guidelines and standards

### Key URLs (Development)
- **Application**: http://localhost:3000
- **Dashboard**: http://localhost:3000/dashboard
- **API Endpoints**: http://localhost:3000/api/*
- **Test UI**: npm run test:ui

## 📝 Documentation Maintenance

### Keeping Documentation Current
- Update component READMEs when adding new features
- Maintain API documentation with endpoint changes
- Update steering files with new patterns and guidelines
- Keep test documentation current with coverage changes

### Documentation Standards
- Use clear, concise language
- Include code examples where helpful
- Maintain consistent formatting and structure
- Link between related documentation sections
- Update version information and timestamps

---

**Last Updated**: January 2025  
**Documentation Version**: 1.0.0  
**Project Version**: 1.0.0

For questions about documentation or to suggest improvements, please refer to the [Contributing Guidelines](./README.md#contributing) or contact the development team.