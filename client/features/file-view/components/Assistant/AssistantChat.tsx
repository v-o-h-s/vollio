"use client";

import { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";
import { ChatMessage } from "./ChatMessage";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function AssistantChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Simulate AI response (replace with actual API call later)
    setTimeout(() => {
      const assistantMessage: Message = {
        role: "assistant",
        content: getMockResponse(input),
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);
      setIsLoading(false);
    }, 1000 + Math.random() * 1000);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-border bg-card px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-foreground">
              AI Assistant
            </h2>
            <p className="text-xs text-muted-foreground">
              Ask me anything about your document
            </p>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto px-2 py-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center space-y-2 max-w-sm px-4">
              <div className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-purple-500/10 to-purple-600/10 flex items-center justify-center">
                <Sparkles className="w-8 h-8 text-purple-500" />
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
                content={message.content}
                timestamp={message.timestamp}
              />
            ))}
            {isLoading && (
              <div className="flex gap-3 p-4 animate-in fade-in duration-300">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center flex-shrink-0">
                  <Sparkles className="w-4 h-4 text-white animate-pulse" />
                </div>
                <div className="flex flex-col gap-1">
                  <div className="rounded-2xl rounded-tl-sm bg-muted px-4 py-2.5">
                    <div className="flex gap-1">
                      <span
                        className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce"
                        style={{ animationDelay: "0ms" }}
                      />
                      <span
                        className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce"
                        style={{ animationDelay: "150ms" }}
                      />
                      <span
                        className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce"
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
      <div className="flex-shrink-0 border-t border-border bg-card p-4">
        <div className="flex gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask a question..."
            className={cn(
              "flex-1 resize-none rounded-xl border border-border bg-background px-4 py-3",
              "text-sm text-foreground placeholder:text-muted-foreground",
              "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
              "transition-all duration-200",
              "max-h-32 min-h-[44px]"
            )}
            rows={1}
            disabled={isLoading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || isLoading}
            className="h-11 w-11 rounded-xl flex-shrink-0 p-0"
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

// Mock AI responses (replace with actual API integration later)
function getMockResponse(userInput: string): string {
  const responses = [
    "I'd be happy to help you with that! Based on the document you're viewing, I can provide detailed insights and explanations.",
    "That's a great question! Let me analyze the content and provide you with a comprehensive answer.",
    "I understand what you're asking. The document contains relevant information that can help answer your question.",
    "Based on the PDF content, here's what I can tell you: This is a simulated response that demonstrates the chat interface. The actual AI integration will provide real, context-aware answers.",
    "Let me break that down for you. The key points from the document suggest several important considerations you should be aware of.",
  ];

  return responses[Math.floor(Math.random() * responses.length)];
}
