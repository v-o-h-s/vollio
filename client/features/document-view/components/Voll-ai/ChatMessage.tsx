import { useState } from "react";
import {
  LuUser as User,
  LuCopy as Copy,
  LuPlus as Plus,
  LuTrash2 as Trash2,
  LuCheck as Check,
} from "react-icons/lu";
import { RiRobot3Fill as Sparkles } from "react-icons/ri";
import { cn } from "@/lib/utils";
import { NotionEditor } from "@/components/editor/NotionEditor";
import type { JSONContent } from "@tiptap/core";
import { useViewer } from "../../context/ViewerContext";
import { MessageSource } from "../../hooks/useVollAiLogic";
import { useAppSelector } from "@/lib/store/hooks";
import { ScaledPosition } from "react-pdf-highlighter-extended-plus";
import { HighlightContent } from "@/lib/shared";

interface ChatMessageProps {
  role: "user" | "assistant";
  source: MessageSource;
  content: string | JSONContent;
  timestamp?: Date;
  onDelete?: () => void;
  isLast?: boolean;
  metadata?: {
    documentName: string;
    content: HighlightContent;
    position: ScaledPosition;
  };
}

export function ChatMessage({
  role,
  source,
  content,
  timestamp,
  onDelete,
  metadata,
}: ChatMessageProps) {
  const {
    copyContentToClipboard,
    addInsightToVollNotes,
    appendContentToActiveNote,
    openNote,
  } = useViewer();
  const vollAiFontSize = useAppSelector(
    (state) => state.settings.vollAiFontSize
  );
  const [copied, setCopied] = useState(false);

  const handleCopyClick = async () => {
    await copyContentToClipboard(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isUser = role === "user";

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
          "flex flex-col gap-1  w-full ",
          isUser && "items-end max-w-[80%]",
        )}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm",
            isUser
              ? "bg-foreground/5 text-white rounded-tr-sm"
              : "bg-background text-foreground rounded-tl-sm"
          )}
        >
          {isUser ? (
            <p
              className="whitespace-pre-wrap wrap-break-word  text-black dark:text-white"
              style={{ fontSize: `${vollAiFontSize}px` }}
            >
              {content as string}
            </p>
          ) : (
            <NotionEditor
              content={{ content: content as JSONContent }}
              editable={false}
              showTitle={false}
              className="min-h-0 p-0 bg-transparent [&_a]:text-purple-500 [&_a]:hover:text-purple-600 [&_a]:transition-colors"
              fontSize={vollAiFontSize}
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
                onClick={handleCopyClick}
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
                <button
                  onClick={() => appendContentToActiveNote(content)}
                  className="flex items-center gap-1 hover:text-indigo-400 transition-colors"
                  title="Add to active note"
                >
                <Plus className="w-3.5 h-3.5" />
              </button>
              {source === MessageSource.DOCUMENT && (
                <button
                  className="p-1 rounded-md hover:bg-muted text-muted-foreground transition-colors group"
                  title="Add as Insight"
                  onClick={() => addInsightToVollNotes(content, metadata)}
                >
                  <Sparkles className="w-3.5 h-3.5 group-hover:text-purple-500 transition-colors" />
                </button>
              )}
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
