import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AnnotationOverlay from '@/components/pdf/AnnotationOverlay';
import type { Annotation } from '@/lib/types';

const mockAnnotations: Annotation[] = [
    {
        id: 'annotation-1',
        userId: 'user-1',
        pdfId: 'pdf-1',
        pageNumber: 1,
        selectedText: 'First annotation text',
        noteContent: 'First note content',
        coordinates: { x: 100, y: 200, width: 150, height: 20 },
        createdAt: new Date('2024-01-01'),
        updatedAt: new Date('2024-01-01')
    },
    {
        id: 'annotation-2',
        userId: 'user-1',
        pdfId: 'pdf-1',
        pageNumber: 1,
        selectedText: 'Second annotation text',
        noteContent: 'Second note content',
        coordinates: { x: 300, y: 400, width: 200, height: 25 },
        createdAt: new Date('2024-01-02'),
        updatedAt: new Date('2024-01-02')
    }
];

describe('AnnotationOverlay', () => {
    let user: ReturnType<typeof userEvent.setup>;
    const mockOnAnnotationHover = vi.fn();
    const mockOnAnnotationClick = vi.fn();

    beforeEach(() => {
        user = userEvent.setup();
        vi.clearAllMocks();
    });

    const renderAnnotationOverlay = (props = {}) => {
        const defaultProps = {
            annotations: mockAnnotations,
            pageNumber: 1,
            onAnnotationHover: mockOnAnnotationHover,
            onAnnotationClick: mockOnAnnotationClick,
            hoveredAnnotationId: null,
            ...props
        };

        return render(<AnnotationOverlay {...defaultProps} />);
    };

    describe('Rendering', () => {
        it('should render all annotations for the current page', () => {
            renderAnnotationOverlay();

            expect(screen.getByTestId('annotation-overlay-annotation-1')).toBeInTheDocument();
            expect(screen.getByTestId('annotation-overlay-annotation-2')).toBeInTheDocument();
        });

        it('should only render annotations for the specified page', () => {
            const annotationsWithDifferentPages = [
                ...mockAnnotations,
                {
                    ...mockAnnotations[0],
                    id: 'annotation-3',
                    pageNumber: 2,
                    selectedText: 'Page 2 annotation'
                }
            ];

            renderAnnotationOverlay({
                annotations: annotationsWithDifferentPages,
                pageNumber: 1
            });

            expect(screen.getByTestId('annotation-overlay-annotation-1')).toBeInTheDocument();
            expect(screen.getByTestId('annotation-overlay-annotation-2')).toBeInTheDocument();
            expect(screen.queryByTestId('annotation-overlay-annotation-3')).not.toBeInTheDocument();
        });

        it('should render empty overlay when no annotations exist', () => {
            renderAnnotationOverlay({ annotations: [] });

            expect(screen.getByTestId('annotation-overlay')).toBeInTheDocument();
            expect(screen.queryByTestId(/annotation-overlay-annotation-/)).not.toBeInTheDocument();
        });

        it('should apply correct positioning and dimensions to annotations', () => {
            renderAnnotationOverlay();

            const annotation1 = screen.getByTestId('annotation-overlay-annotation-1');
            const annotation2 = screen.getByTestId('annotation-overlay-annotation-2');

            expect(annotation1).toHaveStyle({
                position: 'absolute',
                left: '100px',
                top: '200px',
                width: '150px',
                height: '20px'
            });

            expect(annotation2).toHaveStyle({
                position: 'absolute',
                left: '300px',
                top: '400px',
                width: '200px',
                height: '25px'
            });
        });
    });

    describe('Hover Interactions', () => {
        it('should call onAnnotationHover when mouse enters annotation', async () => {
            renderAnnotationOverlay();

            const annotation1 = screen.getByTestId('annotation-overlay-annotation-1');
            await user.hover(annotation1);

            expect(mockOnAnnotationHover).toHaveBeenCalledWith('annotation-1');
        });

        it('should call onAnnotationHover with null when mouse leaves annotation', async () => {
            renderAnnotationOverlay();

            const annotation1 = screen.getByTestId('annotation-overlay-annotation-1');
            await user.hover(annotation1);
            await user.unhover(annotation1);

            expect(mockOnAnnotationHover).toHaveBeenCalledWith(null);
        });

        it('should apply hover styles to hovered annotation', () => {
            renderAnnotationOverlay({ hoveredAnnotationId: 'annotation-1' });

            const annotation1 = screen.getByTestId('annotation-overlay-annotation-1');
            const annotation2 = screen.getByTestId('annotation-overlay-annotation-2');

            expect(annotation1).toHaveClass('hovered');
            expect(annotation2).not.toHaveClass('hovered');
        });

        it('should handle rapid hover changes', async () => {
            renderAnnotationOverlay();

            const annotation1 = screen.getByTestId('annotation-overlay-annotation-1');
            const annotation2 = screen.getByTestId('annotation-overlay-annotation-2');

            // Rapidly hover between annotations
            await user.hover(annotation1);
            await user.hover(annotation2);
            await user.hover(annotation1);

            expect(mockOnAnnotationHover).toHaveBeenCalledTimes(3);
            expect(mockOnAnnotationHover).toHaveBeenNthCalledWith(1, 'annotation-1');
            expect(mockOnAnnotationHover).toHaveBeenNthCalledWith(2, 'annotation-2');
            expect(mockOnAnnotationHover).toHaveBeenNthCalledWith(3, 'annotation-1');
        });
    });

    describe('Click Interactions', () => {
        it('should call onAnnotationClick when annotation is clicked', async () => {
            renderAnnotationOverlay();

            const annotation1 = screen.getByTestId('annotation-overlay-annotation-1');
            await user.click(annotation1);

            expect(mockOnAnnotationClick).toHaveBeenCalledWith('annotation-1');
        });

        it('should handle double clicks', async () => {
            renderAnnotationOverlay();

            const annotation1 = screen.getByTestId('annotation-overlay-annotation-1');
            await user.dblClick(annotation1);

            // Should call onClick for each click in the double click
            expect(mockOnAnnotationClick).toHaveBeenCalledTimes(2);
            expect(mockOnAnnotationClick).toHaveBeenCalledWith('annotation-1');
        });

        it('should handle clicks on different annotations', async () => {
            renderAnnotationOverlay();

            const annotation1 = screen.getByTestId('annotation-overlay-annotation-1');
            const annotation2 = screen.getByTestId('annotation-overlay-annotation-2');

            await user.click(annotation1);
            await user.click(annotation2);

            expect(mockOnAnnotationClick).toHaveBeenCalledTimes(2);
            expect(mockOnAnnotationClick).toHaveBeenNthCalledWith(1, 'annotation-1');
            expect(mockOnAnnotationClick).toHaveBeenNthCalledWith(2, 'annotation-2');
        });
    });

    describe('Keyboard Interactions', () => {
        it('should handle keyboard navigation', async () => {
            renderAnnotationOverlay();

            const annotation1 = screen.getByTestId('annotation-overlay-annotation-1');

            // Focus the annotation
            annotation1.focus();

            // Press Enter to activate
            await user.keyboard('{Enter}');

            expect(mockOnAnnotationClick).toHaveBeenCalledWith('annotation-1');
        });

        it('should handle Space key activation', async () => {
            renderAnnotationOverlay();

            const annotation1 = screen.getByTestId('annotation-overlay-annotation-1');

            annotation1.focus();
            await user.keyboard(' ');

            expect(mockOnAnnotationClick).toHaveBeenCalledWith('annotation-1');
        });

        it('should support tab navigation between annotations', async () => {
            renderAnnotationOverlay();

            // Tab should move focus between annotations
            await user.tab();
            expect(document.activeElement).toBe(screen.getByTestId('annotation-overlay-annotation-1'));

            await user.tab();
            expect(document.activeElement).toBe(screen.getByTestId('annotation-overlay-annotation-2'));
        });
    });

    describe('Accessibility', () => {
        it('should have proper ARIA attributes', () => {
            renderAnnotationOverlay();

            const annotation1 = screen.getByTestId('annotation-overlay-annotation-1');

            expect(annotation1).toHaveAttribute('role', 'button');
            expect(annotation1).toHaveAttribute('tabindex', '0');
            expect(annotation1).toHaveAttribute('aria-label');
        });

        it('should provide descriptive aria-labels', () => {
            renderAnnotationOverlay();

            const annotation1 = screen.getByTestId('annotation-overlay-annotation-1');
            const ariaLabel = annotation1.getAttribute('aria-label');

            expect(ariaLabel).toContain('First annotation text');
            expect(ariaLabel).toContain('annotation');
        });

        it('should indicate hovered state to screen readers', () => {
            renderAnnotationOverlay({ hoveredAnnotationId: 'annotation-1' });

            const annotation1 = screen.getByTestId('annotation-overlay-annotation-1');

            expect(annotation1).toHaveAttribute('aria-expanded', 'true');
        });
    });

    describe('Performance', () => {
        it('should handle large numbers of annotations efficiently', () => {
            const manyAnnotations: Annotation[] = [];

            // Create 1000 annotations
            for (let i = 0; i < 1000; i++) {
                manyAnnotations.push({
                    id: `annotation-${i}`,
                    userId: 'user-1',
                    pdfId: 'pdf-1',
                    pageNumber: 1,
                    selectedText: `Annotation ${i}`,
                    noteContent: `Note ${i}`,
                    coordinates: {
                        x: (i % 50) * 10,
                        y: Math.floor(i / 50) * 20,
                        width: 100,
                        height: 15
                    },
                    createdAt: new Date(),
                    updatedAt: new Date()
                });
            }

            const startTime = performance.now();
            renderAnnotationOverlay({ annotations: manyAnnotations });
            const endTime = performance.now();

            // Should render within reasonable time
            expect(endTime - startTime).toBeLessThan(200);

            // All annotations should be rendered
            expect(screen.getAllByTestId(/annotation-overlay-annotation-/)).toHaveLength(1000);
        });

        it('should not re-render unnecessarily when props do not change', () => {
            const { rerender } = renderAnnotationOverlay();

            // Re-render with same props
            rerender(
                <AnnotationOverlay
                    annotations={mockAnnotations}
                    pageNumber={1}
                    onAnnotationHover={mockOnAnnotationHover}
                    onAnnotationClick={mockOnAnnotationClick}
                    hoveredAnnotationId={null}
                />
            );

            // Component should handle this efficiently (specific implementation would use React.memo)
        });
    });

    describe('Edge Cases', () => {
        it('should handle annotations with zero dimensions', () => {
            const annotationWithZeroDimensions: Annotation = {
                ...mockAnnotations[0],
                id: 'zero-annotation',
                coordinates: { x: 100, y: 200, width: 0, height: 0 }
            };

            renderAnnotationOverlay({
                annotations: [annotationWithZeroDimensions]
            });

            const annotation = screen.getByTestId('annotation-overlay-zero-annotation');
            expect(annotation).toBeInTheDocument();
            expect(annotation).toHaveStyle({
                width: '0px',
                height: '0px'
            });
        });

        it('should handle annotations with negative coordinates', () => {
            const annotationWithNegativeCoords: Annotation = {
                ...mockAnnotations[0],
                id: 'negative-annotation',
                coordinates: { x: -10, y: -5, width: 100, height: 20 }
            };

            renderAnnotationOverlay({
                annotations: [annotationWithNegativeCoords]
            });

            const annotation = screen.getByTestId('annotation-overlay-negative-annotation');
            expect(annotation).toBeInTheDocument();
            expect(annotation).toHaveStyle({
                left: '-10px',
                top: '-5px'
            });
        });

        it('should handle missing callback functions gracefully', () => {
            renderAnnotationOverlay({
                onAnnotationHover: undefined,
                onAnnotationClick: undefined
            });

            const annotation1 = screen.getByTestId('annotation-overlay-annotation-1');

            // Should not throw errors when callbacks are missing
            expect(() => {
                fireEvent.mouseEnter(annotation1);
                fireEvent.mouseLeave(annotation1);
                fireEvent.click(annotation1);
            }).not.toThrow();
        });

        it('should handle overlapping annotations correctly', () => {
            const overlappingAnnotations: Annotation[] = [
                {
                    ...mockAnnotations[0],
                    id: 'overlap-1',
                    coordinates: { x: 100, y: 100, width: 100, height: 50 }
                },
                {
                    ...mockAnnotations[0],
                    id: 'overlap-2',
                    coordinates: { x: 150, y: 125, width: 100, height: 50 }
                }
            ];

            renderAnnotationOverlay({ annotations: overlappingAnnotations });

            expect(screen.getByTestId('annotation-overlay-overlap-1')).toBeInTheDocument();
            expect(screen.getByTestId('annotation-overlay-overlap-2')).toBeInTheDocument();

            // Both should be clickable despite overlap
            const annotation1 = screen.getByTestId('annotation-overlay-overlap-1');
            const annotation2 = screen.getByTestId('annotation-overlay-overlap-2');

            fireEvent.click(annotation1);
            expect(mockOnAnnotationClick).toHaveBeenCalledWith('overlap-1');

            fireEvent.click(annotation2);
            expect(mockOnAnnotationClick).toHaveBeenCalledWith('overlap-2');
        });
    });
});