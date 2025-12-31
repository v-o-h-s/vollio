"use client";

import { useState } from "react";
import { ViewerComponents } from "../types/types";

export function useViewerUI() {
  const [focusedComponent, setFocusedComponent] =
    useState<ViewerComponents | null>(ViewerComponents.V_DOC);
  const [isVollAiOpen, setIsVollAiOpen] = useState(false);
  const [isVollNotesOpen, setIsVollNotesOpen] = useState(false);

  const toggleVollAi = () => setIsVollAiOpen((prev) => !prev);
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
