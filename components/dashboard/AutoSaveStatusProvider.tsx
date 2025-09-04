"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

type AutoSaveStatus = "idle" | "typing" | "saving" | "saved" | "error";

interface AutoSaveContextValue {
  status: AutoSaveStatus;
  lastSaved: Date | null;
  error: string | null;
  isCreating: boolean;
  updateStatus: (status: AutoSaveStatus, lastSaved?: Date | null, error?: string | null, isCreating?: boolean) => void;
}

const AutoSaveContext = createContext<AutoSaveContextValue | null>(null);

export function useAutoSaveStatus() {
  const context = useContext(AutoSaveContext);
  if (!context) {
    // Return a no-op function if context is not available
    // This makes the hook optional for components that might not be wrapped
    return {
      status: "idle" as const,
      lastSaved: null,
      error: null,
      isCreating: false,
      updateStatus: () => {},
    };
  }
  return context;
}

interface AutoSaveStatusProviderProps {
  children: ReactNode;
}

export function AutoSaveStatusProvider({ children }: AutoSaveStatusProviderProps) {
  const [status, setStatus] = useState<AutoSaveStatus>("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const updateStatus = (
    newStatus: AutoSaveStatus,
    newLastSaved?: Date | null,
    newError?: string | null,
    newIsCreating?: boolean
  ) => {
    setStatus(newStatus);
    if (newLastSaved !== undefined) setLastSaved(newLastSaved);
    if (newError !== undefined) setError(newError);
    if (newIsCreating !== undefined) setIsCreating(newIsCreating);
  };

  return (
    <AutoSaveContext.Provider value={{
      status,
      lastSaved,
      error,
      isCreating,
      updateStatus
    }}>
      {children}
    </AutoSaveContext.Provider>
  );
}
