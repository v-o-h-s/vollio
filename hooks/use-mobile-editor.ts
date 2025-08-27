import { useState, useEffect, useCallback, useRef } from "react";
import { useIsMobile } from "./use-mobile";
import { useMobileKeyboard } from "./use-mobile-keyboard";
import { useTouchGestures, useHapticFeedback } from "./use-touch-gestures";
type EditorMode = "normal" | "fullscreen" | "focus";
interface MobileEditorOptions {
  enableGestures?: boolean;
  enableHapticFeedback?: boolean;
  enableKeyboardAdjustments?: boolean;
  gestureThreshold?: number;
  onModeChange?: (mode: EditorMode) => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
}

interface MobileEditorState {
  mode: EditorMode;
  isKeyboardVisible: boolean;
  keyboardHeight: number;
  viewportHeight: number;
  isGestureActive: boolean;
  touchPosition: { x: number; y: number } | null;
}

export function useMobileEditor(options: MobileEditorOptions = {}) {
  const {
    enableGestures = true,
    enableHapticFeedback = true,
    enableKeyboardAdjustments = true,
    gestureThreshold = 50,
    onModeChange,
    onSwipeLeft,
    onSwipeRight,
  } = options;

  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLElement | null>(null);

  const [state, setState] = useState<MobileEditorState>({
    mode: "normal",
    isKeyboardVisible: false,
    keyboardHeight: 0,
    viewportHeight: typeof window !== "undefined" ? window.innerHeight : 0,
    isGestureActive: false,
    touchPosition: null,
  });

  // Mobile keyboard management
  const { keyboardState, scrollIntoView, adjustElementPosition } =
    useMobileKeyboard({
      onShow: (height) => {
        setState((prev) => ({
          ...prev,
          isKeyboardVisible: true,
          keyboardHeight: height,
        }));

        // Update CSS variables for keyboard height (only on client)
        if (typeof document !== "undefined") {
          document.documentElement.style.setProperty(
            "--mobile-keyboard-height",
            `${height}px`
          );
          document.documentElement.style.setProperty(
            "--mobile-viewport-height",
            `${keyboardState.viewportHeight}px`
          );

          // Add keyboard visible class to body
          document.body.classList.add("mobile-keyboard-visible");
        }
      },
      onHide: () => {
        setState((prev) => ({
          ...prev,
          isKeyboardVisible: false,
          keyboardHeight: 0,
        }));

        // Remove CSS variables (only on client)
        if (typeof document !== "undefined") {
          document.documentElement.style.removeProperty(
            "--mobile-keyboard-height"
          );
          document.documentElement.style.removeProperty(
            "--mobile-viewport-height"
          );

          // Remove keyboard visible class from body
          document.body.classList.remove("mobile-keyboard-visible");
        }
      },
      adjustViewport: enableKeyboardAdjustments,
    });

  // Haptic feedback
  const { tapFeedback, swipeFeedback, successFeedback } = useHapticFeedback();

  // Touch gestures
  const { attachToElement } = useTouchGestures({
    onTap: (event) => {
      if (!enableGestures) return;

      setState((prev) => ({
        ...prev,
        touchPosition: {
          x: event.changedTouches[0].clientX,
          y: event.changedTouches[0].clientY,
        },
      }));

      if (enableHapticFeedback) {
        tapFeedback();
      }
    },
    onLongPress: (event) => {
      if (!enableGestures) return;

      // Long press could trigger mode switching or context menu
      if (enableHapticFeedback) {
        successFeedback();
      }
    },
    onSwipeLeft: (event) => {
      if (!enableGestures) return;

      setState((prev) => ({ ...prev, isGestureActive: true }));

      if (enableHapticFeedback) {
        swipeFeedback();
      }

      onSwipeLeft?.();

      // Reset gesture state after animation
      setTimeout(() => {
        setState((prev) => ({ ...prev, isGestureActive: false }));
      }, 300);
    },
    onSwipeRight: (event) => {
      if (!enableGestures) return;

      setState((prev) => ({ ...prev, isGestureActive: true }));

      if (enableHapticFeedback) {
        swipeFeedback();
      }

      onSwipeRight?.();

      // Reset gesture state after animation
      setTimeout(() => {
        setState((prev) => ({ ...prev, isGestureActive: false }));
      }, 300);
    },
    onSwipeUp: (event) => {
      if (!enableGestures) return;

      // Swipe up could trigger fullscreen mode
      if (state.mode === "normal") {
        handleModeChange("fullscreen");
      }
    },
    onSwipeDown: (event) => {
      if (!enableGestures) return;

      // Swipe down could exit fullscreen/focus mode
      if (state.mode !== "normal") {
        handleModeChange("normal");
      }
    },
    swipeThreshold: gestureThreshold,
  });

  // Mode management
  const handleModeChange = useCallback(
    (newMode: EditorMode) => {
      setState((prev) => ({ ...prev, mode: newMode }));

      // Apply mode-specific classes to body (only on client)
      if (typeof document !== "undefined") {
        document.body.classList.remove(
          "editor-normal",
          "editor-fullscreen",
          "editor-focus"
        );
        document.body.classList.add(`editor-${newMode}`);
      }

      // Haptic feedback for mode changes
      if (enableHapticFeedback && isMobile) {
        successFeedback();
      }

      // Handle focus mode specific adjustments (only on client)
      if (typeof document !== "undefined") {
        if (newMode === "focus") {
          // Prevent scrolling on body
          document.body.style.overflow = "hidden";

          // Hide address bar on mobile browsers
          if (isMobile && typeof window !== "undefined") {
            setTimeout(() => {
              window.scrollTo(0, 1);
            }, 100);
          }
        } else {
          // Restore scrolling
          document.body.style.overflow = "";
        }
      }

      onModeChange?.(newMode);
    },
    [enableHapticFeedback, isMobile, successFeedback, onModeChange]
  );

  // Keyboard shortcuts for mobile (volume buttons, etc.)
  useEffect(() => {
    if (!isMobile || typeof document === "undefined") return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Handle hardware back button on Android
      if (event.key === "Escape" || event.keyCode === 27) {
        if (state.mode !== "normal") {
          event.preventDefault();
          handleModeChange("normal");
        }
      }

      // Handle volume buttons for mode switching (if available)
      if (event.key === "VolumeUp" || event.key === "VolumeDown") {
        event.preventDefault();
        const modes: EditorMode[] = ["normal", "fullscreen", "focus"];
        const currentIndex = modes.indexOf(state.mode);
        const nextIndex =
          event.key === "VolumeUp"
            ? (currentIndex + 1) % modes.length
            : (currentIndex - 1 + modes.length) % modes.length;
        handleModeChange(modes[nextIndex]);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isMobile, state.mode, handleModeChange]);

  // Viewport orientation change handling
  useEffect(() => {
    if (!isMobile || typeof window === "undefined") return;

    const handleOrientationChange = () => {
      // Update viewport height after orientation change
      setTimeout(() => {
        setState((prev) => ({
          ...prev,
          viewportHeight: window.innerHeight,
        }));

        // Update CSS variable (only on client)
        if (typeof document !== "undefined") {
          document.documentElement.style.setProperty(
            "--mobile-viewport-height",
            `${window.innerHeight}px`
          );
        }
      }, 500); // Wait for orientation change to complete
    };

    window.addEventListener("orientationchange", handleOrientationChange);
    window.addEventListener("resize", handleOrientationChange);

    return () => {
      window.removeEventListener("orientationchange", handleOrientationChange);
      window.removeEventListener("resize", handleOrientationChange);
    };
  }, [isMobile]);

  // Attach gesture listeners to container
  useEffect(() => {
    if (containerRef.current && enableGestures && isMobile) {
      attachToElement(containerRef.current);
    }
  }, [attachToElement, enableGestures, isMobile]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Remove body classes (only on client)
      if (typeof document !== "undefined") {
        document.body.classList.remove(
          "editor-normal",
          "editor-fullscreen",
          "editor-focus",
          "mobile-keyboard-visible"
        );

        // Remove CSS variables
        document.documentElement.style.removeProperty(
          "--mobile-keyboard-height"
        );
        document.documentElement.style.removeProperty(
          "--mobile-viewport-height"
        );

        // Restore body overflow
        document.body.style.overflow = "";
      }
    };
  }, []);

  // Focus management for mobile inputs
  const handleInputFocus = useCallback(
    (element: HTMLElement) => {
      if (!isMobile) return;

      // Add focused class for styling
      element.classList.add("mobile-input-focused");

      // Scroll element into view when keyboard appears
      if (state.isKeyboardVisible) {
        setTimeout(() => {
          scrollIntoView(element, { block: "center" });
        }, 300);
      }
    },
    [isMobile, state.isKeyboardVisible, scrollIntoView]
  );

  const handleInputBlur = useCallback(
    (element: HTMLElement) => {
      if (!isMobile) return;

      // Remove focused class
      element.classList.remove("mobile-input-focused");
    },
    [isMobile]
  );

  // Prevent iOS zoom on input focus
  const preventZoom = useCallback(() => {
    if (!isMobile || typeof document === "undefined") return;

    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      const content = viewport.getAttribute("content");
      if (content && !content.includes("user-scalable=no")) {
        viewport.setAttribute("content", `${content}, user-scalable=no`);

        // Restore after a delay
        setTimeout(() => {
          viewport.setAttribute("content", content);
        }, 1000);
      }
    }
  }, [isMobile]);

  // Pull-to-refresh functionality
  const [pullRefreshState, setPullRefreshState] = useState({
    isPulling: false,
    pullDistance: 0,
    threshold: 80,
  });

  const handlePullRefresh = useCallback(
    (onRefresh?: () => void) => {
      if (!isMobile || !enableGestures || typeof window === "undefined") return;

      let startY = 0;
      let currentY = 0;
      let isPulling = false;

      const handleTouchStart = (e: TouchEvent) => {
        if (window.scrollY === 0) {
          startY = e.touches[0].clientY;
          isPulling = true;
        }
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (!isPulling) return;

        currentY = e.touches[0].clientY;
        const pullDistance = Math.max(0, currentY - startY);

        if (pullDistance > 0) {
          e.preventDefault();
          setPullRefreshState((prev) => ({
            ...prev,
            isPulling: true,
            pullDistance,
          }));
        }
      };

      const handleTouchEnd = () => {
        if (
          isPulling &&
          pullRefreshState.pullDistance > pullRefreshState.threshold
        ) {
          onRefresh?.();
          if (enableHapticFeedback) {
            successFeedback();
          }
        }

        setPullRefreshState({
          isPulling: false,
          pullDistance: 0,
          threshold: 80,
        });

        isPulling = false;
      };

      if (containerRef.current) {
        containerRef.current.addEventListener("touchstart", handleTouchStart, {
          passive: false,
        });
        containerRef.current.addEventListener("touchmove", handleTouchMove, {
          passive: false,
        });
        containerRef.current.addEventListener("touchend", handleTouchEnd);

        return () => {
          if (containerRef.current) {
            containerRef.current.removeEventListener(
              "touchstart",
              handleTouchStart
            );
            containerRef.current.removeEventListener(
              "touchmove",
              handleTouchMove
            );
            containerRef.current.removeEventListener(
              "touchend",
              handleTouchEnd
            );
          }
        };
      }
    },
    [
      isMobile,
      enableGestures,
      enableHapticFeedback,
      pullRefreshState.pullDistance,
      pullRefreshState.threshold,
      successFeedback,
    ]
  );

  return {
    // State
    isMobile,
    state,

    // Mode management
    mode: state.mode,
    setMode: handleModeChange,

    // Keyboard management
    isKeyboardVisible: state.isKeyboardVisible,
    keyboardHeight: state.keyboardHeight,
    viewportHeight: state.viewportHeight,

    // Gesture management
    isGestureActive: state.isGestureActive,
    touchPosition: state.touchPosition,

    // Refs and handlers
    containerRef,
    handleInputFocus,
    handleInputBlur,
    preventZoom,

    // Utilities
    scrollIntoView,
    adjustElementPosition,

    // Pull-to-refresh
    pullRefreshState,
    handlePullRefresh,

    // Haptic feedback
    hapticFeedback: {
      tap: tapFeedback,
      swipe: swipeFeedback,
      success: successFeedback,
    },
  };
}

// Utility hook for mobile-specific editor enhancements
export function useMobileEditorEnhancements() {
  const isMobile = useIsMobile();

  // Prevent double-tap zoom
  useEffect(() => {
    if (!isMobile) return;

    let lastTouchEnd = 0;
    const preventZoom = (e: TouchEvent) => {
      const now = new Date().getTime();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    };

    document.addEventListener("touchend", preventZoom, { passive: false });
    return () => document.removeEventListener("touchend", preventZoom);
  }, [isMobile]);

  // Optimize viewport for mobile
  useEffect(() => {
    if (!isMobile || typeof document === "undefined") return;

    const viewport = document.querySelector('meta[name="viewport"]');
    if (viewport) {
      const originalContent = viewport.getAttribute("content");
      viewport.setAttribute(
        "content",
        "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
      );

      return () => {
        if (originalContent) {
          viewport.setAttribute("content", originalContent);
        }
      };
    }
  }, [isMobile]);

  // Add mobile-specific CSS classes
  useEffect(() => {
    if (typeof document === "undefined") return;

    if (isMobile) {
      document.body.classList.add("mobile-device");
    } else {
      document.body.classList.remove("mobile-device");
    }

    return () => {
      document.body.classList.remove("mobile-device");
    };
  }, [isMobile]);

  return {
    isMobile,
  };
}
