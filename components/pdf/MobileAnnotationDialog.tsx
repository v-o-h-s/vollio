'use client';

/**
 * MobileAnnotationDialog Component
 * 
 * Full-screen modal dialog for creating annotations on mobile devices.
 * This component replaces the desktop tooltip with a mobile-optimized
 * interface that provides better touch interaction and readability.
 * 
 * Key Features:
 * - Full-screen modal optimized for mobile viewports
 * - Touch-friendly button sizing (44px minimum height)
 * - Selected text preview with smart truncation
 * - Radix UI Dialog integration for accessibility
 * - Auto-focus on primary action button
 * - Responsive layout that adapts to screen size
 * 
 * Design Considerations:
 * - Follows mobile-first design principles
 * - Uses consistent blue accent color (#3B82F6)
 * - Provides clear visual hierarchy and spacing
 * - Includes proper ARIA labels for screen readers
 * 
 * @author Noto Team
 * @version 1.0.0
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';

/**
 * Props interface for MobileAnnotationDialog component
 */
interface MobileAnnotationDialogProps {
    /** The text that was selected by the user */
    selectedText: string;
    /** Whether the dialog should be visible */
    visible: boolean;
    /** Callback fired when user confirms note creation */
    onCreateNote: () => void;
    /** Callback fired when dialog should be closed */
    onClose: () => void;
}

/**
 * Full-screen modal for mobile "Create note" functionality
 * Uses Radix UI Dialog with touch-friendly sizing and mobile-optimized layout
 */
const MobileAnnotationDialog: React.FC<MobileAnnotationDialogProps> = ({
    selectedText,
    visible,
    onCreateNote,
    onClose,
}) => {
    // Truncate selected text for display
    const truncateText = (text: string, maxLength: number = 100): string => {
        if (text.length <= maxLength) {
            return text;
        }
        const truncated = text.substring(0, maxLength);
        const lastSpaceIndex = truncated.lastIndexOf(' ');

        if (lastSpaceIndex > maxLength * 0.8) {
            return truncated.substring(0, lastSpaceIndex) + '...';
        } else {
            return truncated + '...';
        }
    };

    return (
        <Dialog open={visible} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-md w-full max-w-[95vw] max-h-[90vh] overflow-y-auto">
                <DialogHeader className="text-left">
                    <DialogTitle className="text-lg font-semibold text-gray-900">
                        Create Annotation
                    </DialogTitle>
                    <DialogDescription className="text-sm text-gray-600 mt-2">
                        You've selected text to annotate. Create a note to save your thoughts about this selection.
                    </DialogDescription>
                </DialogHeader>

                {/* Selected text preview */}
                <div className="my-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-xs font-medium text-blue-800 mb-2">
                        Selected text:
                    </p>
                    <p className="text-sm text-blue-900 italic leading-relaxed">
                        "{truncateText(selectedText)}"
                    </p>
                </div>

                <DialogFooter className="flex flex-col sm:flex-row gap-3 mt-6">
                    <Button
                        variant="outline"
                        onClick={onClose}
                        className="
                            w-full sm:w-auto 
                            min-h-[44px] 
                            text-base 
                            font-medium
                            border-gray-300
                            hover:bg-gray-50
                            focus:ring-2
                            focus:ring-gray-500
                            focus:ring-offset-2
                        "
                        aria-label="Cancel annotation creation"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={onCreateNote}
                        className="
                            w-full sm:w-auto 
                            min-h-[44px] 
                            text-base 
                            font-medium
                            text-white
                            transition-all 
                            duration-200
                            hover:shadow-md
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
                        aria-label={`Create annotation note for selected text: ${truncateText(selectedText, 50)}`}
                        autoFocus
                    >
                        Create Note
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default MobileAnnotationDialog;