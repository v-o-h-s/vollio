/**
 * Dashboard Components Module
 *
 * This module exports all dashboard-related components for the Vollio application.
 * These components work together to provide a comprehensive dashboard experience.
 *
 * Components:
 * - AutoSaveStatusProvider: Context provider for auto-save status
 * - FloatingAutoSaveStatus: Floating auto-save status display
 *
 * Usage:
 * import { AutoSaveStatusProvider, FloatingAutoSaveStatus } from '@/components/dashboard'
 *
 * @author Vollio Team
 * @version 1.0.0
 */

// Auto-save status components
export {
  AutoSaveStatusProvider,
  useAutoSaveStatus,
} from "./AutoSaveStatusProvider";
export { FloatingAutoSaveStatus } from "./FloatingAutoSaveStatus";
