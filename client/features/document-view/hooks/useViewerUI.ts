"use client";

import { useState } from "react";
import { ViewerComponents } from "../types/types";

export function useViewerUI() {
  const [focusedComponent, setFocusedComponent] =
    useState<ViewerComponents | null>(ViewerComponents.V_DOC);
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
    focusedComponent,
    setFocusedComponent,
  };
}
