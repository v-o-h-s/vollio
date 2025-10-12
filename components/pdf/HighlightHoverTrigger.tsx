import React, { useState, useCallback, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { MoreHorizontal } from "lucide-react";

export interface HighlightHoverTriggerProps {
  /** Whether the trigger is visible */
  isVisible: boolean;
  /** Position of the trigger button */
  position: { x: number; y: number } | null;
  /** Callback when trigger is clicked */
  onTriggerClick: () => void;
  /** Callback when hover ends */
  onHoverEnd?: () => void;
  /** Delay before showing trigger (ms) */
  showDelay?: number;
  /** Delay before hiding trigger (ms) */
  hideDelay?: number;
}

const HighlightHoverTrigger: React.FC<HighlightHoverTriggerProps> = ({
  isVisible,
  position,
  onTriggerClick,
  onHoverEnd,
  showDelay = 300,
  hideDelay = 200,
}) => {
  const [isDelayedVisible, setIsDelayedVisible] = useState(false);
  const showTimeoutRef = useRef<NodeJS.Timeout>();
  const hideTimeoutRef = useRef<NodeJS.Timeout>();

  // Handle visibility with delays
  useEffect(() => {
    // Clear any existing timeouts
    if (showTimeoutRef.current) {
      clearTimeout(showTimeoutRef.current);
    }
    if (hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
    }

    if (isVisible) {
      // Show with delay
      showTimeoutRef.current = setTimeout(() => {
        setIsDelayedVisible(true);
      }, showDelay);
    } else {
      // Hide with delay
      hideTimeoutRef.current = setTimeout(() => {
        setIsDelayedVisible(false);
      }, hideDelay);
    }

    return () => {
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
      }
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
    };
  }, [isVisible, showDelay, hideDelay]);

  // Handle mouse leave from trigger
  const handleMouseLeave = useCallback(() => {
    onHoverEnd?.();
  }, [onHoverEnd]);

  // Handle trigger click
  const handleClick = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      onTriggerClick();
    },
    [onTriggerClick]
  );

  // Don't render if not visible or no position
  if (!isDelayedVisible || !position) {
    return null;
  }

  // Render using portal to ensure proper z-index
  return createPortal(
    <div
      className="fixed z-[9998] pointer-events-none"
      style={{
        left: position.x,
        top: position.y,
        transform: "translate(-50%, -50%)", // Center the button
      }}
    >
      <button
        className="pointer-events-auto h-6 w-6 bg-white/90 hover:bg-white border border-gray-200 shadow-md backdrop-blur-sm rounded-full flex items-center justify-center transition-all duration-200 hover:scale-110"
        onClick={handleClick}
        onMouseLeave={handleMouseLeave}
        title="Highlight options"
      >
        <MoreHorizontal className="h-3 w-3 text-gray-600" />
      </button>
    </div>,
    document.body
  );
};

export default HighlightHoverTrigger;