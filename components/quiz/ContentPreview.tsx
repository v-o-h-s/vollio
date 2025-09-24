"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/ui/loading";
import { ErrorNotification } from "@/components/ui/error-notification";
import { 
  Eye, 
  RefreshCw, 
  Search, 
  FileText, 
  Hash,
  Sparkles,
  ChevronDown,
  ChevronUp
} from "lucide-react";

interface ContentPreviewProps {
  documentIds: string[];
  pageRange?: { start: number; end: number };
  focusAreas?: string[];
  className?: string;
}

interface ContentChunk {
  id: string;
  content: string;
  metadata: {
    documentTitle: string;
    pageNumber: number;
    sectionTitle?: string;
    contentType: string;
    confidence?: number;
  };
  similarity: number;
  relevanceScore: number;
  rank: number;
}

export function ContentPreview({ 
  documentIds, 
  pageRange, 
  focusAreas,
  className 
}: ContentPreviewProps) {
  const [chunks, setChunks] = useState<ContentChunk[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTime, setSearchTime] = useState<number | null>(null);

  // Generate search query from focus areas and page range
  const generateSearchQuery = () => {
    const queries: string[] = [];
    
    if (focusAreas && focusAreas.length > 0) {
      queries.push(...focusAreas);
    } else {
      // Default query for general content
      queries.push("key concepts", "important information", "main topics");
    }
    
    return queries.join(" ");
  };

  const fetchContentPreview = async () => {
    if (documentIds.length === 0) return;

    setIsLoading(true);
    setError(null);

    try {
      const searchQuery = generateSearchQuery();
      
      const response = await fetch("/api/quiz/search-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: searchQuery,
          documentIds,
          pageRange,
          limit: 10,
          similarityThreshold: 0.6,
          rankingMethod: "hybrid",
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setChunks(result.chunks || []);
        setSearchTime(result.searchTime);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch content preview");
      }
    } catch (error) {
      console.error("Failed to fetch content preview:", error);
      setError(error instanceof Error ? error.message : "Failed to fetch content preview");
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch content when dependencies change
  useEffect(() => {
    if (documentIds.length > 0) {
      fetchContentPreview();
    }
  }, [documentIds, pageRange, focusAreas]);

  const truncateContent = (content: string, maxLength: number = 200) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + "...";
  };

  const getContentTypeIcon = (type: string) => {
    switch (type) {
      case "heading":
        return <Hash className="h-3 w-3" />;
      case "table":
        return <FileText className="h-3 w-3" />;
      default:
        return <FileText className="h-3 w-3" />;
    }
  };

  const getContentTypeColor = (type: string) => {
    switch (type) {
      case "heading":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300";
      case "table":
        return "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300";
      case "list":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-300";
    }
  };

  if (documentIds.length === 0) {
    return null;
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Content Preview
            </CardTitle>
            <CardDescription>
              Preview of relevant content that will be used for quiz generation
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={fetchContentPreview}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} />
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
      
      {isExpanded && (
        <CardContent className="space-y-4">
          {/* Search Info */}
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Search className="h-4 w-4" />
              <span>Query: "{generateSearchQuery()}"</span>
            </div>
            {searchTime && (
              <span>{searchTime}ms search time</span>
            )}
          </div>

          {/* Error Display */}
          {error && (
            <ErrorNotification
              title="Content Preview Error"
              message={error}
              onRetry={fetchContentPreview}
              onDismiss={() => setError(null)}
            />
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-8">
              <LoadingSpinner size="sm" />
              <span className="ml-2 text-muted-foreground">Loading content preview...</span>
            </div>
          )}

          {/* Multi-document distribution summary */}
          {!isLoading && !error && chunks.length > 0 && documentIds.length > 1 && (
            <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg">
              <h4 className="font-medium text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Multi-Document Content Distribution
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                {(() => {
                  const docCounts = chunks.reduce((acc, chunk) => {
                    const title = chunk.metadata.documentTitle;
                    acc[title] = (acc[title] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);
                  
                  return Object.entries(docCounts).map(([title, count]) => (
                    <div key={title} className="flex justify-between text-green-700 dark:text-green-300">
                      <span className="truncate max-w-[150px]">{title}:</span>
                      <Badge variant="outline" className="text-xs">
                        {count} chunk{count !== 1 ? 's' : ''}
                      </Badge>
                    </div>
                  ));
                })()}
              </div>
            </div>
          )}

          {/* Content Chunks */}
          {!isLoading && !error && chunks.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-medium">Relevant Content Chunks</h4>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {chunks.length} chunk{chunks.length !== 1 ? 's' : ''} found
                  </Badge>
                  {documentIds.length > 1 && (
                    <Badge variant="outline" className="text-xs">
                      {documentIds.length} documents
                    </Badge>
                  )}
                </div>
              </div>
              
              {chunks.map((chunk, index) => (
                <div key={chunk.id} className="p-4 border rounded-lg space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        #{index + 1}
                      </Badge>
                      <span className="text-sm font-medium truncate max-w-[200px]">
                        {chunk.metadata.documentTitle}
                      </span>
                      <Badge variant="secondary" className="text-xs">
                        Page {chunk.metadata.pageNumber}
                      </Badge>
                      {documentIds.length > 1 && (
                        <Badge variant="outline" className="text-xs">
                          Doc {documentIds.findIndex(id => 
                            chunks.find(c => c.metadata.documentTitle === chunk.metadata.documentTitle)
                          ) + 1}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge 
                        className={`text-xs ${getContentTypeColor(chunk.metadata.contentType)}`}
                      >
                        <div className="flex items-center gap-1">
                          {getContentTypeIcon(chunk.metadata.contentType)}
                          {chunk.metadata.contentType}
                        </div>
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {Math.round(chunk.similarity * 100)}% match
                      </Badge>
                    </div>
                  </div>
                  
                  {chunk.metadata.sectionTitle && (
                    <p className="text-sm text-muted-foreground">
                      Section: {chunk.metadata.sectionTitle}
                    </p>
                  )}
                  
                  <div className="text-sm bg-muted/50 p-3 rounded">
                    {truncateContent(chunk.content)}
                  </div>
                  
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>Relevance Score: {chunk.relevanceScore.toFixed(3)}</span>
                    {chunk.metadata.confidence && (
                      <span>Confidence: {Math.round(chunk.metadata.confidence * 100)}%</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* No Content Found */}
          {!isLoading && !error && chunks.length === 0 && (
            <div className="text-center py-8">
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                No relevant content found with current parameters
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Try adjusting your focus areas or page range
              </p>
            </div>
          )}

          {/* Preview Info */}
          {chunks.length > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
              <div className="flex items-center gap-2 text-blue-700 dark:text-blue-300">
                <Sparkles className="h-4 w-4" />
                <span className="text-sm font-medium">Quiz Generation Preview</span>
              </div>
              <p className="text-sm text-blue-600 dark:text-blue-400 mt-1">
                These content chunks will be used to generate quiz questions. 
                The AI will analyze this content to create relevant questions based on your configuration.
              </p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
}