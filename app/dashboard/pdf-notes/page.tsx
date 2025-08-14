'use client'

/**
 * PDF Notes Page Component
 * 
 * Main page component for PDF document management and viewing.
 * This component serves as the central hub for PDF document upload and display.
 * 
 * Key Responsibilities:
 * - PDF file upload and validation (drag & drop, file picker)
 * - PDF document display using basic PDF viewer
 * - Error handling and user feedback
 * - State management integration with Redux store
 * 
 * Features:
 * - Drag & drop PDF upload with validation (50MB limit, PDF format only)
 * - Comprehensive error handling with user-friendly messages
 * - Loading states and progress indicators
 * - Mobile-responsive design with touch-friendly interactions
 * 
 * @author Noto Team
 * @version 1.0.0
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Upload, FileText, BookOpen, Search, Filter, Grid, List, AlertCircle, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { setPdfDocument, clearPdfDocument } from '@/lib/store/annotationSlice'
import { useUploadPDFMutation } from '@/lib/store/apiSlice'
import { PDFDocument } from '@/lib/types'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { PDFLoadingIndicator } from '@/components/ui/loading'
import { pdfNotifications } from '@/lib/utils/notifications'

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
 * Manages PDF upload and display workflow.
 * Integrates with Redux store for state management.
 */
export default function PDFNotesPage() {
    // UI State Management
    /** Whether user is currently dragging a file over the drop zone */
    const [isDragOver, setIsDragOver] = useState(false)
    /** Current upload error state, if any */
    const [uploadError, setUploadError] = useState<UploadError | null>(null)

    // Component References
    /** Reference to the file input element for resetting */
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Next.js Hooks
    /** Router instance for programmatic navigation */
    const router = useRouter()

    // Redux State Management
    /** Redux dispatch function for state updates */
    const dispatch = useAppDispatch()
    /** Currently loaded PDF document from Redux store */
    const currentPdf = useAppSelector((state) => state.annotations.currentPdf)

    /** 
     * Mutation hook for uploading PDF files
     * Provides loading state and error handling for file uploads
     */
    const [uploadPDF, { isLoading: isUploadingPDF }] = useUploadPDFMutation()

    /** Whether a PDF upload is currently in progress - using RTK Query state */
    const isUploading = isUploadingPDF

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
     * Implementation:
     * 1. Validates file format and size client-side
     * 2. Uploads file to Supabase Storage via API endpoint
     * 3. Receives permanent signed URL and metadata from server
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

            // Clean up previous PDF blob URL to prevent memory leaks
            if (currentPdf?.fileUrl && currentPdf.fileUrl.startsWith('blob:')) {
                URL.revokeObjectURL(currentPdf.fileUrl)
            }

            // Upload file to Supabase Storage via RTK Query
            const formData = new FormData()
            formData.append('file', file)

            const uploadedPDF = await uploadPDF(formData).unwrap()

            // Update Redux store with uploaded PDF document
            dispatch(setPdfDocument(uploadedPDF))

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
        }
    }, [dispatch, currentPdf, uploadPDF])

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

    // If PDF is loaded, show the PDF viewer
    if (currentPdf) {
        return (
            <div className="space-y-8">
                {/* Header Section */}
                <div className="flex items-center justify-between">
                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">PDF Viewer</h1>
                        <p className="text-lg text-gray-600 font-medium">
                            {currentPdf.filename}
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
                        {/* PDF Annotation Viewer */}
                        <div className="w-full h-full">
                            {/* For now, show a placeholder until we integrate the full viewer */}
                            <div className="w-full h-full flex items-center justify-center">
                                <div className="text-center">
                                    <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                        <FileText size={32} className="text-blue-600" />
                                    </div>
                                    <h3 className="text-xl font-bold text-gray-900 mb-2">PDF Viewer Ready</h3>
                                    <p className="text-gray-600 mb-4">
                                        {currentPdf.filename}
                                    </p>
                                    <p className="text-sm text-gray-500 mb-4">
                                        File size: {(currentPdf.fileSize / (1024 * 1024)).toFixed(1)} MB
                                    </p>
                                    <p className="text-xs text-blue-600 bg-blue-50 px-3 py-2 rounded-lg inline-block">
                                        PDFAnnotationViewer component is now available for integration
                                    </p>
                                    {currentPdf.fileUrl && (
                                        <div className="mt-4">
                                            <a
                                                href={currentPdf.fileUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-lg transition-colors"
                                            >
                                                <FileText size={16} />
                                                Open PDF
                                            </a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </ErrorBoundary>
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
                        <h1 className="text-4xl font-bold text-gray-900 tracking-tight">PDF Viewer</h1>
                        <p className="text-lg text-gray-600 font-medium">Upload PDFs for viewing and management</p>
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
                            Drag and drop a PDF file here, or click to browse your files
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
                        <h3 className="font-bold text-lg text-gray-900 mb-2">PDF Viewing</h3>
                        <p className="text-gray-600 text-sm font-medium leading-relaxed">
                            Upload and view your PDF documents with a clean, modern interface
                        </p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/60 hover:shadow-lg hover:shadow-green-500/10 transition-all duration-300">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg mb-4">
                            <BookOpen size={24} className="text-white" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">Document Management</h3>
                        <p className="text-gray-600 text-sm font-medium leading-relaxed">
                            Organize and manage your PDF documents in one convenient location
                        </p>
                    </div>

                    <div className="bg-white/80 backdrop-blur-sm p-6 rounded-2xl shadow-sm border border-gray-200/60 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300">
                        <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg mb-4">
                            <Search size={24} className="text-white" />
                        </div>
                        <h3 className="font-bold text-lg text-gray-900 mb-2">Easy Access</h3>
                        <p className="text-gray-600 text-sm font-medium leading-relaxed">
                            Quick access to your uploaded documents with secure cloud storage
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
                            Upload your first PDF to start viewing and managing your documents
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