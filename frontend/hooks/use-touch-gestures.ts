import { useRef, useEffect, useCallback } from 'react';

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

interface SwipeGesture {
  direction: 'left' | 'right' | 'up' | 'down';
  distance: number;
  velocity: number;
  duration: number;
}

interface TouchGestureHandlers {
  onSwipe?: (gesture: SwipeGesture) => void;
  onTap?: (point: TouchPoint) => void;
  onLongPress?: (point: TouchPoint) => void;
  onPinch?: (scale: number) => void;
}

interface TouchGestureOptions {
  swipeThreshold?: number; // Minimum distance for swipe (default: 50px)
  velocityThreshold?: number; // Minimum velocity for swipe (default: 0.3px/ms)
  longPressDelay?: number; // Long press duration (default: 500ms)
  tapTimeout?: number; // Maximum duration for tap (default: 200ms)
  preventScroll?: boolean; // Prevent default scroll behavior (default: false)
}

/**
 * Hook for handling touch gestures on mobile devices
 * Provides swipe, tap, long press, and pinch gesture recognition
 */
export function useTouchGestures(
  handlers: TouchGestureHandlers,
  options: TouchGestureOptions = {}
) {
  const {
    swipeThreshold = 50,
    velocityThreshold = 0.3,
    longPressDelay = 500,
    tapTimeout = 200,
    preventScroll = false,
  } = options;

  const touchStartRef = useRef<TouchPoint | null>(null);
  const touchEndRef = useRef<TouchPoint | null>(null);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialTouchesRef = useRef<TouchList | null>(null);

  const clearLongPressTimer = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    const touch = event.touches[0];
    const touchPoint: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    };

    touchStartRef.current = touchPoint;
    touchEndRef.current = null;
    initialTouchesRef.current = event.touches;

    // Start long press timer
    if (handlers.onLongPress && event.touches.length === 1) {
      longPressTimerRef.current = setTimeout(() => {
        if (touchStartRef.current) {
          handlers.onLongPress!(touchStartRef.current);
        }
      }, longPressDelay);
    }

    if (preventScroll) {
      event.preventDefault();
    }
  }, [handlers.onLongPress, longPressDelay, preventScroll]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    // Clear long press timer on move
    clearLongPressTimer();

    // Handle pinch gesture
    if (handlers.onPinch && event.touches.length === 2 && initialTouchesRef.current?.length === 2) {
      const touch1 = event.touches[0];
      const touch2 = event.touches[1];
      const initialTouch1 = initialTouchesRef.current[0];
      const initialTouch2 = initialTouchesRef.current[1];

      const currentDistance = Math.sqrt(
        Math.pow(touch2.clientX - touch1.clientX, 2) + 
        Math.pow(touch2.clientY - touch1.clientY, 2)
      );

      const initialDistance = Math.sqrt(
        Math.pow(initialTouch2.clientX - initialTouch1.clientX, 2) + 
        Math.pow(initialTouch2.clientY - initialTouch1.clientY, 2)
      );

      const scale = currentDistance / initialDistance;
      handlers.onPinch(scale);
    }

    if (preventScroll) {
      event.preventDefault();
    }
  }, [handlers.onPinch, clearLongPressTimer, preventScroll]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    clearLongPressTimer();

    if (!touchStartRef.current) return;

    const touch = event.changedTouches[0];
    const touchPoint: TouchPoint = {
      x: touch.clientX,
      y: touch.clientY,
      timestamp: Date.now(),
    };

    touchEndRef.current = touchPoint;

    const deltaX = touchPoint.x - touchStartRef.current.x;
    const deltaY = touchPoint.y - touchStartRef.current.y;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const duration = touchPoint.timestamp - touchStartRef.current.timestamp;
    const velocity = distance / duration;

    // Handle tap gesture
    if (distance < swipeThreshold && duration < tapTimeout && handlers.onTap) {
      handlers.onTap(touchStartRef.current);
      return;
    }

    // Handle swipe gesture
    if (distance >= swipeThreshold && velocity >= velocityThreshold && handlers.onSwipe) {
      const absDeltaX = Math.abs(deltaX);
      const absDeltaY = Math.abs(deltaY);

      let direction: SwipeGesture['direction'];
      if (absDeltaX > absDeltaY) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }

      const gesture: SwipeGesture = {
        direction,
        distance,
        velocity,
        duration,
      };

      handlers.onSwipe(gesture);
    }

    // Reset touch points
    touchStartRef.current = null;
    touchEndRef.current = null;
    initialTouchesRef.current = null;
  }, [handlers.onSwipe, handlers.onTap, swipeThreshold, velocityThreshold, tapTimeout, clearLongPressTimer]);

  const attachGestures = useCallback((element: HTMLElement | null) => {
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: !preventScroll });
    element.addEventListener('touchmove', handleTouchMove, { passive: !preventScroll });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      clearLongPressTimer();
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd, preventScroll, clearLongPressTimer]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearLongPressTimer();
    };
  }, [clearLongPressTimer]);

  return { attachGestures };
}

/**
 * Simplified hook for swipe gestures only
 * Useful when you only need swipe detection
 */
export function useSwipeGestures(
  onSwipe: (gesture: SwipeGesture) => void,
  options: Pick<TouchGestureOptions, 'swipeThreshold' | 'velocityThreshold' | 'preventScroll'> = {}
) {
  return useTouchGestures({ onSwipe }, options);
}