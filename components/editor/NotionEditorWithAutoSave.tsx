'use client';

import React from 'react';
import { NotionEditor } from './NotionEditor';
import { EditorProvider, useEditorContext } from './EditorProvider';
import { SaveStatusIndicator } from './SaveStatusIndicator';
import { cn } from '@/lib/utils';
import type { NotionEditorProps } from './types';

interface NotionEditorWithAutoSaveProps extends Omit<NotionEditorProps, 'onChange'> {
  noteId?: string;
  title?: string;
  autoSaveEnabled?: boolean;
  autoSaveDelay?: number;
  showSaveStatus?: boolean;
  onSave?: (content: any) => void;
  onError?: (error: string) => void;
}

function EditorWithStatus({
  showSaveStatus,
  ...editorProps
}: NotionEditorWithAutoSaveProps & { showSaveStatus: boolean }) {
  const {
    updateContent,
    isSaving,
    lastSaved,
    saveError,
    hasUnsavedChanges,
    saveNow,
    resetSaveError,
  } = useEditorContext();

  return (
    <div className="w-full space-y-2">
      {showSaveStatus && (
        <div className="flex justify-end">
          <SaveStatusIndicator
            isSaving={isSaving}
            lastSaved={lastSaved}
            error={saveError}
            hasUnsavedChanges={hasUnsavedChanges}
            onRetry={saveNow}
            className="text-xs"
          />
        </div>
      )}
      <NotionEditor
        {...editorProps}
        onChange={(content) => {
          updateContent(content);
        }}
      />
      {saveError && (
        <div className="text-xs text-destructive bg-destructive/10 p-2 rounded border">
          <div className="flex items-center justify-between">
            <span>Failed to save: {saveError.message}</span>
            <div className="flex gap-2">
              <button
                onClick={saveNow}
                className="underline hover:no-underline"
              >
                Retry
              </button>
              <button
                onClick={resetSaveError}
                className="underline hover:no-underline"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function NotionEditorWithAutoSave({
  noteId,
  title,
  autoSaveEnabled = true,
  autoSaveDelay = 2000,
  showSaveStatus = true,
  onSave,
  onError,
  content,
  className,
  ...props
}: NotionEditorWithAutoSaveProps) {
  return (
    <EditorProvider
      initialContent={typeof content === 'string' ? undefined : content}
      noteId={noteId}
      title={title}
      autoSaveEnabled={autoSaveEnabled}
      autoSaveDelay={autoSaveDelay}
      onSave={onSave}
      onError={onError}
    >
      <div className={cn('w-full', className)}>
        <EditorWithStatus
          {...props}
          content={content}
          showSaveStatus={showSaveStatus}
        />
      </div>
    </EditorProvider>
  );
}