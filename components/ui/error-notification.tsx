"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  X,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AppError,
  ErrorSeverity,
  ErrorNotificationOptions,
  ErrorRecoveryAction,
} from "@/lib/types/errors";
import { formatErrorForDisplay } from "@/lib/utils/error-handling/frontend-error-handling";

interface ErrorNotificationProps {
  error: AppError;
  options?: ErrorNotificationOptions;
  onDismiss?: () => void;
  onRetry?: () => void;
  recoveryActions?: ErrorRecoveryAction[];
}

export function ErrorNotification({
  error,
  options = {},
  onDismiss,
  onRetry,
  recoveryActions = [],
}: ErrorNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [isRetrying, setIsRetrying] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const {
    duration = 5000,
    persistent = false,
    showDetails: showDetailsOption = false,
    position = "top-right",
  } = options;

  const displayError = formatErrorForDisplay(error);

  // Auto-dismiss logic
  useEffect(() => {
    if (!persistent && duration > 0 && error.severity === ErrorSeverity.LOW) {
      const timer = setTimeout(() => {
        handleDismiss();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration, persistent, error.severity]);

  const handleDismiss = useCallback(() => {
    setIsVisible(false);
    setTimeout(() => onDismiss?.(), 300); // Allow animation to complete
  }, [onDismiss]);

  const handleRetry = useCallback(async () => {
    if (!onRetry) return;

    setIsRetrying(true);
    try {
      await onRetry();
      handleDismiss();
    } catch (retryError) {
      console.error("Retry failed:", retryError);
    } finally {
      setIsRetrying(false);
    }
  }, [onRetry, handleDismiss]);

  const getIcon = () => {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
        return <AlertTriangle size={20} className="text-red-500" />;
      case ErrorSeverity.HIGH:
        return <AlertCircle size={20} className="text-red-500" />;
      case ErrorSeverity.MEDIUM:
        return <AlertTriangle size={20} className="text-orange-500" />;
      case ErrorSeverity.LOW:
        return <Info size={20} className="text-blue-500" />;
      default:
        return <AlertCircle size={20} className="text-gray-500" />;
    }
  };

  const getBorderColor = () => {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return "border-red-200";
      case ErrorSeverity.MEDIUM:
        return "border-orange-200";
      case ErrorSeverity.LOW:
        return "border-blue-200";
      default:
        return "border-gray-200";
    }
  };

  const getBackgroundColor = () => {
    switch (error.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        return "bg-red-50";
      case ErrorSeverity.MEDIUM:
        return "bg-orange-50";
      case ErrorSeverity.LOW:
        return "bg-blue-50";
      default:
        return "bg-gray-50";
    }
  };

  const getPositionClasses = () => {
    const baseClasses = "fixed z-50";
    switch (position) {
      case "top-right":
        return `${baseClasses} top-4 right-4`;
      case "top-left":
        return `${baseClasses} top-4 left-4`;
      case "bottom-right":
        return `${baseClasses} bottom-4 right-4`;
      case "bottom-left":
        return `${baseClasses} bottom-4 left-4`;
      case "top-center":
        return `${baseClasses} top-4 left-1/2 transform -translate-x-1/2`;
      case "bottom-center":
        return `${baseClasses} bottom-4 left-1/2 transform -translate-x-1/2`;
      default:
        return `${baseClasses} top-4 right-4`;
    }
  };

  if (!isVisible) return null;

  return (
    <div
      className={`
        ${getPositionClasses()}
        max-w-md w-full
        transition-all duration-300 ease-in-out
        ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
      `}
    >
      <div
        className={`
          ${getBackgroundColor()}
          ${getBorderColor()}
          border rounded-lg shadow-lg p-4
        `}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-3">
            {getIcon()}
            <div>
              <h4 className="font-semibold text-gray-900 text-sm">
                {displayError.title}
              </h4>
              <p className="text-gray-700 text-sm mt-1">
                {displayError.message}
              </p>
            </div>
          </div>

          <button
            onClick={handleDismiss}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Context Information */}
        {error.context && (showDetailsOption || showDetails) && (
          <div className="mb-3 p-2 bg-white/50 rounded text-xs text-gray-600">
            {error.context.component && (
              <div>Component: {error.context.component}</div>
            )}
            {error.context.action && <div>Action: {error.context.action}</div>}
            {error.context.fileName && (
              <div>File: {error.context.fileName}</div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {/* Retry Button */}
            {error.retryable && onRetry && (
              <Button
                onClick={handleRetry}
                disabled={isRetrying}
                size="sm"
                variant="outline"
                className="text-xs"
              >
                <RefreshCw
                  size={12}
                  className={isRetrying ? "animate-spin" : ""}
                />
                {isRetrying ? "Retrying..." : "Retry"}
              </Button>
            )}

            {/* Recovery Actions */}
            {recoveryActions.slice(0, 2).map((action, index) => (
              <Button
                key={index}
                onClick={action.action}
                size="sm"
                variant={action.primary ? "default" : "outline"}
                className="text-xs"
              >
                {action.label}
              </Button>
            ))}

            {/* Contact Support */}
            {error.severity === ErrorSeverity.HIGH ||
            error.severity === ErrorSeverity.CRITICAL ? (
              <Button
                onClick={() =>
                  window.open(
                    "mailto:support@noto.app?subject=Error Report",
                    "_blank"
                  )
                }
                size="sm"
                variant="outline"
                className="text-xs"
              >
                <ExternalLink size={12} />
                Support
              </Button>
            ) : null}
          </div>

          {/* Details Toggle */}
          {error.context && !showDetailsOption && (
            <button
              onClick={() => setShowDetails(!showDetails)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              {showDetails ? "Hide" : "Details"}
            </button>
          )}
        </div>

        {/* Progress Bar for Auto-dismiss */}
        {!persistent &&
          duration > 0 &&
          error.severity === ErrorSeverity.LOW && (
            <div className="mt-3 h-1 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-500 transition-all ease-linear"
                style={{
                  animation: `shrink ${duration}ms linear`,
                }}
              />
            </div>
          )}
      </div>

      <style jsx>{`
        @keyframes shrink {
          from {
            width: 100%;
          }
          to {
            width: 0%;
          }
        }
      `}</style>
    </div>
  );
}

// Error notification manager hook
export function useErrorNotification() {
  const [notifications, setNotifications] = useState<
    Array<{
      id: string;
      error: AppError;
      options?: ErrorNotificationOptions;
      onRetry?: () => void;
      recoveryActions?: ErrorRecoveryAction[];
    }>
  >([]);

  const showError = useCallback(
    (
      error: AppError,
      options?: ErrorNotificationOptions,
      onRetry?: () => void,
      recoveryActions?: ErrorRecoveryAction[]
    ) => {
      const id = `error-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      setNotifications((prev) => [
        ...prev,
        {
          id,
          error,
          options,
          onRetry,
          recoveryActions,
        },
      ]);

      return id;
    },
    []
  );

  const dismissError = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);

  const dismissAll = useCallback(() => {
    setNotifications([]);
  }, []);

  return {
    notifications,
    showError,
    dismissError,
    dismissAll,
  };
}

// Error notification container component
export function ErrorNotificationContainer() {
  const { notifications, dismissError } = useErrorNotification();

  return (
    <>
      {notifications.map(({ id, error, options, onRetry, recoveryActions }) => (
        <ErrorNotification
          key={id}
          error={error}
          options={options}
          onDismiss={() => dismissError(id)}
          onRetry={onRetry}
          recoveryActions={recoveryActions}
        />
      ))}
    </>
  );
}
