"use client";

import React from "react";
import { FloatingToolbarDemo } from "@/components/editor/FloatingToolbarDemo";
import { MobileEditorDemo } from "@/components/editor/MobileEditorDemo";
import { Separator } from "@/components/ui/separator";

export default function EditorTestPage() {
  return (
    <div className="container mx-auto py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Editor Test Page</h1>
        <p className="text-muted-foreground">
          Test both desktop and mobile editor features
        </p>
      </div>
      
      <MobileEditorDemo />
      
      <Separator />
      
      <div>
        <h2 className="text-2xl font-semibold mb-4">Desktop Floating Toolbar Demo</h2>
        <FloatingToolbarDemo />
      </div>
    </div>
  );
}