import { useState, useEffect } from 'react';

interface MobileDetection {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasTouch: boolean;
  orientation: 'portrait' | 'landscape';
  screenSize: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
}

/**
 * Hook for detecting mobile devices and screen characteristics
 * Provides responsive design utilities and device-specific information
 */
export function useMobile(): MobileDetection {
  const [detection, setDetection] = useState<MobileDetection>(() => {
    // Server-side safe defaults
    if (typeof window === 'undefined') {
      return {
        isMobile: false,
        isTablet: false,
        isDesktop: true,
        hasTouch: false,
        orientation: 'landscape',
        screenSize: 'lg',
      };
    }

    return getDeviceDetection();
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateDetection = () => {
      setDetection(getDeviceDetection());
    };

    // Listen for orientation and resize changes
    window.addEventListener('resize', updateDetection);
    window.addEventListener('orientationchange', updateDetection);

    // Initial detection
    updateDetection();

    return () => {
      window.removeEventListener('resize', updateDetection);
      window.removeEventListener('orientationchange', updateDetection);
    };
  }, []);

  return detection;
}

function getDeviceDetection(): MobileDetection {
  const width = window.innerWidth;
  const height = window.innerHeight;
  
  // Screen size breakpoints (matching Tailwind CSS)
  const screenSize: MobileDetection['screenSize'] = 
    width < 640 ? 'sm' :
    width < 768 ? 'md' :
    width < 1024 ? 'lg' :
    width < 1280 ? 'xl' : '2xl';

  // Device type detection
  const isMobile = width < 768; // md breakpoint
  const isTablet = width >= 768 && width < 1024; // md to lg
  const isDesktop = width >= 1024; // lg and above

  // Touch capability detection
  const hasTouch = 'ontouchstart' in window || 
    navigator.maxTouchPoints > 0 || 
    (navigator as any).msMaxTouchPoints > 0;

  // Orientation detection
  const orientation: MobileDetection['orientation'] = 
    height > width ? 'portrait' : 'landscape';

  return {
    isMobile,
    isTablet,
    isDesktop,
    hasTouch,
    orientation,
    screenSize,
  };
}

/**
 * Hook for detecting if the current device is mobile
 * Simplified version of useMobile for basic mobile detection
 */
export function useIsMobile(): boolean {
  const { isMobile } = useMobile();
  return isMobile;
}

/**
 * Hook for detecting touch capability
 * Useful for enabling touch-specific features
 */
export function useHasTouch(): boolean {
  const { hasTouch } = useMobile();
  return hasTouch;
}