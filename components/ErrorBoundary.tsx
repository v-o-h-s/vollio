'use client'

import React, { Component, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface Props {
    children: ReactNode
    fallback?: ReactNode
    onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

interface State {
    hasError: boolean
    error: Error | null
    errorInfo: React.ErrorInfo | null
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false, error: null, errorInfo: null }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo)

        this.setState({
            error,
            errorInfo
        })

        // Call custom error handler if provided
        if (this.props.onError) {
            this.props.onError(error, errorInfo)
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null })
    }

    render() {
        if (this.state.hasError) {
            // Use custom fallback if provided
            if (this.props.fallback) {
                return this.props.fallback
            }

            // Default error UI
            return (
                <div className="min-h-[400px] flex items-center justify-center bg-red-50 rounded-xl border border-red-200">
                    <div className="text-center max-w-md p-6">
                        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle size={28} className="text-red-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-red-900 mb-2">Something went wrong</h3>
                        <p className="text-red-700 text-sm mb-4">
                            {this.state.error?.message || 'An unexpected error occurred while loading this component.'}
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Button
                                onClick={this.handleReset}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <RefreshCw size={16} />
                                Try Again
                            </Button>
                            <Button
                                onClick={() => window.location.href = '/dashboard'}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <Home size={16} />
                                Go Home
                            </Button>
                        </div>
                        {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
                            <details className="mt-4 text-left">
                                <summary className="text-xs text-red-600 cursor-pointer">Error Details (Dev)</summary>
                                <pre className="text-xs text-red-600 mt-2 p-2 bg-red-100 rounded overflow-auto max-h-32">
                                    {this.state.error?.stack}
                                    {this.state.errorInfo.componentStack}
                                </pre>
                            </details>
                        )}
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}

// Specialized error boundary for PDF components
export class PDFErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false, error: null, errorInfo: null }
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error, errorInfo: null }
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        console.error('PDFErrorBoundary caught an error:', error, errorInfo)

        this.setState({
            error,
            errorInfo
        })

        if (this.props.onError) {
            this.props.onError(error, errorInfo)
        }
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null, errorInfo: null })
    }

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback
            }

            return (
                <div className="flex items-center justify-center h-96 bg-red-50 rounded-xl border border-red-200">
                    <div className="text-center max-w-md">
                        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <AlertTriangle size={28} className="text-red-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-red-900 mb-2">PDF Loading Failed</h3>
                        <p className="text-red-700 text-sm mb-4">
                            {this.state.error?.message || 'There was an error loading the PDF viewer. This might be due to a corrupted file or browser compatibility issue.'}
                        </p>
                        <div className="flex gap-3 justify-center">
                            <Button
                                onClick={this.handleReset}
                                className="bg-red-500 hover:bg-red-600 text-white flex items-center gap-2"
                                size="sm"
                            >
                                <RefreshCw size={16} />
                                Retry PDF Load
                            </Button>
                            <Button
                                onClick={() => window.location.reload()}
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2"
                            >
                                <RefreshCw size={16} />
                                Refresh Page
                            </Button>
                        </div>
                        <p className="text-xs text-red-600 mt-3">
                            Try uploading a different PDF file or refresh the page if the problem persists.
                        </p>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}