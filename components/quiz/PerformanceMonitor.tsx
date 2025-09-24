'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Activity, 
  Database, 
  HardDrive, 
  Zap, 
  RefreshCw, 
  Trash2,
  TrendingUp,
  Clock,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

interface PerformanceMetrics {
  database: {
    queryPerformance: {
      averageExecutionTime: number;
      slowQueryCount: number;
      totalQueries: number;
      cacheHitRate: number;
    };
    slowQueries: Array<{
      query: string;
      executionTime: number;
      rowsReturned: number;
      timestamp: string;
    }>;
    indexSuggestions: Array<{
      table: string;
      columns: string[];
      indexType: string;
      reason: string;
      estimatedImprovement: string;
      priority: 'high' | 'medium' | 'low';
    }>;
  };
  cache: {
    textExtraction: {
      totalEntries: number;
      totalSize: number;
      hitRate: number;
      averageAge: number;
    };
    lazyLoading: {
      totalEntries: number;
      loadingStates: number;
      hitRate: number;
      averageAge: number;
    };
  };
  embedding: {
    cacheSize: number;
    hitRate: number;
    totalAccesses: number;
    averageAge: number;
    activeModels: Array<{
      name: string;
      version: string;
      dimensions: number;
      isActive: boolean;
    }>;
  };
  lazyLoading: {
    totalEntries: number;
    loadingStates: number;
    hitRate: number;
    averageAge: number;
  };
}

interface PerformanceMonitorProps {
  className?: string;
}

export function PerformanceMonitor({ className }: PerformanceMonitorProps) {
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clearing, setClearing] = useState<string | null>(null);

  useEffect(() => {
    loadMetrics();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(loadMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadMetrics = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/performance');
      if (!response.ok) {
        throw new Error(`Failed to load metrics: ${response.statusText}`);
      }

      const data = await response.json();
      if (data.success) {
        setMetrics(data.metrics);
      } else {
        throw new Error(data.error || 'Failed to load metrics');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Performance metrics error:', err);
    } finally {
      setLoading(false);
    }
  };

  const clearCache = async (target: string) => {
    try {
      setClearing(target);

      const response = await fetch('/api/performance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'clear-cache',
          target
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to clear cache: ${response.statusText}`);
      }

      // Reload metrics after clearing
      await loadMetrics();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Cache clear error:', err);
    } finally {
      setClearing(null);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDuration = (hours: number) => {
    if (hours < 1) return `${Math.round(hours * 60)}m`;
    if (hours < 24) return `${Math.round(hours)}h`;
    return `${Math.round(hours / 24)}d`;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'default';
    }
  };

  if (loading && !metrics) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin" />
            <span className="ml-2">Loading performance metrics...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={className}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Performance Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8 text-destructive">
            <AlertTriangle className="h-6 w-6" />
            <span className="ml-2">{error}</span>
          </div>
          <Button onClick={loadMetrics} variant="outline" className="w-full mt-4">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!metrics) return null;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Activity className="h-6 w-6" />
            Performance Monitor
          </h2>
          <p className="text-muted-foreground">
            System performance metrics and optimization suggestions
          </p>
        </div>
        <Button onClick={loadMetrics} variant="outline" disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Database Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Database Performance
          </CardTitle>
          <CardDescription>
            Query execution times and optimization suggestions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">
                {metrics.database.queryPerformance.averageExecutionTime.toFixed(0)}ms
              </div>
              <div className="text-sm text-muted-foreground">Avg Query Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-destructive">
                {metrics.database.queryPerformance.slowQueryCount}
              </div>
              <div className="text-sm text-muted-foreground">Slow Queries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {metrics.database.queryPerformance.totalQueries}
              </div>
              <div className="text-sm text-muted-foreground">Total Queries</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {(metrics.database.queryPerformance.cacheHitRate * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Cache Hit Rate</div>
            </div>
          </div>

          {metrics.database.indexSuggestions.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-2">Index Suggestions</h4>
                <div className="space-y-2">
                  {metrics.database.indexSuggestions.slice(0, 3).map((suggestion, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                      <div className="flex-1">
                        <div className="font-medium">{suggestion.table}</div>
                        <div className="text-sm text-muted-foreground">
                          {suggestion.columns.join(', ')} ({suggestion.indexType})
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {suggestion.reason}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getPriorityColor(suggestion.priority) as any}>
                          {suggestion.priority}
                        </Badge>
                        <div className="text-sm text-green-600">
                          {suggestion.estimatedImprovement}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Button 
            onClick={() => clearCache('database')} 
            variant="outline" 
            size="sm"
            disabled={clearing === 'database'}
          >
            {clearing === 'database' ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Clear Query Cache
          </Button>
        </CardContent>
      </Card>

      {/* Cache Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Cache Performance
          </CardTitle>
          <CardDescription>
            Text extraction and lazy loading cache statistics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Text Extraction Cache */}
          <div>
            <h4 className="font-semibold mb-3">Text Extraction Cache</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-xl font-bold">
                  {metrics.cache.textExtraction.totalEntries}
                </div>
                <div className="text-sm text-muted-foreground">Entries</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">
                  {formatBytes(metrics.cache.textExtraction.totalSize)}
                </div>
                <div className="text-sm text-muted-foreground">Size</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">
                  {(metrics.cache.textExtraction.hitRate * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Hit Rate</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">
                  {formatDuration(metrics.cache.textExtraction.averageAge)}
                </div>
                <div className="text-sm text-muted-foreground">Avg Age</div>
              </div>
            </div>
            <Button 
              onClick={() => clearCache('text-extraction')} 
              variant="outline" 
              size="sm"
              disabled={clearing === 'text-extraction'}
            >
              {clearing === 'text-extraction' ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Clear Text Cache
            </Button>
          </div>

          <Separator />

          {/* Lazy Loading Cache */}
          <div>
            <h4 className="font-semibold mb-3">Lazy Loading Cache</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-xl font-bold">
                  {metrics.cache.lazyLoading.totalEntries}
                </div>
                <div className="text-sm text-muted-foreground">Entries</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">
                  {metrics.cache.lazyLoading.loadingStates}
                </div>
                <div className="text-sm text-muted-foreground">Loading</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-green-600">
                  {(metrics.cache.lazyLoading.hitRate * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Hit Rate</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold">
                  {formatDuration(metrics.cache.lazyLoading.averageAge)}
                </div>
                <div className="text-sm text-muted-foreground">Avg Age</div>
              </div>
            </div>
            <Button 
              onClick={() => clearCache('lazy-loading')} 
              variant="outline" 
              size="sm"
              disabled={clearing === 'lazy-loading'}
            >
              {clearing === 'lazy-loading' ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Trash2 className="h-4 w-4 mr-2" />
              )}
              Clear Lazy Loading Cache
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Embedding Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Embedding Performance
          </CardTitle>
          <CardDescription>
            Vector embedding generation and caching statistics
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-xl font-bold">
                {metrics.embedding.cacheSize}
              </div>
              <div className="text-sm text-muted-foreground">Cache Size</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold text-green-600">
                {(metrics.embedding.hitRate * 100).toFixed(1)}%
              </div>
              <div className="text-sm text-muted-foreground">Hit Rate</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">
                {metrics.embedding.totalAccesses}
              </div>
              <div className="text-sm text-muted-foreground">Total Accesses</div>
            </div>
            <div className="text-center">
              <div className="text-xl font-bold">
                {formatDuration(metrics.embedding.averageAge)}
              </div>
              <div className="text-sm text-muted-foreground">Avg Age</div>
            </div>
          </div>

          {metrics.embedding.activeModels.length > 0 && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-2">Active Models</h4>
                <div className="space-y-2">
                  {metrics.embedding.activeModels.map((model, index) => (
                    <div key={index} className="flex items-center justify-between p-2 bg-muted rounded">
                      <div>
                        <div className="font-medium">{model.name}</div>
                        <div className="text-sm text-muted-foreground">
                          v{model.version} • {model.dimensions} dimensions
                        </div>
                      </div>
                      <Badge variant={model.isActive ? 'default' : 'secondary'}>
                        {model.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          <Button 
            onClick={() => clearCache('embedding')} 
            variant="outline" 
            size="sm"
            disabled={clearing === 'embedding'}
          >
            {clearing === 'embedding' ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Clear Embedding Cache
          </Button>
        </CardContent>
      </Card>

      {/* Clear All */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trash2 className="h-5 w-5" />
            Cache Management
          </CardTitle>
          <CardDescription>
            Clear all caches and reset performance metrics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={() => clearCache('all')} 
            variant="destructive" 
            disabled={clearing === 'all'}
            className="w-full"
          >
            {clearing === 'all' ? (
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Clear All Caches
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}