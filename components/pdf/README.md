# PDF Components

This directory contains all PDF-related components for the Noto application.

## Directory Structure

```
pdf/
├── README.md                          # This file
├── ViewerHeader.tsx                   # Legacy file (deprecated - use viewerheader/ directory)
├── TextSelectionPopup.tsx            # Popup for text selection actions
├── noter/                            # PDF viewer and note-taking components
│   ├── Viewer.tsx                    # Main PDF viewer wrapper
│   ├── ViewerHeader.tsx              # Legacy header (use viewerheader/ instead)
│   ├── Noter.tsx                     # Note editor panel
│   ├── NotesTabsManager.tsx          # Tabs for managing multiple notes
│   ├── AnnotationPopup.tsx           # Popup for annotation actions
│   └── highlight/                    # Highlight-related components
│       ├── HighlightContainer.tsx    # Container for rendering highlights
│       ├── StandardHighlight.tsx     # Standard highlight renderer
│       ├── ContextMenu.tsx           # Right-click context menu for highlights
│       └── ExpandableTip.tsx         # Expandable tooltip component
├── viewerheader/                     # PDF Viewer Header Components (Modular)
│   ├── ViewerHeader.tsx              # Main header component
│   ├── PageNavigation.tsx            # Page navigation controls
│   ├── ZoomControls.tsx              # Zoom in/out controls
│   ├── HighlightColorSelector.tsx    # Color picker for highlights
│   └── index.ts                      # Barrel exports
└── tags/                             # Tag-related components
    └── TaggedHighlight.tsx           # Tagged highlight renderer

```

## Components Overview

### ViewerHeader Components (`viewerheader/`)

Modular components that make up the PDF viewer header bar. Each component is separated for better maintainability and reusability.

#### **ViewerHeader.tsx**
Main header component that orchestrates all sub-components.

**Props:**
- `pdfDocument: PDFDocument` - The PDF document being viewed
- `isHeaderVisible: boolean` - Whether the header is visible
- `setIsHeaderVisible: (visible: boolean) => void` - Function to toggle header visibility
- `onToggleNoter?: () => void` - Function to toggle the notes panel
- `pdfViewerRef?: React.RefObject<any>` - Reference to the PDF viewer instance
- `currentHighlightColor?: string` - Current highlight color (default: "#FFEB3B")
- `onHighlightColorChange?: (color: string) => void` - Callback when highlight color changes
- `viewerWidth?: string` - Width of the viewer for responsive header (default: "100%")

**Features:**
- Glassmorphism design with backdrop blur
- Responsive width that matches the PDF viewer
- Integrated navigation, zoom, and highlight controls
- Notes panel toggle
- Header hide/show functionality

#### **PageNavigation.tsx**
Displays current page number and total pages with inline editing.

**Props:**
- `pdfViewerRef?: React.RefObject<any>` - Reference to the PDF viewer

**Features:**
- Click to edit page number
- Press Enter to navigate to page
- Press Escape to cancel editing
- Auto-updates as user navigates through PDF
- Keyboard shortcuts: Arrow keys, PageUp/PageDown

#### **ZoomControls.tsx**
Zoom in/out controls with custom zoom level input.

**Props:**
- `pdfViewerRef?: React.RefObject<any>` - Reference to the PDF viewer

**Features:**
- Zoom In/Out buttons
- Click zoom percentage to edit (10-400%)
- Double-click to reset zoom (fit to page)
- Keyboard shortcuts: Ctrl+Plus, Ctrl+Minus, Ctrl+0
- Real-time zoom level updates

#### **HighlightColorSelector.tsx**
Color picker dropdown for selecting highlight colors.

**Props:**
- `currentColor: string` - Currently selected color
- `onColorChange: (color: string) => void` - Callback when color changes

**Features:**
- 5 predefined colors: Yellow, Green, Blue, Pink, Orange
- Visual color preview in button
- Grid layout in dropdown
- Active color indication with ring

**Available Colors:**
- Yellow: `#FFEB3B`
- Green: `#4CAF50`
- Blue: `#2196F3`
- Pink: `#E91E63`
- Orange: `#FF9800`

---

### Legacy Components

#### **ViewerHeader.tsx** (Root level - Deprecated)
⚠️ **This file is deprecated.** Use components from `viewerheader/` directory instead.

This file previously contained all header components in a single file. It has been split into modular components for better organization.

---

### Note-Taking Components (`noter/`)

#### **Viewer.tsx**
Main PDF viewer component that wraps the Syncfusion PDF viewer.

**Props:**
- `pdfDocument: PDFDocument` - The PDF document to display
- `onToggleNoter?: () => void` - Function to toggle notes panel
- `viewerWidth?: string` - Width of the viewer container (default: "100%")

**Features:**
- Syncfusion PdfViewerComponent integration
- Highlight creation and management
- Text selection popup
- Annotation popup
- Responsive width support
- Header visibility toggle

#### **Noter.tsx**
Note editor panel with TipTap rich text editor.

**Features:**
- Rich text editing
- Auto-save functionality
- Note synchronization with backend
- Markdown support
- Multiple note tabs

#### **NotesTabsManager.tsx**
Tab interface for managing multiple notes.

**Features:**
- Create/delete note tabs
- Switch between notes
- Unsaved changes indicator
- Tab reordering

---

### Highlight Components (`noter/highlight/`)

#### **HighlightContainer.tsx**
Container component for rendering highlights with context menu.

**Props:**
- `updateHighlight: (highlightId: string, highlight: Partial<CreateHighlightDto>) => any`
- `deleteHighlight: (highlightId: string) => any`

**Features:**
- Right-click context menu
- Color change support
- Delete functionality
- Different highlight styles (standard, tagged)

#### **StandardHighlight.tsx**
Renders a standard text highlight.

**Features:**
- Customizable color
- Scroll-to-highlight support
- Hover effects

#### **ContextMenu.tsx**
Right-click context menu for highlights.

**Features:**
- Delete highlight option
- Change color with color picker
- Click outside to close
- Escape key to close

---

## Usage Examples

### Using ViewerHeader (New Modular Approach)

```tsx
import { ViewerHeader } from "@/components/pdf/viewerheader";
import { useRef, useState } from "react";

function PDFPage() {
  const pdfViewerRef = useRef(null);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [highlightColor, setHighlightColor] = useState("#FFEB3B");

  return (
    <ViewerHeader
      pdfDocument={pdfData}
      isHeaderVisible={isHeaderVisible}
      setIsHeaderVisible={setIsHeaderVisible}
      pdfViewerRef={pdfViewerRef}
      currentHighlightColor={highlightColor}
      onHighlightColorChange={setHighlightColor}
      onToggleNoter={() => setNotesOpen(!notesOpen)}
      viewerWidth="100%"
    />
  );
}
```

### Using Individual Components

```tsx
import { 
  PageNavigation, 
  ZoomControls, 
  HighlightColorSelector 
} from "@/components/pdf/viewerheader";

function CustomHeader() {
  const pdfViewerRef = useRef(null);
  const [color, setColor] = useState("#FFEB3B");

  return (
    <div className="flex gap-4">
      <PageNavigation pdfViewerRef={pdfViewerRef} />
      <ZoomControls pdfViewerRef={pdfViewerRef} />
      <HighlightColorSelector 
        currentColor={color} 
        onColorChange={setColor} 
      />
    </div>
  );
}
```

### Using Viewer Component

```tsx
import Viewer from "@/components/pdf/noter/Viewer";

function PDFViewer({ pdfDocument }) {
  const [notesOpen, setNotesOpen] = useState(false);

  return (
    <Viewer
      pdfDocument={pdfDocument}
      onToggleNoter={() => setNotesOpen(!notesOpen)}
      viewerWidth={notesOpen ? "50%" : "100%"}
    />
  );
}
```

---

## Architecture Notes

### Responsive Design
The viewer header components use a combination of:
- **Container-based width**: The header width matches the actual PDF viewer width (not viewport)
- **ResizeObserver**: Used in parent components to track viewer width changes
- **Dynamic prop passing**: Width is passed down from page → Viewer → ViewerHeader

### State Management
- Local state for UI controls (page number, zoom level, editing mode)
- Props for cross-component communication
- Syncfusion PDF Viewer instance accessed via refs

### Styling
- Tailwind CSS for utility classes
- Glassmorphism effects with backdrop blur
- Dark mode support
- Responsive breakpoints (sm:, md:, lg:)

---

## Dependencies

- **@syncfusion/ej2-react-pdfviewer**: PDF rendering engine
- **react-pdf-highlighter-extended**: Highlight functionality
- **@tiptap/react**: Rich text editor for notes
- **next/navigation**: Router for navigation
- **lucide-react**: Icon library
- **shadcn/ui**: UI components (Button, Input, DropdownMenu, etc.)

---

## Migration Guide

If you're using the old `ViewerHeader.tsx` from the root or `noter/` directory:

### Before:
```tsx
import { ViewerHeader } from "@/components/pdf/ViewerHeader";
// or
import { ViewerHeader } from "@/components/pdf/noter/ViewerHeader";
```

### After:
```tsx
import { ViewerHeader } from "@/components/pdf/viewerheader";
```

The API remains the same, but the components are now modular and easier to maintain.

---

## Future Improvements

- [ ] Add keyboard shortcuts documentation
- [ ] Implement annotation persistence to backend
- [ ] Add highlight search functionality
- [ ] Support for custom highlight colors
- [ ] Collaborative editing support
- [ ] Export annotations to PDF
- [ ] Mobile touch gesture support
- [ ] Accessibility improvements (ARIA labels, keyboard navigation)

---

## Contributing

When adding new PDF-related components:
1. Place them in the appropriate subdirectory
2. Update this README with documentation
3. Export from `index.ts` if creating a new component collection
4. Follow existing naming conventions
5. Include TypeScript types for all props
6. Add JSDoc comments for complex functions

---

## Related Documentation

- [PDF Annotation Tools](../../docs/PDF_ANNOTATION_TOOLS.md)
- [Notes System](../../docs/NOTES_SYSTEM.md)
- [Notion Editor](../../docs/NOTION_EDITOR.md)
- [Project Overview](../../docs/PROJECT_OVERVIEW.md)
