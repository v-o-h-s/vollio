"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface SidebarContextValue {
  isCollapsed: boolean;
  toggleCollapse: () => void;
}

const SidebarContext = createContext<SidebarContextValue | null>(null);

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}

interface SidebarProviderProps {
  children: ReactNode;
}

export function SidebarProvider({ children }: SidebarProviderProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleCollapse = () => setIsCollapsed(!isCollapsed);

  return (
    <SidebarContext.Provider value={{
      isCollapsed,
      toggleCollapse
    }}>
      {children}
    </SidebarContext.Provider>
  );
}
