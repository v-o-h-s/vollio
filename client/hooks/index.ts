// Core hooks
export { useAutoSave } from "./use-auto-save";
export { useRetry } from "./use-retry";
export { useEditorErrorRecovery } from "./use-editor-error-recovery";

// UI and Navigation hooks
export {
  useFloatingSidebar,
  useFloatingSidebarIntegration,
} from "./use-floating-sidebar";
export { useMobile, useIsMobile, useHasTouch } from "./use-mobile";
export { useTouchGestures, useSwipeGestures } from "./use-touch-gestures";
export { useAccessibilityMode } from "./use-accessibility-mode";
export { useTheme } from "./use-theme";
export { useShortcuts } from "./use-shortcuts";
export { usePageStatistics } from "./use-page-statistics";

// Re-export types
export type { AutoSaveStatus } from "./use-auto-save";
export type { RetryOptions, RetryState } from "./use-retry";
export type { AccessibilityMode } from "./use-accessibility-mode";
