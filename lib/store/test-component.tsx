'use client';

import { useAppSelector, useAppDispatch } from './hooks';
import { setPdfDocument } from './annotationSlice';
import { PDFDocument } from '../types';

// Simple test component to verify Redux store is working
export function ReduxStoreTest() {
    const currentPdf = useAppSelector((state) => state.annotations.currentPdf);
    const dispatch = useAppDispatch();

    const testPdf: PDFDocument = {
        id: 'test-pdf-1',
        userId: 'test-user',
        filename: 'test.pdf',
        uploadedAt: new Date(),
        fileUrl: 'blob:test-url'
    };

    const handleSetPdf = () => {
        dispatch(setPdfDocument(testPdf));
    };

    return (
        <div className="p-4 border rounded">
            <h3>Redux Store Test</h3>
            <p>Current PDF: {currentPdf ? currentPdf.filename : 'None'}</p>
            <button
                onClick={handleSetPdf}
                className="px-4 py-2 bg-blue-500 text-white rounded"
            >
                Set Test PDF
            </button>
        </div>
    );
}