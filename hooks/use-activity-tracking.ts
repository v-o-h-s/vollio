/**
 * Activity Tracking Hook
 * 
 * Custom hook for tracking user activity with PDFs and annotations.
 * Provides a convenient interface for activity tracking in React components.
 * 
 * @author Noto Team
 * @version 1.0.0
 */

import { useCallback } from 'react'
import { useAppDispatch } from '@/lib/store/hooks'
import { apiSlice } from '@/lib/store/apiSlice'
import { 
  trackPDFView, 
  trackAnnotationCreation, 
  trackUserActivity,
  ActivityTrackingOptions,
  ActivityTrackingResult 
} from '@/lib/utils/activity-tracking'
import { ActivityType } from '@/lib/types'

/**
 * Hook for activity tracking with automatic cache invalidation
 */
export function useActivityTracking() {
  const dispatch = useAppDispatch()
  
  /**
   * Track PDF view with automatic cache invalidation
   */
  const trackPDFViewWithUpdate = useCallback(async (
    pdfId: string,
    options: ActivityTrackingOptions = {}
  ): Promise<ActivityTrackingResult> => {
    const result = await trackPDFView(pdfId, {
      ...options,
      onSuccess: () => {
        // Invalidate PDF list cache to update recent activity
        dispatch(apiSlice.util.invalidateTags([{ type: 'PDF', id: 'LIST' }]))
        options.onSuccess?.()
      }
    })
    
    return result
  }, [dispatch])
  
  /**
   * Track annotation creation with automatic cache invalidation
   */
  const trackAnnotationCreationWithUpdate = useCallback(async (
    annotationId: string,
    pdfId: string,
    options: ActivityTrackingOptions = {}
  ): Promise<ActivityTrackingResult> => {
    const result = await trackAnnotationCreation(annotationId, pdfId, {
      ...options,
      onSuccess: () => {
        // Invalidate relevant caches
        dispatch(apiSlice.util.invalidateTags([
          { type: 'PDF', id: 'LIST' },
          { type: 'PDF', id: pdfId }
        ]))
        options.onSuccess?.()
      }
    })
    
    return result
  }, [dispatch])
  
  /**
   * Track general user activity with automatic cache invalidation
   */
  const trackUserActivityWithUpdate = useCallback(async (
    activityType: ActivityType,
    resourceId: string,
    options: ActivityTrackingOptions = {}
  ): Promise<ActivityTrackingResult> => {
    const result = await trackUserActivity(activityType, resourceId, {
      ...options,
      onSuccess: () => {
        // Invalidate relevant caches based on activity type
        if (activityType === 'view' || activityType === 'upload' || activityType === 'delete') {
          dispatch(apiSlice.util.invalidateTags([
            { type: 'PDF', id: 'LIST' },
            { type: 'PDF', id: resourceId }
          ]))
        }
        options.onSuccess?.()
      }
    })
    
    return result
  }, [dispatch])
  
  /**
   * Invalidate activity-related caches manually
   */
  const invalidateActivityCaches = useCallback(() => {
    dispatch(apiSlice.util.invalidateTags([{ type: 'PDF', id: 'LIST' }]))
  }, [dispatch])
  
  return {
    trackPDFView: trackPDFViewWithUpdate,
    trackAnnotationCreation: trackAnnotationCreationWithUpdate,
    trackUserActivity: trackUserActivityWithUpdate,
    invalidateActivityCaches
  }
}

/**
 * Hook for debounced activity tracking
 * Useful for preventing excessive tracking calls
 */
export function useDebouncedActivityTracking(delay: number = 1000) {
  const { trackPDFView, trackAnnotationCreation, trackUserActivity } = useActivityTracking()
  
  // Create debounced versions of tracking functions
  const debouncedTrackPDFView = useCallback(
    debounce(trackPDFView, delay),
    [trackPDFView, delay]
  )
  
  const debouncedTrackAnnotationCreation = useCallback(
    debounce(trackAnnotationCreation, delay),
    [trackAnnotationCreation, delay]
  )
  
  const debouncedTrackUserActivity = useCallback(
    debounce(trackUserActivity, delay),
    [trackUserActivity, delay]
  )
  
  return {
    trackPDFView: debouncedTrackPDFView,
    trackAnnotationCreation: debouncedTrackAnnotationCreation,
    trackUserActivity: debouncedTrackUserActivity
  }
}

/**
 * Simple debounce utility function
 */
function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): (...args: Parameters<T>) => Promise<ReturnType<T>> {
  let timeoutId: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    return new Promise<ReturnType<T>>((resolve, reject) => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }
      
      timeoutId = setTimeout(async () => {
        try {
          const result = await func(...args)
          resolve(result)
        } catch (error) {
          reject(error)
        }
      }, delay)
    })
  }
}