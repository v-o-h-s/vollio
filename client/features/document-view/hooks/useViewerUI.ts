"use client";

import { useState } from "react";

export function useViewerUI() {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isNoterOpen, setIsNoterOpen] = useState(false);

  const toggleAssistant = () => setIsAssistantOpen((prev) => !prev);
  const toggleNoter = () => setIsNoterOpen((prev) => !prev);

  return {
    isAssistantOpen,
    setIsAssistantOpen,
    toggleAssistant,
    isNoterOpen,
    setIsNoterOpen,
    toggleNoter,
  };
}
