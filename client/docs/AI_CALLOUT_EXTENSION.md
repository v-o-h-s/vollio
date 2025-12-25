# AI Callout Extension

## Overview

The **AICallout** extension is a custom TipTap node that creates beautiful, editable callout blocks for AI-generated content. It's designed to seamlessly integrate AI explanations and insights into the NotionEditor as structured, professional-looking blocks.

## Features

- ✨ **Beautiful Design**: Premium glassmorphic design with subtle gradients and indigo/purple color scheme
- ✏️ **Fully Editable**: Both title and content are editable inline
- 🎨 **App-Integrated Styling**: Matches the Vollio UI design system with proper theming support
- 🔖 **AI Badge**: Subtle "AI Generated" badge to indicate the source
- 🗑️ **Easy Deletion**: Delete button available in edit mode
- 📱 **Responsive**: Works great on all screen sizes

## Usage

### 1. Basic Usage with Helper Function

The easiest way to insert AI content is using the `insertAICallout` helper:

```typescript
import { insertAICallout } from "@/components/editor/extensions";

// In your component
const handleSaveToNotes = () => {
  const editor = editorRef.current;
  const title = "Understanding Quantum Physics";
  const content = [
    {
      type: "paragraph",
      content: [{ type: "text", text: "Quantum physics is..." }],
    },
    {
      type: "heading",
      attrs: { level: 2 },
      content: [{ type: "text", text: "Key Concepts" }],
    },
    {
      type: "bulletList",
      content: [
        {
          type: "listItem",
          content: [
            {
              type: "paragraph",
              content: [{ type: "text", text: "Wave-particle duality" }],
            },
          ],
        },
      ],
    },
  ];

  insertAICallout(editor, title, content);
};
```

### 2. Using the Editor Command Directly

You can also use the TipTap command directly:

```typescript
editor
  .chain()
  .focus()
  .setAICallout({
    title: "AI Explanation",
    content: [
      {
        type: "paragraph",
        content: [{ type: "text", text: "Content here..." }],
      },
    ],
  })
  .run();
```

### 3. Converting Explanation Data

If you have explanation data from the API, convert it to the correct format:

```typescript
// Assuming explanation has { title: string, content: JSONContent }
const handleSaveExplanation = () => {
  if (!editor || !explanation) return;

  // The explanation.content is already in TipTap JSONContent format
  insertAICallout(
    editor,
    explanation.title,
    explanation.content.content // The nested content array
  );
};
```

## Integration Example

Here's a complete example of integrating with the ExplanationBox:

```typescript
// In ExplanationBox or similar component
import { insertAICallout } from "@/components/editor/extensions";

interface ExplanationBoxProps {
  editorRef: React.RefObject<Editor>;
  explanation: {
    title: string;
    content: JSONContent;
  };
}

export const ExplanationBox = ({ editorRef, explanation }) => {
  const handleSaveToNotes = () => {
    if (!editorRef.current || !explanation) return;

    // Convert the explanation to the callout format
    insertAICallout(
      editorRef.current,
      explanation.title,
      explanation.content.content || []
    );

    toast.success("Explanation saved to notes!");
  };

  return (
    <div>
      {/* ... explanation display ... */}
      <Button onClick={handleSaveToNotes}>
        <Save className="w-4 h-4 mr-2" />
        Save to Notes
      </Button>
    </div>
  );
};
```

## Content Format

The extension accepts content in TipTap's JSONContent format. Here are some examples:

### Simple Paragraph

```json
[
  {
    "type": "paragraph",
    "content": [{ "type": "text", "text": "This is a paragraph." }]
  }
]
```

### Rich Content

```json
[
  {
    "type": "paragraph",
    "content": [
      { "type": "text", "text": "This is " },
      { "type": "text", "marks": [{ "type": "bold" }], "text": "bold" },
      { "type": "text", "text": " and " },
      { "type": "text", "marks": [{ "type": "italic" }], "text": "italic" },
      { "type": "text", "text": "." }
    ]
  }
]
```

### Lists and Headings

```json
[
  {
    "type": "heading",
    "attrs": { "level": 2 },
    "content": [{ "type": "text", "text": "Key Points" }]
  },
  {
    "type": "bulletList",
    "content": [
      {
        "type": "listItem",
        "content": [
          {
            "type": "paragraph",
            "content": [{ "type": "text", "text": "First point" }]
          }
        ]
      },
      {
        "type": "listItem",
        "content": [
          {
            "type": "paragraph",
            "content": [{ "type": "text", "text": "Second point" }]
          }
        ]
      }
    ]
  }
]
```

## Styling

The callout automatically inherits the app's theme and uses:

- `font-heading` for the title (Playfair Display)
- Indigo/purple gradient accents
- Glassmorphic background with backdrop blur
- Proper dark mode support

Custom styling can be added via CSS:

```css
.ai-callout-wrapper {
  /* Custom wrapper styles */
}

.ai-callout-content {
  /* Custom content styles */
}
```

## TypeScript Types

```typescript
import type { JSONContent } from "@tiptap/core";

interface AICalloutAttributes {
  title?: string;
  content?: JSONContent[];
}

// Helper function signature
function insertAICallout(
  editor: Editor,
  title: string,
  content: JSONContent[]
): void;
```

## HTML Output

When saved, the callout produces clean HTML:

```html
<div data-type="ai-callout" data-title="Your Title">
  <p>Your content here...</p>
</div>
```

## Best Practices

1. **Always validate the editor**: Check that the editor exists before inserting
2. **Provide meaningful titles**: The title should give context to the AI-generated content
3. **Use structured content**: Break long explanations into headings, paragraphs, and lists
4. **Handle errors gracefully**: Show user feedback if insertion fails
5. **Close dialogs after save**: Close the ExplanationBox after successfully saving

## Troubleshooting

### Content not appearing

Make sure the content is in the correct JSONContent format:

```typescript
// ❌ Wrong
insertAICallout(editor, title, "plain text");

// ✅ Correct
insertAICallout(editor, title, [
  {
    type: "paragraph",
    content: [{ type: "text", text: "plain text" }],
  },
]);
```

### Editor is null

Ensure you're calling the function after the editor has initialized:

```typescript
useEffect(() => {
  if (editor && autoInsert) {
    insertAICallout(editor, ...);
  }
}, [editor, autoInsert]);
```

### Styling doesn't match

Make sure you've imported the global styles and the editor has the required CSS variables for theming.

## Future Enhancements

Potential improvements for future versions:

- [ ] Support for different callout types (info, warning, success)
- [ ] Collapsible content sections
- [ ] Copy callout content to clipboard
- [ ] Share/export individual callouts
- [ ] Version history for edited callouts
