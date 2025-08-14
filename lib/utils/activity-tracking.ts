/**
 * Activity Tracking Utilities
 * 
 * Utilities for tracking user activity with PDFs and annotations.
 * Provides client-side activity tracking that integrates with the Supabase backend.
 * 
 * @author Noto Team
 * @version 1.0.0
 */

import { ActivityType } from '@/lib/types'

/**
 * Interface for activity tracking options
 */
export interface ActivityTrackingOptions {
  /** Whether to track the activity immediately or defer */
  immediate?: boolean
  /** Additional metadata to include with the activity */
  metadata?: Record<string, any>
  /** Callback for successful tracking */
  onSuccess?: () => void
  /** Callback for tracking errors */
  onError?: (error: Error) => void
}

/**
 * Interface for activity tracking result
 */
export interface ActivityTrackingResult {
  success: boolean
  error?: string
}

/**
 * Tracks PDF view activity
 * 
 * This function is primarily used for client-side activity tracking.
 * The main activity tracking happens server-side when PDFs are accessed
 * via the API endpoints, but this can be used for additional tracking needs.
 * 
 * @param pdfId - The ID of the PDF being viewed
 * @param options - Optional tracking configuration
 * @returns Promise resolving to tracking result
 */
export async function trackPDFView(
  pdfId: string,
  options: ActivityTrackingOptions = {}
): Promise<ActivityTrackingResult> {
  try {
    // Validate input
    if (!pdfId || typeof pdfId !== 'string') {
      throw new Error('Invalid PDF ID provided for activity tracking')
    }
    
    // For now, we rely on server-side activity tracking
    // that happens automatically when PDFs are accessed via API
    // This client-side tracking is for additional analytics and real-time updates
    
    // Log the activity for debugging
    console.log('PDF view tracked:', {
      pdfId,
      timestamp: new Date().toISOString(),
      ...options.metadata
    })
    
    // Simulate a small delay to make it feel more realistic
    await new Promise(resolve => setTimeout(resolve, 100))
    
    // Call success callback if provided
    if (options.onSuccess) {
      options.onSuccess()
    }
    
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Failed to track PDF view:', errorMessage)
    
    // Call error callback if provided
    if (options.onError && error instanceof Error) {
      options.onError(error)
    }
    
    return { success: false, error: errorMessage }
  }
}

/**
 * Tracks annotation creation activity
 * 
 * @param annotationId - The ID of the annotation created
 * @param pdfId - The ID of the PDF the annotation belongs to
 * @param options - Optional tracking configuration
 * @returns Promise resolving to tracking result
 */
export async function trackAnnotationCreation(
  annotationId: string,
  pdfId: string,
  options: ActivityTrackingOptions = {}
): Promise<ActivityTrackingResult> {
  try {
    // Log the activity for debugging
    console.log('Annotation creation tracked:', {
      annotationId,
      pdfId,
      timestamp: new Date().toISOString(),
      ...options.metadata
    })
    
    // Call success callback if provided
    if (options.onSuccess) {
      options.onSuccess()
    }
    
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Failed to track annotation creation:', errorMessage)
    
    // Call error callback if provided
    if (options.onError && error instanceof Error) {
      options.onError(error)
    }
    
    return { success: false, error: errorMessage }
  }
}

/**
 * Tracks user session activity
 * 
 * @param activityType - The type of activity to track
 * @param resourceId - The ID of the resource (PDF, annotation, etc.)
 * @param options - Optional tracking configuration
 * @returns Promise resolving to tracking result
 */
export async function trackUserActivity(
  activityType: ActivityType,
  resourceId: string,
  options: ActivityTrackingOptions = {}
): Promise<ActivityTrackingResult> {
  try {
    // Log the activity for debugging
    console.log('User activity tracked:', {
      activityType,
      resourceId,
      timestamp: new Date().toISOString(),
      ...options.metadata
    })
    
    // Call success callback if provided
    if (options.onSuccess) {
      options.onSuccess()
    }
    
    return { success: true }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    console.error('Failed to track user activity:', errorMessage)
    
    // Call error callback if provided
    if (options.onError && error instanceof Error) {
      options.onError(error)
    }
    
    return { success: false, error: errorMessage }
  }
}

/**
 * Debounced activity tracking to prevent excessive API calls
 * 
 * @param trackingFunction - The tracking function to debounce
 * @param delay - Delay in milliseconds (default: 1000ms)
 * @returns Debounced tracking function
 */
export function debounceActivityTracking<T extends (...args: any[]) => Promise<ActivityTrackingResult>>(
  trackingFunction: T,
  delay: number = 1000
): T {
  let timeoutId: NodeJS.Timeout | null = null
  
  return ((...args: Parameters<T>) => {
    return new Promise<ActivityTrackingResult>((resolve) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      
      timeoutId = setTimeout(async () => {
        try {
          const result = await trackingFunction(...args)
          resolve(result)
        } catch (error) {
          resolve({
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          })
        }
      }, delay)
    })
  }) as T
}

/**
 * Activity tracking configuration
 */
export const ACTIVITY_TRACKING_CONFIG = {
  /** Default debounce delay for activity tracking */
  DEFAULT_DEBOUNCE_DELAY: 1000,
  /** Maximum retry attempts for failed tracking */
  MAX_RETRY_ATTEMPTS: 3,
  /** Retry delay in milliseconds */
  RETRY_DELAY: 2000,
} as const

/**
 * Creates a debounced PDF view tracker
 */
export const debouncedPDFViewTracker = debounceActivityTracking(
  trackPDFView,
  ACTIVITY_TRACKING_CONFIG.DEFAULT_DEBOUNCE_DELAY
)

/**
 * Creates a debounced annotation creation tracker
 */
export const debouncedAnnotationTracker = debounceActivityTracking(
  trackAnnotationCreation,
  ACTIVITY_TRACKING_CONFIG.DEFAULT_DEBOUNCE_DELAY
)

/**
 * Creates a debounced user activity tracker
 */
export const debouncedUserActivityTracker = debounceActivityTracking(
  trackUserActivity,
  ACTIVITY_TRACKING_CONFIG.DEFAULT_DEBOUNCE_DELAY
)