"use client";

import React, { ReactNode, ErrorInfo, useState, useCallback } from "react";
import {
  ErrorBoundary as ReactErrorBoundary,
  FallbackProps,
} from "react-error-boundary";
import {
  AlertTriangle,
  RefreshCw,
  Home,
  Bug,
  Copy,
  CheckCircle,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AppError,
  ErrorRecoveryAction,
  ErrorDisplayOptions,
  ErrorType,
  ErrorSeverity,
} from "@/lib/types/errors";
import {
  mapErrorToAppError,
  logError,
  shouldReportError,
  formatErrorForDisplay,
  createAppError,
} from "@/lib/utils/error-handling/error-handling";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  displayOptions?: ErrorDisplayOptions;
  recoveryActions?: ErrorRecoveryAction[];
  context?: string;
}

interface ErrorFallbackProps extends FallbackProps {
  appError?: AppError;
  displayOptions?: ErrorDisplayOptions;
  recoveryActions?: ErrorRecoveryAction[];
  context?: string;
}

// Enhanced error fallback component with retry logic and better UX
function EnhancedErrorFallback({
  error,
  resetErrorBoundary,
  appError,
  displayOptions = {},
  recoveryActions = [],
  context,
}: ErrorFallbackProps) {
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [copied, setCopied] = useState(false);

  // Convert native error to AppError if needed
  const processedError =
    appError || mapErrorToAppError(error, { component: context });
  const displayError = formatErrorForDisplay(processedError);

  // Log the error
  React.useEffect(() => {
    logError(processedError);
  }, [processedError]);

  const handleRetry = useCallback(async () => {
    setIsRetrying(true);
    setRetryCount((prev) => prev + 1);

    try {
      // Add delay for better UX
      await new Promise((resolve) => setTimeout(resolve, 500));
      resetErrorBoundary();
    } catch (retryError) {
      console.error("Retry failed:", retryError);
    } finally {
      setIsRetrying(false);
    }
  }, [resetErrorBoundary]);

  const handleCopyError = useCallback(async () => {
    const errorDetails = {
      type: processedError.type,
      message: processedError.message,
      timestamp: processedError.timestamp,
      context: processedError.context,
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    try {
      await navigator.clipboard.writeText(
        JSON.stringify(errorDetails, null, 2)
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (clipboardError) {
      console.error("Failed to copy error details:", clipboardError);
    }
  }, [processedError]);

  const handleGoHome = useCallback(() => {
    window.location.href = "/dashboard";
  }, []);

  const handleRefreshPage = useCallback(() => {
    window.location.reload();
  }, []);

  const getSeverityColor = (severity: ErrorSeverity) => {
    switch (severity) {
      case ErrorSeverity.CRITICAL:
        return "bg-red-600 text-white";
      case ErrorSeverity.HIGH:
        return "bg-red-500 text-white";
      case ErrorSeverity.MEDIUM:
        return "bg-orange-500 text-white";
      case ErrorSeverity.LOW:
        return "bg-yellow-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const defaultActions: ErrorRecoveryAction[] = [
    ...(displayOptions.showRetryButton !== false && processedError.retryable
      ? [
          {
            label: isRetrying
              ? "Retrying..."
              : `Try Again${retryCount > 0 ? ` (${retryCount})` : ""}`,
            action: handleRetry,
            primary: true,
          },
        ]
      : []),
    {
      label: "Go Home",
      action: handleGoHome,
    },
    {
      label: "Refresh Page",
      action: handleRefreshPage,
    },
  ];

  const allActions = [...recoveryActions, ...defaultActions];

  return (
    <div className="min-h-[400px] flex items-center justify-center bg-red-50 rounded-xl border border-red-200">
      <div className="text-center max-w-lg p-6">
        {/* Error Icon and Severity Badge */}
        <div className="relative mx-auto mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center">
            <AlertTriangle size={28} className="text-red-500" />
          </div>
          <div
            className={`absolute -top-2 -right-2 px-2 py-1 rounded-full text-xs font-semibold ${getSeverityColor(
              processedError.severity
            )}`}
          >
            {processedError.severity}
          </div>
        </div>

        {/* Error Title and Message */}
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          {displayError.title}
        </h3>
        <p className="text-red-700 text-sm mb-4">{displayError.message}</p>

        {/* Context Information */}
        {processedError.context && (
          <div className="bg-red-100 rounded-lg p-3 mb-4 text-left">
            <p className="text-xs text-red-600 font-medium mb-1">
              Error Context:
            </p>
            <div className="text-xs text-red-700 space-y-1">
              {processedError.context.component && (
                <div>Component: {processedError.context.component}</div>
              )}
              {processedError.context.action && (
                <div>Action: {processedError.context.action}</div>
              )}
              {processedError.context.fileName && (
                <div>File: {processedError.context.fileName}</div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 justify-center mb-4">
          {allActions.map((action, index) => (
            <Button
              key={index}
              onClick={action.action}
              variant={action.primary ? "default" : "outline"}
              size="sm"
              disabled={isRetrying}
              className={`flex items-center gap-2 ${
                action.primary ? "bg-red-500 hover:bg-red-600 text-white" : ""
              }`}
            >
              {action.label === "Try Again" ||
              action.label.includes("Retrying") ? (
                <RefreshCw
                  size={16}
                  className={isRetrying ? "animate-spin" : ""}
                />
              ) : action.label === "Go Home" ? (
                <Home size={16} />
              ) : action.label === "Refresh Page" ? (
                <RefreshCw size={16} />
              ) : null}
              {action.label}
            </Button>
          ))}
        </div>

        {/* Additional Options */}
        <div className="flex justify-center gap-4 text-xs">
          {displayOptions.showTechnicalDetails !== false && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-red-600 hover:text-red-700 flex items-center gap-1"
            >
              <Bug size={12} />
              {showDetails ? "Hide" : "Show"} Details
            </button>
          )}

          <button
            onClick={handleCopyError}
            className="text-red-600 hover:text-red-700 flex items-center gap-1"
          >
            {copied ? <CheckCircle size={12} /> : <Copy size={12} />}
            {copied ? "Copied!" : "Copy Error"}
          </button>

          {displayOptions.showContactSupport !== false &&
            shouldReportError(processedError) && (
              <a
                href="mailto:support@noto.app?subject=Error Report"
                className="text-red-600 hover:text-red-700 flex items-center gap-1"
              >
                <ExternalLink size={12} />
                Contact Support
              </a>
            )}
        </div>

        {/* Technical Details */}
        {showDetails && displayOptions.showTechnicalDetails !== false && (
          <details className="mt-4 text-left bg-red-100 rounded-lg p-3">
            <summary className="text-xs text-red-600 cursor-pointer font-medium mb-2">
              Technical Details
            </summary>
            <div className="text-xs text-red-700 space-y-2">
              <div>
                <strong>Error Type:</strong> {processedError.type}
              </div>
              <div>
                <strong>Timestamp:</strong>{" "}
                {processedError.timestamp.toISOString()}
              </div>
              {processedError.technicalMessage && (
                <div>
                  <strong>Technical Message:</strong>{" "}
                  {processedError.technicalMessage}
                </div>
              )}
              {process.env.NODE_ENV === "development" && error?.stack && (
                <div>
                  <strong>Stack Trace:</strong>
                  <pre className="text-xs bg-red-200 p-2 rounded mt-1 overflow-auto max-h-32">
                    {error.stack}
                  </pre>
                </div>
              )}
            </div>
          </details>
        )}

        {/* Retry Count Display */}
        {retryCount > 0 && (
          <p className="text-xs text-red-600 mt-2">
            Retry attempts: {retryCount}
          </p>
        )}
      </div>
    </div>
  );
}

// PDF-specific error fallback component
function PDFErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const pdfError = createAppError(
    ErrorType.PDF_LOADING_ERROR,
    error?.message || "PDF loading failed",
    { component: "PDFViewer", action: "load" }
  );

  const recoveryActions: ErrorRecoveryAction[] = [
    {
      label: "Try Different PDF",
      action: () => window.history.back(),
    },
    {
      label: "Upload New PDF",
      action: () => (window.location.href = "/dashboard"),
    },
  ];

  return (
    <EnhancedErrorFallback
      error={error}
      resetErrorBoundary={resetErrorBoundary}
      appError={pdfError}
      recoveryActions={recoveryActions}
      context="PDFViewer"
      displayOptions={{
        showTechnicalDetails: true,
        showRetryButton: true,
        showContactSupport: true,
      }}
    />
  );
}

// Upload-specific error fallback component
function UploadErrorFallback({ error, resetErrorBoundary }: FallbackProps) {
  const uploadError = createAppError(
    ErrorType.STORAGE_UPLOAD_FAILED,
    error?.message || "File upload failed",
    { component: "FileUpload", action: "upload" }
  );

  const recoveryActions: ErrorRecoveryAction[] = [
    {
      label: "Choose Different File",
      action: () => {
        // Trigger file picker
        const input = document.createElement("input");
        input.type = "file";
        input.accept = ".pdf";
        input.click();
      },
    },
  ];

  return (
    <EnhancedErrorFallback
      error={error}
      resetErrorBoundary={resetErrorBoundary}
      appError={uploadError}
      recoveryActions={recoveryActions}
      context="FileUpload"
      displayOptions={{
        showRetryButton: true,
        showTechnicalDetails: false,
      }}
    />
  );
}

// General error boundary wrapper
export function ErrorBoundary({
  children,
  fallback,
  onError,
  displayOptions,
  recoveryActions,
  context,
}: ErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    const appError = mapErrorToAppError(error, {
      component: context,
      action: "render",
    });

    logError(appError);
    onError?.(error, errorInfo);
  };

  const FallbackComponent = fallback
    ? () => <>{fallback}</>
    : (props: FallbackProps) => (
        <EnhancedErrorFallback
          {...props}
          displayOptions={displayOptions}
          recoveryActions={recoveryActions}
          context={context}
        />
      );

  return (
    <ReactErrorBoundary
      FallbackComponent={FallbackComponent}
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
  displayOptions,
  recoveryActions,
}: ErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    const pdfError = createAppError(
      ErrorType.PDF_LOADING_ERROR,
      error?.message || "PDF component error",
      { component: "PDFViewer", action: "render" }
    );

    logError(pdfError);
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

// Specialized error boundary for upload components
export function UploadErrorBoundary({
  children,
  fallback,
  onError,
  displayOptions,
  recoveryActions,
}: ErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    const uploadError = createAppError(
      ErrorType.STORAGE_UPLOAD_FAILED,
      error?.message || "Upload component error",
      { component: "FileUpload", action: "render" }
    );

    logError(uploadError);
    onError?.(error, errorInfo);
  };

  return (
    <ReactErrorBoundary
      FallbackComponent={fallback ? () => <>{fallback}</> : UploadErrorFallback}
      onError={handleError}
    >
      {children}
    </ReactErrorBoundary>
  );
}
