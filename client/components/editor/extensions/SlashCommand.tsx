"use client";

import { Extension } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import Suggestion from "@tiptap/suggestion";
import {
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Minus,
  Type,
  Image,
  Link,
  Table,
  LucideIcon,
  Sparkles,
} from "lucide-react";

export interface SlashCommandItem {
  title: string;
  description: string;
  icon: LucideIcon;
  command: ({ editor, range }: { editor: any; range: any }) => void;
  keywords?: string[];
}

export const slashCommandItems: SlashCommandItem[] = [
  {
    title: "Text",
    description: "Just start typing with plain text.",
    icon: Type,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .toggleNode("paragraph", "paragraph")
        .run();
    },
    keywords: ["p", "paragraph", "text"],
  },
  {
    title: "Heading 1",
    description: "Big section heading.",
    icon: Heading1,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 1 })
        .run();
    },
    keywords: ["h1", "heading1", "title"],
  },
  {
    title: "Heading 2",
    description: "Medium section heading.",
    icon: Heading2,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 2 })
        .run();
    },
    keywords: ["h2", "heading2", "subtitle"],
  },
  {
    title: "Heading 3",
    description: "Small section heading.",
    icon: Heading3,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setNode("heading", { level: 3 })
        .run();
    },
    keywords: ["h3", "heading3"],
  },
  {
    title: "Bullet List",
    description: "Create a simple bullet list.",
    icon: List,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
    keywords: ["ul", "bullet", "list", "unordered"],
  },
  {
    title: "Numbered List",
    description: "Create a list with numbering.",
    icon: ListOrdered,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
    keywords: ["ol", "numbered", "list", "ordered"],
  },
  {
    title: "Quote",
    description: "Capture a quote.",
    icon: Quote,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
    keywords: ["blockquote", "quote"],
  },
  {
    title: "Code",
    description: "Capture a code snippet.",
    icon: Code,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
    keywords: ["code", "codeblock"],
  },
  {
    title: "Divider",
    description: "Visually divide blocks.",
    icon: Minus,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
    keywords: ["hr", "divider", "separator"],
  },
  {
    title: "Image",
    description: "Upload an image from your computer.",
    icon: Image,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertContent({
          type: "imageUpload",
          attrs: {
            src: "",
            alt: "",
            loading: false,
          },
        })
        .run();
    },
    keywords: ["image", "photo", "picture", "upload"],
  },
  {
    title: "Link",
    description: "Create a link to a webpage.",
    icon: Link,
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();

      // Trigger link dialog
      const event = new CustomEvent("openLinkDialog");
      document.dispatchEvent(event);
    },
    keywords: ["link", "url", "href", "anchor"],
  },
  {
    title: "Table",
    description: "Create a table with rows and columns.",
    icon: Table,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run();
    },
    keywords: ["table", "grid", "rows", "columns"],
  },
  {
    title: "AI Insight",
    description: "Insert an AI-generated insight box.",
    icon: Sparkles,
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .setInsight({
          selectedText: "Selected text from source",
          metadata: {
            pageNumber: 1,
          },
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "AI-generated insight will appear here.",
                },
              ],
            },
          ],
        })
        .run();
    },
    keywords: ["ai", "insight", "sparkles", "callout"],
  },
];

interface SlashCommandListProps {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
  selectedIndex: number;
}

function SlashCommandList({
  items,
  command,
  selectedIndex,
}: SlashCommandListProps) {
  return (
    <div className="slash-command-menu z-60 h-auto max-h-[330px] w-72 overflow-y-auto rounded-md border border-border bg-background/95 backdrop-blur-sm p-1 shadow-xl">
      {items.length > 0 ? (
        items.map((item, index) => {
          const Icon = item.icon;
          return (
            <button
              key={index}
              className={`flex w-full items-center space-x-2 rounded-md px-2 py-1 text-left text-sm hover:bg-accent hover:text-accent-foreground transition-colors ${
                index === selectedIndex
                  ? "bg-accent text-accent-foreground"
                  : ""
              }`}
              onClick={() => command(item)}
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-md border border-border bg-background">
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">{item.title}</p>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
            </button>
          );
        })
      ) : (
        <div className="px-2 py-1 text-sm text-muted-foreground">
          No results
        </div>
      )}
    </div>
  );
}

export const SlashCommand = Extension.create({
  name: "slashCommand",

  addOptions() {
    return {
      suggestion: {
        char: "/",
        command: ({
          editor,
          range,
          props,
        }: {
          editor: any;
          range: any;
          props: any;
        }) => {
          props.command({ editor, range });
        },
      },
    };
  },

  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

export const slashCommandSuggestion = {
  items: ({ query }: { query: string }) => {
    return slashCommandItems
      .filter((item) => {
        if (typeof query === "string" && query.length > 0) {
          const search = query.toLowerCase();
          return (
            item.title.toLowerCase().includes(search) ||
            item.description.toLowerCase().includes(search) ||
            (item.keywords &&
              item.keywords.some((keyword) => keyword.includes(search)))
          );
        }
        return true;
      })
      .slice(0, 10);
  },

  render: () => {
    let component: ReactRenderer;
    let popup: HTMLElement | null = null;
    let selectedIndex = 0;

    const updateSelectedIndex = (
      newIndex: number,
      items: SlashCommandItem[]
    ) => {
      const itemCount = Array.isArray(items) ? items.length : 0;
      selectedIndex = Math.max(
        0,
        Math.min(newIndex, Math.max(0, itemCount - 1))
      );
      if (component && typeof component.updateProps === "function") {
        component.updateProps({ selectedIndex });
      }
    };

    return {
      onStart: (props: any) => {
        selectedIndex = 0;
        component = new ReactRenderer(SlashCommandList, {
          props: { ...props, selectedIndex },
          editor: props.editor,
        });

        if (!props.clientRect) {
          return;
        }

        // Create a simple popup without tippy.js
        popup = document.createElement("div");
        popup.style.position = "absolute";
        popup.style.zIndex = "60";
        popup.className = "slash-command-popup";
        popup.appendChild(component.element);
        document.body.appendChild(popup);

        const rect = props.clientRect();
        popup.style.top = `${rect.bottom + window.scrollY}px`;
        popup.style.left = `${rect.left + window.scrollX}px`;
      },

      onUpdate(props: any) {
        if (component && typeof component.updateProps === "function") {
          component.updateProps({ ...props, selectedIndex });
        }

        if (!props.clientRect || !popup) {
          return;
        }

        const rect = props.clientRect();
        popup.style.top = `${rect.bottom + window.scrollY}px`;
        popup.style.left = `${rect.left + window.scrollX}px`;
      },

      onKeyDown(props: any) {
        const { event } = props;

        if (event.key === "Escape") {
          if (popup) {
            popup.remove();
            popup = null;
          }
          if (component) {
            try {
              component.destroy();
            } catch (_) {}
            component = undefined as any;
          }
          return true;
        }

        if (event.key === "ArrowUp") {
          event.preventDefault();
          event.stopPropagation();
          updateSelectedIndex(selectedIndex - 1, props.items);
          return true;
        }

        if (event.key === "ArrowDown") {
          event.preventDefault();
          event.stopPropagation();
          updateSelectedIndex(selectedIndex + 1, props.items);
          return true;
        }

        if (event.key === "Enter") {
          const items = Array.isArray(props.items) ? props.items : [];
          const selectedItem = items[selectedIndex];
          if (selectedItem) {
            try {
              props.command(selectedItem);
            } catch (err) {
              console.error("SlashCommand execution error", err);
            }
          }

          // Clean up immediately after command
          if (popup) {
            popup.remove();
            popup = null;
          }
          if (component) {
            try {
              component.destroy();
            } catch (_) {}
            component = undefined as any;
          }

          return true;
        }

        return false;
      },

      onExit() {
        if (popup) {
          popup.remove();
        }
        component.destroy();
      },
    };
  },
};
