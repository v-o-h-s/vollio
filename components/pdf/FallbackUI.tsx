'use client'

/**
 * FallbackUI Components
 * 
 * Collection of fallback UI components for error states and empty states.
 * These components provide user-friendly error messages and recovery options
 * when PDF operations fail or encounter issues.
 * 
 * Components included:
 * - TextSelectionFallback: When text selection fails
 * - AnnotationCreationFallback: When annotation creation fails
 * - PDFViewerFallback: When PDF loading/viewing fails
 * - NetworkErrorFallback: When network requests fail
 * - EmptyStateFallback: Generic empty state component
 * 
 * Key Features:
 * - Consistent visual design with appropriate icons
 * - Helpful error messages and troubleshooting tips
 * - Action buttons for recovery (retry, cancel, help)
 * - Responsive design that works on all devices
 * - Accessibility-compliant markup and interactions
 * 
 * @author Noto Team
 * @version 1.0.0
 */

import React from 'react'
import { AlertTriangle, RefreshCw, MousePointer, FileText, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

/**
 * Props for TextSelectionFallback component
 * Shown when text selection in PDF fails
 */
interface TextSelectionFallbackProps {
    /** Callback to retry the text selection operation */
    onRetry: () => void
    /** Optional callback to show help/troubleshooting information */
    onHelp?: () => void
}

export function TextSelectionFallback({ onRetry, onHelp }: TextSelectionFallbackProps) {
    return (
        <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-[9999]">
            <div className="text-center max-w-md p-6 bg-white rounded-xl border border-gray-200 shadow-lg">
                <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <MousePointer size={28} className="text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Text Selection Failed</h3>
                <p className="text-gray-600 text-sm mb-4">
                    We couldn't capture your text selection. This might happen if the PDF text layer isn't fully loaded or if you selected non-text content.
                </p>
                <div className="space-y-3">
                    <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                        <strong>Tips:</strong>
                        <ul className="mt-1 space-y-1 text-left">
                            <li>• Wait for the PDF to fully load</li>
                            <li>• Select actual text, not images</li>
                            <li>• Try selecting a smaller text area</li>
                            <li>• Ensure you're selecting within the PDF</li>
                        </ul>
                    </div>
                    <div className="flex gap-2 justify-center">
                        <Button
                            onClick={onRetry}
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            <RefreshCw size={16} />
                            Try Again
                        </Button>
                        {onHelp && (
                            <Button
                                onClick={onHelp}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <HelpCircle size={16} />
                                Help
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

interface AnnotationCreationFallbackProps {
    error: string
    onRetry: () => void
    onCancel: () => void
    selectedText?: string
}

export function AnnotationCreationFallback({
    error,
    onRetry,
    onCancel,
    selectedText
}: AnnotationCreationFallbackProps) {
    return (
        <div className="absolute inset-0 bg-white bg-opacity-95 flex items-center justify-center z-[9999]">
            <div className="text-center max-w-md p-6 bg-white rounded-xl border border-red-200 shadow-lg">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle size={28} className="text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-red-900 mb-2">Annotation Creation Failed</h3>
                <p className="text-red-700 text-sm mb-4">{error}</p>

                {selectedText && (
                    <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg mb-4">
                        <strong>Selected text:</strong>
                        <p className="mt-1 italic">"{selectedText.substring(0, 100)}{selectedText.length > 100 ? '...' : ''}"</p>
                    </div>
                )}

                <div className="flex gap-2 justify-center">
                    <Button
                        onClick={onRetry}
                        size="sm"
                        className="flex items-center gap-2 bg-red-500 hover:bg-red-600"
                    >
                        <RefreshCw size={16} />
                        Retry
                    </Button>
                    <Button
                        onClick={onCancel}
                        variant="outline"
                        size="sm"
                    >
                        Cancel
                    </Button>
                </div>
            </div>
        </div>
    )
}

interface PDFViewerFallbackProps {
    error: string
    onRetry: () => void
    onUploadNew: () => void
    fileName?: string
}

export function PDFViewerFallback({
    error,
    onRetry,
    onUploadNew,
    fileName
}: PDFViewerFallbackProps) {
    return (
        <div className="flex items-center justify-center h-96 bg-red-50 rounded-xl border border-red-200">
            <div className="text-center max-w-md p-6">
                <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <FileText size={28} className="text-red-500" />
                </div>
                <h3 className="text-lg font-semibold text-red-900 mb-2">PDF Viewer Error</h3>
                <p className="text-red-700 text-sm mb-4">{error}</p>

                {fileName && (
                    <p className="text-xs text-gray-600 mb-4">
                        File: <span className="font-mono">{fileName}</span>
                    </p>
                )}

                <div className="space-y-3">
                    <div className="text-xs text-red-600 bg-red-50 p-3 rounded-lg border border-red-200">
                        <strong>Common causes:</strong>
                        <ul className="mt-1 space-y-1 text-left">
                            <li>• Corrupted or password-protected PDF</li>
                            <li>• Unsupported PDF version or features</li>
                            <li>• Network connection issues</li>
                            <li>• Browser compatibility problems</li>
                        </ul>
                    </div>

                    <div className="flex gap-2 justify-center">
                        <Button
                            onClick={onRetry}
                            size="sm"
                            className="flex items-center gap-2 bg-red-500 hover:bg-red-600"
                        >
                            <RefreshCw size={16} />
                            Retry
                        </Button>
                        <Button
                            onClick={onUploadNew}
                            variant="outline"
                            size="sm"
                            className="flex items-center gap-2"
                        >
                            <FileText size={16} />
                            Upload Different PDF
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}

interface NetworkErrorFallbackProps {
    onRetry: () => void
    onOfflineMode?: () => void
}

export function NetworkErrorFallback({ onRetry, onOfflineMode }: NetworkErrorFallbackProps) {
    return (
        <div className="flex items-center justify-center min-h-[200px] bg-yellow-50 rounded-xl border border-yellow-200">
            <div className="text-center max-w-md p-6">
                <div className="w-16 h-16 bg-yellow-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle size={28} className="text-yellow-600" />
                </div>
                <h3 className="text-lg font-semibold text-yellow-900 mb-2">Connection Error</h3>
                <p className="text-yellow-700 text-sm mb-4">
                    Unable to connect to the server. Please check your internet connection and try again.
                </p>

                <div className="flex gap-2 justify-center">
                    <Button
                        onClick={onRetry}
                        size="sm"
                        className="flex items-center gap-2"
                    >
                        <RefreshCw size={16} />
                        Retry
                    </Button>
                    {onOfflineMode && (
                        <Button
                            onClick={onOfflineMode}
                            variant="outline"
                            size="sm"
                        >
                            Continue Offline
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}

interface EmptyStateFallbackProps {
    title: string
    description: string
    actionLabel: string
    onAction: () => void
    icon?: React.ComponentType<{ size: number; className?: string }>
}

export function EmptyStateFallback({
    title,
    description,
    actionLabel,
    onAction,
    icon: Icon = FileText
}: EmptyStateFallbackProps) {
    return (
        <div className="flex items-center justify-center min-h-[300px] bg-gray-50 rounded-xl border border-gray-200">
            <div className="text-center max-w-md p-6">
                <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon size={28} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-600 text-sm mb-4">{description}</p>
                <Button
                    onClick={onAction}
                    size="sm"
                    className="flex items-center gap-2"
                >
                    {actionLabel}
                </Button>
            </div>
        </div>
    )
}