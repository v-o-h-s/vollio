'use client';

import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';

interface AnnotationTooltipProps {
    position: { x: number; y: number };
    visible: boolean;
    onCreateNote: () => void;
    onClose: () => void;
}

/**
 * Tooltip component that appears on text hover with "Create note" button
 * Uses blue accent styling (#3B82F6) and smooth animations with viewport edge detection
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
    const isMobile = useIsMobile();

    // Don't show tooltip on mobile devices - use mobile dialog instead
    if (isMobile) {
        return null;
    }

    // Handle viewport edge detection and positioning
    useEffect(() => {
        if (!visible || !tooltipRef.current) {
            return;
        }

        const tooltip = tooltipRef.current;
        const rect = tooltip.getBoundingClientRect();
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

        setAdjustedPosition({ x: adjustedX, y: adjustedY });
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
            if (tooltipRef.current && !tooltipRef.current.contains(event.target as Node)) {
                onClose();
            }
        };

        if (visible) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
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
                ${visible ? 'opacity-100 tooltip-enter' : 'opacity-0'}
            `}
            style={{
                left: `${adjustedPosition.x}px`,
                top: `${adjustedPosition.y}px`,
            }}
        >
            <div
                className="
                    bg-white dark:bg-popover 
                    border border-border 
                    rounded-lg 
                    p-2
                    min-w-max
                    relative
                "
                style={{
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
                }}
            >
                <Button
                    size="sm"
                    onClick={onCreateNote}
                    className="
                        text-white 
                        font-medium 
                        text-xs
                        px-3 
                        py-1.5
                        transition-all 
                        duration-200
                        hover:shadow-md
                        border-0
                        focus:ring-2
                        focus:ring-blue-500
                        focus:ring-offset-2
                    "
                    style={{
                        backgroundColor: '#3B82F6',
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#2563EB';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = '#3B82F6';
                    }}
                    aria-label="Create annotation note from selected text"
                    role="button"
                    tabIndex={0}
                >
                    Create note
                </Button>

                {/* Arrow pointing to the selected text */}
                <div
                    className="absolute w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent"
                    style={{
                        borderTopColor: '#ffffff',
                        bottom: '-4px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                    }}
                />
                <div
                    className="absolute w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent"
                    style={{
                        borderTopColor: 'var(--border)',
                        bottom: '-5px',
                        left: '50%',
                        transform: 'translateX(-50%)',
                    }}
                />
            </div>
        </div>
    );
};

export default AnnotationTooltip;