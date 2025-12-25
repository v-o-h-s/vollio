"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface ViewerContextType {
  isAssistantOpen: boolean;
  setIsAssistantOpen: (isOpen: boolean) => void;
  toggleAssistant: () => void;
  isNoterOpen: boolean;
  setIsNoterOpen: (isOpen: boolean) => void;
  toggleNoter: () => void;
  activeTabId: string;
  setActiveTabId: (id: string) => void;
}

const ViewerContext = createContext<ViewerContextType | undefined>(undefined);

export function ViewerProvider({ children }: { children: ReactNode }) {
  const [isAssistantOpen, setIsAssistantOpen] = useState(false);
  const [isNoterOpen, setIsNoterOpen] = useState(false);
  const [activeTabId, setActiveTabId] = useState<string>("home");
  const toggleAssistant = () => setIsAssistantOpen((prev) => !prev);
  const toggleNoter = () => setIsNoterOpen((prev) => !prev);

  return (
    <ViewerContext.Provider
      value={{
        isAssistantOpen,
        setIsAssistantOpen,
        toggleAssistant,
        isNoterOpen,
        setIsNoterOpen,
        toggleNoter,
        activeTabId,
        setActiveTabId,
      }}
    >
      {children}
    </ViewerContext.Provider>
  );
}

export function useViewer() {
  const context = useContext(ViewerContext);
  if (context === undefined) {
    throw new Error("useViewer must be used within a ViewerProvider");
  }
  return context;
}
