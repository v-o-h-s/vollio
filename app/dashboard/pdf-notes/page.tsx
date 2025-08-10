'use client'

/**
 * PDF Notes Page Component
 * 
 * Main page component for the PDF annotation and note-taking interface.
 * This component serves as the central hub for PDF document management and annotation workflow.
 * 
 * Key Responsibilities:
 * - PDF file upload and validation (drag & drop, file picker)
 * - PDF document display using PDFAnnotationViewer component
 * - Annotation creation workflow management
 * - Cross-tab communication for note editing
 * - URL-based navigation to specific PDF coordinates
 * - Error handling and user feedback
 * - State management integration with Redux store
 * 
 * Features:
 * - Drag & drop PDF upload with validation (50MB limit, PDF format only)
 * - Real-time annotation display and interaction
 * - Cross-tab navigation support for note editor integration
 * - URL parameter parsing for direct coordinate navigation
 * - Mobile-responsiv e design with touch-friendly interactions
 * - Comprehensive error handling with user-friendly messages
 * - Loading states and progress indicators
 * - Keyboard shortcuts and accessibility support
 * 
 * Navigation Support:
 * - URL hash navigation: #pdf?page=3&x=120&y=450&width=200&height=18
 * - PostMessage API for cross-tab communication
 * - Automatic coordinate highlighting for visual feedback
 * 
 * @author Noto Team
 * @version 1.0.0
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Upload, FileText, BookOpen, Search, Filter, Grid, List, AlertCircle, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { setPdfDocument, clearPdfDocument, hideTooltip, hidePreviewCard, clearActiveSelection } from '@/lib/store/annotationSlice'
import { selectTooltipState, selectActiveSelection, selectPreviewCard, selectPreviewCardAnnotationId } from '@/lib/store/selectors'
import { useGetAnnotationsQuery, useCreateAnnotationMutation } from '@/lib/store/apiSlice'
import { PDFDocument } from '@/lib/types'
import PDFAnnotationViewer from '@/components/pdf/PDFAnnotationViewer'
import AnnotationTooltip from '@/components/pdf/AnnotationTooltip'
import AnnotationPreviewCard from '@/components/pdf/AnnotationPreviewCard'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { PDFLoadingIndicator, AnnotationLoadingIndicator } from '@/components/ui/loading'
import { isValidNavigationMessage, validateNavigationParams } from '@/lib/utils/crossTabNavigation'
import { pdfNotifications, selectionNotifications, annotationNotifications } from '@/lib/utils/notifications'


/** Maximum allowed file size for PDF uploads (50MB) */
const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB in bytes

/**
 * Interface for upload error handling
 * Provides structured error information for different failure scenarios
 */
interface UploadError {
    /** Type of error that occurred during upload */
    type: 'size' | 'format' | 'general'
    /** Human-readable error message to display to user */
    message: string
}

/**
 * Main PDF Notes Page Component
 * 
 * Manages the complete PDF annotation workflow from upload to note creation.
 * Integrates with Redux store for state management and provides cross-tab communication.
 */
export default function PDFNotesPage() {
    // UI State Management
    /** Whether user is currently dragging a file over the drop zone */
    const [isDragOver, setIsDragOver] = useState(false)
    /** Whether a PDF upload is currently in progress */
    const [isUploading, setIsUploading] = useState(false)
    /** Current upload error state, if any */
    const [uploadError, setUploadError] = useState<UploadError | null>(null)

    /** 
     * Navigation coordinates to execute once PDF viewer is ready
     * Used for cross-tab communication and URL parameter navigation
     */
    const [pendingNavigation, setPendingNavigation] = useState<{
        page: number;
        x: number;
        y: number;
        width: number;
        height: number;
    } | null>(null)

    // Component References
    /** refrence to the html document(the downloaded pdf) used only in download , 
     * such as fileInputRef.current.value="" for reseting the input 
     */
    const fileInputRef = useRef<HTMLInputElement>(null)
    /**refrence to the syncfusion element to access props that are not available  for html document
     * such that pdfviewRef.current.zoomFactor(this one used to know the zoom level of the docuemnt)
    */
    const pdfViewerRef = useRef<any>(null)

    // Next.js Hooks
    /** Router instance for programmatic navigation */
    const router = useRouter()
    /** URL search parameters for navigation coordinate parsing */
    const searchParams = useSearchParams()

    // Redux State Management
    /** Redux dispatch function for state updates */
    const dispatch = useAppDispatch()
    /** Currently loaded PDF document from Redux store */
    const currentPdf = useAppSelector((state) => state.annotations.currentPdf)
    /** Current tooltip visibility and position state */
    const tooltipState = useAppSelector(selectTooltipState)
    /** Currently active text selection for annotation creation */
    const activeSelection = useAppSelector(selectActiveSelection)
    /** Preview card visibility and position state */
    const previewCard = useAppSelector(selectPreviewCard)
    /** ID of annotation being previewed in preview card */
    const previewCardAnnotationId = useAppSelector(selectPreviewCardAnnotationId)

    // RTK Query Hooks for API Operations
    /** 
     * Fetch annotations for the current PDF document
     * Automatically refetches when PDF changes, skips when no PDF loaded
     */
    const {
        data: annotations = [],
        isLoading: isFetchingAnnotations,
        error: annotationsError
    } = useGetAnnotationsQuery(
        { pdfId: currentPdf?.id || '' },
        { skip: !currentPdf?.id }
    )

    /** 
     * Mutation hook for creating new annotations
     * Provides loading state and error handling
     */
    const [createAnnotation, { isLoading: isCreatingAnnotation }] = useCreateAnnotationMutation()

    /** 
     * Find the specific annotation being previewed in the preview card
     * Searches through fetched annotations by ID
     */
    const previewCardAnnotation = previewCardAnnotationId
        ? annotations.find(ann => ann.id === previewCardAnnotationId) || null
        : null

    // Cleanup blob URL on unmount or when PDF changes
    useEffect(() => {
        return () => {
            if (currentPdf?.fileUrl && currentPdf.fileUrl.startsWith('blob:')) {
                URL.revokeObjectURL(currentPdf.fileUrl)
            }
        }
    }, [currentPdf])

    /**
     * Validates uploaded file for PDF format and size constraints
     * 
     * @param file - The file to validate
     * @returns UploadError object if validation fails, null if valid
     * 
     * Validation Rules:
     * - Must be PDF format (application/pdf MIME type)
     * - Must be under 50MB file size limit
     */
    const validateFile = (file: File): UploadError | null => {
        // Check file type - only PDF files are supported
        if (file.type !== 'application/pdf') {
            return {
                type: 'format',
                message: 'Please select a PDF file. Other file formats are not supported.'
            }
        }

        // Check file size - enforce 50MB limit for performance
        if (file.size > MAX_FILE_SIZE) {
            return {
                type: 'size',
                message: `File size exceeds 50MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`
            }
        }

        return null
    }

    /**
     * Handles PDF file upload process with validation and error handling
     * 
     * @param file - The PDF file to upload
     * 
     * CURRENT IMPLEMENTATION (Prototype):
     * 1. Validates file format and size client-side
     * 2. Creates blob URL for immediate client-side PDF viewing
     * 3. Generates PDF document object with temporary metadata
     * 4. Updates Redux store with new PDF document
     * 5. Cleans up previous blob URLs to prevent memory leaks
     * 
     * PRODUCTION IMPLEMENTATION (TODO):
     * 1. Validates file format and size client-side
     * 2. Uploads file to server/cloud storage (AWS S3, etc.)
     * 3. Receives permanent URL and metadata from server
     * 4. Updates Redux store with server response
     * 5. Handles server-side errors and retry logic
     * 
     * Error Handling:
     * - File validation errors (size, format)
     * - Server upload failures (network, storage)
     * - Authentication errors (user permissions)
     * - Redux state update errors
     */
    const handleFileUpload = useCallback(async (file: File) => {
        setUploadError(null)
        setIsUploading(true)


        try {
            // Validate file before processing
            const error = validateFile(file)
            if (error) {
                setUploadError(error)

                // Log specific error types for debugging
                if (error.type === 'size') {
                    console.error('File size error:', `${(file.size / (1024 * 1024)).toFixed(1)}MB`)
                } else if (error.type === 'format') {
                    console.error('File type error')
                } else {
                    console.error('Upload error:', error.message)
                }
                return
            }

            // CURRENT: Create blob URL for client-side PDF viewing (prototype only)
            // TODO: Replace with server upload in production
            const fileUrl = URL.createObjectURL(file)

            // PRODUCTION TODO: Upload to server instead
            // const formData = new FormData()
            // formData.append('pdf', file)
            // const response = await fetch('/api/pdfs/upload', { method: 'POST', body: formData })
            // const { pdfDocument } = await response.json()

            // Create PDF document object with temporary metadata
            const pdfDocument: PDFDocument = {
                id: crypto.randomUUID(), // Generate unique ID for this session
                userId: 'current-user', // TODO: Replace with actual Clerk user ID
                filename: file.name,
                uploadedAt: new Date(),
                fileUrl // CURRENT: Blob URL for immediate viewing, TODO: Use server URL
            }

            // Clean up previous PDF blob URL to prevent memory leaks
            if (currentPdf?.fileUrl && currentPdf.fileUrl.startsWith('blob:')) {
                URL.revokeObjectURL(currentPdf.fileUrl)
            }

            // Update Redux store with new PDF document
            dispatch(setPdfDocument(pdfDocument))

            // Log successful upload
            console.log('PDF upload successful:', file.name)

        } catch (error) {
            console.error('Error uploading PDF:', error)
            const errorMessage = error instanceof Error ? error.message : 'Failed to upload PDF. Please try again.'
            setUploadError({
                type: 'general',
                message: errorMessage
            })
            pdfNotifications.uploadError(errorMessage)
        } finally {
            setIsUploading(false)
        }
    }, [dispatch, currentPdf])

    const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (file) {
            handleFileUpload(file)
        }
        // Reset input value to allow selecting the same file again
        event.target.value = ''
    }, [handleFileUpload])

    const handleDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault()
        setIsDragOver(true)
    }, [])

    const handleDragLeave = useCallback((event: React.DragEvent) => {
        event.preventDefault()
        setIsDragOver(false)
    }, [])

    const handleDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault()
        setIsDragOver(false)

        const files = Array.from(event.dataTransfer.files)
        const pdfFile = files.find(file => file.type === 'application/pdf')

        if (pdfFile) {
            handleFileUpload(pdfFile)
        } else if (files.length > 0) {
            setUploadError({
                type: 'format',
                message: 'Please drop a PDF file. Other file formats are not supported.'
            })
        }
    }, [handleFileUpload])

    const handleChooseFile = useCallback(() => {
        fileInputRef.current?.click()
    }, [])

    const handleRemovePdf = useCallback(() => {
        if (currentPdf?.fileUrl && currentPdf.fileUrl.startsWith('blob:')) {
            URL.revokeObjectURL(currentPdf.fileUrl)
        }
        dispatch(clearPdfDocument())
        setUploadError(null)
    }, [dispatch, currentPdf])

    const dismissError = useCallback(() => {
        setUploadError(null)
    }, [])

    /**
     * Parses URL parameters for PDF coordinate navigation
     * 
     * Supports two navigation methods:
     * 1. Hash-based: #pdf?page=3&x=120&y=450&width=200&height=18
     * 2. Search params: ?page=3&x=120&y=450&width=200&height=18
     * 
     * @returns Navigation coordinates object or null if not found
     * 
     * Use Cases:
     * - Cross-tab communication from note editor
     * - Direct linking to specific PDF locations
     * - Bookmark-able PDF coordinates
     * - Share-able annotation links
     */
    const parseUrlParameters = useCallback(() => {
        // Primary method: Check for hash-based navigation
        // Format: #pdf?page=3&x=120&y=450&width=200&height=18
        const hash = window.location.hash
        if (hash.startsWith('#pdf?')) {
            const urlParams = new URLSearchParams(hash.substring(5)) // Remove '#pdf?' prefix
            const page = urlParams.get('page')
            const x = urlParams.get('x')
            const y = urlParams.get('y')
            const width = urlParams.get('width')
            const height = urlParams.get('height')

            // Validate that all required parameters are present
            if (page && x && y && width && height) {
                return {
                    page: parseInt(page, 10),
                    x: parseFloat(x),
                    y: parseFloat(y),
                    width: parseFloat(width),
                    height: parseFloat(height)
                }
            }
        }

        // Fallback method: Check Next.js search params
        // Format: ?page=3&x=120&y=450&width=200&height=18
        const page = searchParams.get('page')
        const x = searchParams.get('x')
        const y = searchParams.get('y')
        const width = searchParams.get('width')
        const height = searchParams.get('height')

        // Validate that all required parameters are present
        if (page && x && y && width && height) {
            return {
                page: parseInt(page, 10),
                x: parseFloat(x),
                y: parseFloat(y),
                width: parseFloat(width),
                height: parseFloat(height)
            }
        }

        return null
    }, [searchParams])


    // to this point i understand everything 


    // Navigate to specific PDF coordinates using Syncfusion APIs
    const navigateToCoordinates = useCallback((navigation: {
        page: number;
        x: number;
        y: number;
        width: number;
        height: number;
    }) => {
        if (!pdfViewerRef.current || !currentPdf) {
            console.warn('PDF viewer or PDF not ready, storing navigation for later')
            setPendingNavigation(navigation)
            return false
        }

        try {
            const viewer = pdfViewerRef.current

            // Validate page number
            if (navigation.page < 1) {
                console.warn('Invalid page number, defaulting to page 1')
                navigation.page = 1
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
            else if (typeof viewer.goToPage === 'function') {
                console.log(`Navigating to page ${navigation.page} using direct method`)
                viewer.goToPage(navigation.page)
                navigationSuccess = true
            }
            // Method 3: Use pdfViewer property if available
            else if (viewer.pdfViewer && typeof viewer.pdfViewer.goToPage === 'function') {
                console.log(`Navigating to page ${navigation.page} using pdfViewer property`)
                viewer.pdfViewer.goToPage(navigation.page)
                navigationSuccess = true
            }
            // Method 4: Try accessing the underlying Syncfusion instance
            else if (viewer.element && viewer.element.ej2_instances && viewer.element.ej2_instances[0]) {
                const instance = viewer.element.ej2_instances[0]
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
                    // Validate coordinates
                    if (navigation.x < 0 || navigation.y < 0 || navigation.width <= 0 || navigation.height <= 0) {
                        console.warn('Invalid coordinates, skipping scroll:', navigation)
                        return
                    }

                    // Get current zoom factor for coordinate transformation
                    let zoomFactor = 1.0
                    if (viewer.magnificationModule && viewer.magnificationModule.zoomFactor) {
                        zoomFactor = viewer.magnificationModule.zoomFactor
                    } else if (viewer.magnification && viewer.magnification.zoomFactor) {
                        zoomFactor = viewer.magnification.zoomFactor
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
                    } else {
                        console.warn('Could not find scroll container with any selector')
                    }

                    // Highlight the target area temporarily
                    highlightTargetArea(navigation, zoomFactor)

                } catch (scrollError) {
                    console.warn('Could not scroll to coordinates:', scrollError)
                }
            }, 1000) // Increased timeout for better reliability

            return true

        } catch (error) {
            console.error('Error navigating to coordinates:', error)
            return false
        }
    }, [currentPdf])

    // Highlight target area temporarily for visual feedback
    const highlightTargetArea = useCallback((navigation: {
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
                    console.log(`Found page element using selector: ${selector}`)
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

                console.log(`Created highlight overlay at: x=${scaledX}, y=${scaledY}, w=${scaledWidth}, h=${scaledHeight} (zoom: ${zoomFactor})`)

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
                console.warn(`Could not find page element for page ${navigation.page}`)
            }
        } catch (error) {
            console.warn('Could not create highlight overlay:', error)
        }
    }, [])

    // Handle URL parameter navigation on component mount and URL changes
    useEffect(() => {
        const navigation = parseUrlParameters()
        if (navigation && currentPdf) {
            console.log('URL navigation detected:', navigation)
            navigateToCoordinates(navigation)

            // Clear URL parameters after navigation to prevent re-triggering
            if (window.location.hash.startsWith('#pdf?')) {
                window.history.replaceState(null, '', window.location.pathname + window.location.search)
            }
        }
    }, [parseUrlParameters, navigateToCoordinates, currentPdf])

    // Handle pending navigation when PDF viewer becomes ready
    useEffect(() => {
        if (pendingNavigation && pdfViewerRef.current && currentPdf) {
            console.log('Executing pending navigation:', pendingNavigation)
            navigateToCoordinates(pendingNavigation)
            setPendingNavigation(null)
        }
    }, [pendingNavigation, navigateToCoordinates, currentPdf])

    // Listen for hash changes (for cross-tab communication)
    useEffect(() => {
        const handleHashChange = () => {
            const navigation = parseUrlParameters()
            if (navigation && currentPdf) {
                console.log('Hash change navigation detected:', navigation)
                navigateToCoordinates(navigation)
            }
        }

        window.addEventListener('hashchange', handleHashChange)
        return () => window.removeEventListener('hashchange', handleHashChange)
    }, [parseUrlParameters, navigateToCoordinates, currentPdf])

    // Listen for postMessage communication from note editor tabs
    useEffect(() => {
        const handlePostMessage = (event: MessageEvent) => {
            // Validate message structure and type using utility function
            if (isValidNavigationMessage(event.data)) {
                console.log('Received PDF navigation postMessage:', event.data)

                const { page, coordinates, hash } = event.data

                const navigationParams = {
                    page,
                    x: coordinates.x,
                    y: coordinates.y,
                    width: coordinates.width,
                    height: coordinates.height
                }

                // Validate parameters before navigation
                if (validateNavigationParams(navigationParams)) {
                    console.log('Valid postMessage navigation data, navigating to coordinates')

                    // If we have a PDF loaded, navigate immediately
                    if (currentPdf && pdfViewerRef.current) {
                        navigateToCoordinates(navigationParams)
                    } else {
                        // Store for later navigation when PDF is ready
                        console.log('PDF not ready, storing navigation for later')
                        setPendingNavigation(navigationParams)

                        // Also update the URL hash for consistency
                        if (hash) {
                            window.location.hash = hash
                        }
                    }
                } else {
                    console.warn('Invalid navigation parameters from postMessage:', navigationParams)
                }
            }
        }

        // Add event listener for postMessage
        window.addEventListener('message', handlePostMessage)

        // Cleanup listener on unmount
        return () => {
            window.removeEventListener('message', handlePostMessage)
        }
    }, [navigateToCoordinates, currentPdf])

    // Handle PDF viewer ref callback
    const handlePdfViewerRef = useCallback((ref: any) => {
        pdfViewerRef.current = ref
        console.log('PDF viewer ref set:', !!ref)
    }, [])

    // If PDF is loaded, show the PDF viewer placeholder
    if (currentPdf) {
        return (
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">PDF & Notes</h1>
                        <p className="text-lg text-gray-600 font-medium">
                            {currentPdf.filename} - Ready for annotation
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleRemovePdf}
                            className="flex items-center gap-2 px-4 py-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-xl transition-colors"
                        >
                            <X size={18} />
                            <span className="font-medium">Remove PDF</span>
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
                            <Filter size={18} />
                            <span className="font-medium">Filter</span>
                        </button>
                        <div className="flex items-center bg-gray-100 rounded-xl p-1">
                            <button className="p-2 bg-white rounded-lg shadow-sm">
                                <Grid size={16} className="text-gray-600" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                <List size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* PDF Viewer with Error Boundary */}
                <ErrorBoundary
                    onError={(error, errorInfo) => {
                        console.error('PDF viewer error:', error, errorInfo)
                        pdfNotifications.processingError()
                    }}
                >
                    <div className="relative bg-white rounded-2xl border border-gray-200 overflow-hidden" style={{ height: '800px' }}>
                        {/* Show annotation loading indicator */}
                        {isFetchingAnnotations && (
                            <div className="absolute top-4 right-4 z-10">
                                <AnnotationLoadingIndicator
                                    action="loading"
                                    count={annotations.length}
                                />
                            </div>
                        )}

                        {/* Show annotation creation loading */}
                        {isCreatingAnnotation && (
                            <div className="absolute top-4 left-4 z-10">
                                <AnnotationLoadingIndicator action="creating" />
                            </div>
                        )}

                        <PDFAnnotationViewer
                            ref={handlePdfViewerRef}
                            annotations={annotations}
                            onAnnotationCreate={(selection) => {
                                console.log('Annotation creation requested:', selection)

                                // Validate selection before proceeding
                                if (!selection.text || selection.text.trim().length < 3) {
                                    selectionNotifications.selectionTooShort()
                                    return
                                }

                                if (selection.text.length > 1000) {
                                    selectionNotifications.selectionTooLong()
                                    return
                                }

                                // Check if coordinates are valid
                                if (!selection.coordinates ||
                                    selection.coordinates.x < 0 ||
                                    selection.coordinates.y < 0 ||
                                    selection.coordinates.width <= 0 ||
                                    selection.coordinates.height <= 0) {
                                    selectionNotifications.coordinateCalculationFailed()
                                    return
                                }

                                // This will be handled in future tasks
                            }}
                            onAnnotationClick={(annotationId) => {
                                console.log('Annotation clicked:', annotationId)
                                // This will be handled in future tasks
                            }}
                        />

                        {/* Annotation Tooltip */}
                        {tooltipState.visible && activeSelection && (
                            <AnnotationTooltip
                                position={tooltipState.position}
                                visible={tooltipState.visible}
                                onCreateNote={() => {
                                    if (!activeSelection || !currentPdf) return

                                    try {
                                        // Store note data in localStorage for the new tab
                                        const noteData = {
                                            selectedText: activeSelection.text,
                                            pdfReference: currentPdf.id,
                                            pageNumber: activeSelection.pageNumber,
                                            coordinates: activeSelection.coordinates
                                        }
                                        localStorage.setItem('newNoteData', JSON.stringify(noteData))

                                        // Open note editor in new tab
                                        const newTab = window.open('/dashboard/note/new', '_blank')
                                        if (newTab) {
                                            newTab.focus()
                                        } else {
                                            console.warn('Could not open new tab, falling back to navigation')
                                            router.push('/dashboard/note/new')
                                        }

                                        // Clear active selection and hide tooltip
                                        dispatch(clearActiveSelection())
                                        dispatch(hideTooltip())
                                    } catch (error) {
                                        console.error('Failed to open note editor:', error)
                                    }
                                }}
                                onClose={() => {
                                    dispatch(hideTooltip())
                                }}
                            />
                        )}

                        {/* Annotation Preview Card */}
                        {previewCard.visible && previewCardAnnotation && (
                            <AnnotationPreviewCard
                                annotation={previewCardAnnotation}
                                position={previewCard.position}
                                visible={previewCard.visible}
                                onEdit={(annotationId) => {
                                    try {
                                        // Open note editor in new tab for editing
                                        const newTab = window.open(`/dashboard/note/${annotationId}`, '_blank')
                                        if (newTab) {
                                            newTab.focus()
                                        } else {
                                            console.warn('Could not open new tab, falling back to navigation')
                                            router.push(`/dashboard/note/${annotationId}`)
                                        }

                                        // Hide preview card
                                        dispatch(hidePreviewCard())
                                    } catch (error) {
                                        console.error('Failed to open note editor:', error)
                                    }
                                }}
                                onClose={() => {
                                    dispatch(hidePreviewCard())
                                }}
                            />
                        )}
                    </div>
                </ErrorBoundary >
            </div>
        )
    }

    return (
        <ErrorBoundary
            onError={(error, errorInfo) => {
                console.error('PDF notes page error:', error, errorInfo)
                pdfNotifications.processingError()
            }}
        >
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">PDF & Notes</h1>
                        <p className="text-lg text-gray-600 font-medium">Upload PDFs and create anchored notes for enhanced productivity</p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors">
                            <Filter size={18} />
                            <span className="font-medium">Filter</span>
                        </button>
                        <div className="flex items-center bg-gray-100 rounded-xl p-1">
                            <button className="p-2 bg-white rounded-lg shadow-sm">
                                <Grid size={16} className="text-gray-600" />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors">
                                <List size={16} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Error Display */}
                {uploadError && (
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
                        <AlertCircle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
                        <div className="flex-1">
                            <h4 className="font-semibold text-red-800 mb-1">Upload Error</h4>
                            <p className="text-red-700 text-sm">{uploadError.message}</p>
                        </div>
                        <button
                            onClick={dismissError}
                            className="text-red-400 hover:text-red-600 transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                )}

                {/* Enhanced Upload Section */}
                {isUploading ? (
                    <div className="bg-blue-50 rounded-3xl border-2 border-blue-200 p-12">
                        <PDFLoadingIndicator
                            stage="uploading"
                            fileName={fileInputRef.current?.files?.[0]?.name}
                        />
                    </div>
                ) : (
                    <div
                        className={`bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-3xl border-2 border-dashed p-12 text-center transition-all duration-200 ${isDragOver
                            ? 'border-blue-400 bg-blue-100/70 scale-[1.02]'
                            : 'border-blue-200/60 hover:border-blue-300/60'
                            }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                    >
                        <div className={`mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/25 transition-transform ${isDragOver ? 'scale-110' : ''
                            }`}>
                            <Upload size={28} className="text-white" />
                        </div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
                            {isDragOver ? 'Drop your PDF here' : 'Upload your first PDF'}
                        </h3>
                        <p className="text-blue-700 font-medium mb-6 max-w-md mx-auto">
                            Drag and drop a PDF file here, or click to browse your files and start taking notes'
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                            <button
                                onClick={handleChooseFile}
                                disabled={isUploading}
                                className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-300 text-white font-semibold px-8 py-4 rounded-xl transition-colors shadow-lg shadow-blue-500/25 flex items-center gap-2"
                            >
                                <Upload size={20} />
                                {isUploading ? 'Processing...' : 'Choose File'}
                            </button>
                            <p className="text-blue-600 text-sm font-medium">
                                Supports PDF files up to 50MB
                            </p>
                        </div>

                        {/* Hidden file input */}
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".pdf,application/pdf"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </div>

                )}
                {/* Features Section */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/60 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-300">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg mb-4">
                            <FileText size={24} className="text-white" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">PDF Annotation</h3>
                        <p className="text-gray-600 text-sm font-medium leading-relaxed">
                            Highlight text, add comments, and create anchored notes directly on your PDF documents
                        </p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/60 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg mb-4">
                            <BookOpen size={24} className="text-white" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">Smart Notes</h3>
                        <p className="text-gray-600 text-sm font-medium leading-relaxed">
                            Create intelligent notes that are linked to specific sections of your documents
                        </p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/60 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mb-4">
                            <Search size={24} className="text-white" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">Quick Search</h3>
                        <p className="text-gray-600 text-sm font-medium leading-relaxed">
                            Find any note or annotation instantly with our powerful search functionality
                        </p>
                    </div>
                </div>

                {/* Empty State */}
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/60 p-12 text-center">
                    <div className="max-w-md mx-auto">
                        <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
                            <FileText size={28} className="text-gray-400" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">No PDFs uploaded yet</h3>
                        <p className="text-gray-600 font-medium mb-6">
                            Upload your first PDF to start creating notes and annotations
                        </p>
                        <button
                            onClick={handleChooseFile}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold px-6 py-3 rounded-xl transition-all shadow-lg shadow-blue-500/25"
                        >
                            Get Started
                        </button>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    )
}