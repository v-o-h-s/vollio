/**
 * Editor-related types for TipTap rich text editing system
 */

import { JSONContent } from "@tiptap/core";
import type { Editor } from "@tiptap/react";
export type {
  CreateNoteDTO as CreateNoteRequest,
  UpdateNoteDTO as UpdateNoteRequest,
} from "@/lib/shared";

// ============================================================================
// EDITOR TYPES
// ============================================================================

/**
 * Editor mode for different viewing experiences
 */
export type EditorMode = "normal" | "fullscreen" | "focus";

/**
 * Re-export JSONContent from TipTap for convenience
 */
export type { JSONContent };

/**
 * Note content structure
 */
export interface NoteContent {
  title?: string;
  content?: JSONContent | null;
}

/**
 * Props for the main NotionEditor component
 */
export interface NotionEditorProps {
  documentId?: string;
  content?: NoteContent;
  onChange?: (content: JSONContent) => void;
  onUpdate?: (editor: Editor) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
  autoFocus?: boolean;
  customToolbar?: (editor: Editor) => React.ReactNode;
  showWordCount?: boolean;
  showReadingTime?: boolean;
  showTitle?: boolean;
  // Auto-save props
  autoSave?: boolean;
  noteId?: string;
  autoSaveDelay?: number;
  onAutoSaveStatusChange?: (status: {
    status: "idle" | "typing" | "saving" | "saved" | "error";
    lastSaved: Date | null;
    error: string | null;
  }) => void;
  onNoteCreated?: (noteId: string) => void;
  fontSize?: number;
}

/**
 * Props for editor toolbar components
 */
export interface EditorToolbarProps {
  editor: Editor | null;
  className?: string;
}

/**
 * Configuration for editor commands (buttons, shortcuts, etc.)
 */
export interface EditorCommand {
  name: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: (editor: Editor) => void;
  isActive?: (editor: Editor) => boolean;
  isDisabled?: (editor: Editor) => boolean;
}

/**
 * Configuration for TipTap extensions
 */
export interface EditorExtensionConfig {
  heading?: {
    levels: number[];
  };
  table?: {
    resizable: boolean;
    handleWidth: number;
  };
  image?: {
    inline: boolean;
    allowBase64: boolean;
  };
}

/**
 * Editor state for context management
 */
export interface EditorState {
  editor: Editor | null;
  content: JSONContent | null;
  isLoading: boolean;
  error: string | null;
}

/**
 * Editor context value with state and actions
 */
export interface EditorContextValue extends EditorState {
  setEditor: (editor: Editor | null) => void;
  updateContent: (content: JSONContent) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  resetEditor: () => void;
}

// ============================================================================
// NOTE TYPES
// ============================================================================

/**
 * Note entity with rich text content
 */
export interface Note {
  id: string;
  userId: string;
  title: string;
  content: JSONContent; // TipTap JSONContent format
  documentAnnotationId?: string | null;
  createdAt: string; // ISO string for Redux serialization
  updatedAt: string; // ISO string for Redux serialization
  isDeleted: boolean;
  documentId?: string | null;
  isSummary?: boolean;
}

/**
 * Supabase single note response
 */
export interface SupabaseNoteResponse {
  success: boolean;
  data?: SupabaseNote;
  error?: string;
}

interface SupabaseNote {
  id: string;
  userId: string;
  title: string;
  content: JSONContent | null;
  documentAnnotationId: string | null;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  documentId: string | null;
}

/**
 * supabase response for fetching all notes
 */

export interface SupabaseNotesListResponse {
  success: boolean;
  data?: SupabaseSingleNoteFromListRepsonse[];
  error?: string;
}

export interface SupabaseSingleNoteFromListRepsonse {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  documentId: string | null;
}
