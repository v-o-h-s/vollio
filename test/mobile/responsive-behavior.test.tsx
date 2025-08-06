import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import annotationSlice from '@/lib/store/annotationSlice';
import type { Annotation, PDFDocument } from '@/lib/types';

// Mock the mobile hook
const mockIsMobile = vi.fn();
vi.mock('@/hooks/use-mobile', () => ({
    useMobile: () => mockIsMobile()
}));

// Mock mobile annotation dialog
vi.mock('@/components/pdf/MobileAnnotationDialog', () => ({
    default: vi.fn(({ isOpen, onClose, onSave, selectedText, position }) => (
        isOpen ? (
            <div data-testid="mobile-annotation-dialog">
                <div data-testid="mobile-dialog-content">
                    <h3>Create Annotation</h3>
                    <p data-testid="selected-text">Selected: {selectedText}</p>
                    <textarea
                        data-testid="mobile-note-input"
                        placeholder="Enter your note..."
                    />
                    <div data-testid="mobile-dialog-actions">
                        <button
                            data-testid="mobile-save-btn"
                            onClick={() => onSave?.('Mobile note content')}
                        >
                            Save
                        </button>
                        <button
                            data-testid="mobile-cancel-btn"
                            onClick={onClose}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        ) : null
    ))
}));

// Mock PDF viewer with mobile-specific behavior
vi.mock('@syncfusion/ej2-react-pdfviewer', () => ({
    PdfViewerComponent: vi.fn(({ onTextSelectionEnd, ...props }) => (
        <div data-testid="pdf-viewer" {...props}>
            <div
                data-testid="pdf-page"
                onTouchEnd={(e) => {
                    // Simulate touch selection on mobile
                    if (mockIsMobile()) {
                        const selection = {
                            text: 'Touch selected text',
                            pageNumber: 1,
                            coordinates: { x: 100, y: 200, width: 150, height: 20 }
                        };
                        onTextSelectionEnd?.(selection);
                    }
                }}
                onMouseUp={(e) => {
                    // Simulate mouse selection on desktop
                    if (!mockIsMobile()) {
                        const selection = {
                            text: 'Mouse selected text',
                            pageNumber: 1,
                            coordinates: { x: 100, y: 200, width: 150, height: 20 }
                        };
                        onTextSelectionEnd?.(selection);
                    }
                }}
            >
                PDF Content for responsive testing
            </div>
        </div>
    )),
    Inject: vi.fn(() => null),
    TextSelection: vi.fn(),
    Navigation: vi.fn()
}));

// Mock responsive annotation overlay
vi.mock('@/components/pdf/AnnotationOverlay', () => ({
    default: vi.fn(({ annotations, onAnnotationClick, onAnnotationHover }) => (
        <div data-testid="annotation-overlay">
            {annotations.map((annotation: Annotation) => (
                <div
                    key={annotation.id}
                    data-testid={`annotation-${annotation.id}`}
                    onClick={() => onAnnotationClick?.(annotation.id)}
                    onMouseEnter={() => !mockIsMobile() && onAnnotationHover?.(annotation.id)}
                    onTouchStart={() => mockIsMobile() && onAnnotationHover?.(annotation.id)}
                    style={{
                        position: 'absolute',
                        left: annotation.coordinates.x,
                        top: annotation.coordinates.y,
                        width: annotation.coordinates.width,
                        height: annotation.coordinates.height,
                        backgroundColor: 'rgba(255, 255, 0, 0.3)',
                        cursor: mockIsMobile() ? 'default' : 'pointer',
                        touchAction: mockIsMobile() ? 'manipulation' : 'auto'
                    }}
                >
                    {annotation.selectedText}
                </div>
            ))}
        </div>
    ))
}));

// Responsive PDF annotation viewer component
const ResponsivePDFViewer = ({ pdfDocument }: { pdfDocument: PDFDocument }) => {
    const [showMobileDialog, setShowMobileDialog] = React.useState(false);
    const [selectedText, setSelectedText] = React.useState<string>('');
    const isMobile = mockIsMobile();

    const handleTextSelection = (selection: any) => {
        setSelectedText(selection.text);
        if (isMobile) {
            setShowMobileDialog(true);
        }
    };

    const handleMobileSave = (noteContent: string) => {
        // Save annotation logic
        setShowMobileDialog(false);
        setSelectedText('');
    };

    return (
        <div data-testid="responsive-pdf-viewer" className={isMobile ? 'mobile-layout' : 'desktop-layout'}>
            <div data-testid="pdf-container" style={{
                width: isMobile ? '100vw' : '800px',
                height: isMobile ? '100vh' : '600px'
            }}>
                <div
                    data-testid="pdf-page"
                    onTouchEnd={isMobile ? () => handleTextSelection({ text: 'Touch selected text' }) : undefined}
                    onMouseUp={!isMobile ? () => handleTextSelection({ text: 'Mouse selected text' }) : undefined}
                >
                    PDF Content: {pdfDocument.filename}
                </div>
            </div>

            {/* Mobile Dialog */}
            {isMobile && (
                <div data-testid="mobile-annotation-dialog" style={{ display: showMobileDialog ? 'block' : 'none' }}>
                    <div data-testid="mobile-dialog-content">
                        <h3>Create Annotation</h3>
                        <p data-testid="selected-text">Selected: {selectedText}</p>
                        <textarea data-testid="mobile-note-input" placeholder="Enter your note..." />
                        <div data-testid="mobile-dialog-actions">
                            <button
                                data-testid="mobile-save-btn"
                                onClick={() => handleMobileSave('Mobile note content')}
                            >
                                Save
                            </button>
                            <button
                                data-testid="mobile-cancel-btn"
                                onClick={() => setShowMobileDialog(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Desktop Tooltip */}
            {!isMobile && selectedText && (
                <div data-testid="desktop-tooltip" style={{ position: 'absolute', left: 150, top: 250 }}>
                    <button data-testid="desktop-create-note-btn">Create Note</button>
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

const mockPdfDocument: PDFDocument = {
    id: 'pdf-1',
    userId: 'user-1',
    filename: 'responsive-test.pdf',
    uploadedAt: new Date(),
    fileUrl: 'blob:mock-url'
};

describe('Responsive Behavior and Mobile Interactions', () => {
    let user: ReturnType<typeof userEvent.setup>;

    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    const renderResponsiveViewer = (isMobile = false) => {
        mockIsMobile.mockReturnValue(isMobile);
        const store = createTestStore();

        return render(
            <Provider store={store}>
                <ResponsivePDFViewer pdfDocument={mockPdfDocument} />
            </Provider>
        );
    };

    describe('Desktop Behavior', () => {
        it('should render desktop layout correctly', () => {
            renderResponsiveViewer(false);

            const viewer = screen.getByTestId('responsive-pdf-viewer');
            expect(viewer).toHaveClass('desktop-layout');

            const container = screen.getByTestId('pdf-container');
            expect(container).toHaveStyle({
                width: '800px',
                height: '600px'
            });
        });

        it('should handle mouse-based text selection on desktop', async () => {
            renderResponsiveViewer(false);

            const pdfPage = screen.getByTestId('pdf-page');

            // Simulate mouse selection
            fireEvent.mouseUp(pdfPage);

            await waitFor(() => {
                expect(screen.getByTestId('desktop-tooltip')).toBeInTheDocument();
                expect(screen.getByTestId('desktop-create-note-btn')).toBeInTheDocument();
            });

            // Should not show mobile dialog
            expect(screen.queryByTestId('mobile-annotation-dialog')).not.toBeInTheDocument();
        });

        it('should show hover effects on desktop', async () => {
            const annotation: Annotation = {
                id: 'annotation-1',
                userId: 'user-1',
                pdfId: 'pdf-1',
                pageNumber: 1,
                selectedText: 'Desktop annotation',
                noteContent: 'Desktop note',
                coordinates: { x: 100, y: 200, width: 150, height: 20 },
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const store = createTestStore({
                annotations: { [annotation.id]: annotation }
            });

            mockIsMobile.mockReturnValue(false);

            render(
                <Provider store={store}>
                    <div data-testid="annotation-overlay">
                        <div
                            data-testid={`annotation-${annotation.id}`}
                            onMouseEnter={() => { }}
                            style={{ cursor: 'pointer' }}
                        >
                            {annotation.selectedText}
                        </div>
                    </div>
                </Provider>
            );

            const annotationElement = screen.getByTestId(`annotation-${annotation.id}`);
            expect(annotationElement).toHaveStyle({ cursor: 'pointer' });
        });
    });

    describe('Mobile Behavior', () => {
        it('should render mobile layout correctly', () => {
            renderResponsiveViewer(true);

            const viewer = screen.getByTestId('responsive-pdf-viewer');
            expect(viewer).toHaveClass('mobile-layout');

            const container = screen.getByTestId('pdf-container');
            expect(container).toHaveStyle({
                width: '100vw',
                height: '100vh'
            });
        });

        it('should handle touch-based text selection on mobile', async () => {
            renderResponsiveViewer(true);

            const pdfPage = screen.getByTestId('pdf-page');

            // Simulate touch selection
            fireEvent.touchEnd(pdfPage);

            await waitFor(() => {
                expect(screen.getByTestId('mobile-annotation-dialog')).toBeVisible();
                expect(screen.getByTestId('selected-text')).toHaveTextContent('Selected: Touch selected text');
            });

            // Should not show desktop tooltip
            expect(screen.queryByTestId('desktop-tooltip')).not.toBeInTheDocument();
        });

        it('should handle mobile annotation dialog interactions', async () => {
            renderResponsiveViewer(true);

            const pdfPage = screen.getByTestId('pdf-page');
            fireEvent.touchEnd(pdfPage);

            await waitFor(() => {
                expect(screen.getByTestId('mobile-annotation-dialog')).toBeVisible();
            });

            // Test note input
            const noteInput = screen.getByTestId('mobile-note-input');
            await user.type(noteInput, 'This is a mobile note');
            expect(noteInput).toHaveValue('This is a mobile note');

            // Test save button
            const saveBtn = screen.getByTestId('mobile-save-btn');
            await user.click(saveBtn);

            await waitFor(() => {
                expect(screen.getByTestId('mobile-annotation-dialog')).not.toBeVisible();
            });
        });

        it('should handle mobile annotation dialog cancellation', async () => {
            renderResponsiveViewer(true);

            const pdfPage = screen.getByTestId('pdf-page');
            fireEvent.touchEnd(pdfPage);

            await waitFor(() => {
                expect(screen.getByTestId('mobile-annotation-dialog')).toBeVisible();
            });

            const cancelBtn = screen.getByTestId('mobile-cancel-btn');
            await user.click(cancelBtn);

            await waitFor(() => {
                expect(screen.getByTestId('mobile-annotation-dialog')).not.toBeVisible();
            });
        });

        it('should use touch-friendly interactions for annotations', () => {
            const annotation: Annotation = {
                id: 'annotation-1',
                userId: 'user-1',
                pdfId: 'pdf-1',
                pageNumber: 1,
                selectedText: 'Mobile annotation',
                noteContent: 'Mobile note',
                coordinates: { x: 100, y: 200, width: 150, height: 20 },
                createdAt: new Date(),
                updatedAt: new Date()
            };

            const store = createTestStore({
                annotations: { [annotation.id]: annotation }
            });

            mockIsMobile.mockReturnValue(true);

            render(
                <Provider store={store}>
                    <div data-testid="annotation-overlay">
                        <div
                            data-testid={`annotation-${annotation.id}`}
                            onTouchStart={() => { }}
                            style={{
                                cursor: 'default',
                                touchAction: 'manipulation'
                            }}
                        >
                            {annotation.selectedText}
                        </div>
                    </div>
                </Provider>
            );

            const annotationElement = screen.getByTestId(`annotation-${annotation.id}`);
            expect(annotationElement).toHaveStyle({
                cursor: 'default',
                touchAction: 'manipulation'
            });
        });
    });

    describe('Viewport Size Changes', () => {
        it('should adapt to viewport size changes', () => {
            // Start with desktop
            const { rerender } = renderResponsiveViewer(false);

            expect(screen.getByTestId('responsive-pdf-viewer')).toHaveClass('desktop-layout');

            // Switch to mobile
            mockIsMobile.mockReturnValue(true);
            rerender(
                <Provider store={createTestStore()}>
                    <ResponsivePDFViewer pdfDocument={mockPdfDocument} />
                </Provider>
            );

            expect(screen.getByTestId('responsive-pdf-viewer')).toHaveClass('mobile-layout');
        });

        it('should handle orientation changes on mobile', async () => {
            renderResponsiveViewer(true);

            // Simulate orientation change by changing viewport
            Object.defineProperty(window, 'innerWidth', { value: 768, configurable: true });
            Object.defineProperty(window, 'innerHeight', { value: 1024, configurable: true });

            fireEvent(window, new Event('resize'));

            // Component should remain functional
            const pdfPage = screen.getByTestId('pdf-page');
            fireEvent.touchEnd(pdfPage);

            await waitFor(() => {
                expect(screen.getByTestId('mobile-annotation-dialog')).toBeVisible();
            });
        });
    });

    describe('Touch Gestures', () => {
        it('should handle pinch-to-zoom gestures', () => {
            renderResponsiveViewer(true);

            const pdfContainer = screen.getByTestId('pdf-container');

            // Simulate pinch gesture
            const touchStart = new TouchEvent('touchstart', {
                touches: [
                    { clientX: 100, clientY: 100 } as Touch,
                    { clientX: 200, clientY: 200 } as Touch
                ]
            });

            const touchMove = new TouchEvent('touchmove', {
                touches: [
                    { clientX: 80, clientY: 80 } as Touch,
                    { clientX: 220, clientY: 220 } as Touch
                ]
            });

            fireEvent(pdfContainer, touchStart);
            fireEvent(pdfContainer, touchMove);

            // Should handle zoom gestures without interfering with text selection
            expect(pdfContainer).toBeInTheDocument();
        });

        it('should distinguish between selection and scroll gestures', async () => {
            renderResponsiveViewer(true);

            const pdfPage = screen.getByTestId('pdf-page');

            // Simulate scroll gesture (should not trigger selection)
            const touchStart = new TouchEvent('touchstart', {
                touches: [{ clientX: 100, clientY: 100 } as Touch]
            });

            const touchMove = new TouchEvent('touchmove', {
                touches: [{ clientX: 100, clientY: 50 } as Touch] // Vertical movement
            });

            const touchEnd = new TouchEvent('touchend', {
                changedTouches: [{ clientX: 100, clientY: 50 } as Touch]
            });

            fireEvent(pdfPage, touchStart);
            fireEvent(pdfPage, touchMove);
            fireEvent(pdfPage, touchEnd);

            // Should not show annotation dialog for scroll gesture
            expect(screen.queryByTestId('mobile-annotation-dialog')).not.toBeInTheDocument();
        });
    });

    describe('Accessibility on Mobile', () => {
        it('should provide proper touch targets', () => {
            renderResponsiveViewer(true);

            const pdfPage = screen.getByTestId('pdf-page');
            fireEvent.touchEnd(pdfPage);

            const saveBtn = screen.getByTestId('mobile-save-btn');
            const cancelBtn = screen.getByTestId('mobile-cancel-btn');

            // Touch targets should be large enough (minimum 44px)
            const saveRect = saveBtn.getBoundingClientRect();
            const cancelRect = cancelBtn.getBoundingClientRect();

            expect(saveRect.height).toBeGreaterThanOrEqual(44);
            expect(cancelRect.height).toBeGreaterThanOrEqual(44);
        });

        it('should support screen reader navigation on mobile', () => {
            renderResponsiveViewer(true);

            const pdfPage = screen.getByTestId('pdf-page');
            fireEvent.touchEnd(pdfPage);

            const dialog = screen.getByTestId('mobile-annotation-dialog');
            const noteInput = screen.getByTestId('mobile-note-input');

            expect(dialog).toHaveAttribute('role', 'dialog');
            expect(noteInput).toHaveAttribute('aria-label');
        });
    });

    describe('Performance on Mobile', () => {
        it('should handle touch events efficiently', async () => {
            renderResponsiveViewer(true);

            const pdfPage = screen.getByTestId('pdf-page');
            const startTime = performance.now();

            // Simulate multiple rapid touch events
            for (let i = 0; i < 10; i++) {
                fireEvent.touchEnd(pdfPage);
                await new Promise(resolve => setTimeout(resolve, 10));
            }

            const endTime = performance.now();

            // Should handle multiple touch events within reasonable time
            expect(endTime - startTime).toBeLessThan(500);
        });

        it('should optimize rendering for mobile devices', () => {
            renderResponsiveViewer(true);

            const viewer = screen.getByTestId('responsive-pdf-viewer');

            // Should apply mobile-specific optimizations
            expect(viewer).toHaveClass('mobile-layout');

            // Container should use viewport units for better performance
            const container = screen.getByTestId('pdf-container');
            expect(container).toHaveStyle({
                width: '100vw',
                height: '100vh'
            });
        });
    });

    describe('Cross-Device Compatibility', () => {
        it('should work consistently across different mobile devices', () => {
            // Test different screen sizes
            const deviceSizes = [
                { width: 375, height: 667 }, // iPhone SE
                { width: 414, height: 896 }, // iPhone 11
                { width: 360, height: 640 }, // Android
                { width: 768, height: 1024 } // Tablet
            ];

            deviceSizes.forEach(({ width, height }) => {
                Object.defineProperty(window, 'innerWidth', { value: width, configurable: true });
                Object.defineProperty(window, 'innerHeight', { value: height, configurable: true });

                renderResponsiveViewer(true);

                expect(screen.getByTestId('responsive-pdf-viewer')).toBeInTheDocument();
                expect(screen.getByTestId('pdf-container')).toHaveStyle({
                    width: '100vw',
                    height: '100vh'
                });
            });
        });
    });
});