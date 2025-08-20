"use client";

import React, { useState } from "react";
import { NotionEditor, useEditorContext } from "@/components/editor";
import type { EditorContent } from "@/components/editor";

function EditorTestContent() {
  const [content, setContent] = useState<EditorContent | null>(null);
  const { error, clearError } = useEditorContext();

  const handleContentChange = (newContent: EditorContent) => {
    setContent(newContent);
    console.log("Editor content changed:", newContent);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-lg shadow-sm border p-6">
        <h1 className="text-2xl font-bold mb-4">Editor Test Page</h1>
        
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
            <div className="flex justify-between items-center">
              <p className="text-red-800">{error}</p>
              <button
                onClick={clearError}
                className="text-red-600 hover:text-red-800"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Basic NotionEditor</h2>
          <div className="border rounded-lg p-4 min-h-[200px]">
            <NotionEditor
              content="Start typing to test the editor..."
              onChange={handleContentChange}
              onUpdate={(editor) => console.log("Editor updated:", editor)}
              placeholder="Type something here..."
              className="prose max-w-none"
              autoFocus
            />
          </div>
        </div>

        

        {content && (
          <div className="mt-8 space-y-4">
            <h2 className="text-lg font-semibold">Current Content (JSON)</h2>
            <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-auto max-h-60">
              {JSON.stringify(content, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}

export default function EditorTestPage() {
  return <EditorTestContent />;
}