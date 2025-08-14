"use client";

import React, { ReactNode, ErrorInfo } from "react";
import {
  ErrorBoundary as ReactErrorBoundary,
  FallbackProps,
} from "react-error-boundary";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

// Default error fallback component
function DefaultErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="min-h-[400px] flex items-center justify-center bg-red-50 rounded-xl border border-red-200">
      <div className="text-center max-w-md p-6">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={28} className="text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          Something went wrong
        </h3>
        <p className="text-red-700 text-sm mb-4">
          {error?.message ||
            "An unexpected error occurred while loading this component."}
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={resetErrorBoundary}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <RefreshCw size={16} />
            Try Again
          </Button>
          <Button
            onClick={() => (window.location.href = "/dashboard")}
            variant="outline"
            size="sm"
            className="flex items-center gap-2"
          >
            <Home size={16} />
            Go Home
          </Button>
        </div>
        {process.env.NODE_ENV === "development" && (
          <details className="mt-4 text-left">
            <summary className="text-xs text-red-600 cursor-pointer">
              Error Details (Dev)
            </summary>
            <pre className="text-xs text-red-600 mt-2 p-2 bg-red-100 rounded overflow-auto max-h-32">
              {error?.stack}
            </pre>
          </details>
        )}
      </div>
    </div>
  );
}

// PDF-specific error fallback component
function PDFErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <div className="flex items-center justify-center h-96 bg-red-50 rounded-xl border border-red-200">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={28} className="text-red-500" />
        </div>
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          PDF Loading Failed
        </h3>
        <p className="text-red-700 text-sm mb-4">
          {error?.message ||
            "There was an error loading the PDF viewer. This might be due to a corrupted file or browser compatibility issue."}
        </p>
        <div className="flex gap-3 justify-center">
          <Button
            onClick={resetErrorBoundary}
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
          Try uploading a different PDF file or refresh the page if the problem
          persists.
        </p>
      </div>
    </div>
  );
}

// General error boundary wrapper
export function ErrorBoundary({
  children,
  fallback,
  onError,
}: ErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    onError?.(error, errorInfo);
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={
        fallback ? () => <>{fallback}</> : DefaultErrorFallback
      }
      onError={handleError}
    >
      {children}
    </ReactErrorBoundary>
  );
}

// Specialized error boundary for PDF components
export function PDFErrorBoundary({
  children,
  fallback,
  onError,
}: ErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    console.error("PDFErrorBoundary caught an error:", error, errorInfo);
    onError?.(error, errorInfo);
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={fallback ? () => <>{fallback}</> : PDFErrorFallback}
      onError={handleError}
    >
      {children}
    </ReactErrorBoundary>
  );
}
