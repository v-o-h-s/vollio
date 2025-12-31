"use client";

import { useState, useRef, useEffect } from "react";
import { LuSend as Send, LuSquarePen as SquarePen } from "react-icons/lu";
import { RiRobot3Fill as Bot } from "react-icons/ri";
import { ChatMessage } from "./ChatMessage";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useViewer } from "../../context/ViewerContext";
import { useAppSelector } from "@/lib/store/hooks";

export function VollAiChat({ isFocused }: { isFocused?: boolean }) {
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const {
    messages,
    addUserMessage,
    handleDeleteMessage: handleDelete,
    resetMessages,
    isVollAiLoading: isLoading,
  } = useViewer();
  const vollAiFontSize = useAppSelector(
    (state) => state.settings.vollAiFontSize
  );

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Auto-resize textarea
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = "auto";
      inputRef.current.style.height = `${inputRef.current.scrollHeight}px`;
    }
  }, [input]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    addUserMessage(input);
    setInput("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col bg-background w-full">
      {/* Header */}
      <div
        className={cn(
          "shrink-0 border-b px-4 py-3 flex items-center justify-between transition-colors duration-300",
          isFocused
            ? "border-purple-500/30 bg-purple-500/5"
            : "border-border bg-card/20"
        )}
      >
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full  flex items-center justify-center">
            <Bot className={cn("w-4 h-4", isFocused ? "text-purple-500" : "dark:text-white")} />
          </div>
          <div>
            <h2 className={cn("text-sm font-semibold transition-colors", isFocused ? "text-purple-500" : "text-foreground")}>
              Voll-ai
            </h2>
            <p className="text-xs text-muted-foreground">
              Ask me anything about your document
            </p>
          </div>
        </div>
        {messages.length > 0 && (
          <Button
            variant="ghost"
            size="icon"
            onClick={resetMessages}
            className="h-8 w-8 text-muted-foreground hover:text-purple-500 transition-colors"
            title="New Chat"
          >
            <SquarePen className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-2 py-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-2 max-w-sm px-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-purple-500 flex items-center justify-center shadow-lg shadow-purple-500/20">
                <Bot className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">
                Start a conversation
              </h3>
              <p className="text-sm text-muted-foreground">
                Ask questions about your document, request summaries, or get
                explanations
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-1">
            {messages.map((message, index) => (
              <ChatMessage
                key={index}
                role={message.role}
                source={message.source}
                content={message.content}
                timestamp={message.timestamp}
                metadata={message.metadata}
                onDelete={() => handleDelete(index)}
              />
            ))}
            {isLoading && (
              <div className="flex gap-3 p-4 animate-in fade-in duration-300">
                <div className="w-8 h-8 rounded-full bg-linear-to-br from-purple-500 to-purple-600 flex items-center justify-center shrink-0 shadow-sm">
                  <Bot className="w-4 h-4 text-white animate-pulse" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5">
                    <div className="flex gap-1">
                      <span
                        className="w-2 h-2 bg-purple-500/40 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="w-2 h-2 bg-purple-500/40 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-2 h-2 bg-purple-500/40 rounded-full animate-bounce"
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="shrink-0 border-t border-border bg-background p-4">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            className={cn(
              "flex-1 resize-none rounded-xl border border-border bg-background px-4 py-3",
              "text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent",
              "transition-all duration-200",
              "max-h-32 min-h-[44px]"
            )}
            style={{ fontSize: `${vollAiFontSize}px` }}
            rows={1}
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="h-11 w-11 rounded-xl shrink-0 p-0 bg-purple-500 hover:bg-purple-600 text-white shadow-sm"
            title="Send message (Enter)"
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2 px-1">
          Press{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono text-xs">
            Enter
          </kbd>{" "}
          to send,{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-muted text-muted-foreground font-mono text-xs">
            Shift+Enter
          </kbd>{" "}
          for new line
        </p>
      </div>
    </div>
  );
}
