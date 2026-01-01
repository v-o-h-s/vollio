"use client";

import { useState } from "react";
import { JSONContent } from "@tiptap/core";
import { useAssistantChatMutation } from "@/lib/store/apiSlice";
import { AssistantChatMessage, HighlightContent } from "@vollio/shared";
import { extractTextFromContent } from "../utils";
import { Highlight, ScaledPosition } from "react-pdf-highlighter-extended-plus";

/**
 * Distinguishes between messages originating from general user queries 
 * and those specifically referencing document content.
 */
export enum MessageSource {
  USER,
  DOCUMENT,
}

/**
 * Represents a single message in the AI chat history, including its role,
 * content, and optional document-specific metadata.
 */
export interface Message {
  role: "user" | "assistant";
  content: string | JSONContent;
  timestamp: Date;
  source: MessageSource;
  metadata?: {
    documentName: string;
    content: HighlightContent;
    position: ScaledPosition;
  };
}

/**
 * Handles the logic for the Voll-AI chat interface, including sending messages
 * to the API, managing chat history, and handling errors.
 */
export function useVollAiLogic() {
  const [messages, setMessages] = useState<Message[]>([]);

  // Mutation hook for sending chat requests to the server
  const [vollAiChat, { isLoading: isVollAiLoading }] =
    useAssistantChatMutation();

  /**
   * Adds a user message to the chat, sends the full history to the AI assistant,
   * and appends the assistant's response to the message list.
   */
  const addUserMessage = async (
    message: string,
    metadata?: {
      documentName: string;
      content: HighlightContent;
      position: ScaledPosition;
    }
  ) => {
    if (!message.trim()) return;

    const userMsg: Message = {
      role: "user",
      content: message,
      timestamp: new Date(),
      source: MessageSource.USER,
      metadata,
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const history: AssistantChatMessage[] = messages.map((msg) => ({
        role: msg.role,
        content: extractTextFromContent(msg.content),
      }));

      const response = await vollAiChat({
        message,
        history,
      } as any).unwrap();

      const assistantMsg: Message = {
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
        source: metadata ? MessageSource.DOCUMENT : MessageSource.USER,
        metadata,
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error("Failed to get assistant response:", { ...(error as any) });
      const errorMsg: Message = {
        role: "assistant",
        content: {
          type: "doc",
          content: [
            {
              type: "paragraph",
              content: [
                {
                  type: "text",
                  text: "Sorry, I encountered an error while processing your request.",
                },
              ],
            },
          ],
        },
        timestamp: new Date(),
        source: MessageSource.USER,
        metadata,
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  /**
   * Removes a message from the history by its index. If deleting an assistant 
   * message, it also removes the preceding user question for consistency.
   */
  const handleDeleteMessage = (index: number) => {
    setMessages((prev) => {
      const newMessages = [...prev];
      if (newMessages[index].role === "assistant" && index > 0) {
        newMessages.splice(index - 1, 2);
      } else {
        newMessages.splice(index, 1);
      }
      return newMessages;
    });
  };

  /**
   * Clears the entire chat history.
   */
  const resetMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    addUserMessage,
    handleDeleteMessage,
    resetMessages,
    isVollAiLoading,
  };
}