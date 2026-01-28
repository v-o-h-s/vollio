"use client";

import { type ReactNode } from "react";
import {
  ErrorBoundary as ReactErrorBoundary,
  type ErrorBoundaryProps as ReactErrorBoundaryProps,
  type FallbackProps,
} from "react-error-boundary";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

type ResetHandler = ReactErrorBoundaryProps["onReset"];
type ErrorHandler = ReactErrorBoundaryProps["onError"];
type ResetKeys = ReactErrorBoundaryProps["resetKeys"];
interface DefaultFallbackProps extends FallbackProps {
  title?: string;
  description?: string;
  context?: string;
}

const DefaultFallback = ({  
  error,
  resetErrorBoundary,
  title,
  description,
  context,
}: DefaultFallbackProps) => {
  const errorMessage =
    error instanceof Error ? error.message : String(error ?? "Unknown error");
  const errorStack = error instanceof Error ? error.stack : undefined;

  return (
    <div className="flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full space-y-5 rounded-2xl border border-border/70 bg-card p-8 text-center shadow-sm">
        <div className="flex justify-center">
          <AlertTriangle className="h-12 w-12 text-destructive" />
        </div>

        <div className="space-y-2">
          <h3 className="text-xl font-semibold">
            {title ?? "Something went wrong"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {description ?? "An unexpected error occurred. Please try again."}
          </p>
          {context && (
            <p className="text-xs text-muted-foreground/80">
              Context: {context}
            </p>
          )}
        </div>

        {process.env.NODE_ENV === "development" && error ? (
          <details className="text-left text-xs bg-muted/40 border border-border/60 rounded-lg p-3 max-h-48 overflow-auto">
            <summary className="cursor-pointer font-medium">
              Error details
            </summary>
            <pre className="mt-2 whitespace-pre-wrap text-destructive">
              {errorStack ?? errorMessage}
            </pre>
          </details>
        ) : null}

        <div className="flex justify-center">
          <Button variant="outline" onClick={() => resetErrorBoundary()} className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Try again
          </Button>
        </div>
      </div>
    </div>
  );
};

interface ErrorBoundaryProps {
  children: ReactNode;
  /**
   * Provide a custom fallback UI as a ReactNode.
   */
  fallback?: ReactNode;
  /**
   * Optional reset callback invoked when the boundary successfully resets.
   */
  onReset?: ResetHandler;
  /**
   * Optional error callback from `react-error-boundary`.
   */
  onError?: ErrorHandler;
  /**
   * Keys that trigger an automatic reset when they change.
   */
  resetKeys?: ResetKeys;
  /**
   * Override the default title copy rendered by the built-in fallback UI.
   */
  title?: string;
  /**
   * Override the default description copy rendered by the built-in fallback UI.
   */
  description?: string;
  /**
   * Helpful context string shown underneath the description in the default UI.
   */
  context?: string;
}

export const ErrorBoundary = ({
  children,
  fallback,
  onReset,
  onError,
  resetKeys,
  title,
  description,
  context,
}: ErrorBoundaryProps) => {
  const defaultFallbackRender = (props: FallbackProps) => (
    <DefaultFallback
      {...props}
      title={title}
      description={description}
      context={context} 
    />
  );

  const resolvedFallbackProps = fallback
    ? { fallback }
    : { fallbackRender: defaultFallbackRender };

  const handleReset: ResetHandler = (details) => {
    onReset?.(details);
  };

  const handleError: ErrorHandler = (error, info) => {
    if (process.env.NODE_ENV !== "production") {
      const contextLabel = context ? ` [${context}]` : "";
      console.error(
        `ErrorBoundary${contextLabel} caught an error:`,
        error,
        info,
      );
    }
    onError?.(error, info);
  };

  return (
    <ReactErrorBoundary
      onReset={handleReset}
      onError={handleError}
      resetKeys={resetKeys}
      {...resolvedFallbackProps}
    >
      {children}
    </ReactErrorBoundary>
  );
};

