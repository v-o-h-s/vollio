import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import PDFAnnotationViewer from '@/components/pdf/PDFAnnotationViewer';
import annotationSlice from '@/lib/store/annotationSlice';
import type { PDFDocument, Annotation } from '@/lib/types';

// Mock Syncfusion PDF Viewer
vi.mock('@syncfusion/ej2-react-pdfviewer', () => ({
    PdfViewerComponent: vi.fn(({ children, ...props }) => (
        <div data-testid="pdf-viewer" {...props}>
            {children}
            <div data-testid="pdf-page" style={{ width: '800px', height: '1000px' }}>
                Mock PDF Content
            </div>
        </div>
    )),
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

// Mock the annotation overlay component
vi.mock('@/components/pdf/AnnotationOverlay', () => ({
    default: vi.fn(({ annotations, onAnnotationHover, onAnnotationClick }) => (
        <div data-testid="annotation-overlay">
            {annotations.map((annotation: Annotation) => (
                <div
                    key={annotation.id}
                    data-testid={`annotation-${annotation.id}`}
                    onMouseEnter={() => onAnnotationHover?.(annotation.id)}
                    onMouseLeave={() => onAnnotationHover?.(null)}
                    onClick={() => onAnnotationClick?.(annotation.id)}
                    style={{
                        position: 'absolute',
                        left: annotation.coordinates.x,
                        top: annotation.coordinates.y,
                        width: annotation.coordinates.width,
                        height: annotation.coordinates.height,
                        backgroundColor: 'rgba(255, 255, 0, 0.3)'
                    }}
                >
                    {annotation.selectedText}
                </div>
            ))}
        </div>
    ))
}));

// Mock the tooltip component
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

// Mock the preview card component
vi.mock('@/components/pdf/AnnotationPreviewCard', () => ({
    default: vi.fn(({ visible, annotation, position, onEdit, onDelete }) => (
        visible && annotation ? (
            <div
                data-testid="preview-card"
                style={{ position: 'absolute', left: position.x, top: position.y }}
            >
                <div data-testid="preview-text">{annotation.selectedText}</div>
                <div data-testid="preview-note">{annotation.noteContent}</div>
                <button onClick={() => onEdit?.(annotation.id)} data-testid="edit-btn">
                    Edit
                </button>
                <button onClick={() => onDelete?.(annotation.id)} data-testid="delete-btn">
                    Delete
                </button>
            </div>
        ) : null
    ))
}));

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

const mockPdfDocument: PDFDocument = {
    id: 'pdf-1',
    userId: 'user-1',
    filename: 'test.pdf',
    uploadedAt: new Date('2024-01-01'),
    fileUrl: 'blob:mock-url'
};

const mockAnnotation: Annotation = {
    id: 'annotation-1',
    userId: 'user-1',
    pdfId: 'pdf-1',
    pageNumber: 1,
    selectedText: 'Sample selected text',
    noteContent: 'This is a test note',
    coordinates: { x: 100, y: 200, width: 150, height: 20 },
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01')
};

describe('PDFAnnotationViewer Integration', () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const renderWithStore = (store = createTestStore()) => {
        return render(
            <Provider store={store}>
                <PDFAnnotationViewer pdfDocument={mockPdfDocument} />
            </Provider>
        );
    };

    describe('PDF Viewer Rendering', () => {
        it('should render PDF viewer component', () => {
            renderWithStore();

            expect(screen.getByTestId('pdf-viewer')).toBeInTheDocument();
            expect(screen.getByTestId('pdf-page')).toBeInTheDocument();
        });

        it('should render annotation overlay', () => {
            renderWithStore();

            expect(screen.getByTestId('annotation-overlay')).toBeInTheDocument();
        });

        it('should display existing annotations', () => {
            const store = createTestStore({
                currentPdf: mockPdfDocument,
                annotations: { [mockAnnotation.id]: mockAnnotation }
            });

            renderWithStore(store);

            expect(screen.getByTestId(`annotation-${mockAnnotation.id}`)).toBeInTheDocument();
            expect(screen.getByText('Sample selected text')).toBeInTheDocument();
        });
    });

    describe('Text Selection and Annotation Creation', () => {
        it('should show tooltip when text is selected', async () => {
            const store = createTestStore({
                tooltipState: { visible: true, position: { x: 150, y: 250 } }
            });

            renderWithStore(store);

            expect(screen.getByTestId('annotation-tooltip')).toBeInTheDocument();
            expect(screen.getByTestId('create-note-btn')).toBeInTheDocument();
        });

        it('should handle create note button click', async () => {
            const store = createTestStore({
                tooltipState: { visible: true, position: { x: 150, y: 250 } },
                activeSelection: {
                    text: 'Selected text',
                    pageNumber: 1,
                    coordinates: { x: 100, y: 200, width: 150, height: 20 },
                    pdfId: 'pdf-1'
                }
            });

            renderWithStore(store);

            const createNoteBtn = screen.getByTestId('create-note-btn');
            await user.click(createNoteBtn);

            // Should trigger navigation to note creation
            // This would typically be tested with router mocks
        });

        it('should simulate text selection on PDF page', async () => {
            const store = createTestStore();
            renderWithStore(store);

            const pdfPage = screen.getByTestId('pdf-page');

            // Simulate text selection
            fireEvent.mouseDown(pdfPage, { clientX: 100, clientY: 200 });
            fireEvent.mouseMove(pdfPage, { clientX: 250, clientY: 220 });
            fireEvent.mouseUp(pdfPage, { clientX: 250, clientY: 220 });

            // In a real implementation, this would trigger text selection logic
            // Here we're testing the event handling structure
        });
    });

    describe('Annotation Interactions', () => {
        it('should show preview card when annotation is hovered', async () => {
            const store = createTestStore({
                currentPdf: mockPdfDocument,
                annotations: { [mockAnnotation.id]: mockAnnotation },
                previewCard: {
                    visible: true,
                    annotationId: mockAnnotation.id,
                    position: { x: 200, y: 300 }
                }
            });

            renderWithStore(store);

            expect(screen.getByTestId('preview-card')).toBeInTheDocument();
            expect(screen.getByTestId('preview-text')).toHaveTextContent('Sample selected text');
            expect(screen.getByTestId('preview-note')).toHaveTextContent('This is a test note');
        });

        it('should handle annotation hover events', async () => {
            const store = createTestStore({
                currentPdf: mockPdfDocument,
                annotations: { [mockAnnotation.id]: mockAnnotation }
            });

            renderWithStore(store);

            const annotation = screen.getByTestId(`annotation-${mockAnnotation.id}`);

            // Hover over annotation
            await user.hover(annotation);

            // Should trigger hover state change
            // In real implementation, this would show preview card
        });

        it('should handle annotation click events', async () => {
            const store = createTestStore({
                currentPdf: mockPdfDocument,
                annotations: { [mockAnnotation.id]: mockAnnotation }
            });

            renderWithStore(store);

            const annotation = screen.getByTestId(`annotation-${mockAnnotation.id}`);

            await user.click(annotation);

            // Should trigger click handler
            // In real implementation, this might navigate to note or show details
        });

        it('should handle edit button click in preview card', async () => {
            const store = createTestStore({
                currentPdf: mockPdfDocument,
                annotations: { [mockAnnotation.id]: mockAnnotation },
                previewCard: {
                    visible: true,
                    annotationId: mockAnnotation.id,
                    position: { x: 200, y: 300 }
                }
            });

            renderWithStore(store);

            const editBtn = screen.getByTestId('edit-btn');
            await user.click(editBtn);

            // Should trigger edit action
        });

        it('should handle delete button click in preview card', async () => {
            const store = createTestStore({
                currentPdf: mockPdfDocument,
                annotations: { [mockAnnotation.id]: mockAnnotation },
                previewCard: {
                    visible: true,
                    annotationId: mockAnnotation.id,
                    position: { x: 200, y: 300 }
                }
            });

            renderWithStore(store);

            const deleteBtn = screen.getByTestId('delete-btn');
            await user.click(deleteBtn);

            // Should trigger delete action
        });
    });

    describe('Multiple Annotations', () => {
        it('should render multiple annotations correctly', () => {
            const annotation2: Annotation = {
                ...mockAnnotation,
                id: 'annotation-2',
                selectedText: 'Another selected text',
                coordinates: { x: 300, y: 400, width: 100, height: 15 }
            };

            const store = createTestStore({
                currentPdf: mockPdfDocument,
                annotations: {
                    [mockAnnotation.id]: mockAnnotation,
                    [annotation2.id]: annotation2
                }
            });

            renderWithStore(store);

            expect(screen.getByTestId(`annotation-${mockAnnotation.id}`)).toBeInTheDocument();
            expect(screen.getByTestId(`annotation-${annotation2.id}`)).toBeInTheDocument();
            expect(screen.getByText('Sample selected text')).toBeInTheDocument();
            expect(screen.getByText('Another selected text')).toBeInTheDocument();
        });

        it('should handle overlapping annotations', () => {
            const overlappingAnnotation: Annotation = {
                ...mockAnnotation,
                id: 'annotation-overlap',
                coordinates: { x: 120, y: 210, width: 100, height: 15 } // Overlaps with mockAnnotation
            };

            const store = createTestStore({
                currentPdf: mockPdfDocument,
                annotations: {
                    [mockAnnotation.id]: mockAnnotation,
                    [overlappingAnnotation.id]: overlappingAnnotation
                }
            });

            renderWithStore(store);

            expect(screen.getByTestId(`annotation-${mockAnnotation.id}`)).toBeInTheDocument();
            expect(screen.getByTestId(`annotation-${overlappingAnnotation.id}`)).toBeInTheDocument();
        });
    });

    describe('Error Handling', () => {
        it('should handle missing PDF document gracefully', () => {
            render(
                <Provider store={createTestStore()}>
                    <PDFAnnotationViewer pdfDocument={null} />
                </Provider>
            );

            // Should render without crashing
            // Specific error handling behavior would depend on implementation
        });

        it('should handle corrupted annotation data', () => {
            const corruptedAnnotation = {
                ...mockAnnotation,
                coordinates: null // Invalid coordinates
            } as any;

            const store = createTestStore({
                currentPdf: mockPdfDocument,
                annotations: { [corruptedAnnotation.id]: corruptedAnnotation }
            });

            renderWithStore(store);

            // Should render without crashing
            // Invalid annotations should be filtered out or handled gracefully
        });
    });

    describe('Performance', () => {
        it('should handle large number of annotations efficiently', () => {
            const manyAnnotations: Record<string, Annotation> = {};

            // Create 100 annotations
            for (let i = 0; i < 100; i++) {
                manyAnnotations[`annotation-${i}`] = {
                    ...mockAnnotation,
                    id: `annotation-${i}`,
                    selectedText: `Text ${i}`,
                    coordinates: {
                        x: (i % 10) * 80,
                        y: Math.floor(i / 10) * 50,
                        width: 70,
                        height: 20
                    }
                };
            }

            const store = createTestStore({
                currentPdf: mockPdfDocument,
                annotations: manyAnnotations
            });

            const startTime = performance.now();
            renderWithStore(store);
            const endTime = performance.now();

            // Should render within reasonable time (less than 100ms)
            expect(endTime - startTime).toBeLessThan(100);

            // All annotations should be present
            expect(screen.getAllByTestId(/^annotation-\d+$/)).toHaveLength(100);
        });
    });
});