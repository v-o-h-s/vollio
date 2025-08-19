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