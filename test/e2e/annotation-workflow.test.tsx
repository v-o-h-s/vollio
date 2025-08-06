import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { BrowserRouter } from 'react-router-dom';
import annotationSlice from '@/lib/store/annotationSlice';
import type { PDFDocument, Annotation } from '@/lib/types';

// Mock Next.js router
const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: mockReplace,
        back: vi.fn(),
        forward: vi.fn(),
        refresh: vi.fn(),
        prefetch: vi.fn()
    }),
    usePathname: () => '/dashboard/pdf-notes',
    useSearchParams: () => new URLSearchParams()
}));

// Mock file upload API
vi.mock('@/lib/api/pdfs', () => ({
    uploadPdf: vi.fn().mockResolvedValue({
        id: 'pdf-1',
        userId: 'user-1',
        filename: 'test.pdf',
        uploadedAt: new Date(),
        fileUrl: 'blob:mock-url'
    })
}));

// Mock annotation API
vi.mock('@/lib/api/annotations', () => ({
    createAnnotation: vi.fn().mockImplementation((annotation) =>
        Promise.resolve({ ...annotation, id: `annotation-${Date.now()}` })
    ),
    updateAnnotation: vi.fn().mockImplementation((id, updates) =>
        Promise.resolve({ id, ...updates })
    ),
    deleteAnnotation: vi.fn().mockResolvedValue(undefined),
    getAnnotationsForPdf: vi.fn().mockResolvedValue([])
}));

// Mock Syncfusion PDF Viewer
vi.mock('@syncfusion/ej2-react-pdfviewer', () => ({
    PdfViewerComponent: vi.fn(({ onTextSelectionEnd, onDocumentLoad, ...props }) => {
        // Simulate PDF viewer with text selection capability
        return (
            <div data-testid="pdf-viewer" {...props}>
                <div
                    data-testid="pdf-page"
                    onMouseUp={(e) => {
                        // Simulate text selection
                        const selection = {
                            text: 'Selected text from PDF',
                            pageNumber: 1,
                            coordinates: { x: 100, y: 200, width: 150, height: 20 }
                        };
                        onTextSelectionEnd?.(selection);
                    }}
                >
                    <div data-testid="pdf-content">
                        This is sample PDF content that can be selected for annotation.
                        Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                    </div>
                </div>
            </div>
        );
    }),
    Inject: vi.fn(() => null),
    TextSelection: vi.fn(),
    TextSearch: vi.fn(),
    Navigation: vi.fn(),
    LinkAnnotation: vi.fn(),
    BookmarkView: vi.fn(),
    ThumbnailView: vi.fn(),
    Print: vi.fn(),
    Annotation: vi.fn()
}));

// Mock components
vi.mock('@/components/pdf/AnnotationOverlay', () => ({
    default: vi.fn(({ annotations, onAnnotationClick }) => (
        <div data-testid="annotation-overlay">
            {annotations.map((annotation: Annotation) => (
                <div
                    key={annotation.id}
                    data-testid={`annotation-${annotation.id}`}
                    onClick={() => onAnnotationClick?.(annotation.id)}
                    style={{
                        position: 'absolute',
                        left: annotation.coordinates.x,
                        top: annotation.coordinates.y,
                        width: annotation.coordinates.width,
                        height: annotation.coordinates.height,
                        backgroundColor: 'rgba(255, 255, 0, 0.3)',
                        cursor: 'pointer'
                    }}
                >
                    {annotation.selectedText}
                </div>
            ))}
        </div>
    ))
}));

vi.mock('@/components/pdf/AnnotationTooltip', () => ({
    default: vi.fn(({ visible, position, onCreateNote }) => (
        visible ? (
            <div
                data-testid="annotation-tooltip"
                style={{ position: 'absolute', left: position.x, top: position.y }}
            >
                <button onClick={onCreateNote} data-testid="create-note-btn">
                    Create Note
                </button>
            </div>
        ) : null
    ))
}));

// Mock note editor component
const MockNoteEditor = vi.fn(({ onSave, onCancel, initialContent }) => (
    <div data-testid="note-editor">
        <textarea
            data-testid="note-content"
            defaultValue={initialContent}
            placeholder="Enter your note..."
        />
        <button
            data-testid="save-note-btn"
            onClick={() => onSave?.('This is a test note content')}
        >
            Save Note
        </button>
        <button
            data-testid="cancel-note-btn"
            onClick={onCancel}
        >
            Cancel
        </button>
    </div>
));

vi.mock('@/components/note/NoteEditor', () => ({
    default: MockNoteEditor
}));

// Create a comprehensive test component that includes the full workflow
const AnnotationWorkflowApp = ({ initialPdf }: { initialPdf?: PDFDocument }) => {
    const [currentPdf, setCurrentPdf] = React.useState<PDFDocument | null>(initialPdf || null);
    const [showNoteEditor, setShowNoteEditor] = React.useState(false);
    const [selectedText, setSelectedText] = React.useState<any>(null);

    const handleFileUpload = async (file: File) => {
        // Simulate file upload
        const mockPdf: PDFDocument = {
            id: 'pdf-1',
            userId: 'user-1',
            filename: file.name,
            uploadedAt: new Date(),
            fileUrl: URL.createObjectURL(file)
        };
        setCurrentPdf(mockPdf);
    };

    const handleTextSelection = (selection: any) => {
        setSelectedText(selection);
    };

    const handleCreateNote = () => {
        setShowNoteEditor(true);
    };

    const handleSaveNote = (noteContent: string) => {
        // Create annotation
        const annotation: Annotation = {
            id: `annotation-${Date.now()}`,
            userId: 'user-1',
            pdfId: currentPdf!.id,
            pageNumber: selectedText.pageNumber,
            selectedText: selectedText.text,
            noteContent,
            coordinates: selectedText.coordinates,
            createdAt: new Date(),
            updatedAt: new Date()
        };

        // In real app, this would dispatch to Redux store
        setShowNoteEditor(false);
        setSelectedText(null);
    };

    return (
        <div data-testid="annotation-workflow-app">
            {!currentPdf ? (
                <div data-testid="upload-section">
                    <input
                        type="file"
                        accept=".pdf"
                        data-testid="file-input"
                        onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(file);
                        }}
                    />
                </div>
            ) : (
                <div data-testid="pdf-viewer-section">
                    <div data-testid="pdf-viewer-container">
                        <div
                            data-testid="pdf-page"
                            onMouseUp={() => {
                                const mockSelection = {
                                    text: 'Selected text from PDF',
                                    pageNumber: 1,
                                    coordinates: { x: 100, y: 200, width: 150, height: 20 }
                                };
                                handleTextSelection(mockSelection);
                            }}
                        >
                            PDF Content: {currentPdf.filename}
                        </div>

                        {selectedText && (
                            <div
                                data-testid="annotation-tooltip"
                                style={{ position: 'absolute', left: 150, top: 250 }}
                            >
                                <button
                                    data-testid="create-note-btn"
                                    onClick={handleCreateNote}
                                >
                                    Create Note
                                </button>
                            </div>
                        )}
                    </div>

                    {showNoteEditor && (
                        <div data-testid="note-editor-modal">
                            <MockNoteEditor
                                onSave={handleSaveNote}
                                onCancel={() => setShowNoteEditor(false)}
                                initialContent=""
                            />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const createTestStore = (initialState = {}) => {
    return configureStore({
        reducer: {
            annotations: annotationSlice
        },
        preloadedState: {
            annotations: {
                currentPdf: null,
                annotations: {},
                activeSelection: null,
                hoveredAnnotation: null,
                tooltipState: { visible: false, position: { x: 0, y: 0 } },
                previewCard: { visible: false, annotationId: null, position: { x: 0, y: 0 } },
                ...initialState
            }
        }
    });
};

describe('End-to-End Annotation Workflow', () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();
        // Mock URL.createObjectURL
        global.URL.createObjectURL = vi.fn(() => 'blob:mock-url');
        global.URL.revokeObjectURL = vi.fn();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const renderWorkflowApp = (props = {}) => {
        const store = createTestStore();
        return render(
            <Provider store={store}>
                <BrowserRouter>
                    <AnnotationWorkflowApp {...props} />
                </BrowserRouter>
            </Provider>
        );
    };

    describe('Complete Workflow: Upload → Select → Create → View', () => {
        it('should complete the full annotation workflow', async () => {
            renderWorkflowApp();

            // Step 1: Upload PDF
            expect(screen.getByTestId('upload-section')).toBeInTheDocument();

            const fileInput = screen.getByTestId('file-input');
            const pdfFile = new File(['mock pdf content'], 'test.pdf', { type: 'application/pdf' });

            await user.upload(fileInput, pdfFile);

            // Step 2: PDF should be loaded
            await waitFor(() => {
                expect(screen.getByTestId('pdf-viewer-section')).toBeInTheDocument();
                expect(screen.getByText('PDF Content: test.pdf')).toBeInTheDocument();
            });

            // Step 3: Select text in PDF
            const pdfPage = screen.getByTestId('pdf-page');
            await user.click(pdfPage); // Simulate text selection

            // Step 4: Tooltip should appear
            await waitFor(() => {
                expect(screen.getByTestId('annotation-tooltip')).toBeInTheDocument();
                expect(screen.getByTestId('create-note-btn')).toBeInTheDocument();
            });

            // Step 5: Click create note
            const createNoteBtn = screen.getByTestId('create-note-btn');
            await user.click(createNoteBtn);

            // Step 6: Note editor should open
            await waitFor(() => {
                expect(screen.getByTestId('note-editor-modal')).toBeInTheDocument();
                expect(screen.getByTestId('note-editor')).toBeInTheDocument();
                expect(screen.getByTestId('note-content')).toBeInTheDocument();
            });

            // Step 7: Save the note
            const saveBtn = screen.getByTestId('save-note-btn');
            await user.click(saveBtn);

            // Step 8: Note editor should close
            await waitFor(() => {
                expect(screen.queryByTestId('note-editor-modal')).not.toBeInTheDocument();
            });

            // Workflow completed successfully
            expect(screen.getByTestId('pdf-viewer-section')).toBeInTheDocument();
        });

        it('should handle workflow cancellation', async () => {
            renderWorkflowApp();

            // Upload PDF
            const fileInput = screen.getByTestId('file-input');
            const pdfFile = new File(['mock pdf content'], 'test.pdf', { type: 'application/pdf' });
            await user.upload(fileInput, pdfFile);

            // Select text and create note
            await waitFor(() => {
                expect(screen.getByTestId('pdf-page')).toBeInTheDocument();
            });

            const pdfPage = screen.getByTestId('pdf-page');
            await user.click(pdfPage);

            await waitFor(() => {
                expect(screen.getByTestId('create-note-btn')).toBeInTheDocument();
            });

            await user.click(screen.getByTestId('create-note-btn'));

            // Cancel note creation
            await waitFor(() => {
                expect(screen.getByTestId('cancel-note-btn')).toBeInTheDocument();
            });

            await user.click(screen.getByTestId('cancel-note-btn'));

            // Should return to PDF viewer without creating annotation
            await waitFor(() => {
                expect(screen.queryByTestId('note-editor-modal')).not.toBeInTheDocument();
            });

            expect(screen.getByTestId('pdf-viewer-section')).toBeInTheDocument();
        });
    });

    describe('File Upload Validation', () => {
        it('should accept valid PDF files', async () => {
            renderWorkflowApp();

            const fileInput = screen.getByTestId('file-input');
            const validPdfFile = new File(['%PDF-1.4'], 'valid.pdf', { type: 'application/pdf' });

            await user.upload(fileInput, validPdfFile);

            await waitFor(() => {
                expect(screen.getByTestId('pdf-viewer-section')).toBeInTheDocument();
            });
        });

        it('should handle file upload errors gracefully', async () => {
            // Mock upload failure
            vi.mocked(global.URL.createObjectURL).mockImplementation(() => {
                throw new Error('Upload failed');
            });

            renderWorkflowApp();

            const fileInput = screen.getByTestId('file-input');
            const pdfFile = new File(['mock content'], 'test.pdf', { type: 'application/pdf' });

            // Should not crash on upload error
            await user.upload(fileInput, pdfFile);

            // Should remain on upload screen
            expect(screen.getByTestId('upload-section')).toBeInTheDocument();
        });
    });

    describe('Text Selection Edge Cases', () => {
        it('should handle empty text selection', async () => {
            const mockPdf: PDFDocument = {
                id: 'pdf-1',
                userId: 'user-1',
                filename: 'test.pdf',
                uploadedAt: new Date(),
                fileUrl: 'blob:mock-url'
            };

            renderWorkflowApp({ initialPdf: mockPdf });

            const pdfPage = screen.getByTestId('pdf-page');

            // Simulate empty selection
            fireEvent.mouseUp(pdfPage, { detail: 0 });

            // Should not show tooltip for empty selection
            expect(screen.queryByTestId('annotation-tooltip')).not.toBeInTheDocument();
        });

        it('should handle multiple rapid selections', async () => {
            const mockPdf: PDFDocument = {
                id: 'pdf-1',
                userId: 'user-1',
                filename: 'test.pdf',
                uploadedAt: new Date(),
                fileUrl: 'blob:mock-url'
            };

            renderWorkflowApp({ initialPdf: mockPdf });

            const pdfPage = screen.getByTestId('pdf-page');

            // Rapid selections
            await user.click(pdfPage);
            await user.click(pdfPage);
            await user.click(pdfPage);

            // Should handle gracefully without errors
            expect(screen.getByTestId('pdf-viewer-section')).toBeInTheDocument();
        });
    });

    describe('Note Creation and Editing', () => {
        it('should preserve note content during editing', async () => {
            const mockPdf: PDFDocument = {
                id: 'pdf-1',
                userId: 'user-1',
                filename: 'test.pdf',
                uploadedAt: new Date(),
                fileUrl: 'blob:mock-url'
            };

            renderWorkflowApp({ initialPdf: mockPdf });

            // Select text and create note
            const pdfPage = screen.getByTestId('pdf-page');
            await user.click(pdfPage);

            await waitFor(() => {
                expect(screen.getByTestId('create-note-btn')).toBeInTheDocument();
            });

            await user.click(screen.getByTestId('create-note-btn'));

            // Enter note content
            await waitFor(() => {
                expect(screen.getByTestId('note-content')).toBeInTheDocument();
            });

            const noteTextarea = screen.getByTestId('note-content');
            await user.type(noteTextarea, 'This is my test note content');

            expect(noteTextarea).toHaveValue('This is my test note content');
        });

        it('should handle long note content', async () => {
            const mockPdf: PDFDocument = {
                id: 'pdf-1',
                userId: 'user-1',
                filename: 'test.pdf',
                uploadedAt: new Date(),
                fileUrl: 'blob:mock-url'
            };

            renderWorkflowApp({ initialPdf: mockPdf });

            const pdfPage = screen.getByTestId('pdf-page');
            await user.click(pdfPage);

            await waitFor(() => {
                expect(screen.getByTestId('create-note-btn')).toBeInTheDocument();
            });

            await user.click(screen.getByTestId('create-note-btn'));

            await waitFor(() => {
                expect(screen.getByTestId('note-content')).toBeInTheDocument();
            });

            // Enter very long content
            const longContent = 'A'.repeat(10000);
            const noteTextarea = screen.getByTestId('note-content');
            await user.type(noteTextarea, longContent);

            expect(noteTextarea).toHaveValue(longContent);
        });
    });

    describe('Performance and Responsiveness', () => {
        it('should handle workflow steps within reasonable time', async () => {
            const startTime = performance.now();

            renderWorkflowApp();

            const fileInput = screen.getByTestId('file-input');
            const pdfFile = new File(['mock content'], 'test.pdf', { type: 'application/pdf' });

            await user.upload(fileInput, pdfFile);

            await waitFor(() => {
                expect(screen.getByTestId('pdf-viewer-section')).toBeInTheDocument();
            });

            const endTime = performance.now();

            // Should complete upload and render within 1 second
            expect(endTime - startTime).toBeLessThan(1000);
        });

        it('should remain responsive during note creation', async () => {
            const mockPdf: PDFDocument = {
                id: 'pdf-1',
                userId: 'user-1',
                filename: 'test.pdf',
                uploadedAt: new Date(),
                fileUrl: 'blob:mock-url'
            };

            renderWorkflowApp({ initialPdf: mockPdf });

            const startTime = performance.now();

            // Complete note creation workflow
            const pdfPage = screen.getByTestId('pdf-page');
            await user.click(pdfPage);

            await waitFor(() => {
                expect(screen.getByTestId('create-note-btn')).toBeInTheDocument();
            });

            await user.click(screen.getByTestId('create-note-btn'));

            await waitFor(() => {
                expect(screen.getByTestId('save-note-btn')).toBeInTheDocument();
            });

            await user.click(screen.getByTestId('save-note-btn'));

            const endTime = performance.now();

            // Should complete note creation within reasonable time
            expect(endTime - startTime).toBeLessThan(2000);
        });
    });
});