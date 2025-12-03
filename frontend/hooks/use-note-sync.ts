/**
 * Custom hook for cross-tab note synchronization
 */

import { useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAppDispatch } from "@/lib/store/hooks";
import { apiSlice } from "@/lib/store/apiSlice";
import { Note, JSONContent } from "@/lib/types";
import {
  setupNoteSyncListeners,
  // based on the message , it runs the appropiate function , for example if the message.type=="update",it runs the function update(noteId,content:{tilte:string,content:JSONDate})
  broadcastNoteUpdate,
  broadcastNoteCreate,
  broadcastNoteDelete,
  broadcastNoteFocus,
  // the three above post a message which includes the type of the message(delete,focus,update,create)
  navigateToNoteInTab,
} from "@/lib/utils/note-sync";

export interface UseNoteSyncOptions {
  /**
   * Whether to automatically navigate to focused notes
   */
  enableAutoNavigation?: boolean;

  /**
   * Whether to automatically update local cache when receiving updates
   */
  enableAutoUpdate?: boolean;

  /**
   * Callback when a note is focused from another tab
   */
  onNoteFocus?: (noteId: string) => void;
}

export interface UseNoteSyncReturn {
  /**
   * Broadcast a note update to other tabs
   */
  broadcastUpdate: (
    noteId: string,
    updates: { title?: string; content?: JSONContent }
  ) => void;

  /**
   * Broadcast a note creation to other tabs
   */
  broadcastCreate: (note: Note) => void;

  /**
   * Broadcast a note deletion to other tabs
   */
  broadcastDelete: (noteId: string) => void;

  /**
   * Focus a note in another tab if possible
   */
  focusNoteInTab: (noteId: string) => boolean;

  /**
   * Navigate to a note in another tab if possible
   */
  navigateToNote: (noteId: string) => boolean;
}

export function useNoteSync(
  options: UseNoteSyncOptions = {}
): UseNoteSyncReturn {
  const {
    enableAutoNavigation = true,
    enableAutoUpdate = true,
    onNoteFocus,
  } = options;

  const router = useRouter();
  const dispatch = useAppDispatch();
  const cleanupRef = useRef<(() => void) | null>(null);

  // Handle note updates from other tabs
  const handleNoteUpdate = useCallback(
    (noteId: string, updates: { title?: string; content?: JSONContent }) => {
      if (!enableAutoUpdate) return;

      console.log("Received note update from another tab:", noteId, updates);

      // Show sync notification
      if (updates.title) {
        const { noteNotifications } = require("@/lib/utils/note-notifications");
        noteNotifications.syncUpdate(updates.title);
      }

      // Update the RTK Query cache
      dispatch(
        apiSlice.util.updateQueryData("getNote", noteId, (draft) => {
          if (updates.title !== undefined) {
            draft.title = updates.title;
          }
          if (updates.content !== undefined) {
            draft.content = updates.content;
          }
          draft.updatedAt = new Date().toISOString();
        })
      );

      // Also update the notes list cache
      dispatch(
        apiSlice.util.updateQueryData("getNotes", {}, (draft) => {
          const noteIndex = draft.findIndex((note) => note.id === noteId);
          if (noteIndex !== -1) {
            if (updates.title !== undefined) {
              draft[noteIndex].title = updates.title;
            }
            if (updates.content !== undefined) {
              draft[noteIndex].content = updates.content;
            }
            draft[noteIndex].updatedAt = new Date().toISOString();
          }
        })
      );
    },
    [dispatch, enableAutoUpdate]
  );

  // Handle note creation from other tabs
  const handleNoteCreate = useCallback(
    (note: Note) => {
      if (!enableAutoUpdate) return;

      console.log("Received note creation from another tab:", note);

      // Add to the notes list cache
      dispatch(
        apiSlice.util.updateQueryData("getNotes", {}, (draft) => {
          // Add to beginning of list (most recent first)
          draft.unshift(note);
        })
      );

      // Add to individual note cache
      dispatch(apiSlice.util.upsertQueryData("getNote", note.id, note));
    },
    [dispatch, enableAutoUpdate]
  );

  // Handle note deletion from other tabs
  const handleNoteDelete = useCallback(
    (noteId: string) => {
      if (!enableAutoUpdate) return;

      console.log("Received note deletion from another tab:", noteId);

      // Remove from notes list cache
      dispatch(
        apiSlice.util.updateQueryData("getNotes", {}, (draft) => {
          return draft.filter((note) => note.id !== noteId);
        })
      );

      // Remove from individual note cache
      dispatch(apiSlice.util.invalidateTags([{ type: "Note", id: noteId }]));
    },
    [dispatch, enableAutoUpdate]
  );

  // Handle note focus from other tabs
  const handleNoteFocus = useCallback(
    (noteId: string) => {
      console.log("Received note focus from another tab:", noteId);

      if (onNoteFocus) {
        onNoteFocus(noteId);
      }

      if (enableAutoNavigation) {
        // Navigate to the note if we're not already there
        const currentPath = window.location.pathname;
        const targetPath = `/dashboard/notes/${noteId}`;

        if (currentPath !== targetPath) {
          router.push(targetPath);
        }
      }
    },
    [router, enableAutoNavigation, onNoteFocus]
  );

  // Set up listeners on mount
  useEffect(() => {
    const cleanup = setupNoteSyncListeners({
      onNoteUpdate: handleNoteUpdate,
      onNoteCreate: handleNoteCreate,
      onNoteDelete: handleNoteDelete,
      onNoteFocus: handleNoteFocus,
    });

    cleanupRef.current = cleanup;

    return () => {
      cleanup();
      cleanupRef.current = null;
    };
  }, [handleNoteUpdate, handleNoteCreate, handleNoteDelete, handleNoteFocus]);

  // Broadcast functions
  return {
    broadcastUpdate: broadcastNoteUpdate,
    broadcastCreate: broadcastNoteCreate,
    broadcastDelete: broadcastNoteDelete,
    focusNoteInTab: (noteId: string) => {
      broadcastNoteFocus(noteId);
      return true; // Always return true since we broadcast the focus
    },
    navigateToNote: navigateToNoteInTab,
  };
}
