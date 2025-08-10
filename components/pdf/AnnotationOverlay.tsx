'use client'

/**
 * AnnotationOverlay Component
 * 
 * Renders interactive annotation highlights over PDF pages.
 * This component handles:
 * - Positioning annotation highlights over PDF text
 * - Zoom-aware coordinate transformation
 * - Mouse/touch interaction handling
 * - Mobile-responsive touch targets
 * - Real-time overlay positioning updates
 * 
 * Key Features:
 * - RTK Query integration for annotation data
 * - Dynamic positioning based on PDF viewer zoom/scroll
 * - Touch-friendly interaction on mobile devices
 * - Hover effects and visual feedback
 * - Accessibility support with keyboard navigation
 * 
 * @author Noto Team
 * @version 1.0.0
 */

import React, { useEffect, useState, useRef } from 'react'
import { useAppSelector } from '@/lib/store/hooks'
import { useGetAnnotationsQuery } from '@/lib/store/apiSlice'
import { Annotation, Rectangle } from '@/lib/types'
import { useIsMobile } from '@/hooks/use-mobile'
import {
    getCurrentZoomLevel,
    getPdfViewerScrollPosition,
    transformCoordinatesForDisplay
} from '@/lib/utils/pdfCoordinates'

/**
 * Props interface for AnnotationOverlay component
 */
interface AnnotationOverlayProps {
    /** PDF page number to render annotations for */
    pageNumber: number
    /** Reference to the PDF viewer component for coordinate calculations */
    pdfViewerRef: React.RefObject<any>
    /** Callback fired when user hovers over an annotation */
    onAnnotationHover?: (annotationId: string | null, position?: { x: number; y: number }) => void
    /** Callback fired when user clicks on an annotation */
    onAnnotationClick?: (annotationId: string) => void
}

/**
 * Internal interface for annotation highlight rendering data
 */
interface AnnotationHighlight {
    /** The annotation data from the database */
    annotation: Annotation
    /** Calculated CSS styles for positioning and appearance */
    style: React.CSSProperties
    /** Whether the highlight should be visible (for future filtering) */
    isVisible: boolean
}

export default function AnnotationOverlay({
    pageNumber,
    pdfViewerRef,
    onAnnotationHover,
    onAnnotationClick
}: AnnotationOverlayProps) {
    const currentPdf = useAppSelector((state) => state.annotations.currentPdf)
    const isMobile = useIsMobile()

    // Use RTK Query to get annotations for the current PDF and page
    const {
        data: allAnnotations = [],
        isLoading,
        error
    } = useGetAnnotationsQuery(
        { pdfId: currentPdf?.id || '', pageNumber },
        { skip: !currentPdf?.id }
    )

    // Filter annotations for this specific page (RTK Query might return all annotations)
    const annotations = allAnnotations.filter(ann => ann.pageNumber === pageNumber)

    const [highlights, setHighlights] = useState<AnnotationHighlight[]>([])
    const [currentZoom, setCurrentZoom] = useState<number>(1.0)
    const overlayRef = useRef<HTMLDivElement>(null)

    // Update zoom level when PDF viewer zoom changes
    useEffect(() => {
        const updateZoomLevel = () => {
            if (pdfViewerRef.current) {
                try {
                    const magnificationModule = (pdfViewerRef.current as any).magnificationModule
                    if (magnificationModule) {
                        const zoomFactor = magnificationModule.zoomFactor || 1.0
                        setCurrentZoom(zoomFactor)
                    }
                } catch (error) {
                    console.warn('Could not get zoom level from PDF viewer:', error)
                }
            }
        }

        // Initial zoom level
        updateZoomLevel()

        // Set up interval to check for zoom changes
        const zoomCheckInterval = setInterval(updateZoomLevel, 500)

        return () => {
            clearInterval(zoomCheckInterval)
        }
    }, [pdfViewerRef])

    // Calculate highlight positions and styles
    useEffect(() => {
        const calculateHighlights = () => {
            if (!annotations.length) {
                setHighlights([])
                return
            }

            const newHighlights: AnnotationHighlight[] = []

            // Get current zoom level and scroll position
            const zoomLevel = getCurrentZoomLevel(pdfViewerRef)
            const scrollPosition = getPdfViewerScrollPosition()

            annotations.forEach(annotation => {
                // Transform coordinates based on current zoom level and scroll position
                const transformedCoords = transformCoordinatesForDisplay(
                    annotation.coordinates,
                    zoomLevel,
                    scrollPosition
                )

                // Calculate absolute positioning style
                const style: React.CSSProperties = {
                    position: 'absolute',
                    left: `${transformedCoords.x}px`,
                    top: `${transformedCoords.y}px`,
                    width: `${transformedCoords.width}px`,
                    height: `${transformedCoords.height}px`,
                    backgroundColor: 'rgba(59, 130, 246, 0.2)', // Blue background with transparency
                    borderBottom: '2px solid #3b82f6', // Blue underline
                    pointerEvents: 'auto',
                    cursor: 'pointer',
                    transition: 'all 200ms ease-in-out',
                    borderRadius: '2px',
                    zIndex: 10
                }

                newHighlights.push({
                    annotation,
                    style,
                    isVisible: true
                })
            })

            setHighlights(newHighlights)
        }

        calculateHighlights()
    }, [annotations, currentZoom, pdfViewerRef])

    // Handle mouse and touch events for highlights
    const handleHighlightMouseEnter = (annotation: Annotation, event: React.MouseEvent) => {
        // Don't show hover effects on mobile - use tap instead
        if (isMobile) return

        if (onAnnotationHover) {
            const rect = event.currentTarget.getBoundingClientRect()
            onAnnotationHover(annotation.id, {
                x: rect.left + rect.width / 2,
                y: rect.top - 10
            })
        }

        // Update highlight style on hover
        setHighlights(prev => prev.map(highlight =>
            highlight.annotation.id === annotation.id
                ? {
                    ...highlight,
                    style: {
                        ...highlight.style,
                        backgroundColor: 'rgba(59, 130, 246, 0.3)', // Darker on hover
                        transform: 'scale(1.02)', // Slight scale effect
                    }
                }
                : highlight
        ))
    }

    const handleHighlightMouseLeave = (annotation: Annotation) => {
        // Don't handle mouse leave on mobile
        if (isMobile) return

        if (onAnnotationHover) {
            onAnnotationHover(null)
        }

        // Reset highlight style
        setHighlights(prev => prev.map(highlight =>
            highlight.annotation.id === annotation.id
                ? {
                    ...highlight,
                    style: {
                        ...highlight.style,
                        backgroundColor: 'rgba(59, 130, 246, 0.2)',
                        transform: 'scale(1)',
                    }
                }
                : highlight
        ))
    }

    const handleHighlightClick = (annotation: Annotation, event: React.MouseEvent) => {
        event.preventDefault()
        event.stopPropagation()

        if (onAnnotationClick) {
            onAnnotationClick(annotation.id)
        }
    }

    // Handle touch events for mobile
    const handleHighlightTouchStart = (annotation: Annotation, event: React.TouchEvent) => {
        if (!isMobile) return

        // Provide visual feedback on touch
        setHighlights(prev => prev.map(highlight =>
            highlight.annotation.id === annotation.id
                ? {
                    ...highlight,
                    style: {
                        ...highlight.style,
                        backgroundColor: 'rgba(59, 130, 246, 0.4)', // Darker on touch
                        transform: 'scale(1.05)', // Slightly larger scale for touch
                    }
                }
                : highlight
        ))
    }

    const handleHighlightTouchEnd = (annotation: Annotation, event: React.TouchEvent) => {
        if (!isMobile) return

        // Reset highlight style after touch
        setTimeout(() => {
            setHighlights(prev => prev.map(highlight =>
                highlight.annotation.id === annotation.id
                    ? {
                        ...highlight,
                        style: {
                            ...highlight.style,
                            backgroundColor: 'rgba(59, 130, 246, 0.2)',
                            transform: 'scale(1)',
                        }
                    }
                    : highlight
            ))
        }, 150)

        // Show preview card on touch
        if (onAnnotationHover) {
            const rect = event.currentTarget.getBoundingClientRect()
            onAnnotationHover(annotation.id, {
                x: rect.left + rect.width / 2,
                y: rect.top - 10
            })
        }
    }

    // Find the PDF page element for this page number
    const findPageElement = (): HTMLElement | null => {
        try {
            // Look for Syncfusion PDF viewer page elements
            const pageSelectors = [
                `[data-page-number="${pageNumber}"]`,
                `#pageDiv_${pageNumber - 1}`, // Syncfusion uses 0-based indexing
                `.e-pv-page-container:nth-child(${pageNumber})`,
                `[id*="pageDiv"]:nth-child(${pageNumber})`
            ]

            for (const selector of pageSelectors) {
                const element = document.querySelector(selector) as HTMLElement
                if (element) {
                    return element
                }
            }

            // Fallback: get all page elements and select by index
            const allPages = document.querySelectorAll('[id*="pageDiv"], .e-pv-page-container')
            if (allPages[pageNumber - 1]) {
                return allPages[pageNumber - 1] as HTMLElement
            }

            return null
        } catch (error) {
            console.error('Error finding page element:', error)
            return null
        }
    }

    // Position overlay relative to PDF page
    useEffect(() => {
        const positionOverlay = () => {
            const pageElement = findPageElement()
            const overlay = overlayRef.current

            if (!pageElement || !overlay) {
                return
            }

            try {
                const pageRect = pageElement.getBoundingClientRect()
                const viewerContainer = document.getElementById('pdf-annotation-viewer')

                if (!viewerContainer) {
                    return
                }

                const containerRect = viewerContainer.getBoundingClientRect()

                // Position overlay to match the PDF page
                overlay.style.position = 'absolute'
                overlay.style.left = `${pageRect.left - containerRect.left}px`
                overlay.style.top = `${pageRect.top - containerRect.top}px`
                overlay.style.width = `${pageRect.width}px`
                overlay.style.height = `${pageRect.height}px`
                overlay.style.pointerEvents = 'none' // Allow clicks to pass through to PDF
            } catch (error) {
                console.error('Error positioning overlay:', error)
            }
        }

        // Initial positioning
        positionOverlay()

        // Update positioning on scroll and resize
        const handleScroll = () => positionOverlay()
        const handleResize = () => positionOverlay()

        const viewerContainer = document.getElementById('pdf-annotation-viewer')
        if (viewerContainer) {
            viewerContainer.addEventListener('scroll', handleScroll)
            window.addEventListener('resize', handleResize)

            return () => {
                viewerContainer.removeEventListener('scroll', handleScroll)
                window.removeEventListener('resize', handleResize)
            }
        }
    }, [pageNumber, highlights])

    if (!highlights.length) {
        return null
    }

    return (
        <div
            ref={overlayRef}
            className="annotation-overlay"
            style={{
                position: 'absolute',
                pointerEvents: 'none',
                zIndex: 5
            }}
        >
            {highlights.map(({ annotation, style }) => (
                <div
                    key={annotation.id}
                    className={`annotation-highlight ${isMobile ? 'touch-friendly' : ''}`}
                    style={{
                        ...style,
                        // Make highlights larger and more touch-friendly on mobile
                        minHeight: isMobile ? '44px' : style.height,
                        minWidth: isMobile ? '44px' : style.width,
                    }}
                    onMouseEnter={(e) => handleHighlightMouseEnter(annotation, e)}
                    onMouseLeave={() => handleHighlightMouseLeave(annotation)}
                    onClick={(e) => handleHighlightClick(annotation, e)}
                    onTouchStart={(e) => handleHighlightTouchStart(annotation, e)}
                    onTouchEnd={(e) => handleHighlightTouchEnd(annotation, e)}
                    onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            handleHighlightClick(annotation, e as any)
                        }
                    }}
                    title={`Annotation: ${annotation.selectedText.substring(0, 50)}${annotation.selectedText.length > 50 ? '...' : ''}`}
                    aria-label={`Annotation on "${annotation.selectedText.substring(0, 50)}${annotation.selectedText.length > 50 ? '...' : ''}". Press Enter to view details.`}
                    role="button"
                    tabIndex={0}
                />
            ))}
        </div>
    )
}

