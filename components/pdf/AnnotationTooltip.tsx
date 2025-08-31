"use client";

/**
 * AnnotationTooltip Component
 *
 * Displays a floating tooltip with shadcn-style list item for creating notes when text is selected.
 * This component handles:
 * - Viewport edge detection and automatic repositioning
 * - Smooth fade-in/fade-out animations with delays
 * - Click-outside-to-close functionality
 * - Mobile device detection (hides on mobile in favor of dialog)
 * - Accessibility features and keyboard navigation
 *
 * Key Features:
 * - Smart positioning to stay within viewport bounds
 * - 200ms delay on hide for better UX
 * - shadcn dropdown menu styling with theme-aware colors
 * - Responsive design that adapts to mobile/desktop
 * - ARIA labels and semantic HTML for accessibility
 * - Plus icon with "Create note" text in list format
 *
 * @author Noto Team
 * @version 2.0.0
 */

import React, { useEffect, useRef, useState } from "react";
import { PlusIcon } from "lucide-react";

/**
 * Props interface for AnnotationTooltip component
 */
interface AnnotationTooltipProps {
  /** Screen coordinates where tooltip should appear */
  position: { x: number; y: number };
  /** Whether tooltip should be visible */
  visible: boolean;
  /** Callback fired when user clicks "Create note" button */
  onCreateNote: () => void;
  /** Callback fired when tooltip should be closed */
  onClose: () => void;
}

/**
 * Tooltip component that appears on text hover with shadcn-style list item for creating notes
 * Uses theme-aware popover styling and smooth animations with viewport edge detection
 */
const AnnotationTooltip: React.FC<AnnotationTooltipProps> = ({
  position,
  visible,
  onCreateNote,
  onClose,
}) => {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);
  const [isDelayedVisible, setIsDelayedVisible] = useState(false);

  //   // Debug logging
  //   console.log("AnnotationTooltip render:", {
  //     visible,
  //     position,
  //     adjustedPosition,
  //     isDelayedVisible,
  //   });

  // Tooltip is always shown for desktop/laptop/tablet usage

  // Handle viewport edge detection and positioning
  useEffect(() => {
    if (!visible) {
      return;
    }

    // Set initial position immediately when visible becomes true
    setAdjustedPosition(position);

    // Then adjust for viewport bounds after a brief delay to ensure DOM is ready
    const adjustPosition = () => {
      if (!tooltipRef.current) {
        // If ref is not ready, try again after a short delay
        // just for the record this function run will run forever unless the the DOM is ready
        setTimeout(adjustPosition, 10);
        return;
      }

      const tooltip = tooltipRef.current;
      const rect = tooltip.getBoundingClientRect();
      console.log("the tooltip coordinates :", rect);
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let adjustedX = position.x;
      let adjustedY = position.y;

      // Check right edge - ensure tooltip doesn't go off screen
      if (position.x + rect.width > viewportWidth - 16) {
        adjustedX = viewportWidth - rect.width - 16;
      }

      // Check left edge
      if (adjustedX < 16) {
        adjustedX = 16;
      }

      // Check bottom edge - position above selection if needed
      if (position.y + rect.height > viewportHeight - 16) {
        adjustedY = position.y - rect.height - 8;
      }

      // Check top edge
      if (adjustedY < 16) {
        adjustedY = 16;
      }

      console.log("Position adjustment:", {
        original: position,
        adjusted: { x: adjustedX, y: adjustedY },
        viewportWidth,
        viewportHeight,
        tooltipRect: { width: rect.width, height: rect.height },
      });
      setAdjustedPosition({ x: adjustedX, y: adjustedY });
    };

    // Start position adjustment after a brief delay
    setTimeout(adjustPosition, 0);
  }, [position, visible]);

  // Handle fade-in/fade-out with 200ms delay on hide
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    if (visible) {
      // Immediate show
      setIsDelayedVisible(true);
    } else {
      // Delayed hide (200ms as per requirements)
      timeoutId = setTimeout(() => {
        setIsDelayedVisible(false);
      }, 200);
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [visible]);

  // Handle click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        tooltipRef.current &&
        !tooltipRef.current.contains(event.target as Node)
      ) {
        onClose();
      }
    };

    if (visible) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [visible, onClose]);

  // Don't render if not visible after delay
  if (!isDelayedVisible) {
    return null;
  }

  return (
    <div
      ref={tooltipRef}
      className={`
                fixed z-50 
                transition-opacity duration-200 ease-in-out
                annotation-tooltip
                ${visible ? "opacity-100 tooltip-enter" : "opacity-0"}
            `}
      style={{
        left: `${adjustedPosition.x}px`,
        top: `${adjustedPosition.y}px`,
      }}
    >
      {/* shadcn-style dropdown menu container */}
      <div
        className="
                    bg-popover text-popover-foreground
                    border border-border 
                    rounded-md 
                    p-1
                    min-w-[8rem]
                    shadow-md
                    relative
                "
      >
        {/* shadcn-style menu item */}
        <div
          onClick={onCreateNote}
          className="
                        relative flex cursor-default items-center gap-2 
                        rounded-sm px-2 py-1.5 text-sm 
                        outline-hidden select-none
                        hover:bg-accent hover:text-accent-foreground
                        focus:bg-accent focus:text-accent-foreground
                        transition-colors duration-150
                        [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg]:size-4
                    "
          role="menuitem"
          tabIndex={0}
          aria-label="Create annotation note from selected text"
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onCreateNote();
            }
          }}
        >
          <PlusIcon className="text-muted-foreground" />
          <span className="font-medium">Create note</span>
        </div>

       
      </div>
    </div>
  );
};

export default AnnotationTooltip;
