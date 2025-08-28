import { useState, useEffect } from "react";

interface UseMobileReturn {
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  hasTouch: boolean;
  orientation: "portrait" | "landscape";
  screenSize: "sm" | "md" | "lg" | "xl" | "2xl";
}

export function useMobile(): UseMobileReturn {
  const [state, setState] = useState<UseMobileReturn>({
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    hasTouch: false,
    orientation: "landscape",
    screenSize: "lg",
  });

  useEffect(() => {
    const checkDevice = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;
      
      // Screen size breakpoints (Tailwind CSS)
      let screenSize: "sm" | "md" | "lg" | "xl" | "2xl";
      if (width < 640) screenSize = "sm";
      else if (width < 768) screenSize = "md";
      else if (width < 1024) screenSize = "lg";
      else if (width < 1280) screenSize = "xl";
      else screenSize = "2xl";

      // Device type detection
      const isMobile = width < 768; // < md breakpoint
      const isTablet = width >= 768 && width < 1024; // md to lg breakpoint
      const isDesktop = width >= 1024; // >= lg breakpoint

      // Orientation
      const orientation = height > width ? "portrait" : "landscape";

      setState({
        isMobile,
        isTablet,
        isDesktop,
        hasTouch,
        orientation,
        screenSize,
      });
    };

    // Initial check
    checkDevice();

    // Listen for resize events
    window.addEventListener("resize", checkDevice);
    window.addEventListener("orientationchange", checkDevice);

    return () => {
      window.removeEventListener("resize", checkDevice);
      window.removeEventListener("orientationchange", checkDevice);
    };
  }, []);

  return state;
}