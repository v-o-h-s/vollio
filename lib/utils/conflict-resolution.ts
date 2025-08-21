import type { EditorContent } from '@/components/editor/types';

export interface ConflictData<T = any> {
  local: T;
  remote: T;
  timestamp: string;
}

export interface ConflictResolution<T = any> {
  resolved: T;
  strategy: 'local' | 'remote' | 'merged' | 'manual';
  conflicts?: string[];
}

export type ConflictResolutionStrategy = 'last-write-wins' | 'manual' | 'merge-content';

/**
 * Resolves conflicts between local and remote data
 */
export function resolveConflict<T>(
  conflict: ConflictData<T>,
  strategy: ConflictResolutionStrategy = 'last-write-wins'
): ConflictResolution<T> {
  switch (strategy) {
    case 'last-write-wins':
      return resolveLastWriteWins(conflict);
    case 'merge-content':
      return mergeEditorContent(conflict as ConflictData<EditorContent>) as ConflictResolution<T>;
    case 'manual':
      return {
        resolved: conflict.local,
        strategy: 'manual',
        conflicts: ['Manual resolution required'],
      };
    default:
      return resolveLastWriteWins(conflict);
  }
}

/**
 * Simple last-write-wins strategy
 */
function resolveLastWriteWins<T>(conflict: ConflictData<T>): ConflictResolution<T> {
  // For now, always prefer local changes (user's current work)
  // In a real implementation, you'd compare timestamps
  return {
    resolved: conflict.local,
    strategy: 'local',
  };
}

/**
 * Merge editor content by combining non-conflicting changes
 */
function mergeEditorContent(conflict: ConflictData<EditorContent>): ConflictResolution<EditorContent> {
  const { local, remote } = conflict;
  
  // Simple merge strategy: prefer local content but preserve structure
  // In a real implementation, you'd do more sophisticated merging
  try {
    const merged: EditorContent = {
      type: 'doc',
      content: [
        ...(local.content || []),
        // Add a separator if both have content
        ...(local.content?.length && remote.content?.length ? [{
          type: 'horizontalRule'
        }] : []),
        // Add remote content that's not in local
        ...(remote.content || []).filter(remoteNode => {
          // Simple deduplication based on content
          const remoteStr = JSON.stringify(remoteNode);
          return !(local.content || []).some(localNode => 
            JSON.stringify(localNode) === remoteStr
          );
        })
      ]
    };

    return {
      resolved: merged,
      strategy: 'merged',
    };
  } catch (error) {
    // Fall back to local if merge fails
    return {
      resolved: local,
      strategy: 'local',
      conflicts: ['Merge failed, using local version'],
    };
  }
}

/**
 * Check if two pieces of data have conflicts
 */
export function hasConflicts<T>(local: T, remote: T): boolean {
  return JSON.stringify(local) !== JSON.stringify(remote);
}

/**
 * Create a conflict data object
 */
export function createConflictData<T>(
  local: T,
  remote: T,
  timestamp: string = new Date().toISOString()
): ConflictData<T> {
  return {
    local,
    remote,
    timestamp,
  };
}