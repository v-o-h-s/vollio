"use client";

import React from "react";
import { NotionEditor } from "./NotionEditor";
import { EditorProvider, useEditorContext } from "./EditorProvider";
import { cn } from "@/lib/utils";
import type { NotionEditorProps } from "./types";

interface NotionEditorWithAutoSaveProps
  extends Omit<NotionEditorProps, "onChange"> {
  onError?: (error: string) => void;
}

function EditorWithContext(editorProps: NotionEditorWithAutoSaveProps) {
  const { updateContent } = useEditorContext();

  return (
    <NotionEditor
      {...editorProps}
      onChange={(content) => {
        updateContent(content);
      }}
    />
  );
}

export function NotionEditorWithAutoSave({
  onError,
  content,
  className,
  ...props
}: NotionEditorWithAutoSaveProps) {
  return (
    <EditorProvider
      initialContent={typeof content === "string" ? undefined : content}
      onError={onError}
    >
      <div className={cn("w-full", className)}>
        <EditorWithContext {...props} content={content} />
      </div>
    </EditorProvider>
  );
}
