// Existing hooks
export { useActivityTracking } from './use-activity-tracking';
export { useErrorHandling } from './use-error-handling';
export { useKeyboardShortcuts } from './use-keyboard-shortcuts';
export { useMobile } from './use-mobile';

// Auto-save and persistence hooks
export { useAutoSave } from './use-auto-save';
export { useDebounce } from './use-debounce';
export { useEditorAutoSave } from './use-editor-auto-save';

// Offline support hooks
export { useOfflineStorage } from './use-offline-storage';
export { useEditorWithOffline } from './use-editor-with-offline';

// Error recovery hooks
export { useRetry } from './use-retry';
export { useNetworkStatus } from './use-network-status';
export { useEditorErrorRecovery } from './use-editor-error-recovery';

// Re-export types
export type { AutoSaveOptions, AutoSaveState } from './use-auto-save';
export type { OfflineStorageOptions, OfflineStorageState } from './use-offline-storage';
export type { RetryOptions, RetryState } from './use-retry';
export type { NetworkStatus, NetworkStatusOptions } from './use-network-status';