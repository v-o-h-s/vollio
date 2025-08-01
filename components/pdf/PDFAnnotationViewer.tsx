'use client'

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
import { setActiveSelection, showTooltip, hideTooltip } from '@/lib/store/annotationSlice'
import { selectCurrentPdf } from '@/lib/store/selectors'
import { TextSelection as TextSelectionType } from '@/lib/types'
import { AlertCircle, Loader2 } from 'lucide-react'

interface PDFAnnotationViewerProps {
    onAnnotationCreate?: (selection: TextSelectionType) => void
    onAnnotationClick?: (annotationId: string) => void
}

export default function PDFAnnotationViewer({
    onAnnotationCreate
}: PDFAnnotationViewerProps) {
    const pdfViewerRef = useRef<PdfViewerComponent>(null)
    const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [pdfDataUrl, setPdfDataUrl] = useState<string>('')

    const dispatch = useAppDispatch()
    const currentPdf = useAppSelector(selectCurrentPdf)

    // Handle document load success
    const handleDocumentLoad = useCallback(() => {
        console.log('PDF document loaded successfully - setting isLoading to false')

        // Clear any existing timeout
        if (loadingTimeoutRef.current) {
            clearTimeout(loadingTimeoutRef.current)
            loadingTimeoutRef.current = null
        }

        // Add a small delay to ensure all components are fully initialized
        setTimeout(() => {
            setIsLoading(false)
            setError(null)
        }, 100)
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
    }, [])

    // Handle text selection end
    const handleTextSelectionEnd = useCallback((args: any) => {
        if (!pdfViewerRef.current || !currentPdf) return

        try {
            console.log('Text selection end event:', args)

            // For now, we'll create a basic text selection object
            // The exact API for getting selection details will be refined in future iterations
            const textSelection: TextSelectionType = {
                text: 'Selected text placeholder', // Will be replaced with actual selected text
                pageNumber: 1, // Will be replaced with actual page number
                coordinates: {
                    x: 100,
                    y: 100,
                    width: 200,
                    height: 20
                },
                pdfId: currentPdf.id
            }

            // Update Redux state
            dispatch(setActiveSelection(textSelection))

            // Show tooltip at a default position for now
            dispatch(showTooltip({ x: 200, y: 200 }))

            // Call callback if provided
            if (onAnnotationCreate) {
                onAnnotationCreate(textSelection)
            }

            console.log('Text selection completed:', textSelection)
        } catch (error) {
            console.error('Error handling text selection:', error)
        }
    }, [currentPdf, dispatch, onAnnotationCreate])

    // Handle page change
    const handlePageChange = useCallback((args: any) => {
        console.log('Page changed to:', args.currentPageNumber)
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
                        setPdfDataUrl(base64DataUrl)
                        console.log('PDF converted to base64 data URL', {
                            size: base64DataUrl.length,
                            preview: base64DataUrl.substring(0, 100) + '...'
                        })
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
            }, 10000) // 10 second timeout

            return () => {
                if (loadingTimeoutRef.current) {
                    clearTimeout(loadingTimeoutRef.current)
                    loadingTimeoutRef.current = null
                }
            }
        } else if (currentPdf?.fileUrl) {
            // For non-blob URLs, use directly
            setPdfDataUrl(currentPdf.fileUrl)
            setIsLoading(true)
            setError(null)
        }
    }, [currentPdf])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            dispatch(hideTooltip())
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

    // Show error state
    if (error) {
        return (
            <div className="flex items-center justify-center h-96 bg-red-50 rounded-xl border border-red-200">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <AlertCircle size={28} className="text-red-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-red-900 mb-2">Failed to Load PDF</h3>
                    <p className="text-red-700 text-sm mb-4">{error}</p>
                    <button
                        onClick={() => {
                            setError(null)
                            if (pdfViewerRef.current && currentPdf?.fileUrl) {
                                pdfViewerRef.current.load(currentPdf.fileUrl, '')
                            }
                        }}
                        className="bg-red-500 hover:bg-red-600 text-white font-medium px-4 py-2 rounded-lg transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="relative w-full h-full bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Loading overlay */}
            {isLoading && (
                <div className="absolute inset-0 bg-white bg-opacity-90 flex items-center justify-center z-50">
                    <div className="text-center">
                        <Loader2 size={32} className="text-blue-500 animate-spin mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading PDF</h3>
                        <p className="text-gray-600">Please wait while we load your document...</p>
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
                </div>
            )}

            {/* PDF Viewer */}
            <div className="w-full h-full">
                {pdfDataUrl ? (
                    <PdfViewerComponent
                        ref={pdfViewerRef}
                        id="pdf-annotation-viewer"
                        style={{ height: '100%', width: '100%' }}
                        serviceUrl=""
                        documentPath={pdfDataUrl}
                        documentLoad={handleDocumentLoad}
                        documentLoadFailed={handleDocumentLoadFailed}
                        textSelectionStart={handleTextSelectionStart}
                        textSelectionEnd={handleTextSelectionEnd}
                        pageChange={handlePageChange}
                        zoomChange={handleZoomChange}
                        enableTextSelection={true}
                        enableTextSearch={false}
                        enableNavigation={true}
                        enableMagnification={false}
                        enablePrint={true}
                        enableBookmark={true}
                        enableThumbnail={true}
                        enableToolbar={true}
                        enableAnnotation={true}
                        enableFormFields={false}
                        enableFormDesigner={false}
                        resourceUrl={`${window.location.protocol}//${window.location.host}/lib`}
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
                ) : (
                    <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                            <Loader2 size={32} className="text-blue-500 animate-spin mx-auto mb-4" />
                            <p className="text-gray-600">Processing PDF...</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}