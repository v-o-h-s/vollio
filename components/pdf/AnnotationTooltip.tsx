'use client';

import React from 'react';

interface AnnotationTooltipProps {
    position: { x: number; y: number };
    visible: boolean;
    onCreateNote: () => void;
    onClose: () => void;
}

/**
 * Tooltip component that appears on text hover with "Create note" button
 * Uses blue accent styling and smooth animations
 */
const AnnotationTooltip: React.FC<AnnotationTooltipProps> = ({
    position,
    visible,
    onCreateNote,
    onClose,
}) => {
    // Component implementation will be added in later tasks
    return (
        <div className="absolute z-50">
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-2">
                <p className="text-sm text-gray-500">Tooltip - Implementation pending</p>
            </div>
        </div>
    );
};

export default AnnotationTooltip;