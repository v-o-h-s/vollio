"use client";

import React from "react";
import { FloatingToolbarDemo } from "@/components/editor/FloatingToolbarDemo";
import { MobileEditorDemo } from "@/components/editor/MobileEditorDemo";
import { MultiModeEditorDemo } from "@/components/editor/MultiModeEditorDemo";
import { NotionEditor } from "@/components/editor/NotionEditor";
import { Separator } from "@/components/ui/separator";

export default function EditorTestPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Editor Test Page</h1>
        <p className="text-muted-foreground">
          Test desktop, mobile, and multi-mode editor features
        </p>
      </div>
      
      <div>
        <h2 className="text-2xl font-semibold mb-4">Enhanced NotionEditor with Multi-Mode Support</h2>
        <p className="text-muted-foreground mb-4">
          Test the enhanced NotionEditor with normal, fullscreen, and focus modes. Use F11 for focus mode, Ctrl+Shift+F for fullscreen, or use the mode toggle buttons.
        </p>
        <NotionEditor 
          placeholder="Start writing with the enhanced multi-mode editor..."
          showModeToggle={true}
          showWordCount={true}
          showReadingTime={true}
          mode="normal"
          className="min-h-[400px]"
        />
      </div>
      
      <Separator />
      
      <div>
        <h2 className="text-2xl font-semibold mb-4">Multi-Mode Editor Demo (Standalone)</h2>
        <p className="text-muted-foreground mb-4">
          Standalone multi-mode editor component for comparison.
        </p>
        <MultiModeEditorDemo />
      </div>
      
      <Separator />
      
      <MobileEditorDemo />
      
      <Separator />
      
      <div>
        <h2 className="text-2xl font-semibold mb-4">Desktop Floating Toolbar Demo</h2>
        <FloatingToolbarDemo />
      </div>
    </div>
  );
}