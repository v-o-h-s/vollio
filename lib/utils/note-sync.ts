/**
 * Cross-tab synchronization utilities for notes
 * Integrates with existing PostMessage API for real-time updates
 */

import { Note, JSONContent } from "@/lib/types";

export interface NoteUpdateMessage {
  type: "NOTE_UPDATE";
  noteId: string;
  title?: string;
  content?: JSONContent;
  timestamp: number;
}

export interface NoteCreateMessage {
  type: "NOTE_CREATE";
  note: Note;
  timestamp: number;
}

export interface NoteDeleteMessage {
  type: "NOTE_DELETE";
  noteId: string;
  timestamp: number;
}

export interface NoteFocusMessage {
  type: "NOTE_FOCUS";
  noteId: string;
  timestamp: number;
}

export type NoteSyncMessage =
  | NoteUpdateMessage
  | NoteCreateMessage
  | NoteDeleteMessage
  | NoteFocusMessage;

/**
 * Validates note sync message data
 */
export function isValidNoteSyncMessage(data: any): data is NoteSyncMessage {
  if (
    !data ||
    typeof data.type !== "string" ||
    typeof data.timestamp !== "number"
  ) {
    return false;
  }

  switch (data.type) {
    case "NOTE_UPDATE":
      // For update messages, we need a noteId and at least one field to update
      const hasValidTitle =
        data.title !== undefined && typeof data.title === "string";
      const hasValidContent =
        data.content !== undefined &&
        typeof data.content === "object" &&
        data.content !== null &&
        data.content.type;

      return (
        typeof data.noteId === "string" && (hasValidTitle || hasValidContent)
      );

    case "NOTE_CREATE":
      return (
        data.note &&
        typeof data.note.id === "string" &&
        typeof data.note.title === "string" &&
        typeof data.note.content === "object"
      );

    case "NOTE_DELETE":
    case "NOTE_FOCUS":
      return typeof data.noteId === "string";

    default:
      return false;
  }
}

/**
 * Broadcasts note update to all tabs
 */
export function broadcastNoteUpdate(
  noteId: string,
  updates: { title?: string; content?: JSONContent }
): void {
  const message: NoteUpdateMessage = {
    type: "NOTE_UPDATE",
    noteId,
    ...updates,
    timestamp: Date.now(),
  };

  // Broadcast to all tabs via BroadcastChannel
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    try {
      const channel = new BroadcastChannel("noto-notes-sync");
      channel.postMessage(message);
      console.log("Broadcasted note update:", message);
    } catch (error) {
      console.warn("Failed to broadcast note update:", error);
    }
  }

  // Also try postMessage for cross-origin scenarios
  // here window.opener is the parent of the current tab (i.e the tab that opened this tab)
  try {
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(message, "*");
      //send the message to the parent 
    }
  } catch (error) {
    console.warn("Failed to send note update via postMessage:", error);
  }
}

/**
 * Broadcasts note creation to all tabs
 */
export function broadcastNoteCreate(note: Note): void {
  const message: NoteCreateMessage = {
    type: "NOTE_CREATE",
    note,
    timestamp: Date.now(),
  };

  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    try {
      const channel = new BroadcastChannel("noto-notes-sync");
      channel.postMessage(message);
      console.log("Broadcasted note creation:", message);
    } catch (error) {
      console.warn("Failed to broadcast note creation:", error);
    }
  }

  try {
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(message, "*");
    }
  } catch (error) {
    console.warn("Failed to send note creation via postMessage:", error);
  }
}

/**
 * Broadcasts note deletion to all tabs
 */
export function broadcastNoteDelete(noteId: string): void {
  const message: NoteDeleteMessage = {
    type: "NOTE_DELETE",
    noteId,
    timestamp: Date.now(),
  };

  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    try {
      const channel = new BroadcastChannel("noto-notes-sync");
      channel.postMessage(message);
      console.log("Broadcasted note deletion:", message);
    } catch (error) {
      console.warn("Failed to broadcast note deletion:", error);
    }
  }

  try {
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(message, "*");
    }
  } catch (error) {
    console.warn("Failed to send note deletion via postMessage:", error);
  }
}

/**
 * Broadcasts note focus to all tabs (for navigation)
 */
export function broadcastNoteFocus(noteId: string): void {
  const message: NoteFocusMessage = {
    type: "NOTE_FOCUS",
    noteId,
    timestamp: Date.now(),
  };

  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    try {
      const channel = new BroadcastChannel("noto-notes-sync");
      channel.postMessage(message);
      console.log("Broadcasted note focus:", message);
    } catch (error) {
      console.warn("Failed to broadcast note focus:", error);
    }
  }

  try {
    if (window.opener && !window.opener.closed) {
      window.opener.postMessage(message, "*");
    }
  } catch (error) {
    console.warn("Failed to send note focus via postMessage:", error);
  }
}

/**
 * Sets up cross-tab note synchronization listeners
 */
export function setupNoteSyncListeners(callbacks: {
  onNoteUpdate?: (
    noteId: string,
    updates: { title?: string; content?: JSONContent }
  ) => void;
  onNoteCreate?: (note: Note) => void;
  onNoteDelete?: (noteId: string) => void;
  onNoteFocus?: (noteId: string) => void;
}): () => void {
  const cleanupFunctions: (() => void)[] = [];

  // BroadcastChannel listener
  if (typeof window !== "undefined" && "BroadcastChannel" in window) {
    try {
      const channel = new BroadcastChannel("noto-notes-sync");

      const handleBroadcastMessage = (event: MessageEvent<NoteSyncMessage>) => {
        if (!isValidNoteSyncMessage(event.data)) {
          return;
        }

        const message = event.data;
        console.log("Received note sync message:", message);

        switch (message.type) {
          case "NOTE_UPDATE":
            callbacks.onNoteUpdate?.(message.noteId, {
              title: message.title,
              content: message.content,
            });
            break;

          case "NOTE_CREATE":
            callbacks.onNoteCreate?.(message.note);
            break;

          case "NOTE_DELETE":
            callbacks.onNoteDelete?.(message.noteId);
            break;

          case "NOTE_FOCUS":
            callbacks.onNoteFocus?.(message.noteId);
            break;
        }
      };

      channel.addEventListener("message", handleBroadcastMessage);
      cleanupFunctions.push(() => {
        channel.removeEventListener("message", handleBroadcastMessage);
        channel.close();
      });
    } catch (error) {
      console.warn("Failed to setup BroadcastChannel listener:", error);
    }
  }

  // PostMessage listener for cross-origin scenarios
  const handlePostMessage = (event: MessageEvent) => {
    if (!isValidNoteSyncMessage(event.data)) {
      return;
    }

    const message = event.data;
    console.log("Received note sync postMessage:", message);

    switch (message.type) {
      case "NOTE_UPDATE":
        callbacks.onNoteUpdate?.(message.noteId, {
          title: message.title,
          content: message.content,
        });
        break;

      case "NOTE_CREATE":
        callbacks.onNoteCreate?.(message.note);
        break;

      case "NOTE_DELETE":
        callbacks.onNoteDelete?.(message.noteId);
        break;

      case "NOTE_FOCUS":
        callbacks.onNoteFocus?.(message.noteId);
        break;
    }
  };

  window.addEventListener("message", handlePostMessage);
  cleanupFunctions.push(() => {
    window.removeEventListener("message", handlePostMessage);
  });

  // Return cleanup function
  return () => {
    cleanupFunctions.forEach((cleanup) => cleanup());
  };
}

/**
 * Attempts to navigate to a note in another tab
 */
export function navigateToNoteInTab(noteId: string): boolean {
  // First try to focus the note in existing tabs
  broadcastNoteFocus(noteId);

  // If we have an opener window, try to navigate it
  if (window.opener && !window.opener.closed) {
    try {
      const noteUrl = `/dashboard/notes/${noteId}`;

      // Check if opener is accessible
      const openerLocation = window.opener.location;
      if (openerLocation && typeof openerLocation.pathname === "string") {
        console.log("Navigating opener to note:", noteUrl);
        window.opener.location.href = noteUrl;
        window.opener.focus();
        return true;
      }
    } catch (error) {
      console.warn("Failed to navigate opener to note:", error);
    }
  }

  return false;
}
