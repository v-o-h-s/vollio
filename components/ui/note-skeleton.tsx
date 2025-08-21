import React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface NoteSkeletonProps {
  count?: number;
}

export const NoteSkeleton: React.FC<NoteSkeletonProps> = ({ count = 1 }) => {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Card key={index} className="p-6">
          <div className="flex items-start justify-between mb-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-4" />
          </div>
          
          <div className="space-y-2 mb-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
          
          <div className="flex items-center justify-between">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
        </Card>
      ))}
    </>
  );
};

export const NoteListSkeleton: React.FC = () => {
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      <NoteSkeleton count={6} />
    </div>
  );
};

export const NoteEditorSkeleton: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-48" />
      </div>
      
      <Card className="p-6">
        <Skeleton className="h-8 w-full mb-6" />
        
        <div className="space-y-4">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </Card>
    </div>
  );
};