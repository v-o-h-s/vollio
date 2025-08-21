'use client';

import React, { Component, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface EditorErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
  retryCount: number;
}

interface EditorErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  onRecover?: () => void;
  maxRetries?: number;
}

export class EditorErrorBoundary extends Component<
  EditorErrorBoundaryProps,
  EditorErrorBoundaryState
> {
  private backupContent: string | null = null;

  constructor(props: EditorErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<EditorErrorBoundaryState> {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    });

    // Try to backup current content
    this.backupCurrentContent();

    // Call error handler
    this.props.onError?.(error, errorInfo);

    // Log error for debugging
    console.error('Editor Error Boundary caught an error:', error, errorInfo);
  }

  private backupCurrentContent = () => {
    try {
      // Try to get content from localStorage or editor state
      const editorContent = localStorage.getItem('editor-backup');
      if (editorContent) {
        this.backupContent = editorContent;
      }
    } catch (error) {
      console.error('Failed to backup content:', error);
    }
  };

  private handleRetry = () => {
    const { maxRetries = 3 } = this.props;
    
    if (this.state.retryCount < maxRetries) {
      this.setState(prevState => ({
        hasError: false,
        error: null,
        errorInfo: null,
        retryCount: prevState.retryCount + 1,
      }));
      
      this.props.onRecover?.();
    }
  };

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: 0,
    });
    
    this.props.onRecover?.();
  };

  private handleSaveBackup = () => {
    if (this.backupContent) {
      const blob = new Blob([this.backupContent], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `editor-backup-${new Date().toISOString()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const { maxRetries = 3 } = this.props;
      const canRetry = this.state.retryCount < maxRetries;

      return (
        <Card className="w-full max-w-2xl mx-auto mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-5 w-5" />
              Editor Error
            </CardTitle>
            <CardDescription>
              The editor encountered an unexpected error. Your work may have been automatically saved.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted p-3 rounded text-sm font-mono">
              <div className="font-semibold text-destructive mb-1">Error:</div>
              <div>{this.state.error?.message || 'Unknown error occurred'}</div>
            </div>

            {this.backupContent && (
              <div className="bg-blue-50 p-3 rounded border border-blue-200">
                <div className="text-sm text-blue-800 mb-2">
                  Content backup available - you can download it to prevent data loss.
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={this.handleSaveBackup}
                  className="text-blue-700 border-blue-300"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Download Backup
                </Button>
              </div>
            )}

            <div className="flex gap-2">
              {canRetry && (
                <Button onClick={this.handleRetry} className="flex items-center gap-2">
                  <RefreshCw className="h-4 w-4" />
                  Retry ({maxRetries - this.state.retryCount} attempts left)
                </Button>
              )}
              
              <Button variant="outline" onClick={this.handleReset}>
                Reset Editor
              </Button>
              
              <Button 
                variant="outline" 
                onClick={() => window.location.reload()}
              >
                Reload Page
              </Button>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <details className="mt-4">
                <summary className="cursor-pointer text-sm font-medium">
                  Error Details (Development)
                </summary>
                <pre className="mt-2 text-xs bg-muted p-2 rounded overflow-auto">
                  {this.state.errorInfo.componentStack}
                </pre>
              </details>
            )}
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}