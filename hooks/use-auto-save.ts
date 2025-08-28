"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import debounce from "lodash.debounce"
/* the debounce function works as follows :
    debounce(function,delay) , the function will wait for delay ms then it runs the function
    if during that delay debounce is called again , it will start the timer from 0s
*/
export type AutoSaveStatus = "idle" | "saving" | "saved" | "error";

interface UseAutoSaveOptions {
  onSave: (content: any) => Promise<void>;
  delay?: number;
  enabled?: boolean;
}

interface UseAutoSaveReturn {
  status: AutoSaveStatus;
  lastSaved: Date | null;
  error: string | null;
  updateContent: (content: any) => void;
}

export function useAutoSave({
  onSave,
  delay = 500,
  enabled = true,
}: UseAutoSaveOptions): UseAutoSaveReturn {
  const [status, setStatus] = useState<AutoSaveStatus>("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const contentRef = useRef<any>(null); /// this is for content updating , we have used useref instead of usestate because we don't want uneccessary renders , hope that won't cause some bugs in the future
  const isTypingRef = useRef(false);

  const performSave = useCallback(async () => {
    if (!enabled || !contentRef.current) return;

    try {
      setStatus("saving");
      setError(null);
      await onSave(contentRef.current);
      setStatus("saved");
      setLastSaved(new Date());

      // Reset to idle after showing "saved" for a moment
      setTimeout(() => {
        if (status === "saved") {
          setStatus("idle");
        }
      }, 2000);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Failed to save");
      console.error("Auto-save error:", err);
    }
  }, [onSave, enabled, status]);

  const debouncedSave = useCallback(debounce(performSave, delay), [
    performSave,
    delay,
  ]);

  const updateContent = useCallback(
    // this function is used to update the content and save it after delay
    (content: any) => {
      contentRef.current = content;

      if (!enabled) return;

      // Set typing state
      isTypingRef.current = true;
      setStatus("saving");
      setError(null);

      // Clear any existing debounced calls and create new one
      debouncedSave.cancel();
      debouncedSave();
      /* you may be wondering because the updateContent should run everytime the content updated
         and that also means that debouncedSave will run but since we are using debouncing , that wont 
         happen because :
          the first time you call debouncedSave(), it waits delay ms before running performSave.
          If debouncedSave() is called again before the delay finishes, it cancels the previous timer and starts a new one.
      */
      // Reset typing state after delay + buffer
      setTimeout(() => {
        isTypingRef.current = false;
      }, delay + 100);
    },
    [enabled, delay, debouncedSave]
  );



  // Cleanup on unmount
  useEffect(() => {
    return () => {
      debouncedSave.cancel();
    };
  }, [debouncedSave]);

  return {
    status,
    lastSaved,
    error,
    updateContent,
  };
}
