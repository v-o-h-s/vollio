# NotionEditor Documentation

## Overview

The `NotionEditor` is a powerful, Notion-like rich text editor built with TipTap and React. It provides a comprehensive block-based editing experience with auto-save functionality, extensive formatting options, and seamless integration with the Noto PDF annotation system.

## 🚀 Production Status: ✅ IMPLEMENTED

The NotionEditor is fully implemented and production-ready with:
- **Complete TipTap Integration**: Full rich text editing capabilities
- **Internal Auto-Save**: RTK Query-based auto-save with status tracking
- **Cross-tab Synchronization**: Real-time updates across browser tabs
- **Mobile Optimization**: Touch-friendly interface with responsive design
- **Error Handling**: Comprehensive error recovery and user feedback
- **Theme Integration**: Complete dark/light mode support

## Table of Contents

- [Features](#features)
- [Installation & Setup](#installation--setup)
- [Basic Usage](#basic-usage)
- [Props API](#props-api)
- [Extensions](#extensions)
- [Auto-Save System](#auto-save-system)
- [Keyboard Shortcuts](#keyboard-shortcuts)
- [Styling & Theming](#styling--theming)
- [Advanced Usage](#advanced-usage)
- [Troubleshooting](#troubleshooting)

## Features

### Core Editing Features
- **Block-based editing** with Notion-style interface
- **Rich text formatting** (bold, italic, underline, strikethrough)
- **Headings** (H1, H2, H3) with automatic styling
- **Lists** (bullet and numbered lists)
- **Code blocks** with syntax highlighting
- **Blockquotes** with visual styling
- **Tables** with resizable columns
- **Horizontal rules** for content separation
- **Text alignment** (left, center, right, justify)

### Advanced Features
- **Slash commands** for quick block insertion
- **Image upload** with drag-and-drop support
- **Enhanced links** with validation and auto-detection
- **Auto-save functionality** with RTK Query integration
- **Floating toolbars** for contextual formatting
- **Bubble menus** for text and table operations
- **Keyboard shortcuts** for power users
- **Word count and reading time** calculation
- **Responsive design** for mobile and desktop

### Integration Features
- **PDF annotation integration** for note-taking
- **Cross-tab synchronization** via RTK Query
- **Theme support** (light/dark mode)
- **Error boundaries** for graceful error handling
- **Auto-focus** and accessibility features

## Installation & Setup

The NotionEditor is already integrated into the Noto application. To use it in a new component:

```tsx
import { NotionEditor } from "@/components/editor/NotionEditor";
```

### Dependencies

The editor relies on several TipTap extensions and custom components:

```json
{
  "@tiptap/react": "^2.x.x",
  "@tiptap/core": "^2.x.x",
  "@tiptap/extension-*": "^2.x.x"
}
```

## Basic Usage

### Simple Editor

```tsx
import { NotionEditor } from "@/components/editor/NotionEditor";

function MyComponent() {
  const [content, setContent] = useState(null);

  return (
    <NotionEditor
      content={{ title: "My Note", content }}
      onChange={setContent}
      placeholder="Start writing..."
    />
  );
}
```

### Editor with Auto-Save

```tsx
import { NotionEditor } from "@/components/editor/NotionEditor";

function NoteEditor({ noteId }: { noteId?: string }) {
  const [content, setContent] = useState(null);

  return (
    <NotionEditor
      content={{ title: "Auto-saved Note", content }}
      onChange={setContent}
      autoSave={true}
      noteId={noteId}
      autoSaveDelay={500}
      onNoteCreated={(id) => console.log("Note created:", id)}
      onAutoSaveStatusChange={(status) => console.log("Save status:", status)}
    />
  );
}
```

## Props API

### NotionEditorProps Interface

```typescript
interface NotionEditorProps {
  // Content Management
  content?: NoteContent;                    // Initial content with title and JSON
  onChange?: (content: JSONContent) => void; // Content change handler
  onUpdate?: (editor: Editor) => void;      // Editor update handler
  
  // Basic Configuration
  placeholder?: string;                     // Placeholder text (default: "Start writing...")
  editable?: boolean;                       // Enable/disable editing (default: true)
  className?: string;                       // Additional CSS classes
  autoFocus?: boolean;                      // Auto-focus on mount (default: false)
  
  // UI Customization
  customToolbar?: (editor: Editor) => React.ReactNode; // Custom toolbar renderer
  showWordCount?: boolean;                  // Show word count (default: false)
  showReadingTime?: boolean;               // Show reading time (default: false)
  
  // Auto-Save Configuration
  autoSave?: boolean;                      // Enable auto-save (default: false)
  noteId?: string;                         // Existing note ID for updates
  autoSaveDelay?: number;                  // Debounce delay in ms (default: 500)
  onAutoSaveStatusChange?: (status: AutoSaveStatus) => void; // Status callback
  onNoteCreated?: (noteId: string) => void; // New note creation callback
}
```

### NoteContent Interface

```typescript
interface NoteContent {
  title: string;                           // Note title
  content?: JSONContent | null;            // TipTap JSON content
}
```

### AutoSaveStatus Interface

```typescript
interface AutoSaveStatus {
  status: "idle" | "typing" | "saving" | "saved" | "error";
  lastSaved: Date | null;
  error: string | null;
}
```

## Extensions

The NotionEditor includes several TipTap extensions for enhanced functionality:

### Core Extensions

#### Document Structure
- **Document**: Root document node
- **Paragraph**: Basic paragraph formatting
- **Text**: Plain text nodes
- **Heading**: H1, H2, H3 with custom styling

#### Text Formatting
- **Bold**: Bold text formatting (`Ctrl/Cmd + B`)
- **Italic**: Italic text formatting (`Ctrl/Cmd + I`)
- **Underline**: Underlined text (`Ctrl/Cmd + U`)
- **Strike**: Strikethrough text
- **Code**: Inline code formatting

#### Lists and Structure
- **BulletList**: Unordered lists
- **OrderedList**: Numbered lists
- **ListItem**: List item nodes
- **Blockquote**: Quote blocks
- **HorizontalRule**: Divider lines

#### Advanced Features
- **CodeBlock**: Multi-line code blocks
- **Table**: Resizable tables with headers
- **TextAlign**: Text alignment options

### Custom Extensions

#### SlashCommand
Notion-style slash commands for quick block insertion:

```typescript
// Usage: Type "/" in the editor to open command menu
/heading1    // Insert H1 heading
/heading2    // Insert H2 heading  
/heading3    // Insert H3 heading
/bullet      // Insert bullet list
/number      // Insert numbered list
/quote       // Insert blockquote
/code        // Insert code block
/table       // Insert table
/hr          // Insert horizontal rule
```

#### ImageUpload
Drag-and-drop image upload with Supabase integration:

```typescript
// Features:
- Drag and drop image files
- Automatic upload to Supabase Storage
- Progress indication
- Error handling
- Responsive image display
```

#### EnhancedLink
Advanced link handling with validation:

```typescript
// Features:
- Auto-link detection
- URL validation
- Link on paste
- Custom link dialog
- External link attributes
```

#### KeyboardShortcuts
Comprehensive keyboard shortcuts for power users:

```typescript
// Text Formatting
Ctrl/Cmd + B     // Bold
Ctrl/Cmd + I     // Italic
Ctrl/Cmd + U     // Underline
Ctrl/Cmd + K     // Insert link

// Structure
Ctrl/Cmd + Alt + 1-3  // Headings
Ctrl/Cmd + Shift + 7  // Ordered list
Ctrl/Cmd + Shift + 8  // Bullet list
Ctrl/Cmd + Shift + 9  // Blockquote

// Actions
Ctrl/Cmd + Z     // Undo
Ctrl/Cmd + Y     // Redo (Windows)
Ctrl/Cmd + Shift + Z  // Redo (Mac)
```

## Auto-Save System

The NotionEditor includes a sophisticated auto-save system built on RTK Query:

### How It Works

1. **Content Detection**: Monitors editor content and title changes
2. **Debounced Saves**: Waits for user to stop typing before saving
3. **Smart Creation**: Automatically creates new notes when content is added
4. **Status Tracking**: Provides real-time save status feedback
5. **Error Handling**: Graceful error recovery with retry mechanisms

### Auto-Save States

```typescript
type AutoSaveStatus = 
  | "idle"     // No changes to save
  | "typing"   // User is actively typing
  | "saving"   // Save operation in progress
  | "saved"    // Successfully saved
  | "error";   // Save failed
```

### Configuration

```tsx
<NotionEditor
  autoSave={true}                    // Enable auto-save
  autoSaveDelay={500}               // Wait 500ms after typing stops
  noteId={existingNoteId}           // Update existing note
  onNoteCreated={(id) => {          // Handle new note creation
    console.log("Created note:", id);
  }}
  onAutoSaveStatusChange={(status) => { // Monitor save status
    console.log("Status:", status.status);
    console.log("Last saved:", status.lastSaved);
    console.log("Error:", status.error);
  }}
/>
```

### RTK Query Integration

The auto-save system uses RTK Query mutations for optimal performance:

```typescript
// Automatic note creation
const [createNote] = useCreateNoteMutation();

// Automatic note updates  
const [updateNote] = useUpdateNoteMutation();

// Benefits:
- Automatic caching and invalidation
- Optimistic updates
- Error handling and retries
- Loading state management
- Cross-tab synchronization
```

## Keyboard Shortcuts

### Text Formatting
| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + B` | Toggle bold |
| `Ctrl/Cmd + I` | Toggle italic |
| `Ctrl/Cmd + U` | Toggle underline |
| `Ctrl/Cmd + Shift + X` | Toggle strikethrough |
| `Ctrl/Cmd + E` | Toggle inline code |

### Structure
| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + Alt + 1` | Heading 1 |
| `Ctrl/Cmd + Alt + 2` | Heading 2 |
| `Ctrl/Cmd + Alt + 3` | Heading 3 |
| `Ctrl/Cmd + Alt + 0` | Paragraph |
| `Ctrl/Cmd + Shift + 7` | Ordered list |
| `Ctrl/Cmd + Shift + 8` | Bullet list |
| `Ctrl/Cmd + Shift + 9` | Blockquote |

### Actions
| Shortcut | Action |
|----------|--------|
| `Ctrl/Cmd + K` | Insert/edit link |
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Y` | Redo (Windows) |
| `Ctrl/Cmd + Shift + Z` | Redo (Mac) |
| `Tab` | Indent list item |
| `Shift + Tab` | Outdent list item |

### Slash Commands
| Command | Action |
|---------|--------|
| `/h1` or `/heading1` | Insert H1 heading |
| `/h2` or `/heading2` | Insert H2 heading |
| `/h3` or `/heading3` | Insert H3 heading |
| `/p` or `/paragraph` | Insert paragraph |
| `/ul` or `/bullet` | Insert bullet list |
| `/ol` or `/number` | Insert numbered list |
| `/quote` | Insert blockquote |
| `/code` | Insert code block |
| `/table` | Insert table |
| `/hr` | Insert horizontal rule |

## Styling & Theming

### CSS Classes

The editor uses Tailwind CSS classes with theme-aware styling:

```css
/* Editor container */
.prose {
  @apply max-w-none text-foreground;
}

/* Headings */
.prose h1, .prose h2, .prose h3 {
  @apply font-semibold tracking-tight scroll-mt-20 text-foreground;
}

/* Code blocks */
.prose pre {
  @apply bg-muted rounded-md p-4 font-mono text-sm overflow-x-auto;
}

/* Inline code */
.prose code {
  @apply bg-muted px-1.5 py-0.5 rounded text-sm font-mono;
}

/* Blockquotes */
.prose blockquote {
  @apply border-l-4 border-muted-foreground/20 pl-4 italic text-muted-foreground;
}

/* Tables */
.prose table {
  @apply border-collapse table-auto w-full border border-muted;
}

.prose th {
  @apply border border-muted bg-muted/50 px-4 py-2 text-left font-medium;
}

.prose td {
  @apply border border-muted px-4 py-2;
}
```

### Dark Mode Support

The editor automatically adapts to light/dark themes:

```css
/* Light mode */
.prose {
  --tw-prose-body: theme(colors.foreground);
  --tw-prose-headings: theme(colors.foreground);
}

/* Dark mode */
.dark .prose {
  --tw-prose-body: theme(colors.foreground);
  --tw-prose-headings: theme(colors.foreground);
}
```

### Custom Styling

You can customize the editor appearance with CSS classes:

```tsx
<NotionEditor
  className="custom-editor"
  content={content}
  onChange={setContent}
/>
```

```css
.custom-editor {
  @apply border rounded-lg p-4 bg-card;
}

.custom-editor .ProseMirror {
  @apply min-h-[300px] focus:outline-none;
}
```

## Advanced Usage

### Custom Toolbar

Create a custom toolbar for specific use cases:

```tsx
function CustomToolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex gap-2 p-2 border-b">
      <button
        onClick={() => editor.chain().focus().toggleBold().run()}
        className={editor.isActive('bold') ? 'bg-primary text-primary-foreground' : ''}
      >
        Bold
      </button>
      <button
        onClick={() => editor.chain().focus().toggleItalic().run()}
        className={editor.isActive('italic') ? 'bg-primary text-primary-foreground' : ''}
      >
        Italic
      </button>
    </div>
  );
}

<NotionEditor
  content={content}
  onChange={setContent}
  customToolbar={(editor) => <CustomToolbar editor={editor} />}
/>
```

### Read-Only Mode

Display content in read-only mode:

```tsx
<NotionEditor
  content={content}
  editable={false}
  className="read-only-editor"
/>
```

### PDF Annotation Integration

Use with PDF annotations for note-taking:

```tsx
function PDFNoteEditor({ annotationId }: { annotationId: string }) {
  return (
    <NotionEditor
      autoSave={true}
      placeholder="Add your notes about this highlight..."
      onNoteCreated={(noteId) => {
        // Link note to PDF annotation
        linkNoteToAnnotation(noteId, annotationId);
      }}
    />
  );
}
```

### Error Handling

Wrap the editor in an error boundary:

```tsx
import { EditorErrorBoundary } from "@/components/editor/EditorErrorBoundary";

<EditorErrorBoundary>
  <NotionEditor
    content={content}
    onChange={setContent}
    autoSave={true}
  />
</EditorErrorBoundary>
```

## Troubleshooting

### Common Issues

#### Editor Not Loading
```typescript
// Check if content is properly formatted
const content = {
  title: "My Note",
  content: null // or valid JSONContent
};
```

#### Auto-Save Not Working
```typescript
// Ensure RTK Query is properly configured
// Check network connectivity
// Verify authentication state
```

#### Keyboard Shortcuts Not Working
```typescript
// Ensure editor has focus
// Check for conflicting shortcuts
// Verify KeyboardShortcuts extension is loaded
```

#### Styling Issues
```css
/* Ensure Tailwind CSS is properly configured */
/* Check for CSS conflicts */
/* Verify theme classes are applied */
```

### Debug Mode

Enable debug logging for troubleshooting:

```typescript
// Add to your component
useEffect(() => {
  if (process.env.NODE_ENV === 'development') {
    console.log('Editor state:', editor?.getJSON());
    console.log('Auto-save status:', autoSaveStatus);
  }
}, [editor, autoSaveStatus]);
```

### Performance Optimization

For large documents:

```tsx
<NotionEditor
  content={content}
  onChange={setContent}
  autoSaveDelay={1000}  // Increase delay for large docs
  className="max-h-[500px] overflow-y-auto" // Limit height
/>
```

## API Reference

### Editor Instance Methods

When you have access to the editor instance:

```typescript
// Content manipulation
editor.getJSON()                    // Get content as JSON
editor.getHTML()                    // Get content as HTML  
editor.getText()                    // Get plain text
editor.setContent(content)          // Set new content
editor.clearContent()               // Clear all content

// Selection and focus
editor.focus()                      // Focus the editor
editor.blur()                       // Remove focus
editor.setTextSelection(position)   // Set cursor position

// Commands
editor.chain().focus().toggleBold().run()     // Chain commands
editor.commands.undo()                        // Undo last action
editor.commands.redo()                        // Redo last action

// State queries
editor.isActive('bold')             // Check if bold is active
editor.can().toggleBold()           // Check if bold can be toggled
editor.isEmpty                      // Check if editor is empty
```

### Extension Configuration

Customize extensions when needed:

```typescript
// Example: Custom heading configuration
Heading.configure({
  levels: [1, 2, 3, 4, 5, 6],
  HTMLAttributes: {
    class: 'custom-heading',
  },
})

// Example: Custom table configuration
Table.configure({
  resizable: true,
  handleWidth: 5,
  cellMinWidth: 25,
})
```

## Best Practices

### Performance
- Use `autoSaveDelay` to balance responsiveness and API calls
- Implement proper error boundaries
- Avoid frequent content updates in parent components

### Accessibility
- Always provide meaningful placeholders
- Use proper heading hierarchy
- Ensure keyboard navigation works
- Test with screen readers

### User Experience
- Show auto-save status to users
- Provide clear error messages
- Implement proper loading states
- Use consistent styling across the application

### Data Management
- Always validate content before saving
- Implement proper error recovery
- Use RTK Query for optimal caching
- Handle offline scenarios gracefully

## Related Components

- **[FloatingToolbar](./components/editor/FloatingToolbar.tsx)**: Context-aware formatting toolbar
- **[BubbleMenu](./components/editor/BubbleMenu.tsx)**: Text selection bubble menu
- **[TableBubbleMenu](./components/editor/TableBubbleMenu.tsx)**: Table-specific operations
- **[AutoSaveStatus](./components/editor/AutoSaveStatus.tsx)**: Save status indicator
- **[EditorProvider](./components/editor/EditorProvider.tsx)**: Editor context management
- **[LinkDialog](./components/editor/LinkDialog.tsx)**: Link insertion/editing dialog

## Contributing

When extending the NotionEditor:

1. Follow the existing extension patterns
2. Add proper TypeScript types
3. Include comprehensive tests
4. Update this documentation
5. Ensure accessibility compliance
6. Test across different browsers and devices

---

*This documentation covers the complete NotionEditor system. For specific implementation details, refer to the source code in `components/editor/NotionEditor.tsx` and related files.*