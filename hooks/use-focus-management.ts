'use client';

import { useEffect, useCallback, useRef, useState } from 'react';

export interface FocusableElement {
  element: HTMLElement;
  tabIndex: number;
  role?: string;
  ariaLabel?: string;
}

export interface UseFocusManagementOptions {
  trapFocus?: boolean;
  restoreFocus?: boolean;
  initialFocus?: string | HTMLElement;
  onFocusChange?: (element: HTMLElement | null) => void;
}

/**
 * Enhanced focus management hook for accessibility
 * Provides focus trapping, restoration, and keyboard navigation
 */
export function useFocusManagement({
  trapFocus = false,
  restoreFocus = true,
  initialFocus,
  onFocusChange,
}: UseFocusManagementOptions = {}) {
  const [focusedElement, setFocusedElement] = useState<HTMLElement | null>(null);
  const [focusableElements, setFocusableElements] = useState<FocusableElement[]>([]);
  const previousFocusRef = useRef<HTMLElement | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);

  // Selector for focusable elements
  const focusableSelector = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
    '[role="button"]:not([aria-disabled="true"])',
    '[role="link"]:not([aria-disabled="true"])',
    '[role="menuitem"]:not([aria-disabled="true"])',
    '[role="tab"]:not([aria-disabled="true"])',
  ].join(', ');

  // Get all focusable elements within container
  const getFocusableElements = useCallback((): FocusableElement[] => {
    if (!containerRef.current) return [];

    const elements = Array.from(
      containerRef.current.querySelectorAll(focusableSelector)
    ) as HTMLElement[];

    return elements
      .filter(element => {
        // Check if element is visible and not hidden
        const style = window.getComputedStyle(element);
        return (
          style.display !== 'none' &&
          style.visibility !== 'hidden' &&
          element.offsetParent !== null
        );
      })
      .map(element => ({
        element,
        tabIndex: element.tabIndex,
        role: element.getAttribute('role') || undefined,
        ariaLabel: element.getAttribute('aria-label') || undefined,
      }));
  }, [focusableSelector]);

  // Update focusable elements list
  const updateFocusableElements = useCallback(() => {
    const elements = getFocusableElements();
    setFocusableElements(elements);
  }, [getFocusableElements]);

  // Handle focus events
  const handleFocus = useCallback((event: FocusEvent) => {
    const target = event.target as HTMLElement;
    setFocusedElement(target);
    onFocusChange?.(target);
  }, [onFocusChange]);

  const handleBlur = useCallback((event: FocusEvent) => {
    // Only clear focused element if focus is leaving the container
    const relatedTarget = event.relatedTarget as HTMLElement;
    if (!containerRef.current?.contains(relatedTarget)) {
      setFocusedElement(null);
      onFocusChange?.(null);
    }
  }, [onFocusChange]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!trapFocus || focusableElements.length === 0) return;

    const currentIndex = focusableElements.findIndex(
      item => item.element === focusedElement
    );

    switch (event.key) {
      case 'Tab':
        event.preventDefault();
        const nextIndex = event.shiftKey
          ? currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1
          : currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1;
        
        focusableElements[nextIndex]?.element.focus();
        break;

      case 'ArrowDown':
      case 'ArrowRight':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          const nextIdx = currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1;
          focusableElements[nextIdx]?.element.focus();
        }
        break;

      case 'ArrowUp':
      case 'ArrowLeft':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          const prevIdx = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
          focusableElements[prevIdx]?.element.focus();
        }
        break;

      case 'Home':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          focusableElements[0]?.element.focus();
        }
        break;

      case 'End':
        if (event.ctrlKey || event.metaKey) {
          event.preventDefault();
          focusableElements[focusableElements.length - 1]?.element.focus();
        }
        break;

      case 'Escape':
        if (trapFocus && restoreFocus && previousFocusRef.current) {
          previousFocusRef.current.focus();
        }
        break;
    }
  }, [trapFocus, focusableElements, focusedElement, restoreFocus]);

  // Set up event listeners
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Store previous focus when focus trap is enabled
    if (trapFocus && restoreFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }

    // Update focusable elements
    updateFocusableElements();

    // Set initial focus
    if (initialFocus) {
      const target = typeof initialFocus === 'string'
        ? container.querySelector(initialFocus) as HTMLElement
        : initialFocus;
      
      if (target) {
        // Use setTimeout to ensure element is rendered
        setTimeout(() => target.focus(), 0);
      }
    } else if (trapFocus && focusableElements.length > 0) {
      // Focus first focusable element
      setTimeout(() => focusableElements[0]?.element.focus(), 0);
    }

    // Add event listeners
    container.addEventListener('focusin', handleFocus);
    container.addEventListener('focusout', handleBlur);
    
    if (trapFocus) {
      document.addEventListener('keydown', handleKeyDown);
    }

    // Observer for dynamic content changes
    const observer = new MutationObserver(updateFocusableElements);
    observer.observe(container, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['tabindex', 'disabled', 'aria-disabled'],
    });

    return () => {
      container.removeEventListener('focusin', handleFocus);
      container.removeEventListener('focusout', handleBlur);
      
      if (trapFocus) {
        document.removeEventListener('keydown', handleKeyDown);
      }
      
      observer.disconnect();

      // Restore focus when unmounting
      if (trapFocus && restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [
    trapFocus,
    restoreFocus,
    initialFocus,
    handleFocus,
    handleBlur,
    handleKeyDown,
    updateFocusableElements,
    focusableElements,
  ]);

  // Public API methods
  const focusFirst = useCallback(() => {
    const first = focusableElements[0];
    if (first) {
      first.element.focus();
      return true;
    }
    return false;
  }, [focusableElements]);

  const focusLast = useCallback(() => {
    const last = focusableElements[focusableElements.length - 1];
    if (last) {
      last.element.focus();
      return true;
    }
    return false;
  }, [focusableElements]);

  const focusNext = useCallback(() => {
    const currentIndex = focusableElements.findIndex(
      item => item.element === focusedElement
    );
    const nextIndex = currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1;
    const next = focusableElements[nextIndex];
    
    if (next) {
      next.element.focus();
      return true;
    }
    return false;
  }, [focusableElements, focusedElement]);

  const focusPrevious = useCallback(() => {
    const currentIndex = focusableElements.findIndex(
      item => item.element === focusedElement
    );
    const prevIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
    const previous = focusableElements[prevIndex];
    
    if (previous) {
      previous.element.focus();
      return true;
    }
    return false;
  }, [focusableElements, focusedElement]);

  const focusElement = useCallback((selector: string | HTMLElement) => {
    const target = typeof selector === 'string'
      ? containerRef.current?.querySelector(selector) as HTMLElement
      : selector;
    
    if (target && containerRef.current?.contains(target)) {
      target.focus();
      return true;
    }
    return false;
  }, []);

  const restorePreviousFocus = useCallback(() => {
    if (previousFocusRef.current) {
      previousFocusRef.current.focus();
      return true;
    }
    return false;
  }, []);

  return {
    containerRef,
    focusedElement,
    focusableElements,
    focusFirst,
    focusLast,
    focusNext,
    focusPrevious,
    focusElement,
    restorePreviousFocus,
    updateFocusableElements,
  };
}

/**
 * Hook for managing focus within editor modes
 */
export function useEditorFocusManagement(mode: 'normal' | 'fullscreen' | 'focus') {
  const focusManagement = useFocusManagement({
    trapFocus: mode === 'focus',
    restoreFocus: mode === 'focus',
    onFocusChange: (element) => {
      // Announce focus changes for screen readers in focus mode
      if (mode === 'focus' && element) {
        const label = element.getAttribute('aria-label') || 
                     element.getAttribute('title') || 
                     element.textContent?.trim() || 
                     element.tagName.toLowerCase();
        
        if (label) {
          announceToScreenReader(`Focused: ${label}`);
        }
      }
    },
  });

  // Announce mode changes
  useEffect(() => {
    const modeNames = {
      normal: 'Normal editing mode',
      fullscreen: 'Fullscreen editing mode',
      focus: 'Focus mode - distraction-free editing',
    };
    
    announceToScreenReader(modeNames[mode]);
  }, [mode]);

  return focusManagement;
}

/**
 * Utility function to announce messages to screen readers
 */
function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    if (document.body.contains(announcement)) {
      document.body.removeChild(announcement);
    }
  }, 1000);
}