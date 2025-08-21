'use client';

import { WifiOff, Wifi, AlertTriangle, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { ConflictResolution } from '@/lib/utils/conflict-resolution';
import type { EditorContent } from './types';

export interface OfflineStatusIndicatorProps {
  isOnline: boolean;
  isSyncing: boolean;
  hasPendingChanges: boolean;
  syncError: Error | null;
  conflictResolution: ConflictResolution<EditorContent> | null;
  onSync?: () => void;
  onClearConflict?: () => void;
  className?: string;
}

export function OfflineStatusIndicator({
  isOnline,
  isSyncing,
  hasPendingChanges,
  syncError,
  conflictResolution,
  onSync,
  onClearConflict,
  className,
}: OfflineStatusIndicatorProps) {
  if (conflictResolution) {
    return (
      <div className={cn(
        'flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm',
        className
      )}>
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <div className="flex-1">
          <span className="text-yellow-800">
            Conflict resolved using {conflictResolution.strategy} strategy
          </span>
          {conflictResolution.conflicts && (
            <div className="text-xs text-yellow-600 mt-1">
              {conflictResolution.conflicts.join(', ')}
            </div>
          )}
        </div>
        {onClearConflict && (
          <Button
            size="sm"
            variant="outline"
            onClick={onClearConflict}
            className="text-xs"
          >
            Dismiss
          </Button>
        )}
      </div>
    );
  }

  if (syncError) {
    return (
      <div className={cn(
        'flex items-center gap-2 p-2 bg-red-50 border border-red-200 rounded text-sm',
        className
      )}>
        <WifiOff className="h-4 w-4 text-red-600" />
        <div className="flex-1">
          <span className="text-red-800">Sync failed: {syncError.message}</span>
        </div>
        {onSync && (
          <Button
            size="sm"
            variant="outline"
            onClick={onSync}
            className="text-xs"
          >
            Retry
          </Button>
        )}
      </div>
    );
  }

  if (!isOnline) {
    return (
      <div className={cn(
        'flex items-center gap-2 p-2 bg-orange-50 border border-orange-200 rounded text-sm',
        className
      )}>
        <WifiOff className="h-4 w-4 text-orange-600" />
        <span className="text-orange-800">
          Working offline
          {hasPendingChanges && ' - Changes will sync when online'}
        </span>
      </div>
    );
  }

  if (isSyncing) {
    return (
      <div className={cn(
        'flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded text-sm',
        className
      )}>
        <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />
        <span className="text-blue-800">Syncing changes...</span>
      </div>
    );
  }

  if (hasPendingChanges) {
    return (
      <div className={cn(
        'flex items-center gap-2 p-2 bg-yellow-50 border border-yellow-200 rounded text-sm',
        className
      )}>
        <Wifi className="h-4 w-4 text-yellow-600" />
        <span className="text-yellow-800">Changes pending sync</span>
        {onSync && (
          <Button
            size="sm"
            variant="outline"
            onClick={onSync}
            className="text-xs"
          >
            Sync now
          </Button>
        )}
      </div>
    );
  }

  return null;
}