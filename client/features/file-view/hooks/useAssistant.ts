import { JSONContent } from "@tiptap/core";
import { useState } from "react";
import { useAssistantChatMutation } from "@/lib/store/apiSlice";
import { AssistantChatMessage } from "@vollio/shared";

interface Message {
  role: "user" | "assistant";
  content: string | JSONContent;
  timestamp: Date;
}

export function useAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [assistantChat, { isLoading }] = useAssistantChatMutation();
    // we use this function so like the request will have plain text in history 
  const extractTextFromContent = (content: string | JSONContent): string => {
    if (typeof content === "string") return content;
    if (!content.content) return "";
    return content.content
      .map((node) => {
        if (node.type === "text") return node.text;
        if (node.content) return extractTextFromContent(node);
        return "";
      })
      .join(" ");
  };

  const addUserMessage = async (message: string) => {
    if (!message.trim()) return;

    // Add user message immediately
    const userMsg: Message = {
      role: "user",
      content: message,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);

    try {
      // Prepare history for context
      const history: AssistantChatMessage[] = messages.map((msg) => ({
        role: msg.role,
        content: extractTextFromContent(msg.content),
      }));

      const response = await assistantChat({
        message,
        history,
      }).unwrap();

      const assistantMsg: Message = {
        role: "assistant",
        content: response.content,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (error) {
      console.error("Failed to get assistant response:", error);
      // Optional: Add an error message to the chat
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
      };
      setMessages((prev) => [...prev, errorMsg]);
    }
  };

  const handleDelete = (index: number) => {
    setMessages((prev) => {
      const newMessages = [...prev];
      // If we're deleting an assistant message, delete the preceding user message too
      if (newMessages[index].role === "assistant" && index > 0) {
        newMessages.splice(index - 1, 2);
      } else {
        newMessages.splice(index, 1);
      }
      return newMessages;
    });
  };

  return {
    messages,
    addUserMessage,
    handleDelete,
    isLoading,
  };
}
