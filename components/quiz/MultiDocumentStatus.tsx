"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import type { DocumentProcessingStatus as ProcessingStatus } from "@/lib/types";
import { 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  BarChart3,
  Zap,
  Eye,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface MultiDocumentStatusProps {
  documentIds: string[];
  processingStatuses: Record<string, ProcessingStatus>;
  documentTitles: Record<string, string>;
  onRefresh: () => void;
  className?: string;
}

interface DocumentStats {
  documentId: string;
  title: string;
  status: string;
  totalChunks: number;
  processedChunks: number;
  processingMethod?: string;
  estimatedRelevance?: number;
}

export function MultiDocumentStatus({ 
  documentIds, 
  processingStatuses, 
  documentTitles,
  onRefresh,
  className 
}: MultiDocumentStatusProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [documentStats, setDocumentStats] = useState<DocumentStats[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Calculate document statistics
  useEffect(() => {
    const stats: DocumentStats[] = documentIds.map(docId => {
      const status = processingStatuses[docId];
      const title = documentTitles[docId] || 'Unknown Document';
      
      return {
        documentId: docId,
        title,
        status: status?.status || 'unprocessed',
        totalChunks: status?.totalChunks || 0,
        processedChunks: status?.processedChunks || 0,
        processingMethod: status?.extractionMethod,
        estimatedRelevance: Math.random() * 0.3 + 0.7 // Placeholder for actual relevance calculation
      };
    });
    
    setDocumentStats(stats);
  }, [documentIds, processingStatuses, documentTitles]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await onRefresh();
    setIsRefreshing(false);
  };

  const completedDocs = documentStats.filter(doc => doc.status === 'completed');
  const processingDocs = documentStats.filter(doc => doc.status === 'processing' || doc.status === 'pending');
  const failedDocs = documentStats.filter(doc => doc.status === 'failed');
  
  const totalChunks = documentStats.reduce((sum, doc) => sum + doc.totalChunks, 0);
  const overallProgress = documentStats.length > 0 
    ? (completedDocs.length / documentStats.length) * 100 
    : 0;

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
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default";
      case "processing":
      case "pending":
        return "secondary";
      case "failed":
        return "destructive";
      default:
        return "outline";
    }
  };

  const formatProcessingMethod = (method?: string) => {
    switch (method) {
      case "syncfusion":
        return "Syncfusion PDF";
      case "ocr":
        return "OCR Processing";
      default:
        return "Unknown";
    }
  };

  if (documentIds.length <= 1) {
    return null; // Only show for multi-document scenarios
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Multi-Document Processing Status
            </CardTitle>
            <CardDescription>
              Cross-document processing status and content synthesis readiness
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <Zap className={`h-4 w-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Overall Processing Progress</span>
            <span>{completedDocs.length}/{documentStats.length} documents ready</span>
          </div>
          <Progress value={overallProgress} className="h-2" />
        </div>

        {/* Status Summary */}
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-1">
            <CheckCircle className="h-4 w-4 text-green-500" />
            <span>{completedDocs.length} Ready</span>
          </div>
          {processingDocs.length > 0 && (
            <div className="flex items-center gap-1">
              <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
              <span>{processingDocs.length} Processing</span>
            </div>
          )}
          {failedDocs.length > 0 && (
            <div className="flex items-center gap-1">
              <AlertCircle className="h-4 w-4 text-red-500" />
              <span>{failedDocs.length} Failed</span>
            </div>
          )}
        </div>

        {/* Multi-document readiness indicator */}
        {completedDocs.length === documentStats.length && documentStats.length > 1 && (
          <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
            <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
              <CheckCircle className="h-4 w-4" />
              <span className="font-medium">Multi-Document Synthesis Ready</span>
            </div>
            <div className="text-sm text-green-600 dark:text-green-400 mt-1 space-y-1">
              <p>All {documentStats.length} documents processed with {totalChunks} total content chunks</p>
              <p>Cross-document semantic search and content synthesis enabled</p>
            </div>
          </div>
        )}

        {/* Expanded Document Details */}
        {isExpanded && (
          <>
            <Separator />
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Document Details</h4>
              {documentStats.map((doc, index) => (
                <div key={doc.documentId} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-muted-foreground">
                        Doc {index + 1}
                      </span>
                      <span className="font-medium text-sm truncate max-w-[200px]">
                        {doc.title}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(doc.status)}
                      <Badge variant={getStatusVariant(doc.status)} className="text-xs">
                        {doc.status}
                      </Badge>
                    </div>
                  </div>
                  
                  {doc.status === 'completed' && (
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>Content chunks:</span>
                        <span>{doc.totalChunks}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Processing method:</span>
                        <span>{formatProcessingMethod(doc.processingMethod)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Estimated relevance:</span>
                        <span>{(doc.estimatedRelevance || 0).toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                  
                  {doc.status === 'processing' && doc.totalChunks > 0 && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span>Processing chunks</span>
                        <span>{doc.processedChunks}/{doc.totalChunks}</span>
                      </div>
                      <Progress 
                        value={(doc.processedChunks / doc.totalChunks) * 100} 
                        className="h-1" 
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {/* Multi-document synthesis info */}
        {completedDocs.length > 1 && (
          <>
            <Separator />
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <h4 className="font-medium text-blue-900 dark:text-blue-100 mb-2 flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Cross-Document Synthesis Features
              </h4>
              <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <p>• Unified knowledge base querying across all documents</p>
                <p>• Document relevance weighting and content balancing</p>
                <p>• Cross-document semantic search with diversity factors</p>
                <p>• Source attribution showing content origins</p>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}