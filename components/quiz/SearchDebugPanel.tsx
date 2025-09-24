"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  Search, 
  Clock, 
  Database, 
  Zap, 
  TrendingUp, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  BarChart3,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';

interface SearchExplanation {
  vectorMatches: string[];
  keywordMatches: string[];
  scoringBreakdown: {
    vectorContribution: number;
    keywordContribution: number;
    boosts: Array<{ type: string; value: number; reason: string }>;
    penalties: Array<{ type: string; value: number; reason: string }>;
  };
  relevanceFactors: string[];
}

interface SearchDebugInfo {
  originalQuery: string;
  processedQuery: string;
  vectorEmbeddingTime: number;
  keywordProcessingTime: number;
  filteringTime: number;
  rankingTime: number;
  cacheHit: boolean;
  indexesUsed: string[];
  queryPlan?: any;
}

interface SearchAnalytics {
  queryComplexity: 'simple' | 'moderate' | 'complex';
  vectorSearchTime: number;
  keywordSearchTime: number;
  combinationTime: number;
  filteringTime: number;
  totalProcessingTime: number;
  resultsBeforeFiltering: number;
  resultsAfterFiltering: number;
  cacheHitRate: number;
  indexEfficiency: number;
}

interface SearchResult {
  id: string;
  content: string;
  metadata: {
    documentTitle: string;
    pageNumber: number;
    sectionTitle?: string;
    contentType: string;
    confidence?: number;
  };
  scoring: {
    vectorScore: number;
    keywordScore: number;
    combinedScore: number;
    rank: number;
  };
  explanation?: SearchExplanation;
  debugInfo?: SearchDebugInfo;
}

interface SearchDebugPanelProps {
  results: SearchResult[];
  analytics: SearchAnalytics;
  searchMethod: string;
  query: string;
  isVisible: boolean;
  onToggleVisibility: () => void;
}

export function SearchDebugPanel({
  results,
  analytics,
  searchMethod,
  query,
  isVisible,
  onToggleVisibility
}: SearchDebugPanelProps) {
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'results' | 'performance' | 'recommendations'>('overview');

  // Calculate performance metrics
  const performanceScore = Math.min(100, Math.max(0, 
    100 - (analytics.totalProcessingTime / 50) // 50ms = 100%, 5000ms = 0%
  ));

  const efficiencyScore = Math.round(analytics.indexEfficiency * 100);

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'simple': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'moderate': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'complex': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getPerformanceColor = (score: number) => {
    if (score >= 80) return 'text-green-600 dark:text-green-400';
    if (score >= 60) return 'text-yellow-600 dark:text-yellow-400';
    return 'text-red-600 dark:text-red-400';
  };

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={onToggleVisibility}
        className="fixed bottom-4 right-4 z-50"
      >
        <Eye className="h-4 w-4 mr-2" />
        Show Debug Panel
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-6xl max-h-[90vh] overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Search Debug Panel
            </CardTitle>
            <CardDescription>
              Detailed analysis of search query: "{query}"
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onToggleVisibility}
          >
            <EyeOff className="h-4 w-4" />
          </Button>
        </CardHeader>

        <CardContent className="overflow-y-auto max-h-[calc(90vh-120px)]">
          {/* Tab Navigation */}
          <div className="flex space-x-1 mb-6 border-b">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'results', label: 'Results', icon: Search },
              { id: 'performance', label: 'Performance', icon: Zap },
              { id: 'recommendations', label: 'Recommendations', icon: TrendingUp }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Search Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Search Method</p>
                        <p className="text-2xl font-bold">{searchMethod}</p>
                      </div>
                      <Search className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Total Time</p>
                        <p className="text-2xl font-bold">{analytics.totalProcessingTime}ms</p>
                      </div>
                      <Clock className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-muted-foreground">Results</p>
                        <p className="text-2xl font-bold">{results.length}</p>
                      </div>
                      <Database className="h-8 w-8 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Query Analysis */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Query Analysis</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-4">
                    <Badge className={getComplexityColor(analytics.queryComplexity)}>
                      {analytics.queryComplexity} complexity
                    </Badge>
                    <Badge variant="outline">
                      Cache Hit Rate: {(analytics.cacheHitRate * 100).toFixed(1)}%
                    </Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Performance Score</span>
                      <span className={getPerformanceColor(performanceScore)}>
                        {performanceScore.toFixed(0)}%
                      </span>
                    </div>
                    <Progress value={performanceScore} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Index Efficiency</span>
                      <span className={getPerformanceColor(efficiencyScore)}>
                        {efficiencyScore}%
                      </span>
                    </div>
                    <Progress value={efficiencyScore} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Timing Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Timing Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[
                      { label: 'Vector Search', time: analytics.vectorSearchTime, color: 'bg-blue-500' },
                      { label: 'Keyword Search', time: analytics.keywordSearchTime, color: 'bg-green-500' },
                      { label: 'Combination', time: analytics.combinationTime, color: 'bg-purple-500' },
                      { label: 'Filtering', time: analytics.filteringTime, color: 'bg-orange-500' }
                    ].map(item => (
                      <div key={item.label} className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${item.color}`} />
                        <span className="text-sm font-medium min-w-[120px]">{item.label}</span>
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className={`h-2 rounded-full ${item.color}`}
                            style={{
                              width: `${Math.max(5, (item.time / analytics.totalProcessingTime) * 100)}%`
                            }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground min-w-[50px] text-right">
                          {item.time}ms
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Results Tab */}
          {activeTab === 'results' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Search Results Analysis</h3>
                <Badge variant="outline">
                  {analytics.resultsAfterFiltering} of {analytics.resultsBeforeFiltering} results
                </Badge>
              </div>

              <div className="grid gap-4">
                {results.slice(0, 10).map((result, index) => (
                  <Card 
                    key={result.id}
                    className={`cursor-pointer transition-colors ${
                      selectedResult?.id === result.id ? 'ring-2 ring-primary' : ''
                    }`}
                    onClick={() => setSelectedResult(selectedResult?.id === result.id ? null : result)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline">#{result.scoring.rank}</Badge>
                            <Badge className={getComplexityColor(result.metadata.contentType)}>
                              {result.metadata.contentType}
                            </Badge>
                            <span className="text-sm text-muted-foreground">
                              Page {result.metadata.pageNumber}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mb-2">
                            {result.metadata.documentTitle}
                          </p>
                          <p className="text-sm line-clamp-2">
                            {result.content}
                          </p>
                        </div>
                        <div className="text-right space-y-1">
                          <div className="text-sm font-medium">
                            Score: {(result.scoring.combinedScore * 100).toFixed(1)}%
                          </div>
                          <div className="text-xs text-muted-foreground">
                            V: {(result.scoring.vectorScore * 100).toFixed(0)}% | 
                            K: {(result.scoring.keywordScore * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>

                      {/* Expanded Details */}
                      {selectedResult?.id === result.id && result.explanation && (
                        <div className="mt-4 pt-4 border-t space-y-3">
                          <div>
                            <h4 className="text-sm font-medium mb-2">Vector Matches</h4>
                            <div className="flex flex-wrap gap-1">
                              {result.explanation.vectorMatches.map((match, i) => (
                                <Badge key={i} variant="secondary" className="text-xs">
                                  {match}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium mb-2">Keyword Matches</h4>
                            <div className="flex flex-wrap gap-1">
                              {result.explanation.keywordMatches.map((match, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {match}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          <div>
                            <h4 className="text-sm font-medium mb-2">Scoring Breakdown</h4>
                            <div className="space-y-1 text-xs">
                              <div className="flex justify-between">
                                <span>Vector Contribution:</span>
                                <span>{(result.explanation.scoringBreakdown.vectorContribution * 100).toFixed(1)}%</span>
                              </div>
                              <div className="flex justify-between">
                                <span>Keyword Contribution:</span>
                                <span>{(result.explanation.scoringBreakdown.keywordContribution * 100).toFixed(1)}%</span>
                              </div>
                            </div>
                          </div>

                          {result.explanation.scoringBreakdown.boosts.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium mb-2 text-green-600">Boosts</h4>
                              <div className="space-y-1">
                                {result.explanation.scoringBreakdown.boosts.map((boost, i) => (
                                  <div key={i} className="flex items-center gap-2 text-xs">
                                    <CheckCircle className="h-3 w-3 text-green-500" />
                                    <span>{boost.reason} (+{(boost.value * 100).toFixed(1)}%)</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {result.explanation.scoringBreakdown.penalties.length > 0 && (
                            <div>
                              <h4 className="text-sm font-medium mb-2 text-red-600">Penalties</h4>
                              <div className="space-y-1">
                                {result.explanation.scoringBreakdown.penalties.map((penalty, i) => (
                                  <div key={i} className="flex items-center gap-2 text-xs">
                                    <XCircle className="h-3 w-3 text-red-500" />
                                    <span>{penalty.reason} (-{(penalty.value * 100).toFixed(1)}%)</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Performance Tab */}
          {activeTab === 'performance' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Performance Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {analytics.vectorSearchTime}ms
                      </div>
                      <div className="text-sm text-muted-foreground">Vector Search</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {analytics.keywordSearchTime}ms
                      </div>
                      <div className="text-sm text-muted-foreground">Keyword Search</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {analytics.combinationTime}ms
                      </div>
                      <div className="text-sm text-muted-foreground">Combination</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {analytics.filteringTime}ms
                      </div>
                      <div className="text-sm text-muted-foreground">Filtering</div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Results Filtering Efficiency</span>
                      <span className="text-sm">
                        {analytics.resultsAfterFiltering}/{analytics.resultsBeforeFiltering} 
                        ({((analytics.resultsAfterFiltering / analytics.resultsBeforeFiltering) * 100).toFixed(1)}%)
                      </span>
                    </div>
                    <Progress 
                      value={(analytics.resultsAfterFiltering / analytics.resultsBeforeFiltering) * 100} 
                      className="h-2" 
                    />
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Cache Hit Rate</span>
                      <span className="text-sm">{(analytics.cacheHitRate * 100).toFixed(1)}%</span>
                    </div>
                    <Progress value={analytics.cacheHitRate * 100} className="h-2" />
                  </div>
                </CardContent>
              </Card>

              {/* Debug Information */}
              {results[0]?.debugInfo && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Debug Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium">Original Query:</span>
                        <p className="text-muted-foreground mt-1">{results[0].debugInfo.originalQuery}</p>
                      </div>
                      <div>
                        <span className="font-medium">Processed Query:</span>
                        <p className="text-muted-foreground mt-1">{results[0].debugInfo.processedQuery}</p>
                      </div>
                    </div>

                    <Separator />

                    <div>
                      <span className="font-medium text-sm">Indexes Used:</span>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {results[0].debugInfo.indexesUsed.map((index, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {index}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {results[0].debugInfo.cacheHit ? (
                        <CheckCircle className="h-4 w-4 text-green-500" />
                      ) : (
                        <XCircle className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm">
                        {results[0].debugInfo.cacheHit ? 'Cache Hit' : 'Cache Miss'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}

          {/* Recommendations Tab */}
          {activeTab === 'recommendations' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Performance Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Performance-based recommendations */}
                  {analytics.totalProcessingTime > 2000 && (
                    <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-yellow-800 dark:text-yellow-200">
                          Slow Search Performance
                        </h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                          Search took {analytics.totalProcessingTime}ms. Consider enabling query optimization 
                          or adjusting similarity thresholds.
                        </p>
                      </div>
                    </div>
                  )}

                  {analytics.cacheHitRate < 0.3 && (
                    <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <Info className="h-5 w-5 text-blue-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-blue-800 dark:text-blue-200">
                          Low Cache Hit Rate
                        </h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          Cache hit rate is {(analytics.cacheHitRate * 100).toFixed(1)}%. 
                          Consider increasing cache TTL or size for better performance.
                        </p>
                      </div>
                    </div>
                  )}

                  {analytics.resultsAfterFiltering / analytics.resultsBeforeFiltering < 0.5 && (
                    <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <Settings className="h-5 w-5 text-purple-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-purple-800 dark:text-purple-200">
                          High Filter Impact
                        </h4>
                        <p className="text-sm text-purple-700 dark:text-purple-300 mt-1">
                          Filters removed {analytics.resultsBeforeFiltering - analytics.resultsAfterFiltering} results. 
                          Consider adjusting filter criteria for better recall.
                        </p>
                      </div>
                    </div>
                  )}

                  {analytics.totalProcessingTime < 500 && analytics.cacheHitRate > 0.7 && (
                    <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      <div>
                        <h4 className="font-medium text-green-800 dark:text-green-200">
                          Excellent Performance
                        </h4>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          Search performance is optimal with fast response times and good cache utilization.
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Query Optimization Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Use specific terms for better vector matching</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Enable stemming for broader keyword coverage</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Use content type filters to narrow results</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span>Adjust similarity thresholds based on query complexity</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}