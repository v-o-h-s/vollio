"use client";

import React, { useRef, useEffect } from "react";
import { Send, Bot, User, X, Sparkles } from "lucide-react";

interface ChatSidebarProps {
  onClose: () => void;
}

export function ChatSidebar({ onClose }: ChatSidebarProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const messages = [
    {
      id: 1,
      role: "assistant",
      content:
        "Hello! I'm your AI study assistant. I can help you summarize this document, explain complex terms, or create quizzes. What would you like to do with 'Cellular Biology'?",
    },
    {
      id: 2,
      role: "user",
      content: "Can you explain the function of mitochondria in simple terms?",
    },
    {
      id: 3,
      role: "assistant",
      content:
        "Certainly! Think of mitochondria as the power plants of a city (the cell). Just as power plants generate electricity for the city to run, mitochondria produce ATP, which is the chemical energy that allows the cell to function.",
    },
  ];

  return (
    <div
      style={{
        width: "30rem", // Fixed width
        height: "100%",
        backgroundColor: "#f8fafc", // slate-50
        borderRight: "1px solid #e2e8f0",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        fontFamily:
          'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        animation: "slideInLeft 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: "1.25rem",
          borderBottom: "1px solid #e2e8f0",
          backgroundColor: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div
            style={{
              width: "2rem",
              height: "2rem",
              borderRadius: "0.5rem",
              backgroundColor: "linear-gradient(135deg, #8b5cf6, #6366f1)",
              background: "#f3e8ff",
              color: "#9333ea",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Sparkles size={18} />
          </div>
          <div>
            <h3
              style={{
                fontSize: "0.95rem",
                fontWeight: 700,
                color: "#1e293b",
                margin: 0,
              }}
            >
              AI Assistant
            </h3>
            <span
              style={{
                fontSize: "0.75rem",
                color: "#22c55e",
                fontWeight: 500,
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
              }}
            >
              <span
                style={{
                  width: "6px",
                  height: "6px",
                  borderRadius: "50%",
                  backgroundColor: "currentColor",
                }}
              ></span>
              Online
            </span>
          </div>
        </div>
        <button
          onClick={onClose}
          style={{
            padding: "0.5rem",
            borderRadius: "0.375rem",
            border: "none",
            background: "transparent",
            color: "#64748b",
            cursor: "pointer",
            transition: "background-color 0.2s",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "#f1f5f9")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
        >
          <X size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "1.5rem",
          display: "flex",
          flexDirection: "column",
          gap: "1.5rem",
        }}
      >
        {messages.map((msg) => (
          <div
            key={msg.id}
            style={{
              display: "flex",
              gap: "1rem",
              flexDirection: msg.role === "user" ? "row-reverse" : "row",
            }}
          >
            <div
              style={{
                width: "2rem",
                height: "2rem",
                borderRadius: "50%",
                backgroundColor:
                  msg.role === "assistant" ? "#f3e8ff" : "#eff6ff",
                color: msg.role === "assistant" ? "#9333ea" : "#3b82f6",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
              }}
            >
              {msg.role === "assistant" ? (
                <Bot size={16} />
              ) : (
                <User size={16} />
              )}
            </div>
            <div
              style={{
                maxWidth: "80%",
                padding: "1rem",
                borderRadius: "1rem",
                borderTopLeftRadius: msg.role === "assistant" ? "0" : "1rem",
                borderTopRightRadius: msg.role === "user" ? "0" : "1rem",
                backgroundColor: msg.role === "assistant" ? "white" : "#3b82f6",
                color: msg.role === "assistant" ? "#334155" : "white",
                boxShadow:
                  msg.role === "assistant"
                    ? "0 1px 3px rgba(0,0,0,0.05)"
                    : "0 4px 6px -1px rgba(59, 130, 246, 0.2)",
                border: msg.role === "assistant" ? "1px solid #e2e8f0" : "none",
                lineHeight: "1.5",
                fontSize: "0.95rem",
              }}
            >
              {msg.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div
        style={{
          padding: "1.25rem",
          borderTop: "1px solid #e2e8f0",
          backgroundColor: "white",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "0.75rem",
            padding: "0.75rem 1rem",
            backgroundColor: "#f8fafc",
            borderRadius: "9999px",
            border: "1px solid #e2e8f0",
            transition: "border-color 0.2s, box-shadow 0.2s",
          }}
        >
          <input
            type="text"
            placeholder="Ask a question..."
            style={{
              flex: 1,
              border: "none",
              background: "transparent",
              outline: "none",
              color: "#0f172a",
              fontSize: "0.95rem",
            }}
          />
          <button
            style={{
              width: "2rem",
              height: "2rem",
              borderRadius: "50%",
              backgroundColor: "#3b82f6",
              color: "white",
              border: "none",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              transition: "transform 0.1s",
            }}
          >
            <Send size={14} />
          </button>
        </div>
        <div
          style={{
            textAlign: "center",
            marginTop: "0.75rem",
            fontSize: "0.7rem",
            color: "#94a3b8",
          }}
        >
          AI can make mistakes. Please verify important information.
        </div>
      </div>
    </div>
  );
}
