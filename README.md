# Noto - PDF Annotation & Note-Taking Application

A modern, secure PDF annotation and note-taking application built with Next.js 15, React 19, and TypeScript. Noto provides enterprise-grade document processing, intelligent PDF annotation tools, and comprehensive note management with full theme support.

## 🚀 Features

### Core PDF & Annotation System
- **Advanced PDF Viewing**: Syncfusion PDF Viewer with text selection, zoom, search, and navigation
- **Multi-Mode Highlighting**: Three distinct highlighting modes with color customization
  - 🟡 **Quick Highlight**: Instant highlighting without note creation
  - 🟠 **Inline Comment**: Highlighting with hover-based comments
  - 🔵 **Linked Note**: Full note creation with highlight linkage
- **Smart Annotation Tools**: Context-aware tooltips with coordinate-based positioning
- **Highlight Management**: Advanced color picker, opacity control, and context menus

### Document Processing
- **Syncfusion Text Extraction**: Enterprise-grade text extraction with layout preservation
- **OCR Fallback System**: Automatic fallback to node-tesseract-ocr for scanned documents
- **Semantic Chunking**: Intelligent text segmentation with content type detection
- **Multi-Language Support**: Comprehensive language detection and processing

### Rich Text Editor
- **Notion-Style Editor**: TipTap-based block editor with slash commands
- **Auto-Save Architecture**: Debounced auto-save with RTK Query integration
- **Floating Toolbars**: Context-aware formatting with mobile responsiveness
- **Cross-Tab Sync**: Real-time updates using BroadcastChannel API

### Modern Interface
- **Floating Navigation**: Glassmorphism-based navigation dock with auto-hide functionality
  - Collapsed state: Compact dock with quick navigation icons and user avatar
  - Expanded state: Full 2x2 grid with descriptions, user profile, and settings
  - Smart scroll detection with smooth visibility transitions
  - Hydration-safe rendering with loading states
- **Floating Sidebar**: Left-positioned collapsible sidebar with page-specific actions
  - Context-aware quick actions based on current page
  - Keyboard shortcuts integration with visual indicators
  - Event-based communication system for seamless integration
- **Complete Theme System**: Dark/light mode with system preference detection
- **Responsive Design**: Mobile-first approach with touch-friendly interactions
- **File System Navigation**: Hierarchical folder management with drag & drop

### Quiz Management
- **Interactive Quiz Center**: Advanced filtering by category, difficulty, and progress
- **Progress Tracking**: Comprehensive analytics with completion rates and scores
- **Category Organization**: Mathematics, Programming, History, Chemistry, Computer Science, Language
- **Statistics Dashboard**: Real-time overview with gradient-styled cards showing totals, completion, scores, and streaks
- **Document Integration**: Quiz creation from uploaded PDFs with advanced document selection
- **Bookmark System**: Save favorite quizzes with visual indicators and filtering
- **Floating Sidebar Integration**: Page-specific quiz actions with keyboard shortcuts

## 🛠 Tech Stack

### Frontend
- **Next.js 15** with App Router
- **React 19** with TypeScript (strict mode)
- **Tailwind CSS** + shadcn/ui components
- **Redux Toolkit** with RTK Query for state management
- **TipTap** for rich text editing
- **Syncfusion PDF Viewer** (licensed)

### Backend & Database
- **Supabase** for database and storage
- **Row Level Security (RLS)** for data isolation
- **Clerk** for authentication with JWT integration
- **Node.js** with TypeScript for API routes

### Key Libraries
- **@dnd-kit** for drag and drop functionality
- **react-hot-toast** for notifications
- **lucide-react** for icons
- **node-tesseract-ocr** for OCR processing

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ and npm/yarn
- Supabase account and project
- Clerk account for authentication
- Syncfusion license (for PDF viewer)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd noto
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create `.env.local` with required variables:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

   # Clerk Authentication
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
   NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up

   # Syncfusion License
   SYNCFUSION_LICENSE_KEY=your_syncfusion_license
   ```

4. **Database Setup**
   Run Supabase migrations:
   ```bash
   npx supabase db reset
   ```

5. **Start Development Server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📁 Project Structure

```
noto/
├── app/                          # Next.js App Router
│   ├── api/                      # API routes
│   │   ├── pdfs/                 # PDF management endpoints
│   │   ├── notes/                # Note management endpoints
│   │   ├── highlights/           # Highlight management endpoints
│   │   ├── folders/              # Folder management endpoints
│   │   ├── annotations/          # Annotation management endpoints
│   │   └── quiz/                 # Quiz generation and management endpoints
│   ├── dashboard/                # Main application pages
│   │   ├── pdfs/                 # PDF management interface
│   │   ├── notes/                # Note management interface
│   │   ├── quizzes/              # Quiz management interface
│   │   └── layout.tsx            # Dashboard layout with floating navigation
│   └── globals.css               # Global styles and comprehensive theme system
├── components/                   # React components
│   ├── ui/                       # Base UI components (shadcn/ui + custom)
│   ├── editor/                   # Rich text editor with TipTap integration
│   ├── pdf/                      # PDF viewer and annotation system
│   ├── navigation/               # Modern floating navigation system
│   │   ├── FloatingNavigation.tsx # Glassmorphism navigation dock
│   │   └── FloatingSidebar.tsx   # Context-aware page-specific actions
│   ├── dashboard/                # Dashboard-specific components
│   ├── theme/                    # Complete theme system components
│   └── quiz/                     # Quiz management and document selection
│       ├── DocumentSelectionTabs.tsx # Advanced document selection
│       └── QuizConfiguration.tsx # Interactive quiz configuration
├── lib/                          # Core utilities and configuration
│   ├── store/                    # Redux store with RTK Query
│   ├── types/                    # Comprehensive TypeScript definitions
│   └── utils/                    # Utility functions and helpers
├── hooks/                        # Custom React hooks including floating sidebar integration
├── supabase/                     # Database migrations and RLS policies
├── docs/                         # Comprehensive documentation
└── .kiro/steering/               # Development guidelines and standards
```

## 🔧 Key Features Deep Dive

### PDF Annotation System

The annotation system uses a sophisticated coordinate conversion system:

```typescript
// Text selection triggers annotation tooltip
const handleTextSelection = (args: TextSelectionEventArgs) => {
  const bounds = calculateSelectionBounds(args.textBounds);
  const screenPosition = convertPDFToScreenCoords(bounds, pdfViewerRef.current);
  setTooltipPosition(adjustForViewport(screenPosition));
};
```

### Auto-Save Architecture

Notes automatically save using RTK Query mutations:

```typescript
// Auto-save is handled internally by NotionEditor
const [updateNote] = useUpdateNoteMutation();

const handleAutoSave = useCallback(
  debounce(async (content: JSONContent) => {
    await updateNote({ id: noteId, content }).unwrap();
  }, 1000),
  [noteId, updateNote]
);
```

### Theme System

Complete dark/light mode support with system preference detection:

```typescript
// Theme provider with localStorage persistence
const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') || 'system';
    }
    return 'system';
  });
  // ... theme logic
};
```

## 🧪 Testing

Run the test suite:

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

## 📚 Documentation

- [API Documentation](docs/API_DOCUMENTATION.md)
- [PDF Annotation Tools](docs/PDF_ANNOTATION_TOOLS.md)
- [Notion Editor](docs/NOTION_EDITOR.md)
- [Error Handling](docs/ERROR_HANDLING.md)
- [Project Overview](docs/PROJECT_OVERVIEW.md)

## 🔒 Security

- **Authentication**: Clerk-based authentication with JWT tokens
- **Authorization**: Supabase Row Level Security (RLS) policies
- **File Security**: Time-limited signed URLs for PDF access
- **Input Validation**: Comprehensive server-side validation
- **Data Isolation**: User data automatically isolated via RLS

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Configure environment variables
3. Deploy automatically on push to main

### Manual Deployment

```bash
# Build the application
npm run build

# Start production server
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript strict mode
- Use RTK Query for all API calls
- Implement proper error boundaries
- Maintain theme support in all components
- Write tests for new features
- Update documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Syncfusion](https://www.syncfusion.com/) for the PDF Viewer component
- [Supabase](https://supabase.com/) for the backend infrastructure
- [Clerk](https://clerk.com/) for authentication services
- [Vercel](https://vercel.com/) for hosting and deployment
- [shadcn/ui](https://ui.shadcn.com/) for the component library

## 📞 Support

For support and questions:

- Create an issue in the repository
- Check the [documentation](docs/)
- Review existing issues and discussions

---

**Noto** - Transforming how you interact with PDF documents through intelligent annotation and note-taking.