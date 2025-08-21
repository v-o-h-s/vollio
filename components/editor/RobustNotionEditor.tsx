'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { NotionEditor } from './NotionEditor';
import { EditorErrorBoundary } from './EditorErrorBoundary';
import { SaveStatusIndicator } from './SaveStatusIndicator';
import { OfflineStatusIndicator } from './OfflineStatusIndicator';
import { useEditorWithOffline } from '@/hooks/use-editor-with-offline';
import { useEditorErrorRecovery } from '@/hooks/use-editor-error-recovery';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, RefreshCw, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NotionEditorProps, EditorContent } from './types';

interface RobustNotionEditorProps extends Omit<NotionEditorProps, 'onChange'> {
  noteId?: string;
  title?: string;
  autoSaveEnabled?: boolean;
  autoSaveDelay?: number;
  showStatusIndicators?: boolean;
  onSave?: (content: EditorContent) => void;
  onError?: (error: string) => void;
  onRecovery?: () => void;
}

function EditorWithRecovery({
  noteId,
  title,
  autoSaveEnabled = true,
  autoSaveDelay = 2000,
  showStatusIndicators = true,
  onSave,
  onError,
  onRecovery,
  content: initialContent,
  ...editorProps
}: RobustNotionEditorProps) {
  const [editorContent, setEditorContent] = useState<EditorContent | null>(
    typeof initialContent === 'string' ? null : initialContent || null
  );

  // Offline support and auto-save
  const offlineEditor = useEditorWithOffline(editorContent, {
    noteId,
    title,
    autoSaveDelay,
    enabled: autoSaveEnabled,
    onError: (error) => {
      onError?.(error.message);
      errorRecovery.handleError(error, 'save-failed');
    },
    onConflict: (resolution) => {
      console.log('Conflict resolved:', resolution);
      setEditorContent(resolution.resolved);
    },
    onSync: () => {
      onSave?.(editorContent!);
    },
  });

  // Error recovery
  const errorRecovery = useEditorErrorRecovery(editorContent, {
    noteId,
    onError: (error, context) => {
      console.error(`Editor error in ${context}:`, error);
      onError?.(error.message);
    },
    onRecovery: (context) => {
      console.log(`Editor recovered from ${context}`);
      onRecovery?.();
    },
  });

  // Handle content changes
  const handleContentChange = useCallback((newContent: EditorContent) => {
    setEditorContent(newContent);
    offlineEditor.updateContent(newContent);
  }, [offlineEditor]);

  // Handle editor errors
  const handleEditorError = useCallback((error: Error, errorInfo: React.ErrorInfo) => {
    errorRecovery.handleError(error, 'editor-crash');
  }, [errorRecovery]);

  // Load backup if available and no initial content
  useEffect(() => {
    if (!editorContent && errorRecovery.backupAvailable) {
      const backup = errorRecovery.loadBackup();
      if (backup) {
        setEditorContent(backup);
        offlineEditor.updateContent(backup);
      }
    }
  }, [editorContent, errorRecovery, offlineEditor]);

  // Download backup function
  const downloadBackup = useCallback(() => {
    const backup = errorRecovery.loadBackup();
    if (backup) {
      const blob = new Blob([JSON.stringify(backup, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `editor-backup-${noteId || 'temp'}-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  }, [errorRecovery, noteId]);

  // Show error recovery UI if there's an unrecoverable error
  if (errorRecovery.hasError && !errorRecovery.isRecovering) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-destructive mt-0.5" />
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="font-semibold text-destructive">Editor Error</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {errorRecovery.lastError?.message || 'An unexpected error occurred'}
                </p>
                {errorRecovery.errorContext && (
                  <p className="text-xs text-muted-foreground">
                    Context: {errorRecovery.errorContext}
                  </p>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={errorRecovery.attemptRecovery}
                  disabled={errorRecovery.isRecovering}
                >
                  <RefreshCw className={cn(
                    "h-4 w-4 mr-2",
                    errorRecovery.isRecovering && "animate-spin"
                  )} />
                  {errorRecovery.isRecovering ? 'Recovering...' : 'Try Recovery'}
                </Button>

                {errorRecovery.backupAvailable && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={downloadBackup}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download Backup
                  </Button>
                )}

                <Button
                  size="sm"
                  variant="outline"
                  onClick={errorRecovery.resetError}
                >
                  Reset Editor
                </Button>
              </div>

              {errorRecovery.recoveryAttempts > 0 && (
                <p className="text-xs text-muted-foreground">
                  Recovery attempts: {errorRecovery.recoveryAttempts}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="w-full space-y-2">
      {showStatusIndicators && (
        <div className="flex justify-between items-center">
          <OfflineStatusIndicator
            isOnline={offlineEditor.isOnline}
            isSyncing={offlineEditor.isSyncing}
            hasPendingChanges={offlineEditor.hasPendingChanges}
            syncError={offlineEditor.syncError}
            conflictResolution={offlineEditor.conflictResolution}
            onSync={offlineEditor.syncNow}
            onClearConflict={offlineEditor.clearConflictResolution}
          />
          
          <SaveStatusIndicator
            isSaving={offlineEditor.isSaving}
            lastSaved={offlineEditor.lastSaved}
            error={offlineEditor.saveError}
            hasUnsavedChanges={offlineEditor.hasUnsavedChanges}
            onRetry={offlineEditor.saveNow}
          />
        </div>
      )}

      <NotionEditor
        {...editorProps}
        content={editorContent}
        onChange={handleContentChange}
      />

      {errorRecovery.isRecovering && (
        <div className="text-sm text-muted-foreground flex items-center gap-2 p-2 bg-blue-50 rounded border">
          <RefreshCw className="h-4 w-4 animate-spin" />
          Attempting recovery...
        </div>
      )}
    </div>
  );
}

export function RobustNotionEditor(props: RobustNotionEditorProps) {
  return (
    <EditorErrorBoundary
      onError={(error, errorInfo) => {
        console.error('Editor Error Boundary:', error, errorInfo);
        props.onError?.(error.message);
      }}
      onRecover={() => {
        props.onRecovery?.();
      }}
    >
      <EditorWithRecovery {...props} />
    </EditorErrorBoundary>
  );
}