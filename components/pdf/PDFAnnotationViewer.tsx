'use client';

import React from 'react';
import { Annotation, TextSelection } from '@/lib/types';

interface PDFAnnotationViewerProps {
    pdfFile: File | null;
    annotations: Annotation[];
    onAnnotationCreate: (selection: TextSelection) => void;
    onAnnotationClick: (annotationId: string) => void;
}

/**
 * Main PDF viewer component with annotation support
 * Uses Syncfusion PDF Viewer for rendering and text selection
 */
const PDFAnnotationViewer: React.FC<PDFAnnotationViewerProps> = ({
    pdfFile,
    annotations,
    onAnnotationCreate,
    onAnnotationClick,
}) => {
    // Component implementation will be added in later tasks
    return (
        <div className="w-full h-full">
            <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
                <p className="text-gray-500">PDF Viewer - Implementation pending</p>
            </div>
        </div>
    );
};

export default PDFAnnotationViewer;