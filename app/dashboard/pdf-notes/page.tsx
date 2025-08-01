'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, FileText, BookOpen, Search, Filter, Grid, List, AlertCircle, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/lib/store/hooks'
import { setPdfDocument, clearPdfDocument } from '@/lib/store/annotationSlice'
import { PDFDocument } from '@/lib/types'
import PDFAnnotationViewer from '@/components/pdf/PDFAnnotationViewer'

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50MB in bytes

interface UploadError {
    type: 'size' | 'format' | 'general'
    message: string
}

export default function PDFNotesPage() {
    const [isDragOver, setIsDragOver] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [uploadError, setUploadError] = useState<UploadError | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const dispatch = useAppDispatch()
    const currentPdf = useAppSelector((state) => state.annotations.currentPdf)

    // Cleanup blob URL on unmount or when PDF changes
    useEffect(() => {
        return () => {
            if (currentPdf?.fileUrl && currentPdf.fileUrl.startsWith('blob:')) {
                URL.revokeObjectURL(currentPdf.fileUrl)
            }
        }
    }, [currentPdf])

    const validateFile = (file: File): UploadError | null => {
        // Check file type
        if (file.type !== 'application/pdf') {
            return {
                type: 'format',
                message: 'Please select a PDF file. Other file formats are not supported.'
            }
        }

        // Check file size
        if (file.size > MAX_FILE_SIZE) {
            return {
                type: 'size',
                message: `File size exceeds 50MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`
            }
        }

        return null
    }

    const handleFileUpload = useCallback(async (file: File) => {
        setUploadError(null)
        setIsUploading(true)

        try {
            // Validate file
            const error = validateFile(file)
            if (error) {
                setUploadError(error)
                return
            }

            // Create blob URL for the PDF
            const fileUrl = URL.createObjectURL(file)

            // Create PDF document object
            const pdfDocument: PDFDocument = {
                id: crypto.randomUUID(),
                userId: 'current-user', // This would come from Clerk in a real implementation
                filename: file.name,
                uploadedAt: new Date(),
                fileUrl
            }

            // Clean up previous PDF blob URL if it exists
            if (currentPdf?.fileUrl && currentPdf.fileUrl.startsWith('blob:')) {
                URL.revokeObjectURL(currentPdf.fileUrl)
            }

            // Update Redux store
            dispatch(setPdfDocument(pdfDocument))

        } catch (error) {
            console.error('Error uploading PDF:', error)
            setUploadError({
                type: 'general',
                message: 'Failed to upload PDF. Please try again.'
            })
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

                {/* PDF Viewer */}
                <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden" style={{ height: '800px' }}>
                    <PDFAnnotationViewer
                        onAnnotationCreate={(selection) => {
                            console.log('Annotation creation requested:', selection)
                            // This will be handled in future tasks
                        }}
                        onAnnotationClick={(annotationId) => {
                            console.log('Annotation clicked:', annotationId)
                            // This will be handled in future tasks
                        }}
                    />
                </div>
            </div>
        )
    }

    return (
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

            {/* Upload Section */}
            <div
                className={`bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-3xl border-2 border-dashed p-12 text-center transition-all duration-200 ${isDragOver
                    ? 'border-blue-400 bg-blue-100/70 scale-[1.02]'
                    : 'border-blue-200/60 hover:border-blue-300/60'
                    } ${isUploading ? 'opacity-75 pointer-events-none' : ''}`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
            >
                <div className={`mx-auto w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-blue-500/25 transition-transform ${isDragOver ? 'scale-110' : ''
                    }`}>
                    <Upload size={28} className="text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">
                    {isUploading ? 'Processing PDF...' : isDragOver ? 'Drop your PDF here' : 'Upload your first PDF'}
                </h3>
                <p className="text-blue-700 font-medium mb-6 max-w-md mx-auto">
                    {isUploading
                        ? 'Please wait while we process your file'
                        : 'Drag and drop a PDF file here, or click to browse your files and start taking notes'
                    }
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
    )
}