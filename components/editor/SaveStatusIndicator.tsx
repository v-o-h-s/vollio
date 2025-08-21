'use client';

import { CheckCircle, AlertCircle, Loader2, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface SaveStatusIndicatorProps {
  isSaving: boolean;
  lastSaved: Date | null;
  error: Error | null;
  hasUnsavedChanges: boolean;
  className?: string;
  onRetry?: () => void;
}

export function SaveStatusIndicator({
  isSaving,
  lastSaved,
  error,
  hasUnsavedChanges,
  className,
  onRetry,
}: SaveStatusIndicatorProps) {
  const formatLastSaved = (date: Date) => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Saved just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `Saved ${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else {
      return `Saved at ${date.toLocaleTimeString([], { 
        hour: '2-digit', 
        minute: '2-digit' 
      })}`;
    }
  };

  if (error) {
    return (
      <div className={cn(
        'flex items-center gap-2 text-sm text-destructive',
        className
      )}>
        <AlertCircle className="h-4 w-4" />
        <span>Save failed</span>
        {onRetry && (
          <button
            onClick={onRetry}
            className="text-xs underline hover:no-underline"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  if (isSaving) {
    return (
      <div className={cn(
        'flex items-center gap-2 text-sm text-muted-foreground',
        className
      )}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Saving...</span>
      </div>
    );
  }

  if (hasUnsavedChanges) {
    return (
      <div className={cn(
        'flex items-center gap-2 text-sm text-muted-foreground',
        className
      )}>
        <Clock className="h-4 w-4" />
        <span>Unsaved changes</span>
      </div>
    );
  }

  if (lastSaved) {
    return (
      <div className={cn(
        'flex items-center gap-2 text-sm text-muted-foreground',
        className
      )}>
        <CheckCircle className="h-4 w-4 text-green-600" />
        <span>{formatLastSaved(lastSaved)}</span>
      </div>
    );
  }

  return null;
}