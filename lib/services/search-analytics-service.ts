import { getAuthenticatedSupabaseClient } from '@/lib/supabaseClient';

/**
 * Search query log entry
 */
export interface SearchQueryLog {
  id: string;
  userId: string;
  query: string;
  searchMethod: 'vector' | 'keyword' | 'hybrid';
  documentIds: string[];
  resultCount: number;
  searchTime: number;
  queryComplexity: 'simple' | 'moderate' | 'complex';
  cacheHit: boolean;
  filters: {
    contentTypes?: string[];
    pageRange?: { start: number; end: number };
    confidenceRange?: { min: number; max: number };
    relevanceRange?: { min: number; max: number };
  };
  performance: {
    vectorSearchTime: number;
    keywordSearchTime: number;
    combinationTime: number;
    filteringTime: number;
    indexEfficiency: number;
  };
  timestamp: Date;
}

/**
 * Search performance metrics
 */
export interface SearchPerformanceMetrics {
  totalSearches: number;
  averageSearchTime: number;
  averageResultCount: number;
  cacheHitRate: number;
  searchMethodDistribution: Record<string, number>;
  queryComplexityDistribution: Record<string, number>;
  popularFilters: Array<{
    filterType: string;
    usage: number;
    averageImpact: number;
  }>;
  performanceTrends: Array<{
    date: string;
    averageSearchTime: number;
    searchCount: number;
    cacheHitRate: number;
  }>;
  slowQueries: Array<{
    query: string;
    searchTime: number;
    resultCount: number;
    timestamp: Date;
  }>;
}

/**
 * Search optimization recommendations
 */
export interface SearchOptimizationRecommendations {
  queryOptimizations: Array<{
    type: 'synonym_expansion' | 'stemming' | 'stop_word_removal' | 'fuzzy_matching';
    description: string;
    expectedImprovement: number;
    confidence: number;
  }>;
  indexOptimizations: Array<{
    type: 'vector_index' | 'text_index' | 'composite_index';
    description: string;
    expectedSpeedup: number;
    estimatedCost: 'low' | 'medium' | 'high';
  }>;
  cacheOptimizations: Array<{
    type: 'cache_size' | 'cache_ttl' | 'cache_strategy';
    description: string;
    expectedHitRateImprovement: number;
  }>;
  filterOptimizations: Array<{
    filterType: string;
    description: string;
    usageFrequency: number;
    performanceImpact: number;
  }>;
}

/**
 * Real-time search monitoring data
 */
export interface SearchMonitoringData {
  activeSearches: number;
  averageResponseTime: number;
  errorRate: number;
  cacheHitRate: number;
  indexHealth: {
    vectorIndex: 'healthy' | 'degraded' | 'critical';
    textIndex: 'healthy' | 'degraded' | 'critical';
    lastOptimized: Date;
  };
  resourceUsage: {
    cpuUsage: number;
    memoryUsage: number;
    diskUsage: number;
  };
  alerts: Array<{
    type: 'performance' | 'error' | 'resource';
    severity: 'low' | 'medium' | 'high' | 'critical';
    message: string;
    timestamp: Date;
  }>;
}

export class SearchAnalyticsService {
  private static readonly MAX_LOG_ENTRIES = 10000;
  private static readonly SLOW_QUERY_THRESHOLD = 5000; // 5 seconds
  private static readonly PERFORMANCE_WINDOW_DAYS = 30;

  private queryLogs: SearchQueryLog[] = [];
  private performanceMetrics: SearchPerformanceMetrics | null = null;
  private lastMetricsUpdate: Date | null = null;

  /**
   * Log a search query for analytics
   */
  async logSearchQuery(logEntry: Omit<SearchQueryLog, 'id' | 'timestamp'>): Promise<void> {
    try {
      const client = await getAuthenticatedSupabaseClient();
      
      // Store in database for persistence
      const { error } = await client
        .from('search_query_logs')
        .insert({
          user_id: logEntry.userId,
          query: logEntry.query,
          search_method: logEntry.searchMethod,
          document_ids: logEntry.documentIds,
          result_count: logEntry.resultCount,
          search_time: logEntry.searchTime,
          query_complexity: logEntry.queryComplexity,
          cache_hit: logEntry.cacheHit,
          filters: logEntry.filters,
          performance: logEntry.performance,
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Failed to log search query:', error);
        // Continue with in-memory logging as fallback
      }

      // Also store in memory for real-time analytics
      const fullLogEntry: SearchQueryLog = {
        id: this.generateId(),
        timestamp: new Date(),
        ...logEntry
      };

      this.queryLogs.push(fullLogEntry);

      // Maintain log size limit
      if (this.queryLogs.length > SearchAnalyticsService.MAX_LOG_ENTRIES) {
        this.queryLogs = this.queryLogs.slice(-SearchAnalyticsService.MAX_LOG_ENTRIES);
      }

      // Invalidate cached metrics
      this.performanceMetrics = null;
    } catch (error) {
      console.error('Error logging search query:', error);
    }
  }

  /**
   * Get search performance metrics
   */
  async getPerformanceMetrics(
    userId?: string,
    timeRange?: { start: Date; end: Date }
  ): Promise<SearchPerformanceMetrics> {
    // Return cached metrics if recent and no filters
    if (
      this.performanceMetrics && 
      this.lastMetricsUpdate &&
      Date.now() - this.lastMetricsUpdate.getTime() < 5 * 60 * 1000 && // 5 minutes
      !userId && 
      !timeRange
    ) {
      return this.performanceMetrics;
    }

    try {
      // Get data from database for comprehensive metrics
      const client = await getAuthenticatedSupabaseClient();
      let query = client
        .from('search_query_logs')
        .select('*');

      if (userId) {
        query = query.eq('user_id', userId);
      }

      if (timeRange) {
        query = query
          .gte('created_at', timeRange.start.toISOString())
          .lte('created_at', timeRange.end.toISOString());
      } else {
        // Default to last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - SearchAnalyticsService.PERFORMANCE_WINDOW_DAYS);
        query = query.gte('created_at', thirtyDaysAgo.toISOString());
      }

      const { data: logs, error } = await query.order('created_at', { ascending: false });

      if (error) {
        console.error('Failed to fetch search logs:', error);
        // Fall back to in-memory data
        return this.calculateMetricsFromMemory(userId, timeRange);
      }

      const metrics = this.calculateMetricsFromLogs(logs || []);
      
      // Cache metrics if no filters
      if (!userId && !timeRange) {
        this.performanceMetrics = metrics;
        this.lastMetricsUpdate = new Date();
      }

      return metrics;
    } catch (error) {
      console.error('Error getting performance metrics:', error);
      return this.calculateMetricsFromMemory(userId, timeRange);
    }
  }

  /**
   * Get search optimization recommendations
   */
  async getOptimizationRecommendations(
    userId?: string
  ): Promise<SearchOptimizationRecommendations> {
    const metrics = await this.getPerformanceMetrics(userId);
    
    const recommendations: SearchOptimizationRecommendations = {
      queryOptimizations: [],
      indexOptimizations: [],
      cacheOptimizations: [],
      filterOptimizations: []
    };

    // Query optimization recommendations
    if (metrics.averageSearchTime > 2000) {
      recommendations.queryOptimizations.push({
        type: 'synonym_expansion',
        description: 'Enable synonym expansion to improve recall with potentially faster semantic matching',
        expectedImprovement: 0.15,
        confidence: 0.7
      });
    }

    if (metrics.queryComplexityDistribution.complex > metrics.totalSearches * 0.3) {
      recommendations.queryOptimizations.push({
        type: 'stemming',
        description: 'Enable stemming to reduce query complexity and improve matching',
        expectedImprovement: 0.2,
        confidence: 0.8
      });
    }

    // Index optimization recommendations
    if (metrics.averageSearchTime > 3000) {
      recommendations.indexOptimizations.push({
        type: 'vector_index',
        description: 'Optimize vector index parameters (lists, probes) for better performance',
        expectedSpeedup: 2.0,
        estimatedCost: 'medium'
      });
    }

    // Cache optimization recommendations
    if (metrics.cacheHitRate < 0.3) {
      recommendations.cacheOptimizations.push({
        type: 'cache_ttl',
        description: 'Increase cache TTL to improve hit rate for similar queries',
        expectedHitRateImprovement: 0.2
      });
    }

    if (metrics.cacheHitRate < 0.5 && metrics.totalSearches > 100) {
      recommendations.cacheOptimizations.push({
        type: 'cache_size',
        description: 'Increase cache size to store more query results',
        expectedHitRateImprovement: 0.15
      });
    }

    // Filter optimization recommendations
    const popularFilters = metrics.popularFilters.filter(f => f.usage > 0.1);
    for (const filter of popularFilters) {
      if (filter.averageImpact > 100) { // 100ms impact
        recommendations.filterOptimizations.push({
          filterType: filter.filterType,
          description: `Optimize ${filter.filterType} filtering with dedicated index`,
          usageFrequency: filter.usage,
          performanceImpact: filter.averageImpact
        });
      }
    }

    return recommendations;
  }

  /**
   * Get real-time monitoring data
   */
  async getMonitoringData(): Promise<SearchMonitoringData> {
    const recentLogs = this.queryLogs.filter(
      log => Date.now() - log.timestamp.getTime() < 5 * 60 * 1000 // Last 5 minutes
    );

    const activeSearches = recentLogs.length;
    const averageResponseTime = recentLogs.length > 0 
      ? recentLogs.reduce((sum, log) => sum + log.searchTime, 0) / recentLogs.length
      : 0;

    const errorRate = 0; // Would need to track errors separately
    const cacheHitRate = recentLogs.length > 0
      ? recentLogs.filter(log => log.cacheHit).length / recentLogs.length
      : 0;

    // Simulate index health (in real implementation, would check actual index stats)
    const indexHealth = {
      vectorIndex: averageResponseTime < 1000 ? 'healthy' as const : 
                   averageResponseTime < 3000 ? 'degraded' as const : 'critical' as const,
      textIndex: averageResponseTime < 500 ? 'healthy' as const :
                 averageResponseTime < 2000 ? 'degraded' as const : 'critical' as const,
      lastOptimized: new Date(Date.now() - 24 * 60 * 60 * 1000) // 24 hours ago
    };

    // Simulate resource usage
    const resourceUsage = {
      cpuUsage: Math.min(100, averageResponseTime / 50), // Rough approximation
      memoryUsage: Math.min(100, this.queryLogs.length / 100),
      diskUsage: 45 // Static for now
    };

    // Generate alerts based on conditions
    const alerts: SearchMonitoringData['alerts'] = [];
    
    if (averageResponseTime > 5000) {
      alerts.push({
        type: 'performance',
        severity: 'high',
        message: `Average search response time is ${averageResponseTime}ms, exceeding 5s threshold`,
        timestamp: new Date()
      });
    }

    if (cacheHitRate < 0.1 && recentLogs.length > 10) {
      alerts.push({
        type: 'performance',
        severity: 'medium',
        message: `Cache hit rate is very low (${(cacheHitRate * 100).toFixed(1)}%)`,
        timestamp: new Date()
      });
    }

    if (resourceUsage.cpuUsage > 80) {
      alerts.push({
        type: 'resource',
        severity: 'high',
        message: `High CPU usage detected (${resourceUsage.cpuUsage.toFixed(1)}%)`,
        timestamp: new Date()
      });
    }

    return {
      activeSearches,
      averageResponseTime,
      errorRate,
      cacheHitRate,
      indexHealth,
      resourceUsage,
      alerts
    };
  }

  /**
   * Get popular search queries
   */
  async getPopularQueries(
    userId?: string,
    limit: number = 10,
    timeRange?: { start: Date; end: Date }
  ): Promise<Array<{
    query: string;
    count: number;
    averageSearchTime: number;
    averageResultCount: number;
    lastUsed: Date;
  }>> {
    let logs = this.queryLogs;

    // Apply filters
    if (userId) {
      logs = logs.filter(log => log.userId === userId);
    }

    if (timeRange) {
      logs = logs.filter(log => 
        log.timestamp >= timeRange.start && log.timestamp <= timeRange.end
      );
    }

    // Group by query and calculate statistics
    const queryStats = new Map<string, {
      count: number;
      totalSearchTime: number;
      totalResultCount: number;
      lastUsed: Date;
    }>();

    for (const log of logs) {
      const existing = queryStats.get(log.query) || {
        count: 0,
        totalSearchTime: 0,
        totalResultCount: 0,
        lastUsed: new Date(0)
      };

      queryStats.set(log.query, {
        count: existing.count + 1,
        totalSearchTime: existing.totalSearchTime + log.searchTime,
        totalResultCount: existing.totalResultCount + log.resultCount,
        lastUsed: log.timestamp > existing.lastUsed ? log.timestamp : existing.lastUsed
      });
    }

    // Convert to array and sort by count
    return Array.from(queryStats.entries())
      .map(([query, stats]) => ({
        query,
        count: stats.count,
        averageSearchTime: stats.totalSearchTime / stats.count,
        averageResultCount: stats.totalResultCount / stats.count,
        lastUsed: stats.lastUsed
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Clear analytics data
   */
  clearAnalytics(): void {
    this.queryLogs = [];
    this.performanceMetrics = null;
    this.lastMetricsUpdate = null;
  }

  /**
   * Calculate metrics from database logs
   */
  private calculateMetricsFromLogs(logs: any[]): SearchPerformanceMetrics {
    if (logs.length === 0) {
      return this.getEmptyMetrics();
    }

    const totalSearches = logs.length;
    const averageSearchTime = logs.reduce((sum, log) => sum + log.search_time, 0) / totalSearches;
    const averageResultCount = logs.reduce((sum, log) => sum + log.result_count, 0) / totalSearches;
    const cacheHitRate = logs.filter(log => log.cache_hit).length / totalSearches;

    // Search method distribution
    const searchMethodDistribution: Record<string, number> = {};
    logs.forEach(log => {
      searchMethodDistribution[log.search_method] = 
        (searchMethodDistribution[log.search_method] || 0) + 1;
    });

    // Query complexity distribution
    const queryComplexityDistribution: Record<string, number> = {};
    logs.forEach(log => {
      queryComplexityDistribution[log.query_complexity] = 
        (queryComplexityDistribution[log.query_complexity] || 0) + 1;
    });

    // Popular filters
    const filterUsage = new Map<string, { count: number; totalImpact: number }>();
    logs.forEach(log => {
      const filters = log.filters || {};
      Object.keys(filters).forEach(filterType => {
        if (filters[filterType]) {
          const existing = filterUsage.get(filterType) || { count: 0, totalImpact: 0 };
          filterUsage.set(filterType, {
            count: existing.count + 1,
            totalImpact: existing.totalImpact + (log.performance?.filteringTime || 0)
          });
        }
      });
    });

    const popularFilters = Array.from(filterUsage.entries())
      .map(([filterType, stats]) => ({
        filterType,
        usage: stats.count / totalSearches,
        averageImpact: stats.totalImpact / stats.count
      }))
      .sort((a, b) => b.usage - a.usage);

    // Performance trends (daily aggregation)
    const dailyStats = new Map<string, { 
      searchTime: number; 
      count: number; 
      cacheHits: number; 
    }>();
    
    logs.forEach(log => {
      const date = new Date(log.created_at).toISOString().split('T')[0];
      const existing = dailyStats.get(date) || { searchTime: 0, count: 0, cacheHits: 0 };
      dailyStats.set(date, {
        searchTime: existing.searchTime + log.search_time,
        count: existing.count + 1,
        cacheHits: existing.cacheHits + (log.cache_hit ? 1 : 0)
      });
    });

    const performanceTrends = Array.from(dailyStats.entries())
      .map(([date, stats]) => ({
        date,
        averageSearchTime: stats.searchTime / stats.count,
        searchCount: stats.count,
        cacheHitRate: stats.cacheHits / stats.count
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Slow queries
    const slowQueries = logs
      .filter(log => log.search_time > SearchAnalyticsService.SLOW_QUERY_THRESHOLD)
      .map(log => ({
        query: log.query,
        searchTime: log.search_time,
        resultCount: log.result_count,
        timestamp: new Date(log.created_at)
      }))
      .sort((a, b) => b.searchTime - a.searchTime)
      .slice(0, 10);

    return {
      totalSearches,
      averageSearchTime,
      averageResultCount,
      cacheHitRate,
      searchMethodDistribution,
      queryComplexityDistribution,
      popularFilters,
      performanceTrends,
      slowQueries
    };
  }

  /**
   * Calculate metrics from in-memory logs (fallback)
   */
  private calculateMetricsFromMemory(
    userId?: string,
    timeRange?: { start: Date; end: Date }
  ): SearchPerformanceMetrics {
    let logs = this.queryLogs;

    if (userId) {
      logs = logs.filter(log => log.userId === userId);
    }

    if (timeRange) {
      logs = logs.filter(log => 
        log.timestamp >= timeRange.start && log.timestamp <= timeRange.end
      );
    }

    if (logs.length === 0) {
      return this.getEmptyMetrics();
    }

    // Similar calculation as calculateMetricsFromLogs but for in-memory data
    const totalSearches = logs.length;
    const averageSearchTime = logs.reduce((sum, log) => sum + log.searchTime, 0) / totalSearches;
    const averageResultCount = logs.reduce((sum, log) => sum + log.resultCount, 0) / totalSearches;
    const cacheHitRate = logs.filter(log => log.cacheHit).length / totalSearches;

    return {
      totalSearches,
      averageSearchTime,
      averageResultCount,
      cacheHitRate,
      searchMethodDistribution: {},
      queryComplexityDistribution: {},
      popularFilters: [],
      performanceTrends: [],
      slowQueries: []
    };
  }

  /**
   * Get empty metrics structure
   */
  private getEmptyMetrics(): SearchPerformanceMetrics {
    return {
      totalSearches: 0,
      averageSearchTime: 0,
      averageResultCount: 0,
      cacheHitRate: 0,
      searchMethodDistribution: {},
      queryComplexityDistribution: {},
      popularFilters: [],
      performanceTrends: [],
      slowQueries: []
    };
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `search_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const searchAnalyticsService = new SearchAnalyticsService();