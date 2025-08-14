'use client'

/**
 * Modern PDF List Display Component
 * 
 * A modern, responsive component for displaying user's uploaded PDFs in a grid/card layout.
 * Features drag-and-drop upload, empty states, and click handlers for PDF navigation.
 * 
 * Key Features:
 * - Modern card-based grid layout with hover effects
 * - File metadata display (name, size, upload date)
 * - Prominent upload button with drag-and-drop functionality
 * - Empty state for users with no uploaded files
 * - Click handlers to open PDFs in annotation viewer
 * - Loading states and error handling
 * - Responsive design for mobile and desktop
 * 
 * @author Noto Team
 * @version 1.0.0
 */

import { useState, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  FileText,
  Upload,
  Calendar,
  HardDrive,
  Eye,
  MoreVertical,
  Trash2,
  Download,
  Share2,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'
import { useGetPDFsQuery, useUploadPDFMutation } from '@/lib/store/apiSlice'
import { PDFDocument, AppError } from '@/lib/types'
import { pdfNotifications } from '@/lib/utils/notifications'
import { formatRelativeTime } from '@/lib/utils/dates'
import { useUploadErrorHandler } from '@/hooks/use-error-handling'
import { ErrorBoundary, UploadErrorBoundary } from '@/components/ErrorBoundary'
import { Button } from '@/components/ui/button'

interface PDFListDisplayProps {
  /** Optional CSS class name for styling */
  className?: string
  /** Maximum number of PDFs to display (for pagination) */
  limit?: number
  /** Whether to show the upload button */
  showUpload?: boolean
  /** Callback when a PDF is clicked */
  onPDFClick?: (pdf: PDFDocument) => void
}

/**
 * Formats file size in human-readable format
 */
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}



/**
 * Validates uploaded file for PDF format and size constraints
 */
const validateFile = (file: File): { valid: boolean; error?: string } => {
  // Check file type
  if (file.type !== 'application/pdf') {
    return { valid: false, error: 'Please select a PDF file' }
  }

  // Check file size (50MB limit)
  const maxSize = 50 * 1024 * 1024 // 50MB
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `File too large (${formatFileSize(file.size)}). Maximum size is 50MB.`
    }
  }

  return { valid: true }
}

export default function PDFListDisplay({
  className = '',
  limit = 20,
  showUpload = true,
  onPDFClick
}: PDFListDisplayProps) {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Local state for drag and drop
  const [isDragOver, setIsDragOver] = useState(false)

  // Enhanced error handling
  const {
    error: uploadError,
    isRetrying: isRetryingUpload,
    handleUploadError,
    getRecoveryActions,
    clearError: clearUploadError,
    retry: retryUpload
  } = useUploadErrorHandler()

  // RTK Query hooks
  const {
    data: pdfData,
    isLoading,
    error,
    refetch
  } = useGetPDFsQuery()

  const [uploadPDF, { isLoading: isUploading }] = useUploadPDFMutation()

  const pdfs = pdfData?.pdfs || []
  const totalCount = pdfData?.totalCount || 0

  /**
   * Handles PDF click - either calls custom handler or navigates to PDF viewer
   */
  const handlePDFClick = useCallback((pdf: PDFDocument) => {
    if (onPDFClick) {
      onPDFClick(pdf)
    } else {
      router.push(`/dashboard/pdf/${pdf.id}`)
    }
  }, [onPDFClick, router])

  /**
   * Handles file upload with enhanced validation and error handling
   */
  const handleFileUpload = useCallback(async (file: File) => {
    // Clear any previous upload errors
    clearUploadError()

    const validation = validateFile(file)
    if (!validation.valid) {
      handleUploadError(
        new Error(validation.error!),
        file.name,
        file.size,
        file.type
      )
      return
    }

    try {
      const formData = new FormData()
      formData.append('file', file)

      await uploadPDF(formData).unwrap()
      
      // Reset file input on success
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
    } catch (error: any) {
      // Handle RTK Query errors which may contain AppError
      const appError = error.error as AppError
      if (appError) {
        handleUploadError(appError, file.name, file.size, file.type)
      } else {
        handleUploadError(error, file.name, file.size, file.type)
      }
    }
  }, [uploadPDF, handleUploadError, clearUploadError])

  /**
   * Handles drag and drop events
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    const pdfFile = files.find(file => file.type === 'application/pdf')

    if (pdfFile) {
      handleFileUpload(pdfFile)
    } else if (files.length > 0) {
      pdfNotifications.uploadError('Please drop a PDF file')
    }
  }, [handleFileUpload])

  /**
   * Handles file input change
   */
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }, [handleFileUpload])

  /**
   * Opens file picker
   */
  const openFilePicker = useCallback(() => {
    fileInputRef.current?.click()
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-200 p-6 animate-pulse">
              <div className="w-12 h-12 bg-gray-200 rounded-xl mb-4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-2/3 mb-4"></div>
              <div className="flex justify-between">
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // Enhanced error state with retry logic
  if (error) {
    const appError = error as AppError
    const errorTitle = appError?.userMessage ? 'Failed to Load PDFs' : 'Connection Error'
    const errorMessage = appError?.userMessage || 'There was an error loading your PDF files. Please check your connection and try again.'

    return (
      <div className={`space-y-6 ${className}`}>
        <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={32} className="text-red-600" />
          </div>
          <h3 className="text-xl font-bold text-red-900 mb-2">{errorTitle}</h3>
          <p className="text-red-700 mb-4">{errorMessage}</p>
          
          {/* Error context if available */}
          {appError?.context && (
            <div className="bg-red-100 rounded-lg p-3 mb-4 text-left max-w-md mx-auto">
              <p className="text-xs text-red-600 font-medium mb-1">Error Details:</p>
              <div className="text-xs text-red-700">
                {appError.context.component && <div>Component: {appError.context.component}</div>}
                {appError.context.action && <div>Action: {appError.context.action}</div>}
              </div>
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Button
              onClick={() => refetch()}
              className="bg-red-600 hover:bg-red-700 text-white flex items-center gap-2"
            >
              <RefreshCw size={16} />
              Try Again
            </Button>
            
            {appError?.retryable && (
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                className="flex items-center gap-2"
              >
                <RefreshCw size={16} />
                Refresh Page
              </Button>
            )}
          </div>

          {/* Show technical details in development */}
          {process.env.NODE_ENV === 'development' && appError?.technicalMessage && (
            <details className="mt-4 text-left max-w-md mx-auto">
              <summary className="text-xs text-red-600 cursor-pointer">
                Technical Details (Dev)
              </summary>
              <pre className="text-xs text-red-600 mt-2 p-2 bg-red-100 rounded overflow-auto max-h-32">
                {appError.technicalMessage}
              </pre>
            </details>
          )}
        </div>
      </div>
    )
  }

  return (
    <ErrorBoundary context="PDFListDisplay">
      <div className={`space-y-6 ${className}`}>
        {/* Upload Error Display */}
        {uploadError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-start gap-3">
              <AlertTriangle size={20} className="text-red-500 mt-0.5" />
              <div className="flex-1">
                <h4 className="font-semibold text-red-900 mb-1">Upload Failed</h4>
                <p className="text-red-700 text-sm mb-3">{uploadError.userMessage}</p>
                
                <div className="flex gap-2">
                  {uploadError.retryable && (
                    <Button
                      onClick={() => retryUpload(() => Promise.resolve())}
                      disabled={isRetryingUpload}
                      size="sm"
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <RefreshCw size={14} className={isRetryingUpload ? 'animate-spin' : ''} />
                      {isRetryingUpload ? 'Retrying...' : 'Try Again'}
                    </Button>
                  )}
                  
                  {getRecoveryActions('').map((action, index) => (
                    <Button
                      key={index}
                      onClick={action.action}
                      size="sm"
                      variant="outline"
                    >
                      {action.label}
                    </Button>
                  ))}
                  
                  <Button
                    onClick={clearUploadError}
                    size="sm"
                    variant="outline"
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Upload Section */}
        {showUpload && (
          <UploadErrorBoundary>
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`
                relative border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300
                ${isDragOver
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
                }
                ${isUploading || isRetryingUpload ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
              `}
              onClick={openFilePicker}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Upload size={32} className="text-blue-600" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {isDragOver ? 'Drop your PDF here' : 'Upload PDF'}
              </h3>

              <p className="text-gray-600 mb-4">
                {isUploading || isRetryingUpload
                  ? 'Uploading...'
                  : 'Drag and drop a PDF file here, or click to browse'
                }
              </p>

              <p className="text-sm text-gray-500">
                Maximum file size: 50MB • Supported format: PDF
              </p>
            </div>
          </UploadErrorBoundary>
        )}

      {/* PDF Grid */}
      {pdfs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pdfs.map((pdf) => (
            <div
              key={pdf.id}
              onClick={() => handlePDFClick(pdf)}
              className="group bg-white rounded-2xl border border-gray-200 p-6 hover:shadow-lg hover:shadow-blue-500/10 hover:border-blue-200 transition-all duration-300 cursor-pointer"
            >
              {/* PDF Icon */}
              <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-red-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <FileText size={24} className="text-white" />
              </div>

              {/* PDF Info */}
              <div className="space-y-2 mb-4">
                <h3 className="font-bold text-lg text-gray-900 truncate group-hover:text-blue-600 transition-colors">
                  {pdf.filename}
                </h3>
                <div className="flex items-center gap-4 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <HardDrive size={14} />
                    <span>{formatFileSize(pdf.fileSize)}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{formatRelativeTime(pdf.uploadedAt)}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                <button className="flex items-center gap-2 text-blue-600 text-sm font-semibold hover:text-blue-700 transition-colors">
                  <Eye size={16} />
                  Open
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    // TODO: Implement more actions menu
                  }}
                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <MoreVertical size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="bg-gray-50 rounded-2xl p-12 text-center">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileText size={40} className="text-gray-400" />
          </div>

          <h3 className="text-2xl font-bold text-gray-900 mb-3">No PDFs uploaded yet</h3>

          <p className="text-gray-600 font-medium mb-6 max-w-md mx-auto">
            Upload your first PDF to start creating notes and annotations.
            Your documents will appear here once uploaded.
          </p>

          {showUpload && (
            <button
              onClick={openFilePicker}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-xl transition-colors shadow-lg shadow-blue-500/25"
            >
              Upload Your First PDF
            </button>
          )}
        </div>
      )}

      {/* Total Count */}
      {totalCount > pdfs.length && (
        <div className="text-center py-4">
          <p className="text-gray-500 text-sm">
            Showing {pdfs.length} of {totalCount} PDFs
          </p>
        </div>
      )}
      </div>
    </ErrorBoundary>
  )
}