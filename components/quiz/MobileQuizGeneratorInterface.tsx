"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ErrorNotification } from "@/components/ui/error-notification";
import { useToastActions } from "@/components/ui/toast";
import { useGetPDFsQuery } from "@/lib/store/apiSlice";
import { MobileQuizConfigurationPanel } from "./MobileQuizConfigurationPanel";
import { DocumentProcessingStatus } from "./DocumentProcessingStatus";
import { MultiDocumentStatus } from "./MultiDocumentStatus";
import { QuizGenerationErrorBoundary } from "./QuizErrorBoundary";
import { QuizGenerationLoading, QuizGeneratorSkeleton } from "./QuizLoadingStates";
import { useQuizGenerationErrorHandling } from "@/hooks/use-quiz-error-handling";
import { useTouchGestures } from "@/hooks/use-touch-gestures";
import type { DocumentProcessingStatus as ProcessingStatus } from "@/lib/types/document-processing";
import type { QuizConfiguration } from "@/lib/types/quiz";
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  ChevronDown, 
  ChevronUp,
  Settings,
  Play,
  Upload
} from "lucide-react";

interface MobileQuizGeneratorInterfaceProps {
  className?: string;
}

export function MobileQuizGeneratorInterface({ className }: MobileQuizGeneratorInterfaceProps) {
  const router = useRouter();
  const toast = useToastActions();
  const {
    handleQuizGenerationError,
    handleDocumentProcessingError,
    executeWithErrorHandling,
    clearError,
    error: errorHandlingError,
    isRetrying
  } = useQuizGenerationErrorHandling();

  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [quizConfig, setQuizConfig] = useState<QuizConfiguration>({
    questionCount: 10,
    difficulty: "medium",
    questionTypes: ["mcq", "truefalse"],
  });
  const [processingStatuses, setProcessingStatuses] = useState<Record<string, ProcessingStatus>>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStage, setGenerationStage] = useState<'initializing' | 'searching' | 'generating' | 'validating' | 'storing' | 'complete'>('initializing');
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationError, setGenerationError] = useState<string | null>(null);
  
  // Mobile-specific state
  const [showDocumentList, setShowDocumentList] = useState(true);
  const [showConfiguration, setShowConfiguration] = useState(false);
  const [expandedDocument, setExpandedDocument] = useState<string | null>(null);

  // Fetch user's PDFs
  const {
    data: pdfData,
    isLoading: isLoadingPDFs,
    error: pdfError,
    refetch: refetchPDFs,
  } = useGetPDFsQuery();

  // Touch gestures for mobile navigation
  const { attachGestures } = useTouchGestures({
    onSwipe: (gesture) => {
      // Swipe up to show configuration, down to show documents
      if (gesture.direction === 'up' && !showConfiguration) {
        setShowConfiguration(true);
        setShowDocumentList(false);
      } else if (gesture.direction === 'down' && !showDocumentList) {
        setShowDocumentList(true);
        setShowConfiguration(false);
      }
    }
  }, {
    swipeThreshold: 80,
    velocityThreshold: 0.4
  });

  // Check processing status for selected documents
  useEffect(() => {
    if (selectedDocuments.length > 0) {
      checkProcessingStatuses(selectedDocuments);
    }
  }, [selectedDocuments]);

  const checkProcessingStatuses = async (documentIds: string[]) => {
    try {
      await executeWithErrorHandling(async () => {
        const statusPromises = documentIds.map(async (docId) => {
          const response = await fetch(`/api/quiz/processing-status/${docId}`);
          if (!response.ok) {
            throw new Error(`Failed to fetch status for document ${docId}: ${response.statusText}`);
          }
          const result = await response.json();
          return { docId, status: result.data };
        });

        const results = await Promise.all(statusPromises);
        const statusMap: Record<string, ProcessingStatus> = {};
        
        results.forEach(({ docId, status }) => {
          if (status) {
            statusMap[docId] = status;
          }
        });

        setProcessingStatuses(statusMap);
      }, {
        component: 'MobileQuizGenerator',
        action: 'check_processing_status'
      });
    } catch (error) {
      console.error("Failed to check processing statuses:", error);
    }
  };

  const handleDocumentToggle = (documentId: string) => {
    setSelectedDocuments(prev => 
      prev.includes(documentId)
        ? prev.filter(id => id !== documentId)
        : [...prev, documentId]
    );
    
    // Provide haptic feedback on mobile
    if ('vibrate' in navigator) {
      navigator.vibrate(50);
    }
  };

  const handleProcessDocument = async (documentId: string) => {
    const loadingToastId = toast.loading(
      "Processing Document",
      "Starting document processing..."
    );

    try {
      await executeWithErrorHandling(async () => {
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
        
        toast.update(loadingToastId, {
          type: 'success',
          title: 'Processing Started',
          description: `Document processing has been queued.`,
          duration: 3000
        });

        await checkProcessingStatuses([documentId]);
      }, {
        component: 'MobileQuizGenerator',
        action: 'process_document',
        documentId
      });
    } catch (error) {
      toast.update(loadingToastId, {
        type: 'error',
        title: 'Processing Failed',
        description: error instanceof Error ? error.message : "Failed to process document",
        duration: 5000
      });
      
      handleDocumentProcessingError(error);
    }
  };

  const handleGenerateQuiz = async () => {
    setGenerationError(null);
    clearError();

    if (selectedDocuments.length === 0) {
      const error = "Please select at least one document";
      setGenerationError(error);
      toast.warning("No Documents Selected", error);
      return;
    }

    const unprocessedDocs = selectedDocuments.filter(docId => {
      const status = processingStatuses[docId];
      return !status || status.status !== "completed";
    });

    if (unprocessedDocs.length > 0) {
      const error = "All selected documents must be processed before generating a quiz";
      setGenerationError(error);
      toast.warning("Documents Not Ready", error);
      return;
    }

    setIsGenerating(true);
    setGenerationStage('initializing');
    setGenerationProgress(0);

    try {
      await executeWithErrorHandling(async () => {
        const documentTitles = selectedDocuments.map(docId => {
          const pdf = pdfs.find(p => p.id === docId);
          return pdf?.filename || 'Unknown Document';
        });
        
        const title = selectedDocuments.length === 1 
          ? `Quiz: ${documentTitles[0]}`
          : `Multi-Document Quiz: ${documentTitles.slice(0, 2).join(', ')}${documentTitles.length > 2 ? ` +${documentTitles.length - 2} more` : ''}`;

        const stages: Array<typeof generationStage> = ['initializing', 'searching', 'generating', 'validating', 'storing'];
        
        for (let i = 0; i < stages.length; i++) {
          setGenerationStage(stages[i]);
          setGenerationProgress((i / stages.length) * 90);
          
          if (i < stages.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 300));
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
        
        setGenerationStage('complete');
        setGenerationProgress(100);
        
        toast.success(
          "Quiz Generated!",
          `Created ${result.questions?.length || quizConfig.questionCount} questions.`
        );

        // Haptic feedback for success
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 100]);
        }

        setTimeout(() => {
          router.push(`/dashboard/quiz/${result.quizId}`);
        }, 800);
      }, {
        component: 'MobileQuizGenerator',
        action: 'generate_quiz'
      });
    } catch (error) {
      setGenerationError(error instanceof Error ? error.message : "Failed to generate quiz");
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

  const canGenerateQuiz = selectedDocuments.length > 0 && 
    selectedDocuments.every(docId => getDocumentStatus(docId) === "completed");

  if (isGenerating) {
    return (
      <QuizGenerationLoading
        stage={generationStage}
        progress={generationProgress}
        documentCount={selectedDocuments.length}
        questionCount={quizConfig.questionCount}
        estimatedTimeRemaining={Math.max(0, Math.ceil((100 - generationProgress) / 10) * 10)}
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
      <div className={`min-h-screen bg-background ${className}`} ref={attachGestures}>
        {/* Mobile Header */}
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b">
          <div className="p-4">
            <h1 className="text-2xl font-bold">Quiz Generator</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Create AI-powered quizzes from your PDFs
            </p>
          </div>
        </div>

        {/* Error Display */}
        {generationError && (
          <div className="p-4">
            <ErrorNotification
              title="Quiz Generation Error"
              message={generationError}
              onDismiss={() => setGenerationError(null)}
              onRetry={() => {
                setGenerationError(null);
                clearError();
              }}
            />
          </div>
        )}

        {/* Mobile Tab Navigation */}
        <div className="flex border-b bg-background">
          <button
            onClick={() => {
              setShowDocumentList(true);
              setShowConfiguration(false);
            }}
            className={`flex-1 p-4 text-center font-medium transition-colors ${
              showDocumentList 
                ? "text-primary border-b-2 border-primary bg-primary/5" 
                : "text-muted-foreground"
            }`}
          >
            <FileText className="h-5 w-5 mx-auto mb-1" />
            Documents ({selectedDocuments.length})
          </button>
          <button
            onClick={() => {
              setShowDocumentList(false);
              setShowConfiguration(true);
            }}
            className={`flex-1 p-4 text-center font-medium transition-colors ${
              showConfiguration 
                ? "text-primary border-b-2 border-primary bg-primary/5" 
                : "text-muted-foreground"
            }`}
          >
            <Settings className="h-5 w-5 mx-auto mb-1" />
            Settings
          </button>
        </div>

        {/* Document Selection Panel */}
        {showDocumentList && (
          <div className="p-4 space-y-4">
            {pdfs.length === 0 ? (
              <div className="text-center py-12">
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">No PDF documents found</p>
                <Button
                  onClick={() => router.push("/dashboard/pdfs")}
                  className="w-full"
                >
                  Upload Documents
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Multi-document selection indicator */}
                {selectedDocuments.length > 1 && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                      <FileText className="h-4 w-4" />
                      <span className="font-medium text-sm">Multi-Document Quiz</span>
                    </div>
                    <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                      {selectedDocuments.length} documents selected
                    </p>
                  </div>
                )}

                {pdfs.map((pdf) => {
                  const isSelected = selectedDocuments.includes(pdf.id);
                  const status = getDocumentStatus(pdf.id);
                  const processingStatus = processingStatuses[pdf.id];
                  const isExpanded = expandedDocument === pdf.id;
                  
                  return (
                    <div
                      key={pdf.id}
                      className={`border rounded-lg transition-all ${
                        isSelected
                          ? "border-primary bg-primary/5"
                          : "border-border"
                      }`}
                    >
                      {/* Document Header */}
                      <div
                        className="flex items-center p-4 cursor-pointer"
                        onClick={() => handleDocumentToggle(pdf.id)}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleDocumentToggle(pdf.id)}
                          className="rounded border-border mr-3"
                          onClick={(e) => e.stopPropagation()}
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate text-sm">{pdf.filename}</p>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                            <span>{(pdf.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                            {processingStatus && processingStatus.totalChunks > 0 && (
                              <span>• {processingStatus.totalChunks} chunks</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 ml-2">
                          {getStatusIcon(status)}
                          <Badge
                            variant={status === "completed" ? "default" : 
                                   status === "failed" ? "destructive" : "secondary"}
                            className="text-xs"
                          >
                            {getStatusText(status)}
                          </Badge>
                          
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setExpandedDocument(isExpanded ? null : pdf.id);
                            }}
                            className="p-1"
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-4 w-4 text-muted-foreground" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Document Details */}
                      {isExpanded && (
                        <div className="px-4 pb-4 border-t border-border/50">
                          <div className="pt-3 space-y-3">
                            {status === "unprocessed" && (
                              <Button
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleProcessDocument(pdf.id);
                                }}
                                className="w-full"
                              >
                                Process Document
                              </Button>
                            )}
                            
                            {processingStatus && (
                              <div className="text-xs text-muted-foreground space-y-1">
                                <div className="flex justify-between">
                                  <span>Status:</span>
                                  <span className="capitalize">{processingStatus.status}</span>
                                </div>
                                {processingStatus.totalChunks > 0 && (
                                  <div className="flex justify-between">
                                    <span>Chunks:</span>
                                    <span>{processingStatus.totalChunks}</span>
                                  </div>
                                )}
                                {processingStatus.extractionMethod && (
                                  <div className="flex justify-between">
                                    <span>Method:</span>
                                    <span className="capitalize">{processingStatus.extractionMethod}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Processing Status for Selected Documents */}
            {selectedDocuments.length === 1 && (
              <DocumentProcessingStatus
                documentIds={selectedDocuments}
                processingStatuses={processingStatuses}
                onRefresh={() => checkProcessingStatuses(selectedDocuments)}
              />
            )}

            {selectedDocuments.length > 1 && (
              <MultiDocumentStatus
                documentIds={selectedDocuments}
                processingStatuses={processingStatuses}
                documentTitles={Object.fromEntries(
                  pdfs.map(pdf => [pdf.id, pdf.filename])
                )}
                onRefresh={() => checkProcessingStatuses(selectedDocuments)}
              />
            )}
          </div>
        )}

        {/* Configuration Panel */}
        {showConfiguration && (
          <div className="p-4">
            <MobileQuizConfigurationPanel
              config={quizConfig}
              onChange={setQuizConfig}
              selectedDocuments={selectedDocuments}
            />
          </div>
        )}

        {/* Fixed Bottom Action Bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm border-t p-4">
          <div className="space-y-3">
            {selectedDocuments.length > 0 && !canGenerateQuiz && (
              <p className="text-xs text-muted-foreground text-center">
                All selected documents must be processed before generating a quiz
              </p>
            )}
            
            <Button
              onClick={handleGenerateQuiz}
              disabled={!canGenerateQuiz || isGenerating || isRetrying}
              className="w-full h-12 text-base font-medium"
              size="lg"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Generating Quiz...
                </>
              ) : isRetrying ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                  Retrying...
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  Generate Quiz
                  {selectedDocuments.length > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {selectedDocuments.length}
                    </Badge>
                  )}
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Bottom padding to account for fixed action bar */}
        <div className="h-24" />
      </div>
    </QuizGenerationErrorBoundary>
  );
}