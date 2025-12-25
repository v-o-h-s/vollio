import { JSONContent } from "@tiptap/core";
import { useState } from "react";

interface Message {
  role: "user" | "assistant";
  content: string | JSONContent;
  timestamp: Date;
}

export function useAssistant() {
  const [messages, setMessages] = useState<Message[]>([]);

  const addUserMessage = (message: string) => {
    if (!message.trim()) return;
    setMessages((prev) => [
      ...prev,
      { role: "user", content: message, timestamp: new Date() },
    ]);
    // of course we need to send this to the ai
    
  };
  // used when deleting like a message or something
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
  };
}
