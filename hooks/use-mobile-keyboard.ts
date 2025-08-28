import { useEffect, useState, useCallback } from 'react';

interface MobileKeyboardState {
  isVisible: boolean;
  height: number;
  viewportHeight: number;
}

interface MobileKeyboardOptions {
  onShow?: (height: number) => void;
  onHide?: () => void;
  adjustViewport?: boolean;
  threshold?: number;
}

export function useMobileKeyboard(options: MobileKeyboardOptions = {}) {
  const {
    onShow,
    onHide,
    adjustViewport = true,
    threshold = 0.25, // 25% of screen height
  } = options;

  const [keyboardState, setKeyboardState] = useState<MobileKeyboardState>({
    isVisible: false,
    height: 0,
    viewportHeight: 0,
  });

  const handleViewportChange = useCallback(() => {
    // Skip if we're on the server
    if (typeof window === 'undefined') return;
    
    const currentHeight = window.visualViewport?.height || window.innerHeight;
    const windowHeight = window.innerHeight;
    const heightDifference = windowHeight - currentHeight;
    const isKeyboardVisible = heightDifference > windowHeight * threshold;

    setKeyboardState(prev => {
      // Only update if there's actually a change
      if (prev.isVisible === isKeyboardVisible && 
          prev.height === (isKeyboardVisible ? heightDifference : 0) &&
          prev.viewportHeight === currentHeight) {
        return prev; // No change, return previous state
      }

      const newState = {
        isVisible: isKeyboardVisible,
        height: isKeyboardVisible ? heightDifference : 0,
        viewportHeight: currentHeight,
      };

      // Trigger callbacks if visibility state changed
      if (prev.isVisible !== newState.isVisible) {
        if (newState.isVisible) {
          onShow?.(newState.height);
        } else {
          onHide?.();
        }
      }

      return newState;
    });

    // Adjust viewport if enabled
    if (adjustViewport) {
      if (isKeyboardVisible) {
        document.documentElement.style.setProperty('--keyboard-height', `${heightDifference}px`);
        document.documentElement.style.setProperty('--viewport-height', `${currentHeight}px`);
      } else {
        document.documentElement.style.removeProperty('--keyboard-height');
        document.documentElement.style.removeProperty('--viewport-height');
      }
    }
  }, [onShow, onHide, adjustViewport, threshold]);

  useEffect(() => {
    // Skip if we're on the server
    if (typeof window === 'undefined') return;

    // Initialize viewport height
    setKeyboardState(prev => ({
      ...prev,
      viewportHeight: window.innerHeight,
    }));
    
    // Use Visual Viewport API if available (modern browsers)
    if (window.visualViewport) {
      window.visualViewport.addEventListener('resize', handleViewportChange);
      
      // Initial check with a small delay to avoid SSR issues
      const timeoutId = setTimeout(handleViewportChange, 100);
      
      return () => {
        window.visualViewport?.removeEventListener('resize', handleViewportChange);
        clearTimeout(timeoutId);
        
        // Cleanup styles
        if (adjustViewport) {
          document.documentElement.style.removeProperty('--keyboard-height');
          document.documentElement.style.removeProperty('--viewport-height');
        }
      };
    } else {
      // Fallback for older browsers
      const handleResize = () => {
        setTimeout(handleViewportChange, 100); // Small delay for iOS
      };
      
      window.addEventListener('resize', handleResize);
      
      // Initial check with delay
      const timeoutId = setTimeout(handleViewportChange, 100);
      
      return () => {
        window.removeEventListener('resize', handleResize);
        clearTimeout(timeoutId);
        
        if (adjustViewport) {
          document.documentElement.style.removeProperty('--keyboard-height');
          document.documentElement.style.removeProperty('--viewport-height');
        }
      };
    }
  }, [handleViewportChange, adjustViewport]);

  // Utility functions
  const scrollIntoView = useCallback((element: HTMLElement, options?: ScrollIntoViewOptions) => {
    if (keyboardState.isVisible) {
      // Adjust scroll position to account for keyboard
      const elementRect = element.getBoundingClientRect();
      const availableHeight = keyboardState.viewportHeight;
      const elementBottom = elementRect.bottom;
      
      if (elementBottom > availableHeight - 20) { // 20px padding
        element.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          ...options,
        });
      }
    } else {
      element.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        ...options,
      });
    }
  }, [keyboardState]);

  const adjustElementPosition = useCallback((element: HTMLElement, offset = 20) => {
    if (!keyboardState.isVisible) return;

    const rect = element.getBoundingClientRect();
    const availableHeight = keyboardState.viewportHeight;
    
    if (rect.bottom > availableHeight - offset) {
      const adjustment = rect.bottom - availableHeight + offset;
      element.style.transform = `translateY(-${adjustment}px)`;
    } else {
      element.style.transform = '';
    }
  }, [keyboardState]);

  const resetElementPosition = useCallback((element: HTMLElement) => {
    element.style.transform = '';
  }, []);

  return {
    keyboardState,
    isKeyboardVisible: keyboardState.isVisible,
    keyboardHeight: keyboardState.height,
    viewportHeight: keyboardState.viewportHeight,
    scrollIntoView,
    adjustElementPosition,
    resetElementPosition,
  };
}

// Hook for managing focus and keyboard interactions
export function useMobileFocus() {
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null);
  const { scrollIntoView, isKeyboardVisible } = useMobileKeyboard();

  const handleFocus = useCallback((element: HTMLElement) => {
    setFocusedElement(element);
    
    // Scroll focused element into view when keyboard appears
    if (isKeyboardVisible) {
      setTimeout(() => {
        scrollIntoView(element);
      }, 300); // Wait for keyboard animation
    }
  }, [isKeyboardVisible, scrollIntoView]);

  const handleBlur = useCallback(() => {
    setFocusedElement(null);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;

    const handleFocusIn = (event: FocusEvent) => {
      const target = event.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true')) {
        handleFocus(target);
      }
    };

    const handleFocusOut = () => {
      handleBlur();
    };

    document.addEventListener('focusin', handleFocusIn);
    document.addEventListener('focusout', handleFocusOut);

    return () => {
      document.removeEventListener('focusin', handleFocusIn);
      document.removeEventListener('focusout', handleFocusOut);
    };
  }, [handleFocus, handleBlur]);

  return {
    focusedElement,
    handleFocus,
    handleBlur,
  };
}

// Utility function to prevent zoom on iOS
export function preventIOSZoom() {
  if (typeof document === 'undefined') return () => {};

  // Add viewport meta tag to prevent zoom
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    viewport.setAttribute('content', 
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no'
    );
  }

  // Prevent double-tap zoom
  let lastTouchEnd = 0;
  document.addEventListener('touchend', (event) => {
    const now = new Date().getTime();
    if (now - lastTouchEnd <= 300) {
      event.preventDefault();
    }
    lastTouchEnd = now;
  }, false);

  // Set minimum font size to prevent zoom
  const style = document.createElement('style');
  style.textContent = `
    input, textarea, select {
      font-size: 16px !important;
    }
  `;
  document.head.appendChild(style);

  return () => {
    // Cleanup function
    if (viewport) {
      viewport.setAttribute('content', 
        'width=device-width, initial-scale=1.0'
      );
    }
    document.head.removeChild(style);
  };
}