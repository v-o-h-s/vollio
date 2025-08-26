import React, { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import type { EditorMode } from "./types";

// Lazy load the heavy editor components
const NotionEditor = lazy(() => import("./NotionEditor").then(module => ({ default: module.NotionEditor })));
const EditorProvider = lazy(() => import("./EditorProvider").then(module => ({ default: module.EditorProvider })));

interface LazyNotionEditorProps {
  initialContent?: any;
  onChange?: (content: any) => void;
  placeholder?: string;
  className?: string;
  mode?: EditorMode;
  onModeChange?: (mode: EditorMode) => void;
  showModeToggle?: boolean;
  showWordCount?: boolean;
  showReadingTime?: boolean;
  showContextualToolbar?: boolean;
  distractionFreeMode?: boolean;
  enhancedTypography?: boolean;
}

const EditorSkeleton = () => (
  <Card className="p-6">
    <div className="space-y-4">
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/5" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-2/3" />
      <div className="pt-4">
        <Skeleton className="h-8 w-32" />
      </div>
    </div>
  </Card>
);

export const LazyNotionEditor: React.FC<LazyNotionEditorProps> = (props) => {
  return (
    <Suspense fallback={<EditorSkeleton />}>
      <EditorProvider>
        <NotionEditor {...props} />
      </EditorProvider>
    </Suspense>
  );
};