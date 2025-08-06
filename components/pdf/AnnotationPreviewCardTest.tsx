'use client';

import React, { useState } from 'react';
import AnnotationPreviewCard from './AnnotationPreviewCard';
import { Annotation } from '@/lib/types';

/**
 * Test component for AnnotationPreviewCard
 * This can be used to verify the preview card functionality
 */
export default function AnnotationPreviewCardTest() {
    const [showPreview, setShowPreview] = useState(false);
    const [position, setPosition] = useState({ x: 300, y: 200 });

    const mockAnnotation: Annotation = {
        id: 'test-annotation-1',
        userId: 'test-user',
        pdfId: 'test-pdf',
        pageNumber: 1,
        selectedText: 'This is a sample selected text that demonstrates the preview card functionality',
        noteContent: 'This is a longer note content that should be truncated to approximately 100 characters to test the truncation functionality. This text is intentionally long to verify that the truncation works correctly and shows the ellipsis at the end.',
        coordinates: { x: 100, y: 150, width: 200, height: 20 },
        createdAt: new Date(),
        updatedAt: new Date()
    };

    const handleMouseMove = (event: React.MouseEvent) => {
        setPosition({ x: event.clientX, y: event.clientY });
    };

    return (
        <div className="p-8 bg-gray-50 min-h-screen">
            <div className="max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">AnnotationPreviewCard Test</h2>

                <div className="bg-white p-6 rounded-lg shadow-sm border mb-6">
                    <h3 className="text-lg font-semibold mb-4">Test Controls</h3>
                    <div className="space-y-4">
                        <button
                            onClick={() => setShowPreview(!showPreview)}
                            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                            {showPreview ? 'Hide Preview Card' : 'Show Preview Card'}
                        </button>

                        <div className="text-sm text-gray-600">
                            <p><strong>Position:</strong> x: {position.x}, y: {position.y}</p>
                            <p><strong>Preview Visible:</strong> {showPreview ? 'Yes' : 'No'}</p>
                        </div>
                    </div>
                </div>

                <div
                    className="bg-white p-8 rounded-lg shadow-sm border min-h-96 relative cursor-crosshair"
                    onMouseMove={handleMouseMove}
                >
                    <h3 className="text-lg font-semibold mb-4">Test Area</h3>
                    <p className="text-gray-600 mb-4">
                        Move your mouse around this area to position the preview card.
                        Click the button above to show/hide the preview card.
                    </p>

                    <div className="bg-blue-50 p-4 rounded border-l-4 border-blue-400">
                        <p className="text-sm">
                            <strong>Mock Annotation Data:</strong>
                        </p>
                        <p className="text-xs text-gray-600 mt-2">
                            Selected Text: "{mockAnnotation.selectedText}"
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                            Note Content: "{mockAnnotation.noteContent.substring(0, 100)}..."
                        </p>
                    </div>

                    {/* Preview Card */}
                    {showPreview && (
                        <AnnotationPreviewCard
                            annotation={mockAnnotation}
                            position={position}
                            visible={showPreview}
                            onEdit={(annotationId) => {
                                console.log('Edit clicked for annotation:', annotationId);
                                alert(`Edit clicked for annotation: ${annotationId}`);
                            }}
                            onClose={() => {
                                console.log('Preview card closed');
                                setShowPreview(false);
                            }}
                        />
                    )}
                </div>

                <div className="bg-yellow-50 p-4 rounded border-l-4 border-yellow-400 mt-6">
                    <h4 className="font-semibold text-yellow-800 mb-2">Test Checklist:</h4>
                    <ul className="text-sm text-yellow-700 space-y-1">
                        <li>✓ Preview card shows selected text (truncated to ~60 chars)</li>
                        <li>✓ Preview card shows note content (truncated to ~100 chars)</li>
                        <li>✓ Click-to-edit button is functional</li>
                        <li>✓ Smooth fade-in animations (200ms duration)</li>
                        <li>✓ Viewport boundary handling (move mouse to edges)</li>
                        <li>✓ Click outside to close functionality</li>
                        <li>✓ Radix UI Popover integration</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}