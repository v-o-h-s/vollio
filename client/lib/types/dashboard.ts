/**
 * Dashboard-related types for UI state management and data aggregation
 */

import { DocumentDocument, UserActivity } from "./document";

// ============================================================================
// DASHBOARD TYPES
// ============================================================================

/**
 * Dashboard data aggregation
 */
export interface DashboardData {
  documents: DocumentDocument[];
  recentActivity: UserActivity | null;
  totalDocuments: number;
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
    name: string;
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
      documentId: string;
      activityType: "view" | "upload" | "delete";
      accessedAt: string;
      document?: {
        name: string;
        documentUrl: string;
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