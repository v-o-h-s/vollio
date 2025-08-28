'use client';

import React, { useState } from 'react';
import { RobustNotionEditor } from './RobustNotionEditor';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { JSONContent } from '@/lib/types';

export function AutoSaveDemo() {
  const [noteId, setNoteId] = useState<string>('demo-note-1');
  const [title, setTitle] = useState<string>('Demo Note');
  const [autoSaveEnabled, setAutoSaveEnabled] = useState<boolean>(true);
  const [autoSaveDelay, setAutoSaveDelay] = useState<number>(2000);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 9)]);
  };

  const handleSave = (content: JSONContent) => {
    addLog(`✅ Content saved successfully`);
  };

  const handleError = (error: string) => {
    addLog(`❌ Error: ${error}`);
  };

  const handleRecovery = () => {
    addLog(`🔄 Editor recovered from error`);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Auto-Save Editor Demo</CardTitle>
          <CardDescription>
            This demo shows the auto-save and error recovery features
            of the Notion-like editor.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="noteId">Note ID</Label>
              <Input
                id="noteId"
                value={noteId}
                onChange={(e) => setNoteId(e.target.value)}
                placeholder="Enter note ID"
              />
            </div>
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter note title"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="autoSave"
                checked={autoSaveEnabled}
                onChange={(e) => setAutoSaveEnabled(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="autoSave">Enable Auto-Save</Label>
            </div>
            <div>
              <Label htmlFor="delay">Auto-Save Delay (ms)</Label>
              <Input
                id="delay"
                type="number"
                value={autoSaveDelay}
                onChange={(e) => setAutoSaveDelay(Number(e.target.value))}
                min="500"
                max="10000"
                step="500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Editor</CardTitle>
          <CardDescription>
            Start typing to see auto-save in action.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RobustNotionEditor
            noteId={noteId}
            title={title}
            autoSaveEnabled={autoSaveEnabled}
            autoSaveDelay={autoSaveDelay}
            showStatusIndicators={true}
            placeholder="Start writing your note..."
            onSave={handleSave}
            onError={handleError}
            onRecovery={handleRecovery}
            content={{
              type: 'doc',
              content: [
                {
                  type: 'paragraph',
                  content: [
                    {
                      type: 'text',
                      text: 'Welcome to the auto-save demo! Start typing to see the features in action.'
                    }
                  ]
                }
              ]
            }}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Activity Log</CardTitle>
            <CardDescription>
              Real-time log of save operations, errors, and recovery events
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={clearLogs}>
            Clear Log
          </Button>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-md font-mono text-sm max-h-60 overflow-y-auto">
            {logs.length === 0 ? (
              <div className="text-muted-foreground">No activity yet...</div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div><strong>Auto-Save:</strong> Type in the editor and watch for the "Saving..." indicator</div>
          <div><strong>Error Recovery:</strong> The editor will handle network errors gracefully</div>
        </CardContent>
      </Card>
    </div>
  );
}