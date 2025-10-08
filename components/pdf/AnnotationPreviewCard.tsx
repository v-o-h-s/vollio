'use client';

/**
 * AnnotationPreviewCard Component
 * 
 * Displays a preview card showing annotation content when hovering over highlights.
 * This component handles:
 * - Content truncation with smart word boundary detection
 * - Viewport boundary detection and automatic repositioning
 * - Radix UI Popover integration for smooth animations
 * - Mobile-responsive sizing and touch-friendly interactions
 * - Click-to-edit functionality for annotation management
 * 
 * Key Features:
 * - Smart text truncation (~100 characters with word boundaries)
 * - Automatic collision detection and repositioning
 * - Smooth enter/exit animations via Radix UI
 * - Touch-friendly button sizing on mobile devices
 * - Accessible markup with proper ARIA attributes
 * 
 * @author Noto Team
 * @version 1.0.0
 */

import React, { useEffect, useRef, useState } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Annotation } from '@/lib/types';

/**
 * Props interface for AnnotationPreviewCard component
 */
interface AnnotationPreviewCardProps {
    /** The annotation data to display in the preview */
    annotation: Annotation;
    /** Screen coordinates where preview card should appear */
    position: { x: number; y: number };
    /** Whether preview card should be visible */
    visible: boolean;
    /** Callback fired when user clicks to edit the annotation */
    onEdit: (annotationId: string) => void;
    /** Callback fired when preview card should be closed */
    onClose: () => void;
}

/**
 * Preview card component that shows annotation content on hover
 * Displays first ~100 characters with click-to-edit functionality
 * Uses Radix UI Popover with smooth animations and viewport boundary handling
 */
const AnnotationPreviewCard: React.FC<AnnotationPreviewCardProps> = ({
    annotation,
    position,
    visible,
    onEdit,
    onClose,
}) => {
    const [adjustedPosition, setAdjustedPosition] = useState(position);
    const contentRef = useRef<HTMLDivElement>(null);
    // Responsive design handled via CSS

    // Truncate note content to ~100 characters with proper word boundary
    const truncateContent = (content: string, maxLength: number = 100): string => {
        if (content.length <= maxLength) {
            return content;
        }

        // Find the last space before the max length to avoid cutting words
        const truncated = content.substring(0, maxLength);
        const lastSpaceIndex = truncated.lastIndexOf(' ');

        if (lastSpaceIndex > maxLength * 0.8) {
            // If we found a space reasonably close to the end, use it
            return truncated.substring(0, lastSpaceIndex) + '...';
        } else {
            // Otherwise, just truncate at max length
            return truncated + '...';
        }
    };

    // Handle viewport boundary detection and automatic repositioning
    useEffect(() => {
        if (!visible || !contentRef.current) {
            return;
        }

        const content = contentRef.current;
        const rect = content.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let adjustedX = position.x;
        let adjustedY = position.y;

        // Check right edge - ensure preview card doesn't go off screen
        if (position.x + rect.width > viewportWidth - 16) {
            adjustedX = viewportWidth - rect.width - 16;
        }

        // Check left edge
        if (adjustedX < 16) {
            adjustedX = 16;
        }

        // Check bottom edge - position above if needed
        if (position.y + rect.height > viewportHeight - 16) {
            adjustedY = position.y - rect.height - 8;
        }

        // Check top edge
        if (adjustedY < 16) {
            adjustedY = 16;
        }

        setAdjustedPosition({ x: adjustedX, y: adjustedY });
    }, [position, visible]);

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
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

    const handleEditClick = () => {
        onEdit(annotation.id);
        onClose();
    };

    if (!visible) {
        return null;
    }

    return (
        <Popover.Root open={visible} onOpenChange={(open) => !open && onClose()}>
            {/* Invisible anchor positioned at the desired location */}
            <Popover.Anchor asChild>
                <div
                    style={{
                        position: 'fixed',
                        left: `${adjustedPosition.x}px`,
                        top: `${adjustedPosition.y}px`,
                        width: '1px',
                        height: '1px',
                        pointerEvents: 'none',
                    }}
                />
            </Popover.Anchor>

            <Popover.Portal>
                <Popover.Content
                    ref={contentRef}
                    className="
                        z-[9999] 
                        max-w-xs 
                        bg-white 
                        border 
                        border-gray-200 
                        rounded-lg 
                        p-3 
                        shadow-lg
                        transition-opacity 
                        duration-200 
                        ease-in-out
                        animate-in 
                        fade-in-0 
                        zoom-in-95
                        data-[state=open]:animate-in 
                        data-[state=closed]:animate-out 
                        data-[state=closed]:fade-out-0 
                        data-[state=closed]:zoom-out-95
                        preview-card-enter
                    "
                    sideOffset={8}
                    collisionPadding={16}
                    avoidCollisions={true}
                    onInteractOutside={onClose}
                >
                    {/* Selected text preview */}
                    <div className="mb-2">
                        <p className="text-xs text-gray-500 font-medium">
                            Selected text:
                        </p>
                        <p className="text-sm text-gray-900 italic">
                            "{truncateContent(annotation.selectedText, 60)}"
                        </p>
                    </div>

                    {/* Note content preview */}
                    <div className="mb-3">
                        <p className="text-xs text-gray-500 font-medium mb-1">
                            Note:
                        </p>
                        <p className="text-sm text-gray-900 leading-relaxed">
                            {truncateContent(annotation.content)}
                        </p>
                    </div>

                    {/* Click-to-edit button with touch-friendly sizing */}
                    <button
                        onClick={handleEditClick}
                        className={`
                            w-full 
                            text-blue-600 
                            hover:text-blue-800 
                            hover:bg-blue-50 
                            rounded 
                            transition-colors 
                            duration-200
                            border 
                            border-transparent 
                            hover:border-blue-200
                            font-medium
                            text-xs py-1.5 px-2
                        `}
                    >
                        Click to edit note
                    </button>

                    {/* Arrow pointing to annotation */}
                    <Popover.Arrow
                        className="fill-white"
                        width={12}
                        height={6}
                    />
                </Popover.Content>
            </Popover.Portal>
        </Popover.Root>
    );
};

export default AnnotationPreviewCard;