"use client";

import React, { ReactNode, ErrorInfo } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { AlertTriangle, RefreshCw, Home, FileText, Brain, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createAppError, ErrorType, mapErrorToAppError, logError } from "@/lib/utils/error-handling";

interface QuizErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  context?: 'generation' | 'playing' | 'results' | 'processing';
}

interface QuizErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
  context?: 'generation' | 'playing' | 'results' | 'processing';
}

function QuizErrorFallback({ error, resetErrorBoundary, context = 'generation' }: QuizErrorFallbackProps) {
  const appError = mapErrorToAppError(error, { 
    component: 'QuizComponent', 
    action: context 
  });

  // Log the error
  React.useEffect(() => {
    logError(appError);
  }, [appError]);

  const getContextInfo = () => {
    switch (context) {
      case 'generation':
        return {
          icon: <Brain className="h-8 w-8 text-blue-500" />,
          title: "Quiz Generation Error",
          description: "Something went wrong while generating your quiz",
          suggestions: [
            "Try reducing the number of questions",
            "Select fewer documents",
            "Check if your documents are properly processed",
            "Try again with simpler parameters"
          ]
        };
      case 'playing':
        return {
          icon: <FileText className="h-8 w-8 text-green-500" />,
          title: "Quiz Player Error",
          description: "Something went wrong while taking the quiz",
          suggestions: [
            "Your progress has been saved",
            "Try refreshing the page",
            "Check your internet connection",
            "Contact support if the issue persists"
          ]
        };
      case 'results':
        return {
          icon: <Zap className="h-8 w-8 text-purple-500" />,
          title: "Results Display Error",
          description: "Something went wrong while displaying your results",
          suggestions: [
            "Your quiz results are saved",
            "Try viewing from quiz history",
            "Refresh the page to reload results",
            "Contact support if results are missing"
          ]
        };
      case 'processing':
        return {
          icon: <AlertTriangle className="h-8 w-8 text-orange-500" />,
          title: "Document Processing Error",
          description: "Something went wrong while processing your documents",
          suggestions: [
            "Try processing the document again",
            "Check if the PDF is valid and not corrupted",
            "Try with OCR processing if text extraction failed",
            "Contact support for large or complex documents"
          ]
        };
      default:
        return {
          icon: <AlertTriangle className="h-8 w-8 text-red-500" />,
          title: "Quiz Error",
          description: "Something went wrong with the quiz system",
          suggestions: [
            "Try refreshing the page",
            "Check your internet connection",
            "Contact support if the issue persists"
          ]
        };
    }
  };

  const contextInfo = getContextInfo();

  const handleGoHome = () => {
    window.location.href = "/dashboard";
  };

  const handleGoToQuizzes = () => {
    window.location.href = "/dashboard/quiz";
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-[400px] flex items-center justify-center p-6">
      <Card className="max-w-2xl w-full">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-red-50 dark:bg-red-950/20 rounded-2xl flex items-center justify-center">
              {contextInfo.icon}
            </div>
          </div>
          <CardTitle className="text-2xl text-red-900 dark:text-red-100">
            {contextInfo.title}
          </CardTitle>
          <CardDescription className="text-red-700 dark:text-red-300">
            {contextInfo.description}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Error Details */}
          <div className="bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="destructive" className="text-xs">
                {appError.type}
              </Badge>
              <span className="text-xs text-red-600 dark:text-red-400">
                {appError.timestamp.toLocaleTimeString()}
              </span>
            </div>
            <p className="text-sm text-red-800 dark:text-red-200 font-medium">
              {appError.userMessage}
            </p>
          </div>

          {/* Suggestions */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">
              What you can try:
            </h4>
            <ul className="space-y-2">
              {contextInfo.suggestions.map((suggestion, index) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                  {suggestion}
                </li>
              ))}
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap gap-3 justify-center pt-4 border-t">
            <Button
              onClick={resetErrorBoundary}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
            
            {context === 'generation' && (
              <Button
                variant="outline"
                onClick={handleGoToQuizzes}
                className="flex items-center gap-2"
              >
                <FileText className="h-4 w-4" />
                Back to Quizzes
              </Button>
            )}
            
            <Button
              variant="outline"
              onClick={handleGoHome}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              Go Home
            </Button>
            
            <Button
              variant="outline"
              onClick={handleRefresh}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh Page
            </Button>
          </div>

          {/* Technical Details (Development Only) */}
          {process.env.NODE_ENV === 'development' && (
            <details className="mt-4">
              <summary className="text-xs text-gray-500 cursor-pointer">
                Technical Details (Development)
              </summary>
              <pre className="text-xs bg-gray-100 dark:bg-gray-800 p-2 rounded mt-2 overflow-auto max-h-32">
                {error.stack}
              </pre>
            </details>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export function QuizErrorBoundary({ 
  children, 
  fallback, 
  onError, 
  context = 'generation' 
}: QuizErrorBoundaryProps) {
  const handleError = (error: Error, errorInfo: ErrorInfo) => {
    const quizError = createAppError(
      ErrorType.UNKNOWN_ERROR,
      error?.message || "Quiz component error",
      { component: 'QuizComponent', action: context }
    );

    logError(quizError);
    onError?.(error, errorInfo);
  };

  const FallbackComponent = fallback
    ? () => <>{fallback}</>
    : (props: any) => <QuizErrorFallback {...props} context={context} />;

  return (
    <ErrorBoundary
      FallbackComponent={FallbackComponent}
      onError={handleError}
    >
      {children}
    </ErrorBoundary>
  );
}

// Specialized error boundaries for different quiz contexts
export function QuizGenerationErrorBoundary({ children, onError }: { children: ReactNode; onError?: (error: Error, errorInfo: ErrorInfo) => void }) {
  return (
    <QuizErrorBoundary context="generation" onError={onError}>
      {children}
    </QuizErrorBoundary>
  );
}

export function QuizPlayerErrorBoundary({ children, onError }: { children: ReactNode; onError?: (error: Error, errorInfo: ErrorInfo) => void }) {
  return (
    <QuizErrorBoundary context="playing" onError={onError}>
      {children}
    </QuizErrorBoundary>
  );
}

export function QuizResultsErrorBoundary({ children, onError }: { children: ReactNode; onError?: (error: Error, errorInfo: ErrorInfo) => void }) {
  return (
    <QuizErrorBoundary context="results" onError={onError}>
      {children}
    </QuizErrorBoundary>
  );
}

export function DocumentProcessingErrorBoundary({ children, onError }: { children: ReactNode; onError?: (error: Error, errorInfo: ErrorInfo) => void }) {
  return (
    <QuizErrorBoundary context="processing" onError={onError}>
      {children}
    </QuizErrorBoundary>
  );
}