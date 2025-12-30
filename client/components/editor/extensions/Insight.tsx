"use client";

import { Node, mergeAttributes, type RawCommands } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import { NodeViewWrapper, NodeViewContent } from "@tiptap/react";
import { Sparkles, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Commands, JSONContent } from "@tiptap/core";

interface Metadata {
  pageNumber: number;
}

interface InsightAttributes {
  selectedText: string;
  metadata: Metadata;
  content: JSONContent;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    /**
     * Set an AI callout node
     */
    setInsight: (attributes: InsightAttributes) => ReturnType;
  }
}

export const InsightComponent = (props: any) => {
  const { node, deleteNode, editor } = props;
  const { selectedText, metadata } = node.attrs;

  return (
    <NodeViewWrapper className="insight-wrapper my-8 group/insight">
      <div
        className={cn(
          "relative rounded-2xl border border-border",
          "bg-card/50 dark:bg-card/20",
          "p-6 shadow-sm transition-all duration-300",
          "hover:shadow-md hover:border-primary/30"
        )}
      >
        {/* Subtle decorative background */}
        <div className="absolute -inset-px rounded-2xl bg-linear-to-br from-primary/5 to-transparent -z-10 opacity-50" />

        {/* Header Section */}
        <div className="flex flex-col gap-3 mb-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary">
                <Sparkles size={16} className="fill-current" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-primary leading-none mb-1">
                  AI Insight
                </span>
                <span className="text-[10px] font-medium text-muted-foreground/60 leading-none">
                  Page {metadata?.pageNumber || "N/A"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {editor.isEditable && (
                <button
                  onClick={deleteNode}
                  className="opacity-0 group-hover/insight:opacity-100 transition-opacity p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-lg"
                  title="Remove insight"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M18 6 6 18" />
                    <path d="m6 6 12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          <div className="relative pl-4 border-l-2 border-primary/20 py-1">
            <p className="text-sm font-medium text-foreground/80 italic leading-relaxed">
              "{selectedText}"
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="prose prose-sm dark:prose-invert max-w-none">
          <NodeViewContent
            className={cn(
              "insight-content",
              "text-foreground/90 font-normal leading-relaxed",
              "focus:outline-none"
            )}
          />
        </div>

        {/* Subtle AI badge */}
        <div className="absolute bottom-3 right-4 opacity-30 select-none pointer-events-none">
          <span className="text-[8px] font-bold uppercase tracking-widest text-primary">
            V-AI
          </span>
        </div>
      </div>
    </NodeViewWrapper>
  );
};
export const Insight = Node.create({
  name: "insight",
  group: "block",
  content: "block+",
  draggable: true,
  addAttributes() {
    return {
      selectedText: {
        default: "",
        parseHTML: (element) => element.getAttribute("data-selected-text"),
        renderHTML: (attributes) => {
          return {
            "data-selected-text": attributes.selectedText,
          };
        },
      },
      metadata: {
        default: {},
        parseHTML: (element) => element.getAttribute("data-metadata"),
        renderHTML: (attributes) => {
          return {
            "data-metadata": attributes.metadata,
          };
        },
      },
    };
  },
  parseHTML() {
    return [
      {
        tag: 'div[data-type="insight"]',
      },
    ];
  },
  renderHTML({ HTMLAttributes }) {
    return [
      "div",
      mergeAttributes(HTMLAttributes, { "data-type": "insight" }),
      0,
    ];
  },
  addNodeView() {
    return ReactNodeViewRenderer(InsightComponent);
  },
  addCommands() {
    return {
      setInsight:
        (attributes: InsightAttributes) =>
        ({ commands }: { commands: any }) => {
          return commands.insertContent({
            type: this.name,
            attrs: {
              selectedText: attributes.selectedText,
              metadata: attributes.metadata,
            },
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
