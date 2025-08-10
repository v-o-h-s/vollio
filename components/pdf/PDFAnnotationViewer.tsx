'use client'

/**
 * PDFAnnotationViewer Component
 * 
 * Main PDF viewer component that integrates Syncfusion PDF Viewer with annotation functionality.
 * This component handles:
 * - PDF document loading and display
 * - Text selection detection and processing
 * - Annotation creation workflow
 * - Keyboard shortcuts for PDF navigation and annotation actions
 * - Mobile-responsive annotation creation (tooltip vs dialog)
 * - Error handling and fallback UI states
 * - Zoom and page navigation events
 * 
 * Key Features:
 * - Syncfusion PDF Viewer integration with full feature set
 * - Real-time text selection with coordinate calculation
 * - Redux state management for annotations
 * - Mobile-first responsive design
 * - Keyboard accessibility and shortcuts
 * - Error boundaries and graceful fallbacks
 * 
 * @author Noto Team
 * @version 1.0.0
 */

import React, { useRef, useEffect, useState, useCallback } from 'react'
import {
    PdfViewerComponent,
    Toolbar,
    Magnification,
    Navigation,
    LinkAnnotation,
    BookmarkView,
    ThumbnailView,
    Print,
    TextSelection,
    TextSearch,
    Annotation,
    Inject
} from '@syncfusion/ej2-react-pdfviewer'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { setActiveSelection, showTooltip, hideTooltip, showPreviewCard, hidePreviewCard, setHoveredAnnotation } from '@/lib/store/annotationSlice'
import { selectCurrentPdf, selectAnnotationState } from '@/lib/store/selectors'
import AnnotationOverlay from './AnnotationOverlay'
import MobileAnnotationDialog from './MobileAnnotationDialog'
import { TextSelection as TextSelectionType } from '@/lib/types'
import { AlertCircle, Loader2 } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'
import { useAnnotationKeyboardShortcuts } from '@/hooks/use-keyboard-shortcuts'
import {
    calculateSelectionBounds,
    extractSelectedText,
    getCurrentPageNumber,
    transformCoordinatesForZoom,
    findPdfPageElement
} from '@/lib/utils/pdfCoordinates'
import { PDFErrorBoundary } from '@/components/ErrorBoundary'
import { PDFLoadingIndicator } from '@/components/ui/loading'
import { PDFViewerFallback, TextSelectionFallback, AnnotationCreationFallback } from '@/components/pdf/FallbackUI'
import { pdfNotifications, selectionNotifications, annotationNotifications } from '@/lib/utils/notifications'

/**
 * Props interface for PDFAnnotationViewer component
 */
interface PDFAnnotationViewerProps {
    /** Callback fired when user creates a new annotation from text selection */
    onAnnotationCreate?: (selection: TextSelectionType) => void
    /** Callback fired when user clicks on an existing annotation */
    onAnnotationClick?: (annotationId: string) => void
    /** Array of existing annotations to display as overlays */
    annotations?: any[] // Pass annotations from parent component
}

/**
 * PDFAnnotationViewer component with forwardRef for parent access to PDF viewer instance
 * 
 * Exposes methods:
 * - pdfViewer: Direct access to Syncfusion PDF viewer instance
 * - goToPage(pageNumber): Navigate to specific page
 * - navigateToCoordinates(navigation): Navigate to specific coordinates with highlighting
 */
const PDFAnnotationViewer = React.forwardRef<any, PDFAnnotationViewerProps>(({
    onAnnotationCreate,
    annotations = []
}, ref) => {
    const pdfViewerRef = useRef<PdfViewerComponent>(null)
    const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [pdfDataUrl, setPdfDataUrl] = useState<string>('')
    const [currentPageNumber, setCurrentPageNumber] = useState<number>(1)
    const [showMobileDialog, setShowMobileDialog] = useState(false)
    const [mobileSelectedText, setMobileSelectedText] = useState('')

    const dispatch = useAppDispatch()
    const currentPdf = useAppSelector(selectCurrentPdf)
    const hasAnnotations = annotations.length > 0
    const isMobile = useIsMobile()

    // Keyboard shortcuts for annotation actions
    const keyboardShortcuts = useAnnotationKeyboardShortcuts({
        onCreateNote: () => {
            // Trigger text selection creation if there's an active selection
            const selection = window.getSelection()
            if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
                handleTextSelectionEnd({ source: 'keyboard' })
            }
        },
        onSaveNote: () => {
            // This would be handled by the note editor component
            console.log('Save note shortcut triggered')
        },
        onCancelNote: () => {
            dispatch(hideTooltip())
            dispatch(hidePreviewCard())
            dispatch(setActiveSelection(null))
            setShowMobileDialog(false)
        },
        onNavigateNext: () => {
            if (pdfViewerRef.current) {
                const nextPage = Math.min(currentPageNumber + 1, (pdfViewerRef.current as any).pageCount || currentPageNumber)
                if (nextPage !== currentPageNumber) {
                    (pdfViewerRef.current as any).navigation?.goToPage(nextPage)
                }
            }
        },
        onNavigatePrevious: () => {
            if (pdfViewerRef.current) {
                const prevPage = Math.max(currentPageNumber - 1, 1)
                if (prevPage !== currentPageNumber) {
                    (pdfViewerRef.current as any).navigation?.goToPage(prevPage)
                }
            }
        },
        onToggleSearch: () => {
            if (pdfViewerRef.current) {
                try {
                    const searchModule = (pdfViewerRef.current as any).textSearchModule
                    if (searchModule) {
                        searchModule.showSearchBox(!searchModule.isSearchBoxOpen)
                    }
                } catch (error) {
                    console.warn('Could not toggle search:', error)
                }
            }
        },
        onZoomIn: () => {
            if (pdfViewerRef.current) {
                try {
                    const magnificationModule = (pdfViewerRef.current as any).magnificationModule
                    if (magnificationModule) {
                        magnificationModule.zoomIn()
                    }
                } catch (error) {
                    console.warn('Could not zoom in:', error)
                }
            }
        },
        onZoomOut: () => {
            if (pdfViewerRef.current) {
                try {
                    const magnificationModule = (pdfViewerRef.current as any).magnificationModule
                    if (magnificationModule) {
                        magnificationModule.zoomOut()
                    }
                } catch (error) {
                    console.warn('Could not zoom out:', error)
                }
            }
        },
        onZoomReset: () => {
            if (pdfViewerRef.current) {
                try {
                    const magnificationModule = (pdfViewerRef.current as any).magnificationModule
                    if (magnificationModule) {
                        magnificationModule.fitToPage()
                    }
                } catch (error) {
                    console.warn('Could not reset zoom:', error)
                }
            }
        },
        enabled: !isLoading && !!currentPdf
    })

    // Handle document load success
    const handleDocumentLoad = useCallback(() => {
        console.log('PDF document loaded successfully - setting isLoading to false')

        // Clear any existing timeout
        if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current)
            loadingTimeoutRef.current = null
        }

        // Add a delay to ensure all Syncfusion components are fully initialized
        setTimeout(() => {
            try {
                // Verify the PDF viewer is properly initialized
                if (pdfViewerRef.current && (pdfViewerRef.current as any).viewerBase) {
                    console.log('PDF viewer base initialized successfully')
                    setIsLoading(false)
                    setError(null)
                } else {
                    console.warn('PDF viewer base not yet initialized, retrying...')
                    // Retry after another delay
                    setTimeout(() => {
                        setIsLoading(false)
                        setError(null)
                    }, 500)
                }
            } catch (initError) {
                console.warn('Error checking PDF viewer initialization:', initError)
                setIsLoading(false)
                setError(null)
            }
        }, 200)
    }, [])

    // Handle document load failure
    const handleDocumentLoadFailed = useCallback((args: any) => {
        setIsLoading(false)
        const errorMessage = args.errorDetails || 'Failed to load PDF document'
        setError(errorMessage)
        console.error('PDF document load failed:', errorMessage)
    }, [])

    // Handle text selection start
    const handleTextSelectionStart = useCallback((args: any) => {
        console.log('Text selection started:', args)
        // Hide any existing tooltip when starting new selection
        dispatch(hideTooltip())
    }, [dispatch])

    // Handle text selection end
    const handleTextSelectionEnd = useCallback((args: any) => {
        if (!pdfViewerRef.current || !currentPdf) return

        try {
            console.log('Text selection end event:', args)

            // Get the browser's current selection
            const selection = window.getSelection()
            if (!selection || selection.rangeCount === 0) {
                console.log('No text selection found')
                return
            }

            // Extract selected text
            const selectedText = extractSelectedText(selection)
            if (!selectedText) {
                console.log('No text content in selection')
                return
            }

            // Get the range and find the containing element
            const range = selection.getRangeAt(0)
            const startContainer = range.startContainer
            const element = startContainer.nodeType === Node.TEXT_NODE
                ? startContainer.parentElement as HTMLElement
                : startContainer as HTMLElement

            if (!element) {
                console.log('Could not find containing element')
                return
            }

            // Find the PDF page element
            const pageElement = findPdfPageElement(element)
            if (!pageElement) {
                console.log('Could not find PDF page element')
                return
            }

            // Get current page number - try multiple methods
            let pageNumber = getCurrentPageNumber(element)

            // Fallback to tracked current page number if detection fails
            if (pageNumber === 1 && currentPageNumber > 1) {
                pageNumber = currentPageNumber
            }

            // Try to get page number from Syncfusion API as final fallback
            try {
                if (pdfViewerRef.current && (pdfViewerRef.current as any).currentPageNumber) {
                    pageNumber = (pdfViewerRef.current as any).currentPageNumber
                }
            } catch (apiError) {
                console.warn('Could not get page number from Syncfusion API:', apiError)
            }

            console.log('Detected page number:', pageNumber)

            // Calculate selection bounds
            const bounds = calculateSelectionBounds(selection, pageElement, pageNumber)
            if (!bounds) {
                console.log('Could not calculate selection bounds')
                return
            }

            // Get current zoom level from Syncfusion viewer
            let zoomLevel = 1.0
            try {
                if (pdfViewerRef.current && (pdfViewerRef.current as any).magnificationModule) {
                    zoomLevel = (pdfViewerRef.current as any).magnificationModule.zoomFactor || 1.0
                }
            } catch (zoomError) {
                console.warn('Could not get zoom level, using default:', zoomError)
            }

            // Transform coordinates for zoom level
            const transformedCoordinates = transformCoordinatesForZoom(bounds, zoomLevel)

            // Create text selection object
            const textSelection: TextSelectionType = {
                text: selectedText,
                pageNumber: pageNumber,
                coordinates: transformedCoordinates,
                pdfId: currentPdf.id
            }

            console.log('Text selection completed:', textSelection)

            // Update Redux state
            dispatch(setActiveSelection(textSelection))

            // Handle mobile vs desktop differently
            if (isMobile) {
                // On mobile, show full-screen dialog instead of tooltip
                setMobileSelectedText(selectedText)
                setShowMobileDialog(true)
            } else {
                // Calculate tooltip position in viewport coordinates
                const pageRect = pageElement.getBoundingClientRect()
                const tooltipX = pageRect.left + bounds.x + bounds.width / 2
                const tooltipY = pageRect.top + bounds.y - 10 // Position above selection

                // Show tooltip at selection position
                dispatch(showTooltip({ x: tooltipX, y: tooltipY }))
            }

            // Call callback if provided
            if (onAnnotationCreate) {
                onAnnotationCreate(textSelection)
            }

        } catch (error) {
            console.error('Error handling text selection:', error)
        }
    }, [currentPdf, dispatch, onAnnotationCreate, currentPageNumber, isMobile])

    // Handle page change
    const handlePageChange = useCallback((args: any) => {
        const newPageNumber = args.currentPageNumber || 1
        console.log('Page changed to:', newPageNumber)
        setCurrentPageNumber(newPageNumber)
        // Hide tooltip when page changes
        dispatch(hideTooltip())
    }, [dispatch])

    // Handle zoom change
    const handleZoomChange = useCallback((args: any) => {
        console.log('Zoom changed to:', args.zoomValue)
        // Hide tooltip when zoom changes
        dispatch(hideTooltip())
    }, [dispatch])

    // Convert blob URL to base64 data URL for better Syncfusion compatibility
    useEffect(() => {
        if (currentPdf?.fileUrl && currentPdf.fileUrl.startsWith('blob:')) {
            setIsLoading(true)
            setError(null)
            setPdfDataUrl('')

            // Convert blob URL to base64 data URL
            fetch(currentPdf.fileUrl)
                .then(response => response.blob())
                .then(blob => {
                    const reader = new FileReader()
                    reader.onload = () => {
                        const base64DataUrl = reader.result as string
                        // Add a small delay to ensure Syncfusion components are ready
                        setTimeout(() => {
                            setPdfDataUrl(base64DataUrl)
                            console.log('PDF converted to base64 data URL', {
                                size: base64DataUrl.length,
                                preview: base64DataUrl.substring(0, 100) + '...'
                            })
                        }, 100)
                    }
                    reader.onerror = () => {
                        console.error('Error converting PDF to base64')
                        setError('Failed to process PDF file')
                        setIsLoading(false)
                    }
                    reader.readAsDataURL(blob)
                })
                .catch(error => {
                    console.error('Error fetching PDF blob:', error)
                    setError('Failed to load PDF file')
                    setIsLoading(false)
                })

            // Add a timeout fallback in case documentLoad callback never fires
            loadingTimeoutRef.current = setTimeout(() => {
                console.warn('PDF loading timeout - forcing loading state to false')
                setIsLoading(false)
                loadingTimeoutRef.current = null
            }, 15000) // Increased to 15 second timeout

            return () => {
                if (loadingTimeoutRef.current) {
                    clearTimeout(loadingTimeoutRef.current)
                    loadingTimeoutRef.current = null
                }
            }
        } else if (currentPdf?.fileUrl) {
            // For non-blob URLs, use directly with delay
            const fileUrl = currentPdf.fileUrl
            if (fileUrl) {
                setTimeout(() => {
                    setPdfDataUrl(fileUrl)
                    setIsLoading(true)
                    setError(null)
                }, 100)
            }
        }
    }, [currentPdf])

    // Add mouse and touch event listeners for text selection detection
    useEffect(() => {
        const handleMouseUp = (event: MouseEvent) => {
            // Small delay to ensure selection is complete
            setTimeout(() => {
                const selection = window.getSelection()
                if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
                    // Check if the selection is within the PDF viewer
                    const pdfViewerElement = document.getElementById('pdf-annotation-viewer')
                    if (pdfViewerElement && pdfViewerElement.contains(event.target as Node)) {
                        // Trigger the same logic as textSelectionEnd
                        handleTextSelectionEnd({ source: 'mouseup' })
                    }
                }
            }, 50)
        }

        const handleTouchEnd = (event: TouchEvent) => {
            // On mobile, handle touch-based text selection
            if (isMobile) {
                setTimeout(() => {
                    const selection = window.getSelection()
                    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
                        // Check if the selection is within the PDF viewer
                        const pdfViewerElement = document.getElementById('pdf-annotation-viewer')
                        if (pdfViewerElement && pdfViewerElement.contains(event.target as Node)) {
                            // Trigger the same logic as textSelectionEnd
                            handleTextSelectionEnd({ source: 'touchend' })
                        }
                    }
                }, 100) // Slightly longer delay for touch events
            }
        }

        // Add event listeners
        document.addEventListener('mouseup', handleMouseUp)
        document.addEventListener('touchend', handleTouchEnd, { passive: true })

        return () => {
            document.removeEventListener('mouseup', handleMouseUp)
            document.removeEventListener('touchend', handleTouchEnd)
        }
    }, [handleTextSelectionEnd, currentPageNumber, isMobile])

    // Handle annotation hover events
    const handleAnnotationHover = useCallback((annotationId: string | null, position?: { x: number; y: number }) => {
        if (annotationId && position) {
            dispatch(setHoveredAnnotation(annotationId))
            dispatch(showPreviewCard({ annotationId, position }))
        } else {
            dispatch(setHoveredAnnotation(null))
            dispatch(hidePreviewCard())
        }
    }, [dispatch])

    // Handle annotation click events
    const handleAnnotationClick = useCallback((annotationId: string) => {
        // For now, just log the click - this will be expanded in future tasks
        console.log('Annotation clicked:', annotationId)
        // Could open note editor or show full annotation details
    }, [])

    // Handle mobile dialog actions
    const handleMobileCreateNote = useCallback(() => {
        setShowMobileDialog(false)
        // The note creation logic will be handled by the parent component
        // through the onAnnotationCreate callback which was already called
        console.log('Mobile note creation confirmed')
    }, [])

    const handleMobileDialogClose = useCallback(() => {
        setShowMobileDialog(false)
        setMobileSelectedText('')
        // Clear the active selection when dialog is closed
        dispatch(setActiveSelection(null))
    }, [dispatch])

    // Create temporary highlight for navigation feedback
    const createNavigationHighlight = useCallback((navigation: {
        page: number;
        x: number;
        y: number;
        width: number;
        height: number;
    }, zoomFactor: number = 1.0) => {
        try {
            // Find the page element using multiple selectors
            const pageSelectors = [
                `#pdf-annotation-viewer .e-pv-page-container [data-page-number="${navigation.page}"]`,
                `#pdf-annotation-viewer [data-page="${navigation.page}"]`,
                `#pdf-annotation-viewer .e-pv-page[data-page-number="${navigation.page}"]`,
                `#pdf-annotation-viewer .page-${navigation.page}`
            ]

            let pageElement: Element | null = null
            for (const selector of pageSelectors) {
                pageElement = document.querySelector(selector)
                if (pageElement) {
                    console.log(`Found page element for highlight using selector: ${selector}`)
                    break
                }
            }

            if (pageElement) {
                const highlight = document.createElement('div')

                // Apply zoom factor to coordinates
                const scaledX = navigation.x * zoomFactor
                const scaledY = navigation.y * zoomFactor
                const scaledWidth = navigation.width * zoomFactor
                const scaledHeight = navigation.height * zoomFactor

                highlight.style.position = 'absolute'
                highlight.style.left = `${scaledX}px`
                highlight.style.top = `${scaledY}px`
                highlight.style.width = `${scaledWidth}px`
                highlight.style.height = `${scaledHeight}px`
                highlight.style.backgroundColor = 'rgba(59, 130, 246, 0.3)'
                highlight.style.border = '2px solid #3b82f6'
                highlight.style.borderRadius = '4px'
                highlight.style.pointerEvents = 'none'
                highlight.style.zIndex = '1000'
                highlight.style.transition = 'opacity 0.3s ease-in-out'
                highlight.className = 'pdf-navigation-highlight'

                // Add pulsing animation
                highlight.style.animation = 'pulse 2s ease-in-out infinite'

                pageElement.appendChild(highlight)

                console.log(`Created navigation highlight at: x=${scaledX}, y=${scaledY}, w=${scaledWidth}, h=${scaledHeight} (zoom: ${zoomFactor})`)

                // Fade out and remove highlight after 3 seconds
                setTimeout(() => {
                    highlight.style.opacity = '0'
                    setTimeout(() => {
                        if (highlight.parentNode) {
                            highlight.parentNode.removeChild(highlight)
                        }
                    }, 300) // Wait for fade out transition
                }, 2700) // Start fade out after 2.7 seconds

            } else {
                console.warn(`Could not find page element for navigation highlight on page ${navigation.page}`)
            }
        } catch (error) {
            console.warn('Could not create navigation highlight overlay:', error)
        }
    }, [])

    // Expose PDF viewer instance through ref
    React.useImperativeHandle(ref, () => ({
        // Expose the Syncfusion PDF viewer instance
        get pdfViewer() {
            return pdfViewerRef.current
        },
        // Enhanced navigation methods
        goToPage: (pageNumber: number) => {
            if (pdfViewerRef.current) {
                try {
                    // Method 1: Use Syncfusion's navigation module
                    if (pdfViewerRef.current.navigation && typeof pdfViewerRef.current.navigation.goToPage === 'function') {
                        pdfViewerRef.current.navigation.goToPage(pageNumber)
                        return true
                    }
                    // Method 2: Direct goToPage method
                    else if (typeof (pdfViewerRef.current as any).goToPage === 'function') {
                        (pdfViewerRef.current as any).goToPage(pageNumber)
                        return true
                    }
                    // Method 3: Use pdfViewer property if available
                    else if ((pdfViewerRef.current as any).pdfViewer && typeof (pdfViewerRef.current as any).pdfViewer.goToPage === 'function') {
                        (pdfViewerRef.current as any).pdfViewer.goToPage(pageNumber)
                        return true
                    }
                    // Method 4: Try accessing the underlying Syncfusion instance
                    else if ((pdfViewerRef.current as any).element && (pdfViewerRef.current as any).element.ej2_instances && (pdfViewerRef.current as any).element.ej2_instances[0]) {
                        const instance = (pdfViewerRef.current as any).element.ej2_instances[0]
                        if (instance.navigation && typeof instance.navigation.goToPage === 'function') {
                            instance.navigation.goToPage(pageNumber)
                            return true
                        }
                    }
                    return false
                } catch (error) {
                    console.error('Error navigating to page:', error)
                    return false
                }
            }
            return false
        },
        // Navigate to specific coordinates with enhanced error handling
        navigateToCoordinates: (navigation: {
            page: number;
            x: number;
            y: number;
            width: number;
            height: number;
        }) => {
            if (!pdfViewerRef.current || !currentPdf) {
                console.warn('PDF viewer or PDF not ready for coordinate navigation')
                return false
            }

            try {
                const viewer = pdfViewerRef.current

                // Validate navigation parameters
                if (navigation.page < 1) {
                    console.warn('Invalid page number, defaulting to page 1')
                    navigation.page = 1
                }

                if (navigation.x < 0 || navigation.y < 0 || navigation.width <= 0 || navigation.height <= 0) {
                    console.warn('Invalid coordinates, using page navigation only:', navigation)
                }

                // Navigate to the specific page first using multiple fallback methods
                let navigationSuccess = false

                // Method 1: Use Syncfusion's navigation module
                if (viewer.navigation && typeof viewer.navigation.goToPage === 'function') {
                    console.log(`Navigating to page ${navigation.page} using navigation module`)
                    viewer.navigation.goToPage(navigation.page)
                    navigationSuccess = true
                }
                // Method 2: Direct goToPage method
                else if (typeof (viewer as any).goToPage === 'function') {
                    console.log(`Navigating to page ${navigation.page} using direct method`)
                        ; (viewer as any).goToPage(navigation.page)
                    navigationSuccess = true
                }
                // Method 3: Use pdfViewer property if available
                else if ((viewer as any).pdfViewer && typeof (viewer as any).pdfViewer.goToPage === 'function') {
                    console.log(`Navigating to page ${navigation.page} using pdfViewer property`)
                        ; (viewer as any).pdfViewer.goToPage(navigation.page)
                    navigationSuccess = true
                }
                // Method 4: Try accessing the underlying Syncfusion instance
                else if ((viewer as any).element && (viewer as any).element.ej2_instances && (viewer as any).element.ej2_instances[0]) {
                    const instance = (viewer as any).element.ej2_instances[0]
                    if (instance.navigation && typeof instance.navigation.goToPage === 'function') {
                        console.log(`Navigating to page ${navigation.page} using ej2 instance`)
                        instance.navigation.goToPage(navigation.page)
                        navigationSuccess = true
                    }
                }

                if (!navigationSuccess) {
                    console.error('Failed to navigate to page - no available navigation method')
                    return false
                }

                // Wait for page navigation to complete, then scroll to coordinates
                setTimeout(() => {
                    try {
                        // Skip coordinate scrolling if coordinates are invalid
                        if (navigation.x < 0 || navigation.y < 0 || navigation.width <= 0 || navigation.height <= 0) {
                            console.log('Skipping coordinate scroll due to invalid coordinates')
                            return
                        }

                        // Get current zoom factor for coordinate transformation
                        let zoomFactor = 1.0
                        if ((viewer as any).magnificationModule && (viewer as any).magnificationModule.zoomFactor) {
                            zoomFactor = (viewer as any).magnificationModule.zoomFactor
                        } else if ((viewer as any).magnification && (viewer as any).magnification.zoomFactor) {
                            zoomFactor = (viewer as any).magnification.zoomFactor
                        }

                        // Find the scroll container using multiple selectors
                        const scrollSelectors = [
                            '#pdf-annotation-viewer .e-pv-page-container',
                            '#pdf-annotation-viewer .e-pv-viewer-container',
                            '#pdf-annotation-viewer .e-pv-content',
                            '#pdf-annotation-viewer [data-testid="page-container"]'
                        ]

                        let scrollContainer: Element | null = null
                        for (const selector of scrollSelectors) {
                            scrollContainer = document.querySelector(selector)
                            if (scrollContainer) {
                                console.log(`Found scroll container using selector: ${selector}`)
                                break
                            }
                        }

                        if (scrollContainer) {
                            // Transform coordinates based on zoom level
                            const targetY = navigation.y * zoomFactor
                            const targetX = navigation.x * zoomFactor

                            // Scroll to position with offset for better visibility
                            const offsetY = Math.max(0, targetY - 100)
                            const offsetX = Math.max(0, targetX - 50)

                            scrollContainer.scrollTop = offsetY
                            scrollContainer.scrollLeft = offsetX

                            console.log(`Scrolled to coordinates: x=${navigation.x}, y=${navigation.y} (zoom: ${zoomFactor}, actual: ${offsetX}, ${offsetY})`)

                            // Create temporary highlight for visual feedback
                            createNavigationHighlight(navigation, zoomFactor)
                        } else {
                            console.warn('Could not find scroll container with any selector')
                        }

                    } catch (scrollError) {
                        console.warn('Could not scroll to coordinates:', scrollError)
                    }
                }, 1000) // Increased timeout for better reliability

                return true
            } catch (error) {
                console.error('Error navigating to coordinates:', error)
                return false
            }
        },
        // Magnification methods
        get magnificationModule() {
            return pdfViewerRef.current ? (pdfViewerRef.current as any).magnificationModule : null
        },
        // Get current zoom factor
        get zoomFactor() {
            try {
                if (pdfViewerRef.current) {
                    const magnificationModule = (pdfViewerRef.current as any).magnificationModule
                    return magnificationModule?.zoomFactor || 1.0
                }
            } catch (error) {
                console.warn('Could not get zoom factor:', error)
            }
            return 1.0
        },
        // Current state getters
        get currentPageNumber() {
            return currentPageNumber
        },
        get isLoading() {
            return isLoading
        },
        // Check if PDF is ready for navigation
        get isReady() {
            return !isLoading && !!currentPdf && !!pdfViewerRef.current
        }
    }), [currentPageNumber, isLoading, currentPdf])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            dispatch(hideTooltip())
            dispatch(hidePreviewCard())
            dispatch(setHoveredAnnotation(null))
        }
    }, [dispatch])

    // Show loading state
    if (!currentPdf) {
        return (
            <div className="flex items-center justify-center h-96 bg-gray-50 rounded-xl">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={28} className="text-gray-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No PDF Selected</h3>
                    <p className="text-gray-600">Please upload a PDF to start viewing and annotating.</p>
                </div>
            </div>
        )
    }

    // Show error state with enhanced fallback UI
    if (error) {
        return (
            <PDFViewerFallback
                error={error}
                fileName={currentPdf?.filename}
                onRetry={() => {
                    setError(null)
                    setIsLoading(true)
                    if (pdfViewerRef.current && currentPdf?.fileUrl) {
                        pdfNotifications.loadingStart()
                        pdfViewerRef.current.load(currentPdf.fileUrl, '')
                    }
                }}
                onUploadNew={() => {
                    // This would trigger the parent component to show upload UI
                    window.location.reload()
                }}
            />
        )
    }

    return (
        <PDFErrorBoundary
            onError={(error, errorInfo) => {
                console.error('PDF viewer error boundary triggered:', error, errorInfo)
                pdfNotifications.processingError()
            }}
        >
            <div className="relative w-full h-full bg-white rounded-xl border border-gray-200 overflow-hidden">
                {/* Enhanced loading overlay */}
                {isLoading && (
                    <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-50">
                        <PDFLoadingIndicator
                            stage="rendering"
                            fileName={currentPdf?.filename}
                        />
                        <button
                            onClick={() => {
                                console.log('Manual loading dismiss clicked')
                                setIsLoading(false)
                            }}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm"
                        >
                            Click here if PDF has loaded
                        </button>
                    </div>
                )}

                {/* Syncfusion PDF Viewer with enhanced error handling */}
                {pdfDataUrl && (
                    <div key={`pdf-viewer-${currentPdf?.id}`} style={{ height: '100%', width: '100%' }}>
                        <PdfViewerComponent
                            id="pdf-annotation-viewer"
                            ref={pdfViewerRef}
                            documentPath={pdfDataUrl}
                            serviceUrl=""
                            resourceUrl={`${window.location.protocol}//${window.location.host}/lib`}
                            style={{ height: '100%', width: '100%' }}
                            documentLoad={handleDocumentLoad}
                            documentLoadFailed={handleDocumentLoadFailed}
                            textSelectionStart={handleTextSelectionStart}
                            textSelectionEnd={handleTextSelectionEnd}
                            pageChange={handlePageChange}
                            zoomChange={handleZoomChange}
                            enableTextSelection={true}
                            enableHyperlink={false}
                            enableNavigationToolbar={true}
                            enableCommentPanel={false}
                            enableThumbnail={true}
                            enableBookmark={true}
                            enableTextSearch={true}
                            enablePrint={true}
                            enableDownload={false}
                            enableAnnotationToolbar={false}
                            enableFormDesignerToolbar={false}
                            enableFreeText={false}
                            enableTextMarkupAnnotation={false}
                            enableShapeAnnotation={false}
                            enableMeasureAnnotation={false}
                            restrictZoomRequest={false}
                            // Add error handling props
                            created={() => {
                                console.log('PDF Viewer component created successfully')
                            }}
                            ajaxRequestFailed={(args: any) => {
                                console.error('PDF Viewer AJAX request failed:', args)
                                setError('Failed to load PDF viewer resources')
                                setIsLoading(false)
                            }}
                        >
                            <Inject services={[
                                Toolbar,
                                Magnification,
                                Navigation,
                                LinkAnnotation,
                                BookmarkView,
                                ThumbnailView,
                                Print,
                                TextSelection,
                                TextSearch,
                                Annotation
                            ]} />
                        </PdfViewerComponent>
                    </div>
                )}

                {/* Annotation Overlay */}
                {hasAnnotations && (
                    <AnnotationOverlay
                        pageNumber={currentPageNumber}
                        pdfViewerRef={pdfViewerRef}
                        onAnnotationHover={handleAnnotationHover}
                        onAnnotationClick={handleAnnotationClick}
                    />
                )}

                {/* Mobile Annotation Dialog */}
                {showMobileDialog && (
                    <MobileAnnotationDialog
                        visible={showMobileDialog}
                        selectedText={mobileSelectedText}
                        onCreateNote={handleMobileCreateNote}
                        onClose={handleMobileDialogClose}
                    />
                )}
            </div>
        </PDFErrorBoundary>
    )
})

PDFAnnotationViewer.displayName = 'PDFAnnotationViewer'

export default PDFAnnotationViewer