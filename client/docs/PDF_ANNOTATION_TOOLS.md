# PDF Annotation Tools Documentation

## 🎯 Overview

The Noto PDF Annotation Tools provide a comprehensive, professional-grade annotation system for PDF documents. Built with modern web technologies and featuring a glassmorphism UI design, these tools offer three distinct highlighting modes and an intuitive user experience.

## 🛠️ Tool Modes

### 🟡 Quick Highlight
**Purpose**: Rapid document review and text marking
- **Color**: Yellow (#FFFF00)
- **Behavior**: Instant highlighting without note creation
- **Use Cases**: 
  - Speed reading sessions
  - Initial document scanning
  - Quick reference marking
  - Rapid content identification

**Technical Implementation**:
```typescript
const handleQuickHighlight = () => {
  const annotationOptions: Partial<HighlightSettings> = {
    bounds: selectedTextBounds as TextBounds[],
    pageNumber: currentPageNumber,
    color: "#FFFF00",
    opacity: 0.4,
    customData: { 
      id: `quick-highlight-${Date.now()}`, 
      type: "quick",
      text: selectedText 
    }
  };
  
  pdfViewerRef.current?.annotation.addAnnotation("Highlight", annotationOptions);
};
```

### 🟠 Inline Comment
**Purpose**: Contextual annotations with hover-based display
- **Color**: Orange (#FFA500)
- **Behavior**: Highlighting with comment popup on hover
- **Use Cases**:
  - Detailed document review
  - Collaborative feedback
  - Contextual explanations
  - Quick clarifications

**Features**:
- Hover-activated comment display
- Compact annotation storage
- Quick editing capabilities
- Minimal visual disruption

### 🔵 Linked Note
**Purpose**: Comprehensive document analysis with full note creation
- **Color**: Blue (#4A90E2)
- **Behavior**: Full note creation modal with rich text editing
- **Use Cases**:
  - Research documentation
  - Study notes and analysis
  - Detailed commentary
  - Academic annotations

**Features**:
- Full TipTap rich text editor
- Auto-save functionality
- Cross-reference capabilities
- Comprehensive note management

## 🎨 User Interface Design

### Glassmorphism Header
The PDF viewer features a modern floating header with glassmorphism effects:

```css
.header {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
}
```

**Design Elements**:
- **Backdrop Blur**: Creates depth and focus
- **Transparency**: Maintains document visibility
- **Gradient Overlays**: Subtle visual hierarchy
- **Rounded Corners**: Modern, friendly appearance
- **Shadow Effects**: Floating visual effect

### Tool Selection Interface

#### Primary Tools Dropdown
- **Tools Button**: Palette icon with "Tools" label
- **Dropdown Menu**: Glassmorphism-styled menu
- **Visual Indicators**: Color-coded tool icons
- **Active State**: Blue dot indicators

#### Highlighting Submenu
- **Nested Menu**: Expandable highlighting options
- **Mode Descriptions**: Clear explanations for each mode
- **Color Indicators**: Visual mode identification
- **Selection Feedback**: Immediate visual confirmation

#### Current Tool Display
Real-time indicator showing:
- **Active Tool**: Current tool name
- **Mode Status**: Current highlighting mode
- **Color Coding**: Visual mode identification
- **Compact Design**: Minimal space usage

## 📱 Responsive Design

### Desktop Experience
- **Full Header**: Complete tool interface
- **Hover Interactions**: Rich tooltip experiences
- **Keyboard Shortcuts**: Power user features
- **Multi-window Support**: Cross-tab synchronization

### Mobile Experience
- **Touch Optimization**: Finger-friendly interactions
- **Responsive Tooltips**: Adapted positioning
- **Gesture Support**: Natural mobile workflows
- **Compact Interface**: Space-efficient design

### Focus Mode
- **Distraction-free**: Full-screen PDF viewing
- **Header Toggle**: Smooth show/hide animations
- **Tool Access**: Maintained functionality
- **Enhanced Button**: Prominent "Show Header" styling

## 🔧 Technical Architecture

### Component Structure
```
PDFAnnotationViewer (Main Component)
├── AnnotationTooltip (Dynamic tooltip)
├── NoteCreationModal (Full note editor)
├── HighlightHoverToolbar (Existing highlights)
└── NotePreviewModal (Quick note viewing)
```

### State Management
```typescript
// Tool selection state
const [selectedTool, setSelectedTool] = useState<string>("highlight");
const [highlightMode, setHighlightMode] = useState<"quick" | "comment" | "note">("quick");

// Annotation workflow state
const [selectedText, setSelectedText] = useState<string>("");
const [selectionBounds, setSelectionBounds] = useState<TextBounds | null>(null);
const [showSelectionToolbar, setShowSelectionToolbar] = useState(false);
```

### Coordinate System
Advanced PDF-to-screen coordinate conversion:

```typescript
const handleTextSelection = (args: TextSelectionEventArgs) => {
  // 1. Validate input data
  if (!args?.textContent?.trim() || !args.textBounds?.length) return;
  
  // 2. Calculate selection bounds
  const bounds = calculateSelectionBounds(args.textBounds);
  
  // 3. Convert PDF coordinates to screen coordinates
  const screenPosition = convertPDFToScreenCoords(bounds, pdfViewerRef.current);
  
  // 4. Adjust for viewport boundaries
  const adjustedPosition = adjustForViewport(screenPosition);
  
  // 5. Update state and show tooltip
  setSelectionBounds(bounds);
  setTooltipPosition(adjustedPosition);
  setTimeout(() => setShowSelectionToolbar(true), 10);
};
```

### Annotation Creation
Dynamic annotation creation based on selected mode:

```typescript
const createAnnotation = (noteId: string, mode: HighlightMode) => {
  const getHighlightColor = () => {
    switch (mode) {
      case "quick": return "#FFFF00";   // Yellow
      case "comment": return "#FFA500"; // Orange
      case "note": return "#4A90E2";    // Blue
      default: return "#FFFF00";
    }
  };

  const annotationOptions: Partial<HighlightSettings> = {
    bounds: selectedTextBounds as TextBounds[],
    pageNumber: currentPageNumber,
    color: getHighlightColor(),
    opacity: 0.4,
    customData: { 
      id: `highlight-${noteId}`, 
      noteId: noteId,
      type: mode,
      text: selectedText 
    }
  };

  pdfViewerRef.current?.annotation.addAnnotation("Highlight", annotationOptions);
};
```

## 🚀 Usage Guide

### Getting Started
1. **Open PDF**: Navigate to any PDF document
2. **Select Tool**: Click "Tools" in the header
3. **Choose Mode**: Select highlighting mode from dropdown
4. **Annotate**: Select text and choose action from tooltip

### Tool Selection Workflow
1. **Tools Dropdown**: Click "Tools" button in header
2. **Highlighting Menu**: Hover over "Highlighting" option
3. **Mode Selection**: Choose from Quick, Comment, or Note
4. **Visual Confirmation**: See active mode in tool indicator

### Annotation Workflow
1. **Text Selection**: Click and drag to select text
2. **Tooltip Appearance**: Smart tooltip appears near selection
3. **Action Selection**: Click appropriate action based on mode
4. **Annotation Creation**: Highlight and/or note created automatically

### Focus Mode
1. **Enter Focus**: Click "Focus Mode" or press 'F' key
2. **Header Toggle**: Click "Show Header" when needed
3. **Tool Access**: Full tool functionality maintained
4. **Exit Focus**: Press 'Esc' or click "Exit Focus"

## 🎯 Best Practices

### Tool Selection
- **Quick Highlight**: Use for rapid document scanning
- **Inline Comment**: Use for detailed review and feedback
- **Linked Note**: Use for comprehensive analysis and research

### Workflow Optimization
- **Keyboard Shortcuts**: Use 'F' for focus mode, 'Esc' to exit
- **Tool Switching**: Change modes mid-session as needed
- **Batch Operations**: Select tool once, annotate multiple sections

### Performance Tips
- **Focus Mode**: Use for distraction-free reading
- **Tool Indicators**: Monitor active tool/mode status
- **Quick Actions**: Leverage quick highlight for speed

## 🔍 Troubleshooting

### Common Issues

#### Tooltip Not Appearing
- **Check Selection**: Ensure text is properly selected
- **Viewport Position**: Tooltip may be positioned off-screen
- **Tool State**: Verify tool is properly selected

#### Coordinate Misalignment
- **Canvas Detection**: PDF viewer canvas may not be detected
- **Zoom Level**: High zoom levels may affect positioning
- **Page Rendering**: Wait for page to fully render

#### Tool State Issues
- **State Persistence**: Tool selection persists across sessions
- **Mode Switching**: Mode changes apply immediately
- **Visual Feedback**: Check tool indicator for current state

### Performance Optimization
- **Large Documents**: Use focus mode for better performance
- **Multiple Annotations**: Quick highlight mode for bulk operations
- **Memory Usage**: Close unused modals and tooltips

## 🔮 Future Enhancements

### Planned Features
- **Collaborative Annotations**: Real-time multi-user support
- **Advanced Comments**: Threaded discussions
- **Annotation Search**: Full-text search across annotations
- **Export Options**: PDF export with annotations
- **Voice Notes**: Audio annotation support

### Technical Improvements
- **Performance**: Virtual scrolling for large documents
- **Offline Support**: Local annotation storage
- **AI Integration**: Smart annotation suggestions
- **Custom Tools**: User-defined annotation types

## 📚 Related Documentation

- [Component Architecture](../components/pdf/README.md)
- [Technical Guidelines](../.kiro/steering/tech.md)
- [Product Context](../.kiro/steering/product.md)
- [Project Structure](../.kiro/steering/structure.md)

## 🤝 Contributing

### Development Setup
1. Clone repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Navigate to PDF viewer to test annotations

### Code Standards
- Follow TypeScript strict mode
- Use proper component interfaces
- Implement comprehensive error handling
- Maintain responsive design principles

### Testing Requirements
- Unit tests for coordinate conversion
- Integration tests for annotation workflow
- E2E tests for complete user journey
- Mobile responsiveness testing