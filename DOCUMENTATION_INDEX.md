# Noto PDF Annotation App - Documentation Index

Welcome to the comprehensive documentation for the Noto PDF annotation application. This index provides quick access to all documentation resources organized by topic and audience.

## 📚 Quick Start Documentation

### For New Developers

- **[README.md](./README.md)** - Main project overview, setup instructions, and quick start guide
- **[Project Overview](./docs/PROJECT_OVERVIEW.md)** - Comprehensive project vision, architecture, and roadmap
- **[Project Status](./docs/PROJECT_STATUS.md)** - Current implementation status and development progress

### For API Integration

- **[API Documentation](./docs/API_DOCUMENTATION.md)** - Complete API reference with Supabase integration details
- **[Supabase Setup](./docs/SUPABASE_SETUP.md)** - Database and storage configuration guide

### System Architecture

- **[Error Handling System](./docs/ERROR_HANDLING.md)** - Comprehensive error management architecture and patterns
- **[Recent Activity System](./docs/RECENT_ACTIVITY.md)** - Activity tracking, user experience, and resume functionality

## 🏗️ Architecture Documentation

### System Design

- **[Technical Guidelines](./.kiro/steering/tech.md)** - Code standards, patterns, and best practices
- **[Project Structure](./.kiro/steering/structure.md)** - File organization and naming conventions
- **[Product Context](./.kiro/steering/product.md)** - Feature requirements and UX principles

### Implementation Guides

- **[Cross-Tab Implementation](./CROSS_TAB_IMPLEMENTATION_SUMMARY.md)** - Multi-tab navigation system
- **[Supabase Backend Spec](./.kiro/specs/supabase-pdf-backend/)** - Backend implementation plan and tasks (mostly complete)
- **[Implementation Tasks](./.kiro/specs/supabase-pdf-backend/tasks.md)** - Detailed task completion status

## 🧩 Component Documentation

### Core Components

- **[PDF Components](./components/pdf/README.md)** - PDF viewer and annotation component suite
- **[Store Documentation](./lib/store/README.md)** - Redux state management and RTK Query setup

### Specialized Documentation

- **[Error Handling](./docs/ERROR_HANDLING.md)** - Comprehensive error handling patterns and guidelines
- **[Recent Activity](./docs/RECENT_ACTIVITY.md)** - Activity tracking system documentation

## 🧪 Testing & Quality

### Testing Documentation

- **[Test Suite](./test/README.md)** - Testing strategy, coverage, and running tests
- **[Supabase Setup](./docs/SUPABASE_SETUP.md)** - Database schema and storage configuration

### Development Tools

- **[Development Specs](./.kiro/specs/)** - Feature specifications and implementation plans
- **[Steering Guidelines](./.kiro/steering/)** - Development guidelines and best practices

## 📖 Documentation by Audience

### 👨‍💻 Developers

**Getting Started:**

1. [README.md](./README.md) - Setup and quick start
2. [Technical Guidelines](./.kiro/steering/tech.md) - Code standards
3. [Project Structure](./.kiro/steering/structure.md) - File organization

**Implementation:**

1. [API Documentation](./docs/API_DOCUMENTATION.md) - Backend integration
2. [Component Documentation](./components/pdf/README.md) - Frontend components
3. [Error Handling](./docs/ERROR_HANDLING.md) - Error management patterns

**Testing:**

1. [Test Documentation](./test/README.md) - Testing strategy
2. [Supabase Setup](./docs/SUPABASE_SETUP.md) - Database testing

### 🏢 Project Managers

**Project Overview:**

1. [Project Overview](./docs/PROJECT_OVERVIEW.md) - Vision and architecture
2. [Project Status](./docs/PROJECT_STATUS.md) - Current progress
3. [Product Context](./.kiro/steering/product.md) - Feature requirements

**Implementation Progress:**

1. [Supabase Backend Tasks](./.kiro/specs/supabase-pdf-backend/tasks.md) - Backend completion status
2. [Cross-Tab Implementation](./CROSS_TAB_IMPLEMENTATION_SUMMARY.md) - Feature implementation

### 🎨 Designers

**User Experience:**

1. [Product Context](./.kiro/steering/product.md) - UX principles and patterns
2. [PDF Components](./components/pdf/README.md) - UI component specifications
3. [Project Overview](./docs/PROJECT_OVERVIEW.md) - User experience design

### 🔧 DevOps/Infrastructure

**Setup & Deployment:**

1. [Supabase Setup](./docs/SUPABASE_SETUP.md) - Database and storage configuration
2. [README.md](./README.md) - Environment setup and deployment
3. [API Documentation](./docs/API_DOCUMENTATION.md) - Backend infrastructure

## 📋 Documentation by Feature

### PDF Management

- **Upload System**: [API Documentation](./docs/API_DOCUMENTATION.md#pdf-management-api)
- **File Storage**: [Supabase Setup](./docs/SUPABASE_SETUP.md)
- **PDF Viewer**: [PDF Components](./components/pdf/README.md)

### Annotation System

- **Component Suite**: [PDF Components](./components/pdf/README.md)
- **State Management**: [Store Documentation](./lib/store/README.md)
- **Cross-Tab Sync**: [Cross-Tab Implementation](./CROSS_TAB_IMPLEMENTATION_SUMMARY.md)

### User Interface

- **Responsive Design**: [Technical Guidelines](./.kiro/steering/tech.md#mobile-responsiveness)
- **Error Handling**: [Error Handling](./docs/ERROR_HANDLING.md)
- **Activity Tracking**: [Recent Activity](./docs/RECENT_ACTIVITY.md)

### Backend Integration

- **Database Schema**: [Supabase Setup](./docs/SUPABASE_SETUP.md)
- **API Endpoints**: [API Documentation](./docs/API_DOCUMENTATION.md)
- **Authentication**: [Technical Guidelines](./.kiro/steering/tech.md#security-considerations)

## 🔍 Quick Reference

### Common Tasks

**Setting up development environment:**

```bash
# See README.md for complete setup
npm install
# Configure .env.local with Supabase and Clerk credentials
npm run dev
```

**Running tests:**

```bash
# See test/README.md for complete testing guide
npm run test:run        # Run all tests
npm run test:coverage   # Run with coverage
npm run test:ui         # Interactive test UI
```

**Database setup:**

```bash
# See docs/SUPABASE_SETUP.md for complete guide
# Run migrations in Supabase SQL editor
npm run setup:supabase  # Verify setup
```

### Key File Locations

**Configuration:**

- Environment: `.env.local`
- TypeScript: `tsconfig.json`
- Tailwind: `tailwind.config.js`
- Vitest: `vitest.config.ts`

**Core Implementation:**

- API Routes: `app/api/pdfs/`
- PDF Components: `components/pdf/`
- State Management: `lib/store/`
- Error Handling: `lib/utils/error-handling.ts`
- Supabase Client: `lib/supabaseClient.ts`

**Documentation:**

- Main docs: `docs/` directory and root `README.md`
- Component docs: `components/*/README.md`
- Specs: `.kiro/specs/`
- Guidelines: `.kiro/steering/`

## 🆘 Getting Help

### Documentation Issues

- Check the specific component or feature documentation
- Review error handling patterns in [Error Handling](./docs/ERROR_HANDLING.md)
- Consult the [Technical Guidelines](./.kiro/steering/tech.md) for code standards

### Development Issues

- Review [Project Status](./docs/PROJECT_STATUS.md) for known issues
- Check [Test Documentation](./test/README.md) for testing guidance
- Consult [API Documentation](./docs/API_DOCUMENTATION.md) for backend integration

### Setup Issues

- Follow [README.md](./README.md) setup instructions
- Review [Supabase Setup](./docs/SUPABASE_SETUP.md) for database configuration
- Check environment variable configuration

## 📝 Contributing to Documentation

When updating documentation:

1. **Keep it current**: Update relevant docs when implementing features
2. **Be comprehensive**: Include examples, error cases, and edge scenarios
3. **Follow patterns**: Use consistent formatting and structure
4. **Cross-reference**: Link related documentation appropriately
5. **Test examples**: Ensure code examples work and are up-to-date

### Documentation Standards

- Use clear, concise language
- Include practical examples and code snippets
- Provide both high-level overviews and detailed implementation guides
- Keep table of contents and cross-references updated
- Use consistent formatting and markdown structure

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Maintained by**: Noto Development Team

For questions about documentation or to suggest improvements, please refer to the project's issue tracker or contact the development team.
