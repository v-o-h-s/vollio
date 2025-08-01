'use client';

import React from 'react';
import { Annotation } from '@/lib/types';

interface AnnotationPreviewCardProps {
    annotation: Annotation;
    position: { x: number; y: number };
    visible: boolean;
    onEdit: (annotationId: string) => void;
    onClose: () => void;
}

/**
 * Preview card component that shows annotation content on hover
 * Displays first ~100 characters with click-to-edit functionality
 */
const AnnotationPreviewCard: React.FC<AnnotationPreviewCardProps> = ({
    annotation,
    position,
    visible,
    onEdit,
    onClose,
}) => {
    // Component implementation will be added in later tasks
    return (
        <div className="absolute z-50">
            <div className="bg-white border border-gray-200 rounded-lg shadow-lg p-3 max-w-xs">
                <p className="text-sm text-gray-500">Preview Card - Implementation pending</p>
            </div>
        </div>
    );
};

export default AnnotationPreviewCard;