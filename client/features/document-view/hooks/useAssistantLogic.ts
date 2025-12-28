"use client";

import { useState } from "react";
import { JSONContent } from "@tiptap/core";
import { useAppSelector } from "@/lib/store/hooks";
import { useAssistantChatMutation } from "@/lib/store/apiSlice";
import { AssistantChatMessage } from "@vollio/shared";
import { extractTextFromContent } from "../utils";

export enum MessageSource {
  USER,
  DOCUMENT,
}
export interface Message {
  role: "user" | "assistant";
  content: string | JSONContent;
  timestamp: Date;
  source: MessageSource;
}

export function useAssistantLogic() {
  const [messages, setMessages] = useState<Message[]>([]);

  const [assistantChat, { isLoading: isAssistantLoading }] =
    useAssistantChatMutation();

  const addUserMessage = async (
    message: string,
    metadata?: { documentName: string; pageNumber: number }
  ) => {
    if (!message.trim()) return;

    const userMsg: Message = {
      role: "user",
      content: message,
      timestamp: new Date(),
      source: metadata ? MessageSource.DOCUMENT : MessageSource.USER,
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      const history: AssistantChatMessage[] = messages.map((msg) => ({
        role: msg.role,
        content: extractTextFromContent(msg.content),
      }));

      const response = await assistantChat({
        message,
        history,
      } as any).unwrap();

      const assistantMsg: Message = {
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
        source: metadata ? MessageSource.DOCUMENT : MessageSource.USER,
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
        source: metadata ? MessageSource.DOCUMENT : MessageSource.USER,
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

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

  const resetMessages = () => {
    setMessages([]);
  };

  return {
    messages,
    addUserMessage,
    handleDeleteMessage,
    resetMessages,
    isAssistantLoading,
  };
}
