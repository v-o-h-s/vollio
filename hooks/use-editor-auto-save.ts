import { useCallback } from "react";
import { useAutoSave } from "./use-auto-save";
import { useUpdateNoteMutation } from "@/lib/store/apiSlice";
import type { EditorContent } from "@/components/editor/types";

export interface EditorAutoSaveOptions {
  noteId?: string;
  delay?: number;
  //onError?: (error: Error) => void;
  // onSaveStart?: () => void;
  // onSaveComplete?: () => void;
  enabled?: boolean;
}

export interface EditorSaveData {
  content: EditorContent;
  title?: string;
}

export function useEditorAutoSave(
  data: EditorSaveData,
  options: EditorAutoSaveOptions
) {
  const {
    noteId,
    delay = 2000,
    // onError,
    //onSaveStart,
    //onSaveComplete,
    enabled = true,
  } = options;

  const [updateNote] = useUpdateNoteMutation();

  const saveToAPI = useCallback(
    async (saveData: EditorSaveData) => {
      if (!noteId) {
        throw new Error("Note ID is required for saving");
      }

      try {
        await updateNote({
          id: noteId,
          updates: {
            content: saveData.content,
            title: saveData.title,
          },
        }).unwrap();
      } catch (error: any) {
        // RTK Query errors come wrapped, extract the actual error
        const actualError = error?.data || error;
        throw new Error(
          actualError?.error || actualError?.message || "Save failed"
        );
      }
    },
    [noteId, updateNote]
  );

  // return useAutoSave(data, {
  //   delay,
  //   onSave: saveToAPI,
  //   onError,
  //   onSaveStart,
  //   onSaveComplete,
  //   enabled: enabled && !!noteId,
  // });
  return useAutoSave({ onSave: () => saveToAPI(data), delay, enabled });
}
