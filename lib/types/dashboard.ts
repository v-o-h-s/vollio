/**
 * Dashboard-related types for UI state management and data aggregation
 */

import { PDFDocument, UserActivity } from "./pdf";

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

/**
 * Dashboard data aggregation
 */
export interface DashboardData {
  pdfs: PDFDocument[];
  recentActivity: UserActivity | null;
  totalFiles: number;
  totalSize: number;
}

/**
 * Dashboard component state
 */
export interface DashboardState {
  data: DashboardData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null; // ISO string for Redux serialization
}

/**
 * Activity tracking configuration
 */
export interface ActivityTrackingOptions {
  trackView?: boolean;
  trackUpload?: boolean;
  trackDelete?: boolean;
}

/**
 * User activity summary statistics
 */
export interface ActivitySummary {
  totalViews: number;
  totalUploads: number;
  totalDeletes: number;
  lastActivity: string | null; // ISO string for Redux serialization
  mostViewedPdf: {
    id: string;
    filename: string;
    viewCount: number;
  } | null;
}

/**
 * Supabase activity tracking response
 */
export interface SupabaseActivityResponse {
  success: boolean;
  data?: {
    activities: Array<{
      id: string;
      pdfId: string;
      activityType: "view" | "upload" | "delete";
      accessedAt: string;
      pdf?: {
        filename: string;
        fileUrl: string;
      };
    }>;
    summary: {
      totalViews: number;
      totalUploads: number;
      totalDeletes: number;
      lastActivity: string | null;
    };
  };
  error?: string;
}