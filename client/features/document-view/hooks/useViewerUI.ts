"use client";

import { useState } from "react";
import { ViewerComponents } from "../types/types";

/**
 * Manages the UI state of the document viewer, including the visibility of side panels
 * (Voll-AI and Voll-Notes) and tracking which component currently has focus.
 */
export function useViewerUI() {
  // Tracks which part of the viewer is currently active/focused (e.g., PDF viewer, AI chat, or Notes)
  const [focusedComponent, setFocusedComponent] =
    useState<ViewerComponents | null>(ViewerComponents.V_DOC);
  
  // Controls the visibility of the Voll-AI side panel
  const [isVollAiOpen, setIsVollAiOpen] = useState(false);
  
  // Controls the visibility of the Voll-Notes side panel
  const [isVollNotesOpen, setIsVollNotesOpen] = useState(false);

  /**
   * Toggles the open/closed state of the Voll-AI side panel.
   */
  const toggleVollAi = () => setIsVollAiOpen((prev) => !prev);
  
  /**
   * Toggles the open/closed state of the Voll-Notes side panel.
   */
  const toggleVollNotes = () => setIsVollNotesOpen((prev) => !prev);

  return {
    isVollAiOpen,
    setIsVollAiOpen,
    toggleVollAi,
    isVollNotesOpen,
    setIsVollNotesOpen,
    toggleVollNotes,
    focusedComponent,
    setFocusedComponent,
  };
}