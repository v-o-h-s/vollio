# Floating Toolbar Components

This directory contains floating toolbar components that appear when text is selected, similar to Medium, Notion, and other modern editors.

## Components

### 1. FloatingToolbar (Basic)
A simple floating toolbar with essential formatting options.

**Features:**
- Bold, Italic, Underline, Strikethrough
- Inline Code
- Quick Link (with prompt)
- Blockquote
- Heading Toggle
- Placeholder buttons for Color and More Options

**Usage:**
```tsx
import { FloatingToolbar } from '@/components/editor/FloatingToolbar';

// Used automatically in NotionEditor, or manually:
<FloatingToolbar editor={editor} />
```

### 2. AdvancedFloatingToolbar
A feature-rich floating toolbar with advanced formatting options.

**Features:**
- All basic formatting options
- Advanced Link Dialog with URL input
- Text Color Picker
- Highlight Colors
- List Formatting (Bullet/Numbered)
- Popover-based UI for better UX

**Usage:**
```tsx
import { AdvancedFloatingToolbar } from '@/components/editor/AdvancedFloatingToolbar';

<NotionEditor
  customToolbar={(editor) => <AdvancedFloatingToolbar editor={editor} />}
/>
```

### 3. PDFAnnotationToolbar
A specialized toolbar designed for PDF annotation workflows.

**Features:**
- Text formatting (Bold, Italic, Underline, Strikethrough)
- Multiple highlight colors with visual selection
- Save annotation action
- Cancel action
- Optimized for annotation workflows

**Usage:**
```tsx
import { PDFAnnotationToolbar } from '@/components/editor/PDFAnnotationToolbar';

<PDFAnnotationToolbar
  editor={editor}
  onSaveAnnotation={(content) => console.log('Save:', content)}
  onCancel={() => console.log('Cancel')}
/>
```

### 4. FloatingToolbarDemo
A demonstration component showing both basic and advanced toolbars.

**Usage:**
```tsx
import { FloatingToolbarDemo } from '@/components/editor/FloatingToolbarDemo';

<FloatingToolbarDemo />
```

## Key Features

### Intelligent Positioning
- Automatically positions above selected text
- Adjusts position to stay within viewport
- Handles window resize and scroll events
- Responsive design for mobile devices

### Selection-Based Activation
- Only appears when text is selected
- Hides when selection is empty
- Updates position as selection changes
- Handles click outside to dismiss

### Smooth Animations
- Fade-in/zoom-in animation on appear
- Smooth transitions for button states
- Backdrop blur effect for modern look
- Active state indicators

### Mobile Responsive
- Touch-friendly button sizes
- Responsive layout for small screens
- Proper touch event handling
- Optimized for mobile text selection

## Styling

The toolbars use CSS classes defined in `app/globals.css`:

```css
/* Active state for floating toolbar buttons */
.floating-toolbar button[data-active="true"] {
  background-color: hsl(var(--primary));
  color: hsl(var(--primary-foreground));
}

/* Enhanced hover states */
.floating-toolbar button:hover {
  background-color: hsl(var(--accent));
  transform: translateY(-1px);
}
```

## Customization

### Creating Custom Toolbars

1. **Basic Structure:**
```tsx
interface CustomToolbarProps {
  editor: Editor;
  className?: string;
}

export function CustomToolbar({ editor, className }: CustomToolbarProps) {
  const [position, setPosition] = useState({ top: 0, left: 0, visible: false });
  
  // Position calculation logic...
  
  return (
    <div className="floating-toolbar" style={{ top: position.top, left: position.left }}>
      {/* Your toolbar buttons */}
    </div>
  );
}
```

2. **Adding Custom Commands:**
```tsx
const handleCustomCommand = () => {
  editor.chain().focus().toggleHeading({ level: 1 }).run();
  editor.view.focus(); // Keep editor focused
};
```

3. **Active State Detection:**
```tsx
<Button
  data-active={editor.isActive('bold')}
  onClick={() => editor.chain().focus().toggleBold().run()}
>
  <Bold />
</Button>
```

### Integration with NotionEditor

Use the `customToolbar` prop to override the default toolbar:

```tsx
<NotionEditor
  content={content}
  onChange={setContent}
  customToolbar={(editor) => <YourCustomToolbar editor={editor} />}
/>
```

## Performance Considerations

- Position updates are debounced with `setTimeout`
- Event listeners are properly cleaned up
- Toolbar only renders when visible
- Efficient re-rendering with proper dependencies

## Browser Compatibility

- Modern browsers with CSS backdrop-filter support
- Fallback styling for older browsers
- Touch event support for mobile devices
- Proper keyboard navigation support

## Examples

See the `FloatingToolbarDemo` component for complete examples of all toolbar variants in action.

## Integration with PDF Annotation System

The floating toolbars are designed to integrate seamlessly with the PDF annotation system:

### PDF Annotation Workflow

1. **Text Selection in PDF**: User selects text in the PDF viewer
2. **Annotation Creation**: Mobile dialog or desktop tooltip appears
3. **Rich Text Editing**: User creates annotation content using the NotionEditor with floating toolbars
4. **Save Annotation**: Content is saved with the selected PDF text coordinates

### Specialized PDF Toolbar

The `PDFAnnotationToolbar` is specifically designed for PDF annotation workflows:

- Streamlined formatting options relevant to annotations
- Highlight color selection for visual annotation types
- Save/Cancel actions integrated with annotation creation flow
- Optimized for quick annotation creation without complex formatting

### Cross-Component Communication

The editor components work with the PDF system through:

- **Shared State**: Redux store manages both PDF and editor state
- **Event System**: Custom events for toolbar actions and editor updates
- **Context Providers**: EditorProvider manages editor state across components
- **Type Safety**: Shared TypeScript interfaces for annotation content

## Performance Considerations

- **Lazy Loading**: Toolbar components only render when text is selected
- **Debounced Updates**: Position calculations are debounced for smooth performance
- **Memory Management**: Proper cleanup of event listeners and timeouts
- **Mobile Optimization**: Touch-friendly interactions with optimized event handling