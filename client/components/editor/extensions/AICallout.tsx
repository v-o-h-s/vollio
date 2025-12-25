"use client";

import { Node, mergeAttributes, type RawCommands } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { JSONContent } from "@tiptap/core";

interface AICalloutAttributes {
  title?: string;
  content?: JSONContent[];
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    /**
     * Set an AI callout node
     */
    setAICallout: (attributes: AICalloutAttributes) => ReturnType;
  }
}

// React component for rendering the AI Callout
export const AICalloutComponent = (props: any) => {
  const { node, updateAttributes, deleteNode, editor } = props;
  const { title } = node.attrs;

  return (
    <NodeViewWrapper className="ai-callout-wrapper my-4">
      <div
        className={cn(
          "relative rounded-xl border border-indigo-200 dark:border-indigo-800/50",
          "bg-linear-to-br from-indigo-50/50 to-purple-50/30 dark:from-indigo-950/20 dark:to-purple-950/10",
          "p-5 shadow-sm transition-all",
          "hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700/50"
        )}
      >
        {/* Decorative gradient glow */}
        <div className="absolute -inset-px rounded-xl bg-linear-to-br from-indigo-500/10 to-purple-500/10 blur-sm -z-10 opacity-50" />

        {/* Header with icon and title */}
        <div className="flex items-start gap-3 mb-3">
          <div className="shrink-0 w-8 h-8 rounded-lg bg-indigo-500/10 dark:bg-indigo-500/20 flex items-center justify-center mt-0.5">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400 fill-current" />
          </div>
          <div className="flex-1 min-w-0">
            {editor.isEditable ? (
              <input
                type="text"
                value={title}
                onChange={(e) => updateAttributes({ title: e.target.value })}
                placeholder="AI Insight Title"
                className={cn(
                  "w-full px-0 py-0 bg-transparent border-0",
                  "text-base font-heading font-semibold text-foreground",
                  "focus:outline-none focus:ring-0",
                  "placeholder:text-muted-foreground/50"
                )}
              />
            ) : (
              <h3 className="text-base font-heading font-semibold text-foreground">
                {title || "AI Insight"}
              </h3>
            )}
          </div>
          {editor.isEditable && (
            <button
              onClick={deleteNode}
              className="shrink-0 w-6 h-6 rounded-md hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors flex items-center justify-center"
              title="Remove callout"
            >
              ×
            </button>
          )}
        </div>

        {/* Content area - editable */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <NodeViewContent
            className={cn(
              "ai-callout-content",
              "text-foreground/90 leading-relaxed",
              "*:my-2 *:first:mt-0 *:last:mb-0",
              "focus:outline-none"
            )}
          />
        </div>

        {/* Subtle AI badge */}
        <div className="absolute top-2 right-2 opacity-50">
          <span className="text-[9px] uppercase tracking-wider font-medium text-indigo-600 dark:text-indigo-400">
            AI Generated
          </span>
        </div>
      </div>
    </NodeViewWrapper>
  );
};

// TipTap Node extension
export const AICallout = Node.create({
  name: "aiCallout",

  group: "block",

  content: "block+",

  draggable: true,

  addAttributes() {
    return {
      title: {
        default: "AI Explanation",
        parseHTML: (element) => element.getAttribute("data-title"),
        renderHTML: (attributes) => {
          return {
            "data-title": attributes.title,
          };
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="ai-callout"]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "ai-callout" }),
      0,
    ];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AICalloutComponent);
  },

  addCommands() {
    return {
      setAICallout:
        (attributes: AICalloutAttributes) =>
        ({ commands }) => {
          return commands.insertContent({
            type: this.name,
            attrs: { title: attributes.title },
            content: attributes.content || [
              {
                type: "paragraph",
                content: [
                  {
                    type: "text",
                    text: "AI-generated content will appear here.",
                  },
                ],
              },
            ],
          });
        },
    } as any as RawCommands;
  },
});

// Helper function to insert AI response into editor
export function insertAICallout(
  editor: any,
  title: string,
  content: JSONContent[]
) {
  if (!editor) return;

  editor
    .chain()
    .focus()
    .setAICallout({
      title,
      content,
    })
    .run();
}
