import React from "react";
import { Card } from "./card";
import { Skeleton } from "./skeleton";

interface EnhancedNotesListSkeletonProps {
  count?: number;
  viewMode?: 'grid' | 'list' | 'compact';
}

const EnhancedNoteCardSkeleton: React.FC<{ variant: 'grid' | 'list' | 'compact'; index?: number }> = ({ variant, index = 0 }) => {
  const cardClasses = variant === 'grid' 
    ? "p-6 min-h-[220px]" 
    : variant === 'list' 
    ? "p-5 min-h-[140px]" 
    : "p-4 min-h-[100px]";

  return (
    <Card 
      className={`${cardClasses} space-y-3 loading-shimmer enhanced-note-card`}
      style={{ 
        animationDelay: `${Math.min(index * 50, 400)}ms`,
        animationDuration: '1.5s'
      }}
    >
      {/* Title skeleton */}
      <div className="flex items-start justify-between">
        <Skeleton className={`h-${variant === 'compact' ? '4' : '5'} w-3/4`} />
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
      
      {/* Content preview skeleton (not shown in compact mode) */}
      {variant !== 'compact' && (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-5/6" />
          {variant === 'grid' && <Skeleton className="h-4 w-3/4" />}
        </div>
      )}
      
      {/* Metadata skeleton */}
      <div className="flex items-center justify-between pt-2">
        <div className="flex items-center gap-3">
          <Skeleton className="h-3 w-16" />
          {variant !== 'compact' && <Skeleton className="h-3 w-12" />}
          {variant === 'grid' && <Skeleton className="h-3 w-14" />}
        </div>
        <Skeleton className="h-5 w-20 rounded-full" />
      </div>
      
      {/* Quick action button (grid mode only) */}
      {variant === 'grid' && (
        <div className="pt-4 border-t border-border">
          <Skeleton className="h-9 w-28" />
        </div>
      )}
    </Card>
  );
};

export const EnhancedNotesListSkeleton: React.FC<EnhancedNotesListSkeletonProps> = ({ 
  count = 8, 
  viewMode = 'grid' 
}) => {
  const gridClasses = viewMode === 'list' 
    ? 'grid gap-4 grid-cols-1'
    : viewMode === 'compact'
    ? 'grid gap-3 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6'
    : 'grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5';

  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <Skeleton className="h-10 w-80" />
        <div className="flex items-center gap-2">
          <div className="flex items-center border rounded-lg p-1">
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
            <Skeleton className="h-8 w-8 rounded" />
          </div>
          <Skeleton className="h-10 w-24" />
        </div>
      </div>
      
      {/* Results summary skeleton */}
      <Skeleton className="h-4 w-40" />
      
      {/* Notes grid skeleton with staggered animation */}
      <div className={`${gridClasses} notes-grid`}>
        {Array.from({ length: count }).map((_, index) => (
          <div 
            key={index}
            className="notes-grid-item"
            style={{ 
              animationDelay: `${Math.min(index * 50, 400)}ms` 
            }}
          >
            <EnhancedNoteCardSkeleton variant={viewMode} index={index} />
          </div>
        ))}
      </div>
    </div>
  );
};