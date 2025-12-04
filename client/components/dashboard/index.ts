/**
 * Dashboard Components Module
 *
 * This module exports all dashboard-related components for the Noto application.
 * These components work together to provide a comprehensive dashboard experience.
 *
 * Components:
 * - RecentActivityDisplay: Shows user's recent PDF activity
 * - AutoSaveStatusProvider: Context provider for auto-save status
 * - FloatingAutoSaveStatus: Floating auto-save status display
 *
 * Usage:
 * import { RecentActivityDisplay, AutoSaveStatusProvider, FloatingAutoSaveStatus } from '@/components/dashboard'
 *
 * @author Noto Team
 * @version 1.0.0
 */

// Recent activity display component
export { default as RecentActivityDisplay } from "./RecentActivityDisplay";

// Auto-save status components
export { AutoSaveStatusProvider, useAutoSaveStatus } from "./AutoSaveStatusProvider";
export { FloatingAutoSaveStatus } from "./FloatingAutoSaveStatus";
