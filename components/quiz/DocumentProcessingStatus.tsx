"use client";

import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToastActions } from "@/components/ui/toast";
import { DocumentProcessingErrorBoundary } from "./QuizErrorBoundary";
import { DocumentProcessingLoading } from "./QuizLoadingStates";
import { useDocumentProcessingErrorHandling } from "@/hooks/use-quiz-error-handling";
import { DocumentProcessingStatus as ProcessingStatus } from "@/lib/types/document-processing";
import {
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Loader2,
  Clock,
  FileText,
  Zap,
} from "lucide-react";

interface DocumentProcessingStatusProps {
  documentIds: string[];
  processingStatuses: Record<string, ProcessingStatus>;
  onRefresh: () => void;
  className?: string;
}

export function DocumentProcessingStatus({
  documentIds,
  processingStatuses,
  onRefresh,
  className,
}: DocumentProcessingStatusProps) {
  const toast = useToastActions();
  const { handleError, executeWithErrorHandling } =
    useDocumentProcessingErrorHandling();

  const [isRefreshing, setIsRefreshing] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refreshError, setRefreshError] = useState<string | null>(null);

  // Auto-refresh processing statuses
  useEffect(() => {
    if (!autoRefresh) return;

    const hasProcessingDocs = documentIds.some((docId) => {
      const status = processingStatuses[docId];
      return (
        status &&
        (status.status === "processing" || status.status === "pending")
      );
    });

    if (hasProcessingDocs) {
      const interval = setInterval(() => {
        onRefresh();
      }, 3000); // Refresh every 3 seconds

      return () => clearInterval(interval);
    }
  }, [documentIds, processingStatuses, onRefresh, autoRefresh]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    setRefreshError(null);

    try {
      await executeWithErrorHandling(
        async () => {
          await onRefresh();
          toast.success(
            "Status Updated",
            "Processing status refreshed successfully."
          );
        },
        {
          component: "DocumentProcessingStatus",
          action: "refresh_status",
        }
      );
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Failed to refresh status";
      setRefreshError(errorMessage);
      handleError(error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getStatusIcon = (status: ProcessingStatus | undefined) => {
    if (!status) return <Clock className="h-4 w-4 text-gray-400" />;

    switch (status.status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "processing":
      case "pending":
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case "failed":
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusText = (status: ProcessingStatus | undefined) => {
    if (!status) return "Not processed";

    switch (status.status) {
      case "completed":
        return "Ready for quiz generation";
      case "processing":
        return "Processing document...";
      case "pending":
        return "Queued for processing";
      case "failed":
        return "Processing failed";
      default:
        return "Unknown status";
    }
  };

  const getStatusVariant = (status: ProcessingStatus | undefined) => {
    if (!status) return "secondary";

    switch (status.status) {
      case "completed":
        return "default";
      case "processing":
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const formatTimeRemaining = (seconds?: number) => {
    if (!seconds || seconds <= 0) return null;

    if (seconds < 60) {
      return `${Math.round(seconds)}s remaining`;
    } else if (seconds < 3600) {
      return `${Math.round(seconds / 60)}m remaining`;
    } else {
      return `${Math.round(seconds / 3600)}h remaining`;
    }
  };

  const formatProcessingMethod = (method?: string) => {
    switch (method) {
      case "syncfusion":
        return "Syncfusion PDF Viewer";
      case "ocr":
        return "OCR Processing";
      default:
        return "Unknown method";
    }
  };

  const completedCount = documentIds.filter((docId) => {
    const status = processingStatuses[docId];
    return status && status.status === "completed";
  }).length;

  const processingCount = documentIds.filter((docId) => {
    const status = processingStatuses[docId];
    return (
      status && (status.status === "processing" || status.status === "pending")
    );
  }).length;

  const failedCount = documentIds.filter((docId) => {
    const status = processingStatuses[docId];
    return status && status.status === "failed";
  }).length;

  return (
    <DocumentProcessingErrorBoundary>
      <Card className={className}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Document Processing Status
              </CardTitle>
              <CardDescription>
                Track the processing progress of your selected documents
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`}
              />
              {isRefreshing ? "Refreshing..." : "Refresh"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Refresh Error */}
          {refreshError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-300">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm font-medium">Refresh Failed</span>
              </div>
              <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                {refreshError}
              </p>
            </div>
          )}
          {/* Overall Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Overall Progress</span>
              <span>
                {completedCount}/{documentIds.length} completed
              </span>
            </div>
            <Progress
              value={(completedCount / documentIds.length) * 100}
              className="h-2"
            />
          </div>

          {/* Status Summary */}
          <div className="flex gap-4 text-sm">
            <div className="flex items-center gap-1">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>{completedCount} Ready</span>
            </div>
            {processingCount > 0 && (
              <div className="flex items-center gap-1">
                <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
                <span>{processingCount} Processing</span>
              </div>
            )}
            {failedCount > 0 && (
              <div className="flex items-center gap-1">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <span>{failedCount} Failed</span>
              </div>
            )}
          </div>

          {/* Multi-document processing info */}
          {documentIds.length > 1 && completedCount === documentIds.length && (
            <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">
                  Multi-Document Processing Complete
                </span>
              </div>
              <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                All {documentIds.length} documents are processed and ready for
                cross-document quiz generation.
              </p>
            </div>
          )}

          {/* Individual Document Status */}
          <div className="space-y-3">
            {documentIds.map((docId) => {
              const status = processingStatuses[docId];
              const progress = status
                ? status.totalChunks > 0
                  ? (status.processedChunks / status.totalChunks) * 100
                  : 0
                : 0;

              return (
                <div key={docId} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium text-sm truncate">
                        Document {docId.slice(0, 8)}...
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status)}
                      <Badge
                        variant={getStatusVariant(status)}
                        className="text-xs"
                      >
                        {status?.status || "unprocessed"}
                      </Badge>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground mb-2">
                    {getStatusText(status)}
                  </p>

                  {status && status.status === "processing" && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Processing chunks</span>
                        <span>
                          {status.processedChunks}/{status.totalChunks}
                        </span>
                      </div>
                      <Progress value={progress} className="h-1" />
                      {status.estimatedTimeRemaining && (
                        <p className="text-xs text-muted-foreground">
                          {formatTimeRemaining(status.estimatedTimeRemaining)}
                        </p>
                      )}
                    </div>
                  )}

                  {status && status.status === "completed" && (
                    <div className="text-xs text-muted-foreground space-y-1">
                      <p>✓ {status.totalChunks} chunks processed</p>
                      <p>
                        Method:{" "}
                        {formatProcessingMethod(status.extractionMethod)}
                      </p>
                      {status.processingCompletedAt && (
                        <p>
                          Completed:{" "}
                          {new Date(
                            status.processingCompletedAt
                          ).toLocaleTimeString()}
                        </p>
                      )}
                    </div>
                  )}

                  {status &&
                    status.status === "failed" &&
                    status.errorMessage && (
                      <div className="text-xs text-red-600 bg-red-50 dark:bg-red-950/20 p-2 rounded">
                        Error: {status.errorMessage}
                      </div>
                    )}
                </div>
              );
            })}
          </div>

          {/* Auto-refresh toggle */}
          <div className="flex items-center justify-between pt-2 border-t">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="autoRefresh"
                checked={autoRefresh}
                onChange={(e) => setAutoRefresh(e.target.checked)}
                className="rounded border-border"
              />
              <label
                htmlFor="autoRefresh"
                className="text-sm text-muted-foreground"
              >
                Auto-refresh processing status
              </label>
            </div>

            {processingCount > 0 && (
              <p className="text-xs text-muted-foreground">
                Refreshing every 3 seconds
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </DocumentProcessingErrorBoundary>
  );
}
