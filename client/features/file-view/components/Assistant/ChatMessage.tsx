import { useState } from "react";
import { Bot, User, Copy, Plus, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotionEditor } from "@/components/editor/NotionEditor";
import type { JSONContent } from "@tiptap/core";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string | JSONContent;
  timestamp?: Date;
  onDelete?: () => void;
  isLast?: boolean;
}

export function ChatMessage({
  role,
  content,
  timestamp,
  onDelete,
}: ChatMessageProps) {
  console.log("this is content",content)
  const isUser = role === "user";
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    // it is fuckign recursion dawg
    let textToCopy = "";
    if (typeof content === "string") {
      textToCopy = content;
    } else {
      // Helper to extract text from Tiptap JSONContent
      const extractText = (node: JSONContent): string => {
        if (node.text) return node.text;
        if (!node.content) return "";

        const contentText = node.content.map(extractText).join("");

        // Add formatting for common block types
        if (node.type === "paragraph" || node.type?.startsWith("heading")) {
          return contentText + "\n";
        }
        if (node.type === "listItem") {
          return "• " + contentText + "\n";
        }
        return contentText;
      };

      textToCopy = extractText(content).trim();
    }

    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <div
      className={cn(
        "flex gap-3 p-4 animate-in fade-in slide-in-from-bottom-2 duration-300 w-full",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Message Content */}
      <div
        className={cn(
          "flex flex-col gap-1 max-w-[80%] w-full ",
          isUser && "items-end"
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm",
            isUser
              ? "bg-card text-white rounded-tr-sm"
              : "bg-background text-foreground rounded-tl-sm"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap wrap-break-word text-black dark:text-white">
              {content as string}
            </p>
          ) : (
            <NotionEditor
              content={{ content: content as JSONContent }}
              editable={false}
              showTitle={false}
              className="text-sm min-h-0 p-0 bg-transparent"
            />
          )}
        </div>

        {/* Footer: Timestamp & Actions */}
        <div
          className={cn(
            "flex items-center gap-2 px-2",
            isUser ? "flex-row-reverse" : "flex-row"
          )}
        >
          {timestamp && (
            <span className="text-[10px] text-muted-foreground/60 uppercase font-medium">
              {timestamp.toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          )}
          {/* Actions */}

          {!isUser && (
            <div className="flex items-center gap-1 ml-1">
              <button
                className={cn(
                  "p-1 rounded-md transition-colors",
                  copied
                    ? "text-green-500 bg-green-500/10"
                    : "hover:bg-muted text-muted-foreground"
                )}
                title={copied ? "Copied!" : "Copy to clipboard"}
                onClick={handleCopy}
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
              <button
                className="p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors"
                title="Add to notes"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
              <button
                className="p-1 rounded-md hover:bg-muted text-muted-foreground hover:text-destructive transition-colors"
                title="Delete message"
                onClick={onDelete}
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
