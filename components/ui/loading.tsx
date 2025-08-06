'use client'

import React from 'react'
import { Loader2, FileText, Upload, CheckCircle } from 'lucide-react'

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

export function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-6 w-6',
        lg: 'h-8 w-8'
    }

    return (
        <Loader2
            className={`animate-spin text-blue-500 ${sizeClasses[size]} ${className}`}
        />
    )
}

interface LoadingStateProps {
    title: string
    description?: string
    progress?: number
    className?: string
}

export function LoadingState({ title, description, progress, className = '' }: LoadingStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center p-8 ${className}`}>
            <LoadingSpinner size="lg" className="mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
            {description && (
                <p className="text-gray-600 text-center max-w-md mb-4">{description}</p>
            )}
            {progress !== undefined && (
                <div className="w-full max-w-xs">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

interface PDFLoadingProps {
    stage: 'uploading' | 'processing' | 'rendering' | 'complete'
    progress?: number
    fileName?: string
}

export function PDFLoadingIndicator({ stage, progress, fileName }: PDFLoadingProps) {
    const stages = {
        uploading: {
            icon: Upload,
            title: 'Uploading PDF',
            description: fileName ? `Uploading ${fileName}...` : 'Uploading your PDF file...'
        },
        processing: {
            icon: FileText,
            title: 'Processing PDF',
            description: 'Converting PDF for viewing and annotation...'
        },
        rendering: {
            icon: Loader2,
            title: 'Loading PDF Viewer',
            description: 'Initializing PDF viewer and text layer...'
        },
        complete: {
            icon: CheckCircle,
            title: 'PDF Ready',
            description: 'Your PDF is ready for annotation!'
        }
    }

    const currentStage = stages[stage]
    const Icon = currentStage.icon

    return (
        <div className="flex flex-col items-center justify-center p-8 bg-blue-50 rounded-xl border border-blue-200">
            <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mb-4">
                <Icon
                    size={28}
                    className={`text-blue-500 ${stage === 'complete' ? '' : 'animate-spin'}`}
                />
            </div>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">{currentStage.title}</h3>
            <p className="text-blue-700 text-center max-w-md mb-4">{currentStage.description}</p>

            {progress !== undefined && stage !== 'complete' && (
                <div className="w-full max-w-xs">
                    <div className="flex justify-between text-sm text-blue-700 mb-1">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-blue-200 rounded-full h-2">
                        <div
                            className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-out"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

interface AnnotationLoadingProps {
    action: 'creating' | 'updating' | 'deleting' | 'loading'
    count?: number
}

export function AnnotationLoadingIndicator({ action, count }: AnnotationLoadingProps) {
    const actions = {
        creating: 'Creating annotation...',
        updating: 'Updating annotation...',
        deleting: 'Deleting annotation...',
        loading: count ? `Loading ${count} annotations...` : 'Loading annotations...'
    }

    return (
        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
            <LoadingSpinner size="sm" />
            <span className="text-sm text-blue-700 font-medium">{actions[action]}</span>
        </div>
    )
}

interface InlineLoadingProps {
    text: string
    size?: 'sm' | 'md'
}

export function InlineLoading({ text, size = 'sm' }: InlineLoadingProps) {
    return (
        <div className="flex items-center gap-2">
            <LoadingSpinner size={size} />
            <span className={`text-gray-600 ${size === 'sm' ? 'text-sm' : 'text-base'}`}>
                {text}
            </span>
        </div>
    )
}

// Skeleton components for better perceived performance
interface SkeletonProps {
    className?: string
    animate?: boolean
}

export function Skeleton({ className = '', animate = true }: SkeletonProps) {
    return (
        <div
            className={`bg-gray-200 rounded ${animate ? 'animate-pulse' : ''} ${className}`}
            role="status"
            aria-label="Loading content"
        />
    )
}

export function PDFViewerSkeleton() {
    return (
        <div className="w-full h-full bg-white rounded-xl border border-gray-200 overflow-hidden">
            <div className="animate-pulse">
                {/* Toolbar skeleton */}
                <div className="h-12 bg-gray-100 border-b border-gray-200 flex items-center px-4 gap-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <div className="flex-1" />
                    <Skeleton className="h-6 w-16" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                </div>

                {/* PDF content skeleton */}
                <div className="p-8 space-y-6">
                    <div className="max-w-2xl mx-auto space-y-4">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-4/5" />
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-3/4" />

                        <div className="py-4">
                            <Skeleton className="h-32 w-full" />
                        </div>

                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-4 w-5/6" />
                        <Skeleton className="h-4 w-4/5" />
                    </div>
                </div>
            </div>
        </div>
    )
}

export function AnnotationListSkeleton({ count = 3 }: { count?: number }) {
    return (
        <div className="space-y-3">
            {Array.from({ length: count }).map((_, i) => (
                <div key={i} className="animate-pulse">
                    <div className="bg-white rounded-lg border border-gray-200 p-4">
                        <div className="flex items-start gap-3">
                            <Skeleton className="h-10 w-10 rounded-full flex-shrink-0" />
                            <div className="flex-1 space-y-2">
                                <Skeleton className="h-4 w-1/4" />
                                <Skeleton className="h-3 w-full" />
                                <Skeleton className="h-3 w-3/4" />
                                <div className="flex gap-2 mt-3">
                                    <Skeleton className="h-6 w-16" />
                                    <Skeleton className="h-6 w-20" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    )
}

export function NoteEditorSkeleton() {
    return (
        <div className="animate-pulse space-y-4">
            <div className="flex items-center gap-2 mb-4">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-6 w-32" />
            </div>

            {/* Toolbar skeleton */}
            <div className="flex gap-1 p-2 border border-gray-200 rounded-lg">
                {Array.from({ length: 8 }).map((_, i) => (
                    <Skeleton key={i} className="h-8 w-8" />
                ))}
            </div>

            {/* Editor content skeleton */}
            <div className="border border-gray-200 rounded-lg p-4 min-h-[200px] space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-4/5" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
            </div>

            {/* Action buttons skeleton */}
            <div className="flex gap-2 justify-end">
                <Skeleton className="h-9 w-20" />
                <Skeleton className="h-9 w-16" />
            </div>
        </div>
    )
}