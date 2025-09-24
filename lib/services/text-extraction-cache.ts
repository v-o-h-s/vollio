import { promises as fs } from "fs";
import { join } from "path";
import { tmpdir } from "os";
import { createHash } from "crypto";

/**
 * Cache entry for text extraction results
 */
interface TextExtractionCacheEntry {
  documentHash: string;
  extractionMethod: 'syncfusion' | 'ocr';
  pageTexts: Array<{
    pageNumber: number;
    text: string;
    confidence?: number;
  }>;
  totalPages: number;
  extractionOptions: any;
  createdAt: Date;
  lastAccessed: Date;
  accessCount: number;
  fileSize: number;
}

/**
 * Cache statistics
 */
interface CacheStats {
  totalEntries: number;
  totalSize: number;
  hitRate: number;
  averageAge: number;
  oldestEntry: Date | null;
  newestEntry: Date | null;
}

/**
 * Text extraction cache service for avoiding reprocessing
 */
export class TextExtractionCache {
  private static readonly CACHE_DIR = join(tmpdir(), 'noto-text-cache');
  private static readonly MAX_CACHE_SIZE = 500 * 1024 * 1024; // 500MB
  private static readonly MAX_CACHE_AGE = 30 * 24 * 60 * 60 * 1000; // 30 days
  private static readonly CACHE_VERSION = '1.0.0';

  private cache = new Map<string, TextExtractionCacheEntry>();
  private cacheHits = 0;
  private cacheMisses = 0;
  private initialized = false;

  constructor() {
    this.initializeCache();
  }

  /**
   * Initialize cache directory and load existing cache
   */
  private async initializeCache(): Promise<void> {
    if (this.initialized) return;

    try {
      // Ensure cache directory exists
      await fs.mkdir(TextExtractionCache.CACHE_DIR, { recursive: true });

      // Load existing cache entries
      await this.loadCacheFromDisk();

      // Clean up expired entries
      await this.cleanupExpiredEntries();

      this.initialized = true;
      console.log(`📁 Text extraction cache initialized with ${this.cache.size} entries`);
    } catch (error) {
      console.warn('Failed to initialize text extraction cache:', error);
      this.initialized = true; // Continue without cache
    }
  }

  /**
   * Get cached text extraction result
   */
  async getCachedExtraction(
    pdfBuffer: Buffer,
    extractionMethod: 'syncfusion' | 'ocr',
    options: any = {}
  ): Promise<TextExtractionCacheEntry | null> {
    await this.initializeCache();

    const cacheKey = this.generateCacheKey(pdfBuffer, extractionMethod, options);
    const entry = this.cache.get(cacheKey);

    if (!entry) {
      this.cacheMisses++;
      return null;
    }

    // Check if entry is expired
    if (this.isEntryExpired(entry)) {
      this.cache.delete(cacheKey);
      await this.deleteCacheFile(cacheKey);
      this.cacheMisses++;
      return null;
    }

    // Update access statistics
    entry.lastAccessed = new Date();
    entry.accessCount++;
    this.cacheHits++;

    // Save updated entry to disk
    await this.saveCacheEntryToDisk(cacheKey, entry);

    console.log(`🎯 Cache hit for document (${extractionMethod}): ${entry.pageTexts.length} pages`);
    return entry;
  }

  /**
   * Cache text extraction result
   */
  async cacheExtraction(
    pdfBuffer: Buffer,
    extractionMethod: 'syncfusion' | 'ocr',
    options: any,
    pageTexts: Array<{
      pageNumber: number;
      text: string;
      confidence?: number;
    }>,
    totalPages: number
  ): Promise<void> {
    await this.initializeCache();

    const cacheKey = this.generateCacheKey(pdfBuffer, extractionMethod, options);
    const documentHash = this.generateDocumentHash(pdfBuffer);

    const entry: TextExtractionCacheEntry = {
      documentHash,
      extractionMethod,
      pageTexts,
      totalPages,
      extractionOptions: options,
      createdAt: new Date(),
      lastAccessed: new Date(),
      accessCount: 1,
      fileSize: pdfBuffer.length
    };

    // Check cache size limits before adding
    await this.ensureCacheSize();

    this.cache.set(cacheKey, entry);
    await this.saveCacheEntryToDisk(cacheKey, entry);

    console.log(`💾 Cached text extraction (${extractionMethod}): ${pageTexts.length} pages, ${(pdfBuffer.length / 1024).toFixed(1)}KB`);
  }

  /**
   * Generate cache key for document and options
   */
  private generateCacheKey(
    pdfBuffer: Buffer,
    extractionMethod: 'syncfusion' | 'ocr',
    options: any
  ): string {
    const documentHash = this.generateDocumentHash(pdfBuffer);
    const optionsHash = this.generateOptionsHash(options);
    return `${documentHash}_${extractionMethod}_${optionsHash}`;
  }

  /**
   * Generate hash for PDF document content
   */
  private generateDocumentHash(pdfBuffer: Buffer): string {
    return createHash('sha256').update(pdfBuffer).digest('hex').substring(0, 16);
  }

  /**
   * Generate hash for extraction options
   */
  private generateOptionsHash(options: any): string {
    const optionsString = JSON.stringify(options, Object.keys(options).sort());
    return createHash('md5').update(optionsString).digest('hex').substring(0, 8);
  }

  /**
   * Check if cache entry is expired
   */
  private isEntryExpired(entry: TextExtractionCacheEntry): boolean {
    const age = Date.now() - entry.createdAt.getTime();
    return age > TextExtractionCache.MAX_CACHE_AGE;
  }

  /**
   * Ensure cache doesn't exceed size limits
   */
  private async ensureCacheSize(): Promise<void> {
    const currentSize = this.getCurrentCacheSize();
    
    if (currentSize <= TextExtractionCache.MAX_CACHE_SIZE) {
      return;
    }

    console.log(`🧹 Cache size (${(currentSize / 1024 / 1024).toFixed(1)}MB) exceeds limit, cleaning up...`);

    // Sort entries by last accessed time (oldest first)
    const entries = Array.from(this.cache.entries());
    entries.sort(([, a], [, b]) => a.lastAccessed.getTime() - b.lastAccessed.getTime());

    // Remove oldest entries until we're under the limit
    let removedSize = 0;
    let removedCount = 0;

    for (const [key, entry] of entries) {
      if (currentSize - removedSize <= TextExtractionCache.MAX_CACHE_SIZE * 0.8) {
        break; // Leave some headroom
      }

      this.cache.delete(key);
      await this.deleteCacheFile(key);
      removedSize += entry.fileSize;
      removedCount++;
    }

    console.log(`🗑️ Removed ${removedCount} cache entries (${(removedSize / 1024 / 1024).toFixed(1)}MB)`);
  }

  /**
   * Get current cache size in bytes
   */
  private getCurrentCacheSize(): number {
    return Array.from(this.cache.values()).reduce((total, entry) => total + entry.fileSize, 0);
  }

  /**
   * Load cache entries from disk
   */
  private async loadCacheFromDisk(): Promise<void> {
    try {
      const files = await fs.readdir(TextExtractionCache.CACHE_DIR);
      const cacheFiles = files.filter(file => file.endsWith('.json'));

      for (const file of cacheFiles) {
        try {
          const filePath = join(TextExtractionCache.CACHE_DIR, file);
          const content = await fs.readFile(filePath, 'utf-8');
          const entry: TextExtractionCacheEntry = JSON.parse(content);
          
          // Convert date strings back to Date objects
          entry.createdAt = new Date(entry.createdAt);
          entry.lastAccessed = new Date(entry.lastAccessed);

          const cacheKey = file.replace('.json', '');
          this.cache.set(cacheKey, entry);
        } catch (error) {
          console.warn(`Failed to load cache file ${file}:`, error);
          // Delete corrupted cache file
          try {
            await fs.unlink(join(TextExtractionCache.CACHE_DIR, file));
          } catch (deleteError) {
            console.warn(`Failed to delete corrupted cache file ${file}:`, deleteError);
          }
        }
      }
    } catch (error) {
      console.warn('Failed to load cache from disk:', error);
    }
  }

  /**
   * Save cache entry to disk
   */
  private async saveCacheEntryToDisk(cacheKey: string, entry: TextExtractionCacheEntry): Promise<void> {
    try {
      const filePath = join(TextExtractionCache.CACHE_DIR, `${cacheKey}.json`);
      await fs.writeFile(filePath, JSON.stringify(entry, null, 2));
    } catch (error) {
      console.warn(`Failed to save cache entry ${cacheKey}:`, error);
    }
  }

  /**
   * Delete cache file from disk
   */
  private async deleteCacheFile(cacheKey: string): Promise<void> {
    try {
      const filePath = join(TextExtractionCache.CACHE_DIR, `${cacheKey}.json`);
      await fs.unlink(filePath);
    } catch (error) {
      // File might not exist, ignore error
    }
  }

  /**
   * Clean up expired cache entries
   */
  private async cleanupExpiredEntries(): Promise<void> {
    const expiredKeys: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (this.isEntryExpired(entry)) {
        expiredKeys.push(key);
      }
    }

    for (const key of expiredKeys) {
      this.cache.delete(key);
      await this.deleteCacheFile(key);
    }

    if (expiredKeys.length > 0) {
      console.log(`🧹 Cleaned up ${expiredKeys.length} expired cache entries`);
    }
  }

  /**
   * Clear all cache entries
   */
  async clearCache(): Promise<void> {
    await this.initializeCache();

    // Delete all cache files
    try {
      const files = await fs.readdir(TextExtractionCache.CACHE_DIR);
      for (const file of files) {
        if (file.endsWith('.json')) {
          await fs.unlink(join(TextExtractionCache.CACHE_DIR, file));
        }
      }
    } catch (error) {
      console.warn('Failed to clear cache files:', error);
    }

    this.cache.clear();
    this.cacheHits = 0;
    this.cacheMisses = 0;

    console.log('🗑️ Text extraction cache cleared');
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): CacheStats {
    const entries = Array.from(this.cache.values());
    const totalSize = this.getCurrentCacheSize();
    const totalRequests = this.cacheHits + this.cacheMisses;
    const hitRate = totalRequests > 0 ? this.cacheHits / totalRequests : 0;

    const now = Date.now();
    const averageAge = entries.length > 0 
      ? entries.reduce((sum, entry) => sum + (now - entry.createdAt.getTime()), 0) / entries.length
      : 0;

    const oldestEntry = entries.length > 0 
      ? entries.reduce((oldest, entry) => 
          entry.createdAt < oldest ? entry.createdAt : oldest, entries[0].createdAt)
      : null;

    const newestEntry = entries.length > 0 
      ? entries.reduce((newest, entry) => 
          entry.createdAt > newest ? entry.createdAt : newest, entries[0].createdAt)
      : null;

    return {
      totalEntries: this.cache.size,
      totalSize,
      hitRate,
      averageAge: averageAge / (1000 * 60 * 60), // Convert to hours
      oldestEntry,
      newestEntry
    };
  }

  /**
   * Invalidate cache for specific document
   */
  async invalidateDocument(pdfBuffer: Buffer): Promise<void> {
    await this.initializeCache();

    const documentHash = this.generateDocumentHash(pdfBuffer);
    const keysToDelete: string[] = [];

    for (const [key, entry] of this.cache.entries()) {
      if (entry.documentHash === documentHash) {
        keysToDelete.push(key);
      }
    }

    for (const key of keysToDelete) {
      this.cache.delete(key);
      await this.deleteCacheFile(key);
    }

    if (keysToDelete.length > 0) {
      console.log(`🗑️ Invalidated ${keysToDelete.length} cache entries for document`);
    }
  }

  /**
   * Preload cache for commonly used documents
   */
  async preloadCache(documents: Array<{ buffer: Buffer; title: string }>): Promise<void> {
    console.log(`🔄 Preloading cache for ${documents.length} documents...`);

    for (const doc of documents) {
      // Check if already cached
      const syncfusionCached = await this.getCachedExtraction(doc.buffer, 'syncfusion');
      const ocrCached = await this.getCachedExtraction(doc.buffer, 'ocr');

      if (!syncfusionCached && !ocrCached) {
        console.log(`📄 Document "${doc.title}" not in cache, will be processed on first access`);
      }
    }
  }
}

// Export singleton instance
export const textExtractionCache = new TextExtractionCache();