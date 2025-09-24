// Existing hooks
export { useActivityTracking } from './use-activity-tracking';
export { useErrorHandling } from './use-error-handling';
export { useKeyboardShortcuts } from './use-keyboard-shortcuts';

// Auto-save and persistence hooks
export { useAutoSave } from './use-auto-save';
export { useDebounce } from './use-debounce';

// Quiz-specific error handling hooks
export { 
  useQuizErrorHandling,
  useQuizGenerationErrorHandling,
  useDocumentProcessingErrorHandling,
  useQuizPlayerErrorHandling,
  useQuizResultsErrorHandling
} from './use-quiz-error-handling';

// Error recovery hooks
export { useRetry } from './use-retry';
export { useNetworkStatus } from './use-network-status';
export { useEditorErrorRecovery } from './use-editor-error-recovery';

// Cross-tab synchronization hooks
export { useNoteSync } from './use-note-sync';

// Mobile and touch hooks
export { useMobile, useIsMobile, useHasTouch } from './use-mobile';
export { useTouchGestures, useSwipeGestures } from './use-touch-gestures';

// Accessibility hooks
export { useAccessibilityMode } from './use-accessibility-mode';
export { useQuizKeyboardShortcuts } from './use-quiz-keyboard-shortcuts';

// Re-export types
export type { AutoSaveOptions, AutoSaveState } from './use-auto-save';
export type { RetryOptions, RetryState } from './use-retry';
export type { NetworkStatus, NetworkStatusOptions } from './use-network-status';
export type { UseNoteSyncOptions, UseNoteSyncReturn } from './use-note-sync';
export type { AccessibilityMode } from './use-accessibility-mode';
export type { QuizKeyboardShortcut } from './use-quiz-keyboard-shortcuts';