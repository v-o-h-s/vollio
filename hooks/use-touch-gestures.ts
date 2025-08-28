import { useRef, useCallback, useEffect } from 'react';

interface TouchGestureOptions {
  onTap?: (event: TouchEvent) => void;
  onLongPress?: (event: TouchEvent) => void;
  onSwipeLeft?: (event: TouchEvent) => void;
  onSwipeRight?: (event: TouchEvent) => void;
  onSwipeUp?: (event: TouchEvent) => void;
  onSwipeDown?: (event: TouchEvent) => void;
  onPinch?: (scale: number, event: TouchEvent) => void;
  longPressDelay?: number;
  swipeThreshold?: number;
  pinchThreshold?: number;
}

interface TouchState {
  startX: number;
  startY: number;
  startTime: number;
  initialDistance?: number;
  longPressTimer?: NodeJS.Timeout;
}

export function useTouchGestures(options: TouchGestureOptions = {}) {
  const {
    onTap,
    onLongPress,
    onSwipeLeft,
    onSwipeRight,
    onSwipeUp,
    onSwipeDown,
    onPinch,
    longPressDelay = 500,
    swipeThreshold = 50,
    pinchThreshold = 0.1,
  } = options;

  const touchState = useRef<TouchState | null>(null);
  const elementRef = useRef<HTMLElement | null>(null);

  const getDistance = useCallback((touch1: Touch, touch2: Touch) => {
    const dx = touch1.clientX - touch2.clientX;
    const dy = touch1.clientY - touch2.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }, []);

  const handleTouchStart = useCallback((event: TouchEvent) => {
    const touch = event.touches[0];
    
    // Clear any existing long press timer
    if (touchState.current?.longPressTimer) {
      clearTimeout(touchState.current.longPressTimer);
    }

    touchState.current = {
      startX: touch.clientX,
      startY: touch.clientY,
      startTime: Date.now(),
    };

    // Handle multi-touch for pinch gestures
    if (event.touches.length === 2 && onPinch) {
      touchState.current.initialDistance = getDistance(event.touches[0], event.touches[1]);
    }

    // Set up long press timer
    if (onLongPress) {
      touchState.current.longPressTimer = setTimeout(() => {
        if (touchState.current) {
          onLongPress(event);
          // Add haptic feedback
          if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
            navigator.vibrate(100);
          }
        }
      }, longPressDelay);
    }
  }, [onLongPress, longPressDelay, getDistance, onPinch]);

  const handleTouchMove = useCallback((event: TouchEvent) => {
    if (!touchState.current) return;

    // Handle pinch gestures
    if (event.touches.length === 2 && onPinch && touchState.current.initialDistance) {
      const currentDistance = getDistance(event.touches[0], event.touches[1]);
      const scale = currentDistance / touchState.current.initialDistance;
      
      if (Math.abs(scale - 1) > pinchThreshold) {
        onPinch(scale, event);
      }
      return;
    }

    // Cancel long press if finger moves too much
    const touch = event.touches[0];
    const deltaX = Math.abs(touch.clientX - touchState.current.startX);
    const deltaY = Math.abs(touch.clientY - touchState.current.startY);
    
    if ((deltaX > 10 || deltaY > 10) && touchState.current.longPressTimer) {
      clearTimeout(touchState.current.longPressTimer);
      touchState.current.longPressTimer = undefined;
    }
  }, [onPinch, getDistance, pinchThreshold]);

  const handleTouchEnd = useCallback((event: TouchEvent) => {
    if (!touchState.current) return;

    const touch = event.changedTouches[0];
    const deltaX = touch.clientX - touchState.current.startX;
    const deltaY = touch.clientY - touchState.current.startY;
    const deltaTime = Date.now() - touchState.current.startTime;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

    // Clear long press timer
    if (touchState.current.longPressTimer) {
      clearTimeout(touchState.current.longPressTimer);
    }

    // Determine gesture type
    if (distance < 10 && deltaTime < 300) {
      // Tap gesture
      if (onTap) {
        onTap(event);
        // Add subtle haptic feedback
        if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
          navigator.vibrate(25);
        }
      }
    } else if (distance > swipeThreshold) {
      // Swipe gesture
      const absX = Math.abs(deltaX);
      const absY = Math.abs(deltaY);
      
      if (absX > absY) {
        // Horizontal swipe
        if (deltaX > 0 && onSwipeRight) {
          onSwipeRight(event);
        } else if (deltaX < 0 && onSwipeLeft) {
          onSwipeLeft(event);
        }
      } else {
        // Vertical swipe
        if (deltaY > 0 && onSwipeDown) {
          onSwipeDown(event);
        } else if (deltaY < 0 && onSwipeUp) {
          onSwipeUp(event);
        }
      }
      
      // Add haptic feedback for swipes
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(50);
      }
    }

    touchState.current = null;
  }, [onTap, onSwipeLeft, onSwipeRight, onSwipeUp, onSwipeDown, swipeThreshold]);

  const attachToElement = useCallback((element: HTMLElement | null) => {
    // Remove previous listeners
    if (elementRef.current) {
      elementRef.current.removeEventListener('touchstart', handleTouchStart);
      elementRef.current.removeEventListener('touchmove', handleTouchMove);
      elementRef.current.removeEventListener('touchend', handleTouchEnd);
    }

    elementRef.current = element;

    // Add new listeners
    if (element) {
      element.addEventListener('touchstart', handleTouchStart, { passive: false });
      element.addEventListener('touchmove', handleTouchMove, { passive: false });
      element.addEventListener('touchend', handleTouchEnd, { passive: false });
    }
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (elementRef.current) {
        elementRef.current.removeEventListener('touchstart', handleTouchStart);
        elementRef.current.removeEventListener('touchmove', handleTouchMove);
        elementRef.current.removeEventListener('touchend', handleTouchEnd);
      }
      
      if (touchState.current?.longPressTimer) {
        clearTimeout(touchState.current.longPressTimer);
      }
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { attachToElement };
}

// Utility hook for haptic feedback
export function useHapticFeedback() {
  const vibrate = useCallback((pattern: number | number[]) => {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }, []);

  const tapFeedback = useCallback(() => vibrate(25), [vibrate]);
  const longPressFeedback = useCallback(() => vibrate(100), [vibrate]);
  const swipeFeedback = useCallback(() => vibrate(50), [vibrate]);
  const errorFeedback = useCallback(() => vibrate([100, 50, 100]), [vibrate]);
  const successFeedback = useCallback(() => vibrate([50, 25, 50]), [vibrate]);

  return {
    vibrate,
    tapFeedback,
    longPressFeedback,
    swipeFeedback,
    errorFeedback,
    successFeedback,
  };
}