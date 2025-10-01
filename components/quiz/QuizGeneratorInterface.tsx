"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ErrorNotification } from "@/components/ui/error-notification";
import toast from "react-hot-toast";
import { useGetPDFsQuery } from "@/lib/store/apiSlice";
import { QuizConfigurationPanel } from "./QuizConfigurationPanel";
import { MultiDocumentStatus } from "./MultiDocumentStatus";
import { ContentPreview } from "./ContentPreview";
import { QuizGenerationErrorBoundary } from "./QuizErrorBoundary";
import {
  QuizGenerationLoading,
  QuizGeneratorSkeleton,
} from "./QuizLoadingStates";
import { useQuizGenerationErrorHandling } from "@/hooks/use-quiz-error-handling";
import { QuizConfiguration } from "@/lib/types/quiz";
import { type DocumentProcessingStatus as DocumentProcessingStatusType } from "@/lib/types/document-processing";
import { DocumentProcessingStatus } from "./DocumentProcessingStatus";
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";

interface QuizGeneratorInterfaceProps {
  className?: string;
}

export function QuizGeneratorInterface({
  className,
}: QuizGeneratorInterfaceProps) {
  const router = useRouter();

  const {
    handleQuizGenerationError,
    handleDocumentProcessingError,
    executeWithErrorHandling,
    clearError,
    error: errorHandlingError,
    isRetrying,
  } = useQuizGenerationErrorHandling();

  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [quizConfig, setQuizConfig] = useState<QuizConfiguration>({
    questionCount: 10,
    difficulty: "medium",
    questionTypes: ["mcq", "truefalse"],
  });
  const [processingStatuses, setProcessingStatuses] = useState<
    Record<string, DocumentProcessingStatusType>
  >({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState<
    | "initializing"
    | "searching"
    | "generating"
    | "validating"
    | "storing"
    | "complete"
  >("initializing");
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);

  // Fetch user's PDFs
  const {
    data: pdfData,
    isLoading: isLoadingPDFs,
    error: pdfError,
    refetch: refetchPDFs,
  } = useGetPDFsQuery();

  // Check processing status for selected documents
  useEffect(() => {
    if (selectedDocuments.length > 0) {
      checkProcessingStatuses(selectedDocuments);
    }
  }, [selectedDocuments]);

  const checkProcessingStatuses = async (documentIds: string[]) => {
    try {
      await executeWithErrorHandling(
        async () => {
          const statusPromises = documentIds.map(async (docId) => {
            const response = await fetch(
              `/api/quiz/processing-status/${docId}`
            );
            if (!response.ok) {
              throw new Error(
                `Failed to fetch status for document ${docId}: ${response.statusText}`
              );
            }
            const result = await response.json();
            return { docId, status: result.data };
          });

          const results = await Promise.all(statusPromises);
          const statusMap: Record<string, DocumentProcessingStatusType> = {};

          results.forEach(({ docId, status }) => {
            if (status) {
              statusMap[docId] = status;
            }
          });

          setProcessingStatuses(statusMap);
        },
        {
          component: "QuizGenerator",
          action: "check_processing_status",
        }
      );
    } catch (error) {
      // Error is already handled by executeWithErrorHandling
      console.error("Failed to check processing statuses:", error);
    }
  };

  const handleDocumentToggle = (documentId: string) => {
    setSelectedDocuments((prev) =>
      prev.includes(documentId)
        ? prev.filter((id) => id !== documentId)
        : [...prev, documentId]
    );
  };

  const handleProcessDocument = async (documentId: string) => {
    const loadingToastId = toast.loading(
      "Processing Document",
      "Starting document processing..."
    );

    try {
      await executeWithErrorHandling(
        async () => {
          const response = await fetch("/api/quiz/process-document", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pdfId: documentId }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to process document");
          }

          const result = await response.json();

          // Update toast to show success
          toast.update(loadingToastId, {
            type: "success",
            title: "Processing Started",
            description: `Document processing has been queued. Job ID: ${result.jobId}`,
            duration: 5000,
          });

          // Refresh processing status
          await checkProcessingStatuses([documentId]);
        },
        {
          component: "QuizGenerator",
          action: "process_document",
          documentId,
        }
      );
    } catch (error) {
      // Update toast to show error
      toast.update(loadingToastId, {
        type: "error",
        title: "Processing Failed",
        description:
          error instanceof Error ? error.message : "Failed to process document",
        duration: 8000,
      });

      handleDocumentProcessingError(error);
    }
  };

  const handleGenerateQuiz = async () => {
    // Clear any previous errors
    setGenerationError(null);
    clearError();

    // Validation
    if (selectedDocuments.length === 0) {
      const error = "Please select at least one document";
      setGenerationError(error);
      toast.warning("No Documents Selected", error);
      return;
    }

    // Check if all selected documents are processed
    const unprocessedDocs = selectedDocuments.filter((docId) => {
      const status = processingStatuses[docId];
      return !status || status.status !== "completed";
    });

    if (unprocessedDocs.length > 0) {
      const error =
        "All selected documents must be processed before generating a quiz";
      setGenerationError(error);
      toast.warning("Documents Not Ready", error);
      return;
    }

    setIsGenerating(true);
    setGenerationStage("initializing");
    setGenerationProgress(0);

    try {
      await executeWithErrorHandling(
        async () => {
          // Enhanced title for multi-document quizzes
          const documentTitles = selectedDocuments.map((docId) => {
            const pdf = pdfs.find((p) => p.id === docId);
            return pdf?.filename || "Unknown Document";
          });

          const title =
            selectedDocuments.length === 1
              ? `Quiz: ${documentTitles[0]}`
              : `Multi-Document Quiz: ${documentTitles.slice(0, 2).join(", ")}${
                  documentTitles.length > 2
                    ? ` +${documentTitles.length - 2} more`
                    : ""
                }`;

          // Simulate progress stages
          const stages: Array<typeof generationStage> = [
            "initializing",
            "searching",
            "generating",
            "validating",
            "storing",
          ];

          for (let i = 0; i < stages.length; i++) {
            setGenerationStage(stages[i]);
            setGenerationProgress((i / stages.length) * 90); // Leave 10% for final completion

            // Add small delay to show progress (remove in production if API provides real progress)
            if (i < stages.length - 1) {
              await new Promise((resolve) => setTimeout(resolve, 500));
            }
          }

          const response = await fetch("/api/quiz/generate-rag", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              documentIds: selectedDocuments,
              questionCount: quizConfig.questionCount,
              difficulty: quizConfig.difficulty,
              questionTypes: quizConfig.questionTypes,
              pageRange: quizConfig.pageRange,
              notes: quizConfig.notes,
              focusAreas: quizConfig.focusAreas,
              learningObjectives: quizConfig.learningObjectives,
              title,
            }),
          });

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || "Failed to generate quiz");
          }

          const result = await response.json();

          // Complete progress
          setGenerationStage("complete");
          setGenerationProgress(100);

          // Show success toast
          toast.success(
            "Quiz Generated Successfully!",
            `Created ${
              result.questions?.length || quizConfig.questionCount
            } questions from ${selectedDocuments.length} document${
              selectedDocuments.length !== 1 ? "s" : ""
            }.`
          );

          // Small delay to show completion, then navigate
          setTimeout(() => {
            router.push(`/dashboard/quiz/${result.quizId}`);
          }, 1000);
        },
        {
          component: "QuizGenerator",
          action: "generate_quiz",
        }
      );
    } catch (error) {
      setGenerationError(
        error instanceof Error ? error.message : "Failed to generate quiz"
      );
      handleQuizGenerationError(error);
    } finally {
      setIsGenerating(false);
    }
  };

  const getDocumentStatus = (documentId: string) => {
    const status = processingStatuses[documentId];
    if (!status) return "unprocessed";
    return status.status;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
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

  const getStatusText = (status: string) => {
    switch (status) {
      case "completed":
        return "Ready";
      case "processing":
        return "Processing";
      case "pending":
        return "Queued";
      case "failed":
        return "Failed";
      default:
        return "Not processed";
    }
  };

  const canGenerateQuiz =
    selectedDocuments.length > 0 &&
    selectedDocuments.every(
      (docId) => getDocumentStatus(docId) === "completed"
    );

  // Show quiz generation loading state
  if (isGenerating) {
    return (
      <QuizGenerationLoading
        stage={generationStage}
        progress={generationProgress}
        documentCount={selectedDocuments.length}
        questionCount={quizConfig.questionCount}
        estimatedTimeRemaining={Math.max(
          0,
          Math.ceil((100 - generationProgress) / 10) * 15
        )} // Rough estimate
      />
    );
  }

  if (isLoadingPDFs) {
    return <QuizGeneratorSkeleton />;
  }

  if (pdfError) {
    return (
      <ErrorNotification
        title="Failed to load documents"
        message="Unable to fetch your PDF documents. Please try again."
        onRetry={refetchPDFs}
      />
    );
  }

  const pdfs = pdfData?.pdfs || [];

  return (
    <QuizGenerationErrorBoundary>
      <div className={`space-y-6 ${className}`}>
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Quiz Generator</h1>
          <p className="text-muted-foreground">
            Create intelligent quizzes from your PDF documents using AI-powered
            content analysis
          </p>
        </div>

        {/* Error Display */}
        {generationError && (
          <ErrorNotification
            title="Quiz Generation Error"
            message={generationError}
            onDismiss={() => setGenerationError(null)}
            onRetry={() => {
              setGenerationError(null);
              clearError();
            }}
          />
        )}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Document Selection */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Select Documents
              </CardTitle>
              <CardDescription>
                Choose the PDF documents you want to generate quiz questions
                from
              </CardDescription>
            </CardHeader>
            <CardContent>
              {pdfs.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">
                    No PDF documents found
                  </p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={() => router.push("/dashboard/pdfs")}
                  >
                    Upload Documents
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Multi-document selection header */}
                  {selectedDocuments.length > 1 && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                      <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                        <FileText className="h-4 w-4" />
                        <span className="font-medium">
                          Multi-Document Quiz Mode
                        </span>
                      </div>
                      <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                        {selectedDocuments.length} documents selected. Questions
                        will be generated from content across all selected
                        documents with balanced representation.
                      </p>
                    </div>
                  )}

                  {pdfs.map((pdf) => {
                    const isSelected = selectedDocuments.includes(pdf.id);
                    const status = getDocumentStatus(pdf.id);
                    const processingStatus = processingStatuses[pdf.id];

                    return (
                      <div
                        key={pdf.id}
                        className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => handleDocumentToggle(pdf.id)}
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleDocumentToggle(pdf.id)}
                            className="rounded border-border"
                          />
                          <div className="flex-1">
                            <p className="font-medium truncate">
                              {pdf.filename}
                            </p>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>
                                {(pdf.fileSize / 1024 / 1024).toFixed(1)} MB
                              </span>
                              {processingStatus &&
                                processingStatus.totalChunks > 0 && (
                                  <span>
                                    {processingStatus.totalChunks} chunks
                                  </span>
                                )}
                              {isSelected && selectedDocuments.length > 1 && (
                                <Badge variant="outline" className="text-xs">
                                  Document{" "}
                                  {selectedDocuments.indexOf(pdf.id) + 1}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          {getStatusIcon(status)}
                          <Badge
                            variant={
                              status === "completed"
                                ? "default"
                                : status === "failed"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {getStatusText(status)}
                          </Badge>

                          {status === "unprocessed" && (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleProcessDocument(pdf.id);
                              }}
                            >
                              Process
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Processing Status */}
          {selectedDocuments.length === 1 && (
            <DocumentProcessingStatus
              documentIds={selectedDocuments}
              processingStatuses={processingStatuses}
              onRefresh={() => checkProcessingStatuses(selectedDocuments)}
            />
          )}

          {/* Multi-Document Status */}
          {selectedDocuments.length > 1 && (
            <MultiDocumentStatus
              documentIds={selectedDocuments}
              processingStatuses={processingStatuses}
              documentTitles={Object.fromEntries(
                pdfs.map((pdf) => [pdf.id, pdf.filename])
              )}
              onRefresh={() => checkProcessingStatuses(selectedDocuments)}
            />
          )}

          {/* Content Preview */}
          {selectedDocuments.length > 0 && quizConfig.pageRange && (
            <ContentPreview
              documentIds={selectedDocuments}
              pageRange={quizConfig.pageRange}
              focusAreas={quizConfig.focusAreas}
            />
          )}
        </div>

        {/* Configuration Panel */}
        <div className="space-y-4">
          <QuizConfigurationPanel
            config={quizConfig}
            onChange={setQuizConfig}
            selectedDocuments={selectedDocuments}
          />

          <Separator />

          {/* Generate Button */}
          <div className="space-y-4">
            <Button
              onClick={handleGenerateQuiz}
              disabled={!canGenerateQuiz || isGenerating || isRetrying}
              className="w-full"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Generating Quiz...
                </>
              ) : isRetrying ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                "Generate Quiz"
              )}
            </Button>

            {selectedDocuments.length > 0 && !canGenerateQuiz && (
              <p className="text-sm text-muted-foreground text-center">
                All selected documents must be processed before generating a
                quiz
              </p>
            )}
          </div>
        </div>
      </div>
    </QuizGenerationErrorBoundary>
  );
}
