/**
 * Lazy loading service for quiz history and large question sets
 */

export interface PaginationOptions {
  page: number;
  limit: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, any>;
}

export interface PaginatedResult<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  metadata?: Record<string, any>;
}

export interface QuizHistoryFilters {
  dateFrom?: string;
  dateTo?: string;
  minScore?: number;
  maxScore?: number;
  sourceDocumentIds?: string[];
  difficulty?: string[];
  questionTypes?: string[];
}

export interface QuestionSetFilters {
  difficulty?: string[];
  questionTypes?: string[];
  sourcePages?: number[];
  confidenceThreshold?: number;
}

/**
 * Virtual scrolling configuration
 */
export interface VirtualScrollConfig {
  itemHeight: number;
  containerHeight: number;
  overscan: number; // Number of items to render outside visible area
  threshold: number; // Distance from edge to trigger loading
}

/**
 * Lazy loading cache entry
 */
interface CacheEntry<T> {
  data: T[];
  timestamp: number;
  page: number;
  filters: Record<string, any>;
  total: number;
}

export class LazyLoadingService {
  private static readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private static readonly MAX_CACHE_SIZE = 100;
  private static readonly DEFAULT_PAGE_SIZE = 20;
  private static readonly PREFETCH_PAGES = 2;

  private cache = new Map<string, CacheEntry<any>>();
  private loadingStates = new Map<string, Promise<any>>();

  /**
   * Load quiz history with pagination and lazy loading
   */
  async loadQuizHistory(
    userId: string,
    options: PaginationOptions & { filters?: QuizHistoryFilters } = { page: 1, limit: LazyLoadingService.DEFAULT_PAGE_SIZE }
  ): Promise<PaginatedResult<any>> {
    const cacheKey = this.generateCacheKey('quiz_history', userId, options);
    
    // Check cache first
    const cached = this.getCachedResult(cacheKey);
    if (cached) {
      console.log(`🎯 Cache hit for quiz history page ${options.page}`);
      return this.formatPaginatedResult(cached.data, options, cached.total);
    }

    // Check if already loading
    if (this.loadingStates.has(cacheKey)) {
      console.log(`⏳ Waiting for ongoing quiz history load for page ${options.page}`);
      return await this.loadingStates.get(cacheKey)!;
    }

    // Start loading
    const loadingPromise = this.fetchQuizHistory(userId, options);
    this.loadingStates.set(cacheKey, loadingPromise);

    try {
      const result = await loadingPromise;
      
      // Cache the result
      this.cacheResult(cacheKey, result.data, options, result.pagination.total);
      
      // Prefetch next pages in background
      this.prefetchQuizHistory(userId, options);
      
      return result;
    } finally {
      this.loadingStates.delete(cacheKey);
    }
  }

  /**
   * Load quiz questions with virtual scrolling support
   */
  async loadQuizQuestions(
    quizId: string,
    options: PaginationOptions & { 
      filters?: QuestionSetFilters;
      virtualScroll?: VirtualScrollConfig;
    } = { page: 1, limit: LazyLoadingService.DEFAULT_PAGE_SIZE }
  ): Promise<PaginatedResult<any>> {
    const cacheKey = this.generateCacheKey('quiz_questions', quizId, options);
    
    // Check cache first
    const cached = this.getCachedResult(cacheKey);
    if (cached) {
      console.log(`🎯 Cache hit for quiz questions page ${options.page}`);
      return this.formatPaginatedResult(cached.data, options, cached.total);
    }

    // Check if already loading
    if (this.loadingStates.has(cacheKey)) {
      console.log(`⏳ Waiting for ongoing quiz questions load for page ${options.page}`);
      return await this.loadingStates.get(cacheKey)!;
    }

    // Start loading
    const loadingPromise = this.fetchQuizQuestions(quizId, options);
    this.loadingStates.set(cacheKey, loadingPromise);

    try {
      const result = await loadingPromise;
      
      // Cache the result
      this.cacheResult(cacheKey, result.data, options, result.pagination.total);
      
      // Prefetch for virtual scrolling if configured
      if (options.virtualScroll) {
        this.prefetchForVirtualScroll(quizId, options);
      }
      
      return result;
    } finally {
      this.loadingStates.delete(cacheKey);
    }
  }

  /**
   * Load document chunks with lazy loading
   */
  async loadDocumentChunks(
    documentId: string,
    options: PaginationOptions & {
      filters?: {
        pageRange?: { start: number; end: number };
        contentTypes?: string[];
        minQualityScore?: number;
      };
    } = { page: 1, limit: LazyLoadingService.DEFAULT_PAGE_SIZE }
  ): Promise<PaginatedResult<any>> {
    const cacheKey = this.generateCacheKey('document_chunks', documentId, options);
    
    // Check cache first
    const cached = this.getCachedResult(cacheKey);
    if (cached) {
      console.log(`🎯 Cache hit for document chunks page ${options.page}`);
      return this.formatPaginatedResult(cached.data, options, cached.total);
    }

    // Check if already loading
    if (this.loadingStates.has(cacheKey)) {
      return await this.loadingStates.get(cacheKey)!;
    }

    // Start loading
    const loadingPromise = this.fetchDocumentChunks(documentId, options);
    this.loadingStates.set(cacheKey, loadingPromise);

    try {
      const result = await loadingPromise;
      
      // Cache the result
      this.cacheResult(cacheKey, result.data, options, result.pagination.total);
      
      return result;
    } finally {
      this.loadingStates.delete(cacheKey);
    }
  }

  /**
   * Calculate virtual scroll window
   */
  calculateVirtualWindow(
    config: VirtualScrollConfig,
    scrollTop: number,
    totalItems: number
  ): {
    startIndex: number;
    endIndex: number;
    visibleStartIndex: number;
    visibleEndIndex: number;
    offsetY: number;
  } {
    const visibleStartIndex = Math.floor(scrollTop / config.itemHeight);
    const visibleEndIndex = Math.min(
      visibleStartIndex + Math.ceil(config.containerHeight / config.itemHeight),
      totalItems - 1
    );

    const startIndex = Math.max(0, visibleStartIndex - config.overscan);
    const endIndex = Math.min(totalItems - 1, visibleEndIndex + config.overscan);

    const offsetY = startIndex * config.itemHeight;

    return {
      startIndex,
      endIndex,
      visibleStartIndex,
      visibleEndIndex,
      offsetY
    };
  }

  /**
   * Preload data for virtual scrolling
   */
  async preloadVirtualData(
    type: 'quiz_history' | 'quiz_questions' | 'document_chunks',
    id: string,
    startIndex: number,
    endIndex: number,
    baseOptions: PaginationOptions
  ): Promise<void> {
    const pageSize = baseOptions.limit || LazyLoadingService.DEFAULT_PAGE_SIZE;
    const startPage = Math.floor(startIndex / pageSize) + 1;
    const endPage = Math.floor(endIndex / pageSize) + 1;

    const loadPromises: Promise<any>[] = [];

    for (let page = startPage; page <= endPage; page++) {
      const options = { ...baseOptions, page };
      const cacheKey = this.generateCacheKey(type, id, options);

      if (!this.getCachedResult(cacheKey) && !this.loadingStates.has(cacheKey)) {
        let loadPromise: Promise<any>;

        switch (type) {
          case 'quiz_history':
            loadPromise = this.loadQuizHistory(id, options);
            break;
          case 'quiz_questions':
            loadPromise = this.loadQuizQuestions(id, options);
            break;
          case 'document_chunks':
            loadPromise = this.loadDocumentChunks(id, options);
            break;
          default:
            continue;
        }

        loadPromises.push(loadPromise);
      }
    }

    if (loadPromises.length > 0) {
      console.log(`🔄 Preloading ${loadPromises.length} pages for virtual scrolling`);
      await Promise.allSettled(loadPromises);
    }
  }

  /**
   * Fetch quiz history from API
   */
  private async fetchQuizHistory(
    userId: string,
    options: PaginationOptions & { filters?: QuizHistoryFilters }
  ): Promise<PaginatedResult<any>> {
    const params = new URLSearchParams({
      page: options.page.toString(),
      limit: options.limit.toString(),
    });

    if (options.sortBy) {
      params.append('sortBy', options.sortBy);
      params.append('sortOrder', options.sortOrder || 'desc');
    }

    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await fetch(`/api/quiz/history?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch quiz history: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Fetch quiz questions from API
   */
  private async fetchQuizQuestions(
    quizId: string,
    options: PaginationOptions & { filters?: QuestionSetFilters }
  ): Promise<PaginatedResult<any>> {
    const params = new URLSearchParams({
      page: options.page.toString(),
      limit: options.limit.toString(),
    });

    if (options.sortBy) {
      params.append('sortBy', options.sortBy);
      params.append('sortOrder', options.sortOrder || 'asc');
    }

    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await fetch(`/api/quiz/${quizId}/questions?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch quiz questions: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Fetch document chunks from API
   */
  private async fetchDocumentChunks(
    documentId: string,
    options: PaginationOptions & {
      filters?: {
        pageRange?: { start: number; end: number };
        contentTypes?: string[];
        minQualityScore?: number;
      };
    }
  ): Promise<PaginatedResult<any>> {
    const params = new URLSearchParams({
      page: options.page.toString(),
      limit: options.limit.toString(),
    });

    if (options.sortBy) {
      params.append('sortBy', options.sortBy);
      params.append('sortOrder', options.sortOrder || 'asc');
    }

    if (options.filters) {
      Object.entries(options.filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          if (key === 'pageRange' && typeof value === 'object') {
            params.append('pageStart', value.start.toString());
            params.append('pageEnd', value.end.toString());
          } else if (Array.isArray(value)) {
            params.append(key, value.join(','));
          } else {
            params.append(key, value.toString());
          }
        }
      });
    }

    const response = await fetch(`/api/documents/${documentId}/chunks?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch document chunks: ${response.statusText}`);
    }

    return await response.json();
  }

  /**
   * Prefetch quiz history pages
   */
  private async prefetchQuizHistory(
    userId: string,
    baseOptions: PaginationOptions & { filters?: QuizHistoryFilters }
  ): Promise<void> {
    const prefetchPromises: Promise<any>[] = [];

    for (let i = 1; i <= LazyLoadingService.PREFETCH_PAGES; i++) {
      const nextPage = baseOptions.page + i;
      const options = { ...baseOptions, page: nextPage };
      const cacheKey = this.generateCacheKey('quiz_history', userId, options);

      if (!this.getCachedResult(cacheKey) && !this.loadingStates.has(cacheKey)) {
        prefetchPromises.push(this.loadQuizHistory(userId, options));
      }
    }

    if (prefetchPromises.length > 0) {
      console.log(`🔄 Prefetching ${prefetchPromises.length} quiz history pages`);
      Promise.allSettled(prefetchPromises); // Don't await - run in background
    }
  }

  /**
   * Prefetch for virtual scrolling
   */
  private async prefetchForVirtualScroll(
    quizId: string,
    baseOptions: PaginationOptions & { 
      filters?: QuestionSetFilters;
      virtualScroll?: VirtualScrollConfig;
    }
  ): Promise<void> {
    if (!baseOptions.virtualScroll) return;

    const config = baseOptions.virtualScroll;
    const itemsPerPage = baseOptions.limit || LazyLoadingService.DEFAULT_PAGE_SIZE;
    
    // Calculate how many pages we need to prefetch based on scroll config
    const visibleItems = Math.ceil(config.containerHeight / config.itemHeight);
    const totalPrefetchItems = visibleItems + (config.overscan * 2);
    const pagesToPrefetch = Math.ceil(totalPrefetchItems / itemsPerPage);

    const prefetchPromises: Promise<any>[] = [];

    for (let i = 1; i <= pagesToPrefetch; i++) {
      const nextPage = baseOptions.page + i;
      const options = { ...baseOptions, page: nextPage };
      const cacheKey = this.generateCacheKey('quiz_questions', quizId, options);

      if (!this.getCachedResult(cacheKey) && !this.loadingStates.has(cacheKey)) {
        prefetchPromises.push(this.loadQuizQuestions(quizId, options));
      }
    }

    if (prefetchPromises.length > 0) {
      console.log(`🔄 Prefetching ${prefetchPromises.length} pages for virtual scrolling`);
      Promise.allSettled(prefetchPromises); // Don't await - run in background
    }
  }

  /**
   * Generate cache key
   */
  private generateCacheKey(
    type: string,
    id: string,
    options: PaginationOptions & { filters?: any }
  ): string {
    const filterString = options.filters ? JSON.stringify(options.filters, Object.keys(options.filters).sort()) : '';
    const sortString = options.sortBy ? `${options.sortBy}_${options.sortOrder || 'desc'}` : '';
    return `${type}_${id}_${options.page}_${options.limit}_${sortString}_${filterString}`;
  }

  /**
   * Get cached result
   */
  private getCachedResult<T>(cacheKey: string): CacheEntry<T> | null {
    const entry = this.cache.get(cacheKey);
    
    if (!entry) {
      return null;
    }

    // Check if cache entry is expired
    if (Date.now() - entry.timestamp > LazyLoadingService.CACHE_TTL) {
      this.cache.delete(cacheKey);
      return null;
    }

    return entry;
  }

  /**
   * Cache result
   */
  private cacheResult<T>(
    cacheKey: string,
    data: T[],
    options: PaginationOptions,
    total: number
  ): void {
    // Check cache size limit
    if (this.cache.size >= LazyLoadingService.MAX_CACHE_SIZE) {
      this.evictOldestCacheEntries();
    }

    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      page: options.page,
      filters: options.filters || {},
      total
    };

    this.cache.set(cacheKey, entry);
  }

  /**
   * Format paginated result
   */
  private formatPaginatedResult<T>(
    data: T[],
    options: PaginationOptions,
    total: number
  ): PaginatedResult<T> {
    const totalPages = Math.ceil(total / options.limit);
    
    return {
      data,
      pagination: {
        page: options.page,
        limit: options.limit,
        total,
        totalPages,
        hasNext: options.page < totalPages,
        hasPrev: options.page > 1
      }
    };
  }

  /**
   * Evict oldest cache entries
   */
  private evictOldestCacheEntries(): void {
    const entries = Array.from(this.cache.entries());
    
    // Sort by timestamp (oldest first)
    entries.sort(([, a], [, b]) => a.timestamp - b.timestamp);
    
    // Remove oldest 20% of entries
    const toRemove = Math.floor(entries.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }

    console.log(`🗑️ Evicted ${toRemove} oldest cache entries`);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
    this.loadingStates.clear();
    console.log('🗑️ Lazy loading cache cleared');
  }

  /**
   * Invalidate cache for specific type and ID
   */
  invalidateCache(type: string, id: string): void {
    const keysToDelete: string[] = [];

    for (const key of this.cache.keys()) {
      if (key.startsWith(`${type}_${id}_`)) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
    }

    console.log(`🗑️ Invalidated ${keysToDelete.length} cache entries for ${type}:${id}`);
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    totalEntries: number;
    loadingStates: number;
    hitRate: number;
    averageAge: number;
  } {
    const entries = Array.from(this.cache.values());
    const now = Date.now();
    const averageAge = entries.length > 0 
      ? entries.reduce((sum, entry) => sum + (now - entry.timestamp), 0) / entries.length
      : 0;

    return {
      totalEntries: this.cache.size,
      loadingStates: this.loadingStates.size,
      hitRate: 0, // Would need to track this separately
      averageAge: averageAge / (1000 * 60) // Convert to minutes
    };
  }
}

// Export singleton instance
export const lazyLoadingService = new LazyLoadingService();