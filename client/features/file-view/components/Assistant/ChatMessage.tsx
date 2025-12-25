import React from "react";
import { Bot, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { NotionEditor } from "@/components/editor/NotionEditor";
import type { JSONContent } from "@tiptap/core";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string | JSONContent;
  timestamp?: Date;
}

export function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <div
      className={cn(
        "flex gap-3 p-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      {/* Avatar */}
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
          isUser
            ? "bg-linear-to-br from-blue-500 to-blue-600"
            : "bg-linear-to-br from-purple-500 to-purple-600"
        )}
      >
        {isUser ? (
          <User className="w-4 h-4 text-white" />
        ) : (
          <Bot className="w-4 h-4 text-white" />
        )}
      </div>

      {/* Message Content */}
      <div
        className={cn("flex flex-col gap-1 max-w-[80%]", isUser && "items-end")}
      >
        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm",
            isUser
              ? "bg-blue-500 text-white rounded-tr-sm"
              : "bg-muted text-foreground rounded-tl-sm"
          )}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap wrap-break-word">
              {content as string}
            </p>
          ) : (
            <NotionEditor
              content={{ content: content as JSONContent }}
              editable={false}
              showTitle={false}
              className="text-sm"
            />
          )}
        </div>

        {/* Timestamp */}
        {timestamp && (
          <span className="text-xs text-muted-foreground px-2">
            {timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>
    </div>
  );
}
