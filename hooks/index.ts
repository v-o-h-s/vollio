// Existing hooks
export { useActivityTracking } from './use-activity-tracking';
export { useErrorHandling } from './use-error-handling';
export { useKeyboardShortcuts } from './use-keyboard-shortcuts';
export { useMobile } from './use-mobile';
export { useTouchGestures } from './use-touch-gestures';
export { useMobileKeyboard } from './use-mobile-keyboard';

// Auto-save and persistence hooks
export { useAutoSave } from './use-auto-save';
export { useDebounce } from './use-debounce';




// Error recovery hooks
export { useRetry } from './use-retry';
export { useNetworkStatus } from './use-network-status';
export { useEditorErrorRecovery } from './use-editor-error-recovery';

// Cross-tab synchronization hooks
export { useNoteSync } from './use-note-sync';

// Re-export types
export type { AutoSaveOptions, AutoSaveState } from './use-auto-save';

export type { RetryOptions, RetryState } from './use-retry';
export type { NetworkStatus, NetworkStatusOptions } from './use-network-status';
export type { UseNoteSyncOptions, UseNoteSyncReturn } from './use-note-sync';