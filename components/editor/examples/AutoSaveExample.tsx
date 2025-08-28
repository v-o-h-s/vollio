"use client";

import { useState } from "react";
import { NotionEditor } from "../NotionEditor";
import type { JSONContent } from "@/lib/types";

interface AutoSaveExampleProps {
  noteId: string;
  initialContent?: JSONContent;
}

export function AutoSaveExample({ noteId, initialContent }: AutoSaveExampleProps) {
  const [content, setContent] = useState<JSONContent | undefined>(initialContent);

  const handleAutoSave = async (content: JSONContent, noteId: string) => {
    // Custom auto-save logic if needed
    const response = await fetch(`/api/notes/${noteId}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Failed to save note");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Auto-Save Editor Example</h1>
      
      <NotionEditor
        content={content}
        onChange={setContent}
        placeholder="Start typing... Your changes will be saved automatically after 500ms of inactivity."
        autoSave={true}
        noteId={noteId}
        onAutoSave={handleAutoSave}
        autoSaveDelay={500}
        showWordCount={true}
        showReadingTime={true}
        className="min-h-[400px]"
      />
      
      <div className="mt-4 text-sm text-muted-foreground">
        <p>✨ Auto-save is enabled with a 500ms delay</p>
        <p>💾 Changes are automatically saved when you stop typing</p>
        <p>📊 Word count and reading time are displayed</p>
      </div>
    </div>
  );
}