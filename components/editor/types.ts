import type { Editor } from '@tiptap/react';

export interface EditorContent {
  type: 'doc';
  content?: Array<{
    type: string;
    attrs?: Record<string, any>;
    content?: Array<{
      type: string;
      text?: string;
      marks?: Array<{
        type: string;
        attrs?: Record<string, any>;
      }>;
    }>;
  }>;
}

export interface NotionEditorProps {
  content?: EditorContent | string;
  onChange?: (content: EditorContent) => void;
  onUpdate?: (editor: Editor) => void;
  placeholder?: string;
  editable?: boolean;
  className?: string;
  autoFocus?: boolean;
  customToolbar?: (editor: Editor) => React.ReactNode;
}

export interface EditorToolbarProps {
  editor: Editor | null;
  className?: string;
}

export interface EditorCommand {
  name: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  action: (editor: Editor) => void;
  isActive?: (editor: Editor) => boolean;
  isDisabled?: (editor: Editor) => boolean;
}

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

export interface EditorState {
  editor: Editor | null;
  content: EditorContent | null;
  isLoading: boolean;
  error: string | null;
  hasUnsavedChanges: boolean;
}

export interface EditorContextValue extends EditorState {
  setEditor: (editor: Editor | null) => void;
  updateContent: (content: EditorContent) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearError: () => void;
  markAsSaved: () => void;
  markAsUnsaved: () => void;
  resetEditor: () => void;
}