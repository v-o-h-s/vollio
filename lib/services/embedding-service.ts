import { v4 as uuidv4 } from 'uuid';

/**
 * Embedding generation options
 */
export interface EmbeddingOptions {
  model?: string;
  batchSize?: number;
  timeout?: number;
  retryAttempts?: number;
  retryDelay?: number;
  cacheEnabled?: boolean;
  validateQuality?: boolean;
  qualityThreshold?: number;
}

/**
 * Individual embedding result
 */
export interface EmbeddingResult {
  id: string;
  text: string;
  embedding: number[];
  model: string;
  tokenCount: number;
  processingTime: number;
  qualityScore?: number;
  cached: boolean;
}

/* 
 * Batch embedding result
 */
export interface BatchEmbeddingResult {
  success: boolean;
  results: EmbeddingResult[];
  totalProcessed: number;
  totalTime: number;
  averageQualityScore?: number;
  cacheHitRate: number;
  error?: string;
}

/**
 * Embedding cache entry
 */
interface EmbeddingCacheEntry {
  embedding: number[];
  model: string;
  tokenCount: number;
  qualityScore?: number;
  createdAt: Date;
  accessCount: number;
  lastAccessed: Date;
}

/**
 * Model version information
 */
interface ModelVersion {
  name: string;
  version: string;
  dimensions: number;
  maxTokens: number;
  isActive: boolean;
  createdAt: Date;
  deprecatedAt?: Date;
}

/**
 * DeepSeek API response structure
 */
interface DeepSeekEmbeddingResponse {
  object: string;
  data: Array<{
    object: string;
    embedding: number[];
    index: number;
  }>;
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

/**
 * Embedding quality metrics
 */
interface QualityMetrics {
  magnitude: number;
  variance: number;
  sparsity: number;
  dimensionality: number;
  isValid: boolean;
}

export class EmbeddingService {
  private static readonly DEFAULT_MODEL = 'deepseek-chat';
  private static readonly DEFAULT_BATCH_SIZE = 100;
  private static readonly DEFAULT_TIMEOUT = 30000; // 30 seconds
  private static readonly DEFAULT_RETRY_ATTEMPTS = 3;
  private static readonly DEFAULT_RETRY_DELAY = 1000; // 1 second
  private static readonly DEFAULT_QUALITY_THRESHOLD = 0.7;
  private static readonly CACHE_TTL = 7 * 24 * 60 * 60 * 1000; // 7 days
  private static readonly MAX_CACHE_SIZE = 10000;

  private cache = new Map<string, EmbeddingCacheEntry>();
  private modelVersions = new Map<string, ModelVersion>();
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.DEEPSEEK_AP_KEY || '';
    this.baseUrl = 'https://api.deepseek.com/v1';
    
    if (!this.apiKey) {
      throw new Error('DeepSeek API key not found in environment variables');
     }

    // Initialize default model version
    this.initializeModelVersions();
  }

  /**
   * Generate embeddings for a single text
   */
  async generateEmbedding(
    text: string,
    options: EmbeddingOptions = {}
  ): Promise<EmbeddingResult> {
    const config = this.getConfig(options);
    const textId = uuidv4();
    
    // Check cache first
    if (config.cacheEnabled) {
      const cached = this.getCachedEmbedding(text, config.model!);
      if (cached) {
        return {
          id: textId,
          text,
          embedding: cached.embedding,
          model: cached.model,
          tokenCount: cached.tokenCount,
          processingTime: 0,
          qualityScore: cached.qualityScore,
          cached: true
        };
      }
    }

    const startTime = Date.now();
    
    try {
      const embedding = await this.callDeepSeekAPI([text], config);
      const result = embedding.results[0];
      
      // Validate quality if enabled
      if (config.validateQuality) {
        const qualityScore = this.validateEmbeddingQuality(result.embedding);
        if (qualityScore < config.qualityThreshold!) {
          throw new Error(`Embedding quality score ${qualityScore} below threshold ${config.qualityThreshold}`);
        }
        result.qualityScore = qualityScore;
      }

      // Cache the result
      if (config.cacheEnabled) {
        this.cacheEmbedding(text, result, config.model!);
      }

      return {
        ...result,
        id: textId,
        text,
        processingTime: Date.now() - startTime,
        cached: false
      };
    } catch (error) {
      throw new Error(`Failed to generate embedding: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Generate embeddings for multiple texts in batches
   */
  async generateBatchEmbeddings(
    texts: string[],
    options: EmbeddingOptions = {}
  ): Promise<BatchEmbeddingResult> {
    const config = this.getConfig(options);
    const startTime = Date.now();
    const results: EmbeddingResult[] = [];
    let cacheHits = 0;
    let totalQualityScore = 0;
    let qualityCount = 0;

    try {
      // Process in batches
      for (let i = 0; i < texts.length; i += config.batchSize!) {
        const batch = texts.slice(i, i + config.batchSize!);
        const batchResults: EmbeddingResult[] = [];
        const uncachedTexts: string[] = [];
        const uncachedIndices: number[] = [];

        // Check cache for each text in batch
        if (config.cacheEnabled) {
          for (let j = 0; j < batch.length; j++) {
            const text = batch[j];
            const cached = this.getCachedEmbedding(text, config.model!);
            
            if (cached) {
              batchResults[j] = {
                id: uuidv4(),
                text,
                embedding: cached.embedding,
                model: cached.model,
                tokenCount: cached.tokenCount,
                processingTime: 0,
                qualityScore: cached.qualityScore,
                cached: true
              };
              cacheHits++;
            } else {
              uncachedTexts.push(text);
              uncachedIndices.push(j);
            }
          }
        } else {
          uncachedTexts.push(...batch);
          uncachedIndices.push(...batch.map((_, idx) => idx));
        }

        // Process uncached texts
        if (uncachedTexts.length > 0) {
          const apiResult = await this.callDeepSeekAPI(uncachedTexts, config);
          
          for (let k = 0; k < apiResult.results.length; k++) {
            const result = apiResult.results[k];
            const originalIndex = uncachedIndices[k];
            const text = uncachedTexts[k];

            // Validate quality if enabled
            if (config.validateQuality) {
              const qualityScore = this.validateEmbeddingQuality(result.embedding);
              if (qualityScore < config.qualityThreshold!) {
                console.warn(`Embedding quality score ${qualityScore} below threshold for text: ${text.substring(0, 100)}...`);
              }
              result.qualityScore = qualityScore;
              totalQualityScore += qualityScore;
              qualityCount++;
            }

            // Cache the result
            if (config.cacheEnabled) {
              this.cacheEmbedding(text, result, config.model!);
            }

            batchResults[originalIndex] = {
              ...result,
              id: uuidv4(),
              text,
              processingTime: 0, // Individual timing not available in batch
              cached: false
            };
          }
        }

        results.push(...batchResults);
      }

      const totalTime = Date.now() - startTime;
      const cacheHitRate = texts.length > 0 ? cacheHits / texts.length : 0;
      const averageQualityScore = qualityCount > 0 ? totalQualityScore / qualityCount : undefined;

      return {
        success: true,
        results,
        totalProcessed: texts.length,
        totalTime,
        averageQualityScore,
        cacheHitRate
      };
    } catch (error) {
      return {
        success: false,
        results: [],
        totalProcessed: 0,
        totalTime: Date.now() - startTime,
        cacheHitRate: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Call DeepSeek API with retry logic
   */
  private async callDeepSeekAPI(
    texts: string[],
    config: Required<EmbeddingOptions>
  ): Promise<BatchEmbeddingResult> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < config.retryAttempts; attempt++) {
      try {
        const response = await fetch(`${this.baseUrl}/embeddings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          },
          body: JSON.stringify({
            model: config.model,
            input: texts
          }),
          signal: AbortSignal.timeout(config.timeout)
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(`DeepSeek API error: ${response.status} ${response.statusText} - ${JSON.stringify(errorData)}`);
        }

        const data: DeepSeekEmbeddingResponse = await response.json();
        
        // Validate response structure
        if (!data.data || !Array.isArray(data.data)) {
          throw new Error('Invalid response structure from DeepSeek API');
        }

        const results: EmbeddingResult[] = data.data.map((item, index) => ({
          id: uuidv4(),
          text: texts[index],
          embedding: item.embedding,
          model: data.model,
          tokenCount: Math.ceil(texts[index].length / 4), // Rough estimation
          processingTime: 0,
          cached: false
        }));

        return {
          success: true,
          results,
          totalProcessed: texts.length,
          totalTime: 0,
          cacheHitRate: 0
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown API error');
        
        if (attempt < config.retryAttempts - 1) {
          const delay = config.retryDelay * Math.pow(2, attempt); // Exponential backoff
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError || new Error('Failed to call DeepSeek API after all retry attempts');
  }

  /**
   * Validate embedding quality
   */
  private validateEmbeddingQuality(embedding: number[]): number {
    const metrics = this.calculateQualityMetrics(embedding);
    
    // Composite quality score based on multiple factors
    let score = 0;
    
    // Check if embedding is valid (not all zeros, reasonable magnitude)
    if (!metrics.isValid) {
      return 0;
    }
    
    // Magnitude score (should be reasonable, not too small or too large)
    const magnitudeScore = Math.min(1, Math.max(0, 1 - Math.abs(metrics.magnitude - 1) / 2));
    score += magnitudeScore * 0.3;
    
    // Variance score (should have reasonable spread)
    const varianceScore = Math.min(1, metrics.variance * 10);
    score += varianceScore * 0.3;
    
    // Sparsity score (shouldn't be too sparse)
    const sparsityScore = Math.max(0, 1 - metrics.sparsity);
    score += sparsityScore * 0.2;
    
    // Dimensionality score (should use most dimensions)
    const dimensionalityScore = metrics.dimensionality;
    score += dimensionalityScore * 0.2;
    
    return Math.min(1, Math.max(0, score));
  }

  /**
   * Calculate quality metrics for an embedding
   */
  private calculateQualityMetrics(embedding: number[]): QualityMetrics {
    if (!embedding || embedding.length === 0) {
      return {
        magnitude: 0,
        variance: 0,
        sparsity: 1,
        dimensionality: 0,
        isValid: false
      };
    }

    // Calculate magnitude (L2 norm)
    const magnitude = Math.sqrt(embedding.reduce((sum, val) => sum + val * val, 0));
    
    // Calculate variance
    const mean = embedding.reduce((sum, val) => sum + val, 0) / embedding.length;
    const variance = embedding.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / embedding.length;
    
    // Calculate sparsity (ratio of zero/near-zero values)
    const nearZeroCount = embedding.filter(val => Math.abs(val) < 1e-6).length;
    const sparsity = nearZeroCount / embedding.length;
    
    // Calculate dimensionality usage (ratio of non-zero dimensions)
    const dimensionality = 1 - sparsity;
    
    // Check if embedding is valid
    const isValid = magnitude > 1e-6 && !embedding.every(val => val === 0);

    return {
      magnitude,
      variance,
      sparsity,
      dimensionality,
      isValid
    };
  }

  /**
   * Get cached embedding
   */
  private getCachedEmbedding(text: string, model: string): EmbeddingCacheEntry | null {
    const key = this.getCacheKey(text, model);
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    // Check if cache entry is expired
    if (Date.now() - entry.createdAt.getTime() > EmbeddingService.CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }

    // Update access statistics
    entry.accessCount++;
    entry.lastAccessed = new Date();
    
    return entry;
  }

  /**
   * Cache embedding result
   */
  private cacheEmbedding(text: string, result: EmbeddingResult, model: string): void {
    // Check cache size limit
    if (this.cache.size >= EmbeddingService.MAX_CACHE_SIZE) {
      this.evictOldestCacheEntries();
    }

    const key = this.getCacheKey(text, model);
    const entry: EmbeddingCacheEntry = {
      embedding: result.embedding,
      model: result.model,
      tokenCount: result.tokenCount,
      qualityScore: result.qualityScore,
      createdAt: new Date(),
      accessCount: 1,
      lastAccessed: new Date()
    };

    this.cache.set(key, entry);
  }

  /**
   * Generate cache key for text and model
   */
  private getCacheKey(text: string, model: string): string {
    // Use a simple hash of text + model for cache key
    const content = `${model}:${text}`;
    let hash = 0;
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  /**
   * Evict oldest cache entries to make room
   */
  private evictOldestCacheEntries(): void {
    const entries = Array.from(this.cache.entries());
    
    // Sort by last accessed time (oldest first)
    entries.sort(([, a], [, b]) => a.lastAccessed.getTime() - b.lastAccessed.getTime());
    
    // Remove oldest 20% of entries
    const toRemove = Math.floor(entries.length * 0.2);
    for (let i = 0; i < toRemove; i++) {
      this.cache.delete(entries[i][0]);
    }
  }

  /**
   * Initialize model versions
   */
  private initializeModelVersions(): void {
    // DeepSeek embedding model information
    this.modelVersions.set('deepseek-chat', {
      name: 'deepseek-chat',
      version: '1.0',
      dimensions: 1536, // Assuming similar to OpenAI ada-002
      maxTokens: 8192,
      isActive: true,
      createdAt: new Date()
    });
  }

  /**
   * Add or update model version
   */
  addModelVersion(modelInfo: Omit<ModelVersion, 'createdAt'>): void {
    this.modelVersions.set(modelInfo.name, {
      ...modelInfo,
      createdAt: new Date()
    });
  }

  /**
   * Get active model versions
   */
  getActiveModels(): ModelVersion[] {
    return Array.from(this.modelVersions.values()).filter(model => model.isActive);
  }

  /**
   * Migrate embeddings to new model version
   */
  async migrateEmbeddings(
    oldModel: string,
    newModel: string,
    texts: string[]
  ): Promise<{ migrated: number; failed: number; errors: string[] }> {
    let migrated = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const text of texts) {
      try {
        // Remove old cached embedding
        const oldKey = this.getCacheKey(text, oldModel);
        this.cache.delete(oldKey);

        // Generate new embedding
        await this.generateEmbedding(text, { model: newModel, cacheEnabled: true });
        migrated++;
      } catch (error) {
        failed++;
        errors.push(`Failed to migrate embedding for text: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    return { migrated, failed, errors };
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): {
    size: number;
    hitRate: number;
    totalAccesses: number;
    averageAge: number;
  } {
    const entries = Array.from(this.cache.values());
    const totalAccesses = entries.reduce((sum, entry) => sum + entry.accessCount, 0);
    const now = Date.now();
    const averageAge = entries.length > 0 
      ? entries.reduce((sum, entry) => sum + (now - entry.createdAt.getTime()), 0) / entries.length
      : 0;

    return {
      size: this.cache.size,
      hitRate: 0, // Would need to track this separately
      totalAccesses,
      averageAge: averageAge / (1000 * 60 * 60) // Convert to hours
    };
  }

  /**
   * Get configuration with defaults
   */
  private getConfig(options: EmbeddingOptions): Required<EmbeddingOptions> {
    return {
      model: options.model || EmbeddingService.DEFAULT_MODEL,
      batchSize: options.batchSize || EmbeddingService.DEFAULT_BATCH_SIZE,
      timeout: options.timeout || EmbeddingService.DEFAULT_TIMEOUT,
      retryAttempts: options.retryAttempts || EmbeddingService.DEFAULT_RETRY_ATTEMPTS,
      retryDelay: options.retryDelay || EmbeddingService.DEFAULT_RETRY_DELAY,
      cacheEnabled: options.cacheEnabled !== false, // Default to true
      validateQuality: options.validateQuality !== false, // Default to true
      qualityThreshold: options.qualityThreshold || EmbeddingService.DEFAULT_QUALITY_THRESHOLD
    };
  }
}

// Export singleton instance
export const embeddingService = new EmbeddingService();