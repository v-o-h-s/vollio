'use client';

/**
 * Test component for the enhanced annotation preview functionality
 * This component helps verify that all the new features work correctly
 */

import React, { useState } from 'react';
import AnnotationPreviewCard from './AnnotationPreviewCard';
import { Annotation, AnnotationStyle } from '@/lib/types';
import { Button } from '@/components/ui/button';

const mockAnnotation: Annotation = {
  id: 'test-annotation-1',
  userId: 'test-user',
  pdfId: 'test-pdf',
  noteId: 'test-note',
  pageNumber: 1,
  selectedText: 'This is a sample selected text that demonstrates the annotation preview functionality with a longer text to test truncation.',
  noteContent: 'This is a sample note content that explains the selected text. It contains detailed information about the annotation and can be quite long to test the preview functionality.',
  coordinates: {
    x: 100,
    y: 200,
    width: 300,
    height: 20,
  },
  style: {
    highlightColor: 'rgba(255, 255, 0, 0.3)',
    borderColor: 'rgba(255, 193, 7, 0.6)',
    opacity: 0.3,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const AnnotationPreviewTest: React.FC = () => {
  const [showPreview, setShowPreview] = useState(false);
  const [position, setPosition] = useState({ x: 300, y: 300 });

  const handleEdit = (annotationId: string) => {
    console.log('Edit annotation:', annotationId);
    alert(`Edit annotation: ${annotationId}`);
  };

  const handleDelete = (annotationId: string) => {
    console.log('Delete annotation:', annotationId);
    alert(`Delete annotation: ${annotationId}`);
    setShowPreview(false);
  };

  const handleStyleUpdate = (annotationId: string, style: AnnotationStyle) => {
    console.log('Style update:', annotationId, style);
    alert(`Style updated for annotation: ${annotationId}`);
  };

  const handleClose = () => {
    setShowPreview(false);
  };

  const handleShowPreview = (event: React.MouseEvent) => {
    const rect = event.currentTarget.getBoundingClientRect();
    setPosition({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
    });
    setShowPreview(true);
  };

  return (
    <div className="p-8 space-y-4">
      <h2 className="text-2xl font-bold mb-4">Annotation Preview Test</h2>
      
      <div className="space-y-4">
        <p className="text-gray-600">
          Click the button below to test the enhanced annotation preview card with editing capabilities.
        </p>
        
        <Button
          onClick={handleShowPreview}
          className="bg-yellow-200 hover:bg-yellow-300 text-gray-800 border border-yellow-400"
        >
          Show Annotation Preview (Hover Simulation)
        </Button>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-semibold mb-2">Test Features:</h3>
          <ul className="list-disc list-inside space-y-1 text-sm text-gray-600">
            <li>Hover preview with annotation content</li>
            <li>Inline note editing with save/cancel</li>
            <li>Color picker for highlight customization</li>
            <li>Delete confirmation dialog</li>
            <li>Edit in full editor navigation</li>
            <li>Viewport boundary detection</li>
            <li>Theme-aware styling (light/dark mode)</li>
          </ul>
        </div>
      </div>

      {/* Annotation Preview Card */}
      <AnnotationPreviewCard
        visible={showPreview}
        annotation={mockAnnotation}
        position={position}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onStyleUpdate={handleStyleUpdate}
        onClose={handleClose}
      />
    </div>
  );
};

export default AnnotationPreviewTest;