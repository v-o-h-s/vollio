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
// import { useUploadErrorHandler } from '@/hooks/use-error-handling' // TODO: Create this hook
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
  // TODO: Re-enable when use-error-handling hook is created
  /*
  const {
    error: uploadError,
    isRetrying: isRetryingUpload,
    handleUploadError,
    getRecoveryActions,
    clearError: clearUploadError,
    retry: retryUpload
  } = useUploadErrorHandler()
  */

  // Temporary error handling - to be replaced with useUploadErrorHandler
  const uploadError = null;
  const isRetryingUpload = false;
  const handleUploadError = () => {};
  const getRecoveryActions = () => [];
  const clearUploadError = () => {};
  const retryUpload = () => {};

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
      <div className={`space-y-4 p-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-card/50 backdrop-blur-sm rounded-lg border border-border/60 p-4 animate-pulse">
              <div className="w-8 h-8 bg-card/60 backdrop-blur-sm rounded-lg mb-3"></div>
              <div className="h-4 bg-card/60 backdrop-blur-sm rounded mb-2"></div>
              <div className="h-3 bg-card/60 backdrop-blur-sm rounded w-2/3 mb-3"></div>
              <div className="flex justify-between items-center">
                <div className="h-3 bg-card/60 backdrop-blur-sm rounded w-1/3"></div>
                <div className="h-3 bg-card/60 backdrop-blur-sm rounded w-1/4"></div>
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
      <div className={`space-y-4 p-6 ${className}`}>
        <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-6 text-center">
          <div className="w-12 h-12 bg-destructive/10 rounded-lg flex items-center justify-center mx-auto mb-4">
            <AlertTriangle size={24} className="text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-destructive mb-2">{errorTitle}</h3>
          <p className="text-destructive/80 text-sm mb-4">{errorMessage}</p>
          
          {/* Error context if available */}
          {appError?.context && (
            <div className="bg-destructive/10 rounded-lg p-3 mb-4 text-left max-w-md mx-auto">
              <p className="text-xs text-destructive font-medium mb-1">Error Details:</p>
              <div className="text-xs text-destructive/80">
                {appError.context.component && <div>Component: {appError.context.component}</div>}
                {appError.context.action && <div>Action: {appError.context.action}</div>}
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-center">
            <Button
              onClick={() => refetch()}
              size="sm"
              className="bg-destructive hover:bg-destructive/90 text-destructive-foreground flex items-center gap-2 h-8"
            >
              <RefreshCw size={12} />
              Try Again
            </Button>
            
            {appError?.retryable && (
              <Button
                onClick={() => window.location.reload()}
                variant="outline"
                size="sm"
                className="flex items-center gap-2 border-destructive/20 text-destructive hover:bg-destructive/5 h-8"
              >
                <RefreshCw size={16} />
                Refresh Page
              </Button>
            )}
          </div>

          {/* Show technical details in development */}
          {process.env.NODE_ENV === 'development' && appError?.technicalMessage && (
            <details className="mt-4 text-left max-w-md mx-auto">
              <summary className="text-xs text-destructive cursor-pointer">
                Technical Details (Dev)
              </summary>
              <pre className="text-xs text-destructive/80 mt-2 p-2 bg-destructive/10 rounded overflow-auto max-h-32">
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
      <div className={`space-y-4 ${className}`}>
        {/* Upload Error Display */}
        {uploadError && (
          <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 mx-6">
            <div className="flex items-start gap-3">
              <AlertTriangle size={16} className="text-destructive mt-0.5" />
              <div className="flex-1">
                <h4 className="font-medium text-destructive mb-1 text-sm">Upload Failed</h4>
                <p className="text-destructive/80 text-sm mb-3">{uploadError.userMessage}</p>
                
                <div className="flex gap-2">
                  {uploadError.retryable && (
                    <Button
                      onClick={() => retryUpload(() => Promise.resolve())}
                      disabled={isRetryingUpload}
                      size="sm"
                      className="bg-destructive hover:bg-destructive/90 text-destructive-foreground h-8"
                    >
                      <RefreshCw size={12} className={isRetryingUpload ? 'animate-spin' : ''} />
                      {isRetryingUpload ? 'Retrying...' : 'Try Again'}
                    </Button>
                  )}
                  
                  {getRecoveryActions('').map((action, index) => (
                    <Button
                      key={index}
                      onClick={action.action}
                      size="sm"
                      variant="outline"
                      className="border-destructive/20 text-destructive hover:bg-destructive/5 h-8"
                    >
                      {action.label}
                    </Button>
                  ))}
                  
                  <Button
                    onClick={clearUploadError}
                    size="sm"
                    variant="outline"
                    className="border-destructive/20 text-destructive hover:bg-destructive/5 h-8"
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
            <div className="p-6 border-t border-border">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  relative border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200
                  ${isDragOver
                    ? 'border-border bg-card/40 backdrop-blur-sm'
                    : 'border-border bg-card/20 backdrop-blur-sm hover:border-border/60 hover:bg-card/40'
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

                <div className="w-12 h-12 bg-card/60 backdrop-blur-sm rounded-lg flex items-center justify-center mx-auto mb-3">
                  <Upload size={24} className="text-muted-foreground" />
                </div>

                <h3 className="text-base font-medium text-foreground mb-2">
                  {isDragOver ? 'Drop your PDF here' : 'Upload PDF'}
                </h3>

                <p className="text-muted-foreground text-sm mb-3">
                  {isUploading || isRetryingUpload
                    ? 'Uploading...'
                    : 'Drag and drop a PDF file here, or click to browse'
                  }
                </p>

                <p className="text-xs text-muted-foreground">
                  Maximum file size: 50MB • Supported format: PDF
                </p>
              </div>
            </div>
          </UploadErrorBoundary>
        )}

      {/* PDF Grid */}
      {pdfs.length > 0 ? (
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {pdfs.map((pdf) => (
              <div
                key={pdf.id}
                onClick={() => handlePDFClick(pdf)}
                className="group bg-card/50 backdrop-blur-sm rounded-lg border border-border/60 p-4 hover:shadow-md hover:border-border/80 hover:bg-card/70 transition-all duration-200 cursor-pointer"
              >
                {/* PDF Icon */}
                <div className="w-8 h-8 bg-card/60 backdrop-blur-sm rounded-lg flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <FileText size={16} className="text-muted-foreground" />
                </div>

                {/* PDF Info */}
                <div className="space-y-2 mb-3">
                  <h3 className="font-medium text-sm text-foreground truncate group-hover:text-foreground/80 transition-colors">
                    {pdf.filename}
                  </h3>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <HardDrive size={12} />
                      <span>{formatFileSize(pdf.fileSize)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar size={12} />
                      <span>{formatRelativeTime(pdf.uploadedAt)}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <button className="flex items-center gap-2 text-foreground text-xs hover:text-foreground/80 transition-colors">
                    <Eye size={12} />
                    Open
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      // TODO: Implement more actions menu
                    }}
                    className="p-1 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <MoreVertical size={12} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Empty State */
        <div className="p-6">
          <div className="bg-card/30 backdrop-blur-sm rounded-lg p-8 text-center border border-border/40">
            <div className="w-16 h-16 bg-card/60 backdrop-blur-sm rounded-lg flex items-center justify-center mx-auto mb-4">
              <FileText size={32} className="text-muted-foreground" />
            </div>

            <h3 className="text-lg font-semibold text-foreground mb-2">No PDFs uploaded yet</h3>

            <p className="text-muted-foreground text-sm mb-4 max-w-md mx-auto">
              Upload your first PDF to start creating notes and annotations.
              Your documents will appear here once uploaded.
            </p>

            {showUpload && (
              <Button
                onClick={openFilePicker}
                size="sm"
                variant="outline"
                className="border-border/60 text-foreground hover:bg-card/50 backdrop-blur-sm"
              >
                Upload Your First PDF
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Total Count */}
      {totalCount > pdfs.length && (
        <div className="text-center py-3 px-6 border-t border-border">
          <p className="text-muted-foreground text-xs">
            Showing {pdfs.length} of {totalCount} PDFs
          </p>
        </div>
      )}
      </div>
    </ErrorBoundary>
  )
}