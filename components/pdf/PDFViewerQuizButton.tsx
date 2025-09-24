"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { LoadingSpinner } from "@/components/ui/loading";
import { ErrorNotification } from "@/components/ui/error-notification";
import { 
  Brain, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2,
  Settings,
  ChevronDown,
  ChevronUp,
  Zap
} from "lucide-react";
import { PDFDocument, DocumentProcessingStatus, QuizConfiguration } from "@/lib/types";

interface PDFViewerQuizButtonProps {
  pdfDocument: PDFDocument;
  currentPageNumber?: number;
  totalPages?: number;
  selectedText?: string;
  className?: string;
  onQuizGenerated?: (quizId: string) => void;
}

export function PDFViewerQuizButton({
  pdfDocument,
  currentPageNumber = 1,
  totalPages = 0,
  selectedText,
  className = "",
  onQuizGenerated,
}: PDFViewerQuizButtonProps) {
  const router = useRouter();
  const [isExpanded, setIsExpanded] = useState(false);
  const [processingStatus, setProcessingStatus] = useState<DocumentProcessingStatus | null>(null);
  const [isCheckingStatus, setIsCheckingStatus] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Quiz configuration with smart defaults
  const [quizConfig, setQuizConfig] = useState<QuizConfiguration>({
    questionCount: 5,
    difficulty: "medium",
    questionTypes: ["mcq", "truefalse"],
    pageRange: currentPageNumber > 1 ? { 
      start: Math.max(1, currentPageNumber - 2), 
      end: Math.min(totalPages || currentPageNumber + 10, currentPageNumber + 2)
    } : undefined,
    notes: selectedText ? `Focus on: "${selectedText.slice(0, 100)}${selectedText.length > 100 ? '...' : ''}"` : undefined,
  });

  // Update page range when current page changes
  useEffect(() => {
    if (currentPageNumber > 1) {
      setQuizConfig(prev => ({
        ...prev,
        pageRange: {
          start: Math.max(1, currentPageNumber - 2),
          end: Math.min(totalPages || currentPageNumber + 10, currentPageNumber + 2)
        }
      }));
    }
  }, [currentPageNumber, totalPages]);

  // Update notes when selected text changes
  useEffect(() => {
    if (selectedText) {
      setQuizConfig(prev => ({
        ...prev,
        notes: `Focus on: "${selectedText.slice(0, 100)}${selectedText.length > 100 ? '...' : ''}"`
      }));
    }
  }, [selectedText]);

  // Check document processing status
  const checkProcessingStatus = useCallback(async () => {
    if (!pdfDocument?.id) return;

    try {
      setIsCheckingStatus(true);
      const response = await fetch(`/api/quiz/processing-status/${pdfDocument.id}`);
      
      if (response.ok) {
        const result = await response.json();
        setProcessingStatus(result.data);
      } else if (response.status === 404) {
        // Document not processed yet
        setProcessingStatus(null);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to check processing status");
      }
    } catch (error) {
      console.error("Failed to check processing status:", error);
      setError(error instanceof Error ? error.message : "Failed to check document status");
    } finally {
      setIsCheckingStatus(false);
    }
  }, [pdfDocument?.id]);

  // Initial status check
  useEffect(() => {
    checkProcessingStatus();
  }, [checkProcessingStatus]);

  // Process document for quiz generation
  const handleProcessDocument = async () => {
    if (!pdfDocument?.id) return;

    try {
      setIsProcessing(true);
      setError(null);

      const response = await fetch("/api/quiz/process-document", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          pdfId: pdfDocument.id,
          forceReprocess: false,
          generateEmbeddings: true
        }),
      });

      if (response.ok) {
        // Start polling for status updates
        const pollStatus = async () => {
          await checkProcessingStatus();
          if (processingStatus?.status === "processing" || processingStatus?.status === "pending") {
            setTimeout(pollStatus, 2000); // Poll every 2 seconds
          }
        };
        setTimeout(pollStatus, 1000);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process document");
      }
    } catch (error) {
      console.error("Failed to process document:", error);
      setError(error instanceof Error ? error.message : "Failed to process document");
    } finally {
      setIsProcessing(false);
    }
  };

  // Generate quiz with current configuration
  const handleGenerateQuiz = async () => {
    if (!pdfDocument?.id || !processingStatus || processingStatus.status !== "completed") {
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);

      const title = `Quiz: ${pdfDocument.filename}${quizConfig.pageRange ? ` (Pages ${quizConfig.pageRange.start}-${quizConfig.pageRange.end})` : ''}`;

      const response = await fetch("/api/quiz/generate-rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentIds: [pdfDocument.id],
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

      if (response.ok) {
        const result = await response.json();
        onQuizGenerated?.(result.quizId);
        // Navigate to quiz taking interface
        router.push(`/dashboard/quiz/${result.quizId}`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate quiz");
      }
    } catch (error) {
      console.error("Failed to generate quiz:", error);
      setError(error instanceof Error ? error.message : "Failed to generate quiz");
    } finally {
      setIsGenerating(false);
    }
  };

  // Quick quiz generation with minimal configuration
  const handleQuickQuiz = async () => {
    if (!pdfDocument?.id || !processingStatus || processingStatus.status !== "completed") {
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);

      const quickConfig = {
        documentIds: [pdfDocument.id],
        questionCount: 5,
        difficulty: "medium" as const,
        questionTypes: ["mcq", "truefalse"] as const,
        pageRange: currentPageNumber > 1 ? {
          start: Math.max(1, currentPageNumber - 1),
          end: Math.min(totalPages || currentPageNumber + 5, currentPageNumber + 1)
        } : undefined,
        notes: selectedText ? `Focus on: "${selectedText.slice(0, 200)}"` : `Generate questions from current page context (page ${currentPageNumber})`,
        title: `Quick Quiz: ${pdfDocument.filename} (Page ${currentPageNumber})`,
      };

      const response = await fetch("/api/quiz/generate-rag", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(quickConfig),
      });

      if (response.ok) {
        const result = await response.json();
        onQuizGenerated?.(result.quizId);
        router.push(`/dashboard/quiz/${result.quizId}`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to generate quiz");
      }
    } catch (error) {
      console.error("Failed to generate quick quiz:", error);
      setError(error instanceof Error ? error.message : "Failed to generate quiz");
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusIcon = (status?: string) => {
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

  const getStatusText = (status?: string) => {
    switch (status) {
      case "completed":
        return "Ready for quiz generation";
      case "processing":
        return "Processing document...";
      case "pending":
        return "Queued for processing";
      case "failed":
        return "Processing failed";
      default:
        return "Not processed";
    }
  };

  const canGenerateQuiz = processingStatus?.status === "completed";
  const needsProcessing = !processingStatus || processingStatus.status === "failed";

  return (
    <div className={`fixed bottom-6 right-6 z-50 ${className}`}>
      {/* Error Display */}
      {error && (
        <div className="mb-4">
          <ErrorNotification
            title="Quiz Generation Error"
            message={error}
            onDismiss={() => setError(null)}
            className="max-w-sm"
          />
        </div>
      )}

      {/* Main Quiz Button Card */}
      <Card className="bg-card/95 backdrop-blur-sm border shadow-lg max-w-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="h-4 w-4 text-white" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold">AI Quiz Generator</CardTitle>
                <CardDescription className="text-xs">
                  {selectedText ? "From selected text" : `From page ${currentPageNumber}`}
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-6 w-6 p-0"
            >
              {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* Document Status */}
          <div className="flex items-center gap-2 mb-3 p-2 bg-muted/50 rounded-lg">
            {isCheckingStatus ? (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            ) : (
              getStatusIcon(processingStatus?.status)
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{pdfDocument.filename}</p>
              <p className="text-xs text-muted-foreground">
                {isCheckingStatus ? "Checking status..." : getStatusText(processingStatus?.status)}
              </p>
            </div>
            {processingStatus?.totalChunks && (
              <Badge variant="outline" className="text-xs">
                {processingStatus.totalChunks} chunks
              </Badge>
            )}
          </div>

          {/* Action Buttons */}
          <div className="space-y-2">
            {needsProcessing ? (
              <Button
                onClick={handleProcessDocument}
                disabled={isProcessing || isCheckingStatus}
                className="w-full"
                size="sm"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <FileText className="h-4 w-4 mr-2" />
                    Process Document
                  </>
                )}
              </Button>
            ) : canGenerateQuiz ? (
              <>
                <Button
                  onClick={handleQuickQuiz}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-purple-500 to-blue-600 hover:from-purple-600 hover:to-blue-700"
                  size="sm"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 mr-2" />
                      Quick Quiz (5 questions)
                    </>
                  )}
                </Button>
                
                {isExpanded && (
                  <>
                    <Separator />
                    <Button
                      onClick={handleGenerateQuiz}
                      disabled={isGenerating}
                      variant="outline"
                      className="w-full"
                      size="sm"
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Custom Quiz
                    </Button>
                    
                    <Button
                      onClick={() => router.push('/dashboard/quiz')}
                      variant="ghost"
                      className="w-full"
                      size="sm"
                    >
                      <FileText className="h-4 w-4 mr-2" />
                      Full Quiz Generator
                    </Button>
                  </>
                )}
              </>
            ) : (
              <Button disabled className="w-full" size="sm">
                <Clock className="h-4 w-4 mr-2" />
                Processing Required
              </Button>
            )}
          </div>

          {/* Expanded Configuration */}
          {isExpanded && canGenerateQuiz && (
            <>
              <Separator className="my-3" />
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Questions</label>
                  <div className="flex gap-1 mt-1">
                    {[5, 10, 15, 20].map((count) => (
                      <Button
                        key={count}
                        variant={quizConfig.questionCount === count ? "default" : "outline"}
                        size="sm"
                        className="flex-1 h-7 text-xs"
                        onClick={() => setQuizConfig(prev => ({ ...prev, questionCount: count }))}
                      >
                        {count}
                      </Button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-muted-foreground">Difficulty</label>
                  <div className="flex gap-1 mt-1">
                    {(["easy", "medium", "hard"] as const).map((difficulty) => (
                      <Button
                        key={difficulty}
                        variant={quizConfig.difficulty === difficulty ? "default" : "outline"}
                        size="sm"
                        className="flex-1 h-7 text-xs capitalize"
                        onClick={() => setQuizConfig(prev => ({ ...prev, difficulty }))}
                      >
                        {difficulty}
                      </Button>
                    ))}
                  </div>
                </div>

                {quizConfig.pageRange && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Page Range</label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Pages {quizConfig.pageRange.start}-{quizConfig.pageRange.end}
                      {totalPages > 0 && ` of ${totalPages}`}
                    </p>
                  </div>
                )}

                {selectedText && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Selected Context</label>
                    <p className="text-xs text-muted-foreground mt-1 p-2 bg-muted/50 rounded text-ellipsis overflow-hidden">
                      "{selectedText.slice(0, 100)}{selectedText.length > 100 ? '...' : ''}"
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Processing Progress */}
          {processingStatus?.status === "processing" && (
            <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300 text-xs">
                <Loader2 className="h-3 w-3 animate-spin" />
                <span>Processing: {processingStatus.processedChunks}/{processingStatus.totalChunks} chunks</span>
              </div>
              {processingStatus.totalChunks > 0 && (
                <div className="w-full bg-blue-200 dark:bg-blue-900 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                    style={{
                      width: `${(processingStatus.processedChunks / processingStatus.totalChunks) * 100}%`
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}