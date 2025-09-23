# Embedding Service

The Embedding Service provides advanced vector embedding generation capabilities using the DeepSeek API. It's designed for high-performance document processing with intelligent caching, quality validation, and batch processing support.

## Features

### Core Capabilities
- **DeepSeek API Integration**: Direct integration with DeepSeek's embedding models
- **Batch Processing**: Efficient processing of multiple texts with configurable batch sizes
- **Intelligent Caching**: LRU (least recently used) cache with TTL (Time To Live) and quality-based eviction 
- **Quality Validation**: Automatic embedding quality assessment and filtering
- **Retry Logic**: Exponential backoff retry mechanism for API failures
- **Model Version Management**: Support for multiple embedding models and migrations

### Performance Optimizations
- **Batch API Calls**: Reduces API overhead by processing multiple texts together
- **Cache Hit Optimization**: Avoids redundant API calls for previously processed content
- **Memory Management**: Automatic cache eviction to prevent memory leaks
- **Timeout Handling**: Configurable timeouts with proper error handling

## Usage

### Basic Usage

```typescript
import { embeddingService } from '@/lib/services/embedding-service';

// Generate single embedding
const result = await embeddingService.generateEmbedding(
  'This is a sample document about machine learning.',
  {
    cacheEnabled: true,
    validateQuality: true
  }
);

console.log(`Generated ${result.embedding.length}D embedding`);
console.log(`Quality score: ${result.qualityScore}`);
```

### Batch Processing

```typescript
const texts = [
  'First document about AI',
  'Second document about ML',
  'Third document about NLP'
];

const batchResult = await embeddingService.generateBatchEmbeddings(texts, {
  batchSize: 100,
  cacheEnabled: true,
  validateQuality: true,
  retryAttempts: 3
});

if (batchResult.success) {
  console.log(`Processed ${batchResult.totalProcessed} texts`);
  console.log(`Cache hit rate: ${batchResult.cacheHitRate * 100}%`);
}
```

### Integration with Document Processing

```typescript
import { documentProcessingService } from '@/lib/services/document-processing';

const result = await documentProcessingService.processDocument(
  pdfBuffer,
  'document.pdf',
  {
    generateEmbeddings: true,
    model: 'deepseek-chat',
    batchSize: 50,
    cacheEnabled: true,
    validateQuality: true
  }
);

// Each chunk now includes vector embeddings
result.chunks.forEach(chunk => {
  if (chunk.embedding) {
    console.log(`Chunk ${chunk.id}: ${chunk.embedding.length}D embedding`);
  }
});
```

## Configuration Options

### EmbeddingOptions Interface

```typescript
interface EmbeddingOptions {
  model?: string;              // Embedding model name (default: 'deepseek-chat')
  batchSize?: number;          // Batch size for API calls (default: 100)
  timeout?: number;            // Request timeout in ms (default: 30000)
  retryAttempts?: number;      // Number of retry attempts (default: 3)
  retryDelay?: number;         // Initial retry delay in ms (default: 1000)
  cacheEnabled?: boolean;      // Enable caching (default: true)
  validateQuality?: boolean;   // Enable quality validation (default: true)
  qualityThreshold?: number;   // Minimum quality score (default: 0.7)
}
```

### Environment Variables

```bash
# Required: DeepSeek API key
DEEPSEEK_AP_KEY=your_deepseek_api_key_here
```

## Quality Validation

The service includes comprehensive quality validation for generated embeddings:

### Quality Metrics
- **Magnitude**: L2 norm of the embedding vector
- **Variance**: Statistical variance across dimensions
- **Sparsity**: Ratio of zero/near-zero values
- **Dimensionality**: Effective dimension usage

### Quality Score Calculation
```typescript
// Composite score based on multiple factors
const qualityScore = 
  magnitudeScore * 0.3 +     // Reasonable magnitude
  varianceScore * 0.3 +      // Good spread of values
  sparsityScore * 0.2 +      // Not too sparse
  dimensionalityScore * 0.2; // Uses most dimensions
```

### Quality Thresholds
- **High Quality**: Score > 0.8 (excellent embeddings)
- **Good Quality**: Score > 0.7 (acceptable embeddings)
- **Low Quality**: Score < 0.5 (may need reprocessing)

## Caching System

### Cache Features
- **LRU Eviction**: Least recently used entries are removed first
- **TTL Expiration**: Entries expire after 7 days by default
- **Size Limits**: Maximum 10,000 cached embeddings
- **Access Tracking**: Monitors cache hit rates and usage patterns

### Cache Statistics
```typescript
const stats = embeddingService.getCacheStats();
console.log(`Cache size: ${stats.size} entries`);
console.log(`Total accesses: ${stats.totalAccesses}`);
console.log(`Average age: ${stats.averageAge} hours`);
```

### Cache Management
```typescript
// Clear all cached embeddings
embeddingService.clearCache();

// Cache is automatically managed, but you can monitor performance
const cacheStats = embeddingService.getCacheStats();
```

## Model Management

### Active Models
```typescript
const activeModels = embeddingService.getActiveModels();
activeModels.forEach(model => {
  console.log(`${model.name} v${model.version}`);
  console.log(`Dimensions: ${model.dimensions}`);
  console.log(`Max tokens: ${model.maxTokens}`);
});
```

### Model Migration
```typescript
// Migrate embeddings from old model to new model
const migrationResult = await embeddingService.migrateEmbeddings(
  'old-model-v1',
  'new-model-v2',
  textsToMigrate
);

console.log(`Migrated: ${migrationResult.migrated}`);
console.log(`Failed: ${migrationResult.failed}`);
```


### Common Error Scenarios
## Error Handling
1. **API Key Missing**: Service throws initialization error
2. **Network Failures**: Automatic retry with exponential backoff
3. **Rate Limiting**: Respects API rate limits with proper delays
4. **Quality Failures**: Low-quality embeddings are rejected
5. **Timeout Errors**: Configurable timeouts with graceful handling

### Error Recovery
```typescript
try {
  const result = await embeddingService.generateEmbedding(text, {
    retryAttempts: 5,
    retryDelay: 2000,
    timeout: 60000
  });
} catch (error) {
  if (error.message.includes('quality')) {
    // Handle quality validation failure
    console.log('Embedding quality too low, trying different approach');
  } else if (error.message.includes('timeout')) {
    // Handle timeout
    console.log('Request timed out, try with smaller batch');
  }
}
```

## Performance Considerations

### Optimization Strategies
1. **Batch Processing**: Always prefer batch operations for multiple texts
2. **Cache Utilization**: Enable caching for repeated content processing
3. **Quality Thresholds**: Adjust quality thresholds based on use case requirements
4. **Batch Size Tuning**: Optimize batch sizes based on API limits and memory constraints

### Performance Monitoring
```typescript
// Monitor batch processing performance
const startTime = Date.now();
const result = await embeddingService.generateBatchEmbeddings(texts);
const processingTime = Date.now() - startTime;

console.log(`Processed ${result.totalProcessed} texts in ${processingTime}ms`);
console.log(`Average time per text: ${processingTime / result.totalProcessed}ms`);
```

## Integration Examples

### With Document Processing Pipeline
```typescript
// Full document processing with embeddings
const processDocumentWithEmbeddings = async (pdfBuffer: Buffer, title: string) => {
  const result = await documentProcessingService.processDocument(
    pdfBuffer,
    title,
    {
      // Text extraction options
      useOCR: false,
      chunkSize: 400,
      chunkOverlap: 50,
      
      // Embedding options
      generateEmbeddings: true,
      model: 'deepseek-chat',
      batchSize: 50,
      cacheEnabled: true,
      validateQuality: true,
      qualityThreshold: 0.7
    }
  );
  
  return result.chunks.filter(chunk => chunk.embedding); // Only chunks with embeddings
};
```

### With Vector Search
```typescript
// Prepare chunks for vector database storage
const prepareChunksForStorage = async (chunks: DocumentChunk[]) => {
  return chunks
    .filter(chunk => chunk.embedding) // Only chunks with embeddings
    .map(chunk => ({
      id: chunk.id,
      content: chunk.content,
      embedding: chunk.embedding,
      metadata: {
        pageNumber: chunk.pageNumber,
        documentTitle: chunk.metadata.documentTitle,
        contentType: chunk.metadata.contentType
      }
    }));
};
```

## Testing

### Unit Tests
The service includes comprehensive unit tests covering:
- Single and batch embedding generation
- Cache functionality and eviction
- Quality validation and scoring
- Error handling and retry logic
- Model management and migration

### Running Tests
```bash
# Run embedding service tests
npm test lib/services/__tests__/embedding-service.test.ts

# Run with coverage
npm test -- --coverage lib/services/__tests__/embedding-service.test.ts
```

### Demo Script
```bash
# Run the demo to test functionality
npx ts-node lib/services/embedding-service-demo.ts
```

## API Reference

### EmbeddingService Class

#### Methods

##### `generateEmbedding(text: string, options?: EmbeddingOptions): Promise<EmbeddingResult>`
Generates a vector embedding for a single text.

##### `generateBatchEmbeddings(texts: string[], options?: EmbeddingOptions): Promise<BatchEmbeddingResult>`
Generates vector embeddings for multiple texts efficiently.

##### `getActiveModels(): ModelVersion[]`
Returns information about available embedding models.

##### `addModelVersion(modelInfo: Omit<ModelVersion, 'createdAt'>): void`
Adds a new embedding model version.

##### `migrateEmbeddings(oldModel: string, newModel: string, texts: string[]): Promise<MigrationResult>`
Migrates embeddings from one model version to another.

##### `getCacheStats(): CacheStatistics`
Returns current cache performance statistics.

##### `clearCache(): void`
Clears all cached embeddings.

### Type Definitions

See the main service file for complete type definitions including:
- `EmbeddingOptions`
- `EmbeddingResult`
- `BatchEmbeddingResult`
- `ModelVersion`
- `QualityMetrics`

## Troubleshooting

### Common Issues

1. **API Key Not Found**
   - Ensure `DEEPSEEK_AP_KEY` environment variable is set
   - Check that the API key is valid and has proper permissions

2. **Low Quality Embeddings**
   - Adjust `qualityThreshold` parameter
   - Check input text quality and length
   - Verify model compatibility

3. **Performance Issues**
   - Reduce batch size if memory constrained
   - Enable caching for repeated content
   - Monitor cache hit rates

4. **Network Timeouts**
   - Increase timeout values
   - Reduce batch sizes
   - Check network connectivity

### Debug Mode
Enable detailed logging by setting environment variable:
```bash
DEBUG=embedding-service npm start
```

## Contributing

When contributing to the embedding service:

1. **Follow TypeScript Standards**: Use strict typing and proper interfaces
2. **Add Tests**: Include unit tests for new functionality
3. **Update Documentation**: Keep this README current with changes
4. **Performance Testing**: Verify performance impact of changes
5. **Error Handling**: Ensure robust error handling and recovery

## License

This service is part of the Noto PDF annotation application and follows the same licensing terms.