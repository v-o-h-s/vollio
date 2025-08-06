'use client';

import { useAppSelector, useAppDispatch } from './hooks';
import { setPdfDocument, loadAnnotations } from './annotationSlice';
import { PDFDocument, Annotation } from '../types';

// Test component to verify annotation overlay system
export function AnnotationOverlayTest() {
    const currentPdf = useAppSelector((state) => state.annotations.currentPdf);
    const annotations = useAppSelector((state) => state.annotations.annotations);
    const dispatch = useAppDispatch();

    const testPdf: PDFDocument = {
        id: 'test-pdf-1',
        userId: 'test-user',
        filename: 'test-document.pdf',
        uploadedAt: new Date(),
        fileUrl: 'blob:test-url'
    };

    const mockAnnotations: Annotation[] = [
        {
            id: 'annotation-1',
            userId: 'test-user',
            pdfId: 'test-pdf-1',
            pageNumber: 1,
            selectedText: 'This is a test annotation',
            noteContent: 'This is a test note with some content to verify the annotation system works correctly.',
            coordinates: {
                x: 100,
                y: 200,
                width: 200,
                height: 20
            },
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 'annotation-2',
            userId: 'test-user',
            pdfId: 'test-pdf-1',
            pageNumber: 1,
            selectedText: 'Another test annotation',
            noteContent: 'This is another test note to verify multiple annotations work.',
            coordinates: {
                x: 150,
                y: 300,
                width: 180,
                height: 18
            },
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 'annotation-3',
            userId: 'test-user',
            pdfId: 'test-pdf-1',
            pageNumber: 2,
            selectedText: 'Page 2 annotation',
            noteContent: 'This annotation is on page 2 to test multi-page support.',
            coordinates: {
                x: 120,
                y: 150,
                width: 160,
                height: 22
            },
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ];

    const handleSetPdf = () => {
        dispatch(setPdfDocument(testPdf));
    };

    const handleLoadAnnotations = () => {
        dispatch(loadAnnotations(mockAnnotations));
    };

    const handleClearAll = () => {
        dispatch(setPdfDocument(testPdf)); // This clears annotations
    };

    return (
        <div className="p-4 border rounded-lg bg-gray-50">
            <h3 className="text-lg font-semibold mb-4">Annotation Overlay Test</h3>

            <div className="space-y-2 mb-4">
                <p><strong>Current PDF:</strong> {currentPdf ? currentPdf.filename : 'None'}</p>
                <p><strong>Annotations Count:</strong> {Object.keys(annotations).length}</p>
            </div>

            <div className="space-x-2">
                <button
                    onClick={handleSetPdf}
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                >
                    Set Test PDF
                </button>

                <button
                    onClick={handleLoadAnnotations}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
                >
                    Load Mock Annotations
                </button>

                <button
                    onClick={handleClearAll}
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                >
                    Clear All
                </button>
            </div>

            {Object.keys(annotations).length > 0 && (
                <div className="mt-4">
                    <h4 className="font-medium mb-2">Current Annotations:</h4>
                    <div className="space-y-1 text-sm">
                        {Object.values(annotations).map(annotation => (
                            <div key={annotation.id} className="bg-white p-2 rounded border">
                                <p><strong>Page {annotation.pageNumber}:</strong> {annotation.selectedText}</p>
                                <p className="text-gray-600">Position: ({annotation.coordinates.x}, {annotation.coordinates.y})</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}