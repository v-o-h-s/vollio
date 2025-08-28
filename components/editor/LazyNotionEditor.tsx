import React, { lazy, Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";
import { JSONContent } from "@/lib/types";

// Lazy load the heavy editor components
const NotionEditor = lazy(() => import("./NotionEditor").then(module => ({ default: module.NotionEditor })));
const EditorProvider = lazy(() => import("./EditorProvider").then(module => ({ default: module.EditorProvider })));

interface LazyNotionEditorProps {
  initialContent?: JSONContent | string;
  onChange?: (content: JSONContent) => void;
  placeholder?: string;
  className?: string;
  showWordCount?: boolean;
  showReadingTime?: boolean;
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