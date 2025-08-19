'use client';

import { useState } from 'react';
import { NotionEditorWithToolbar } from '@/components/editor';
import type { EditorContent } from '@/components/editor/types';

export default function EditorDemoPage() {
  const [content, setContent] = useState<EditorContent | undefined>();

  const handleContentChange = (newContent: EditorContent) => {
    setContent(newContent);
    console.log('Editor content changed:', newContent);
  };

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notion-like Editor Demo</h1>
          <p className="text-muted-foreground mt-2">
            Test the TipTap-based rich text editor with toolbar controls.
          </p>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <NotionEditorWithToolbar
            content={content}
            onChange={handleContentChange}
            placeholder="Start writing your document..."
            autoFocus
            className="min-h-[400px]"
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Editor Content (JSON)</h2>
          <pre className="bg-muted p-4 rounded-lg overflow-auto text-sm">
            {JSON.stringify(content, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}