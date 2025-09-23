# Vector Search Service

The Vector Search Service provides semantic similarity search capabilities for the PDF Quiz Generator using Supabase's pgvector extension. It enables intelligent content retrieval from processed document chunks using vector embeddings and advanced ranking algorithms.

## Features

### Core Search Capabilities
- **Semantic Similarity Search**: Find relevant content using vector embeddings and cosine similarity
- **Configurable Similarity Thresholds**: Filter results based on relevance scores (0.0 to 1.0)
- **Multi-Document Search Coordination**: Search across multiple documents with balanced representation
- **Page Range Filtering**: Restrict search to specific page ranges within documents
- **Content Type Filtering**: Filter by content types (paragraph, heading, list, table, caption)
- **Confidence-Based Filtering**: Filter results based on extraction confidence scores

### Advanced Ranking Algorithms
- **Similarity Ranking**: Pure vector similarity-based ranking
- **Hybrid Ranking**: Multi-factor ranking combining similarity, recency, content type, and confidence
- **Re-ranking**: Advanced context-aware re-ranking for improved relevance
- **Diversity Factor**: Balance results across multiple documents for comprehensive coverage

### Query Optimization
- **Stop Word Removal**: Automatically remove common stop words for better semantic matching
- **Abbreviation Expansion**: Expand common abbreviations (AI → artificial intelligence, ML → machine learning)
- **Query Confidence Scoring**: Assess optimization confidence for query quality
- **Semantic Enhancement**: Improve query understanding for better retrieval

### Performance Features
- **Intelligent Caching**: Cache search results with TTL and LRU eviction
- **Batch Processing**: Efficient handling of multiple search requests
- **Performance Monitoring**: Track search times, cache hit rates, and result quality
- **Search Analytics**: Comprehensive analytics with popular queries and performance trends

## Architecture

### Database Integration
- **Supabase pgvector**: Native vector storage and similarity search
- **RLS Security**: Automatic user data isolation through Row Level Security
- **Optimized Indexes**: IVFFlat indexes for fast vector similarity queries
- **Metadata Filtering**: Efficient filtering using JSONB metadata fields

### Embedding Integration
- **DeepSeek Embeddings**: High-quality vector embeddings via EmbeddingService
- **Embedding Caching**: Reuse embeddings for repeated queries
- **Quality Validation**: Validate embedding quality before storage and search

### Search Pipeline
```
Query Input → Query Optimization → Embedding Generation → Vector Search → Result Ranking → Response Formatting
```

## Usage

### Basic Search
```typescript
import { vectorSearchService } from '@/lib/services/vector-search-service';

const result = await vectorSearchService.searchSimilarChunks(
  'machine learning algorithms',
  {
    similarityThreshold: 0.7,
    limit: 10,
    documentIds: ['doc-1', 'doc-2']
  }
);

if (result.success) {
  console.log(`Found ${result.totalResults} relevant chunks`);
  result.results.forEach(item => {
    console.log(`${item.chunk.content} (similarity: ${item.similarity})`);
  });
}
```

### Multi-Document Search
```typescript
const multiDocResult = await vectorSearchService.searchMultipleDocuments(
  'artificial intelligence applications',
  ['doc-1', 'doc-2', 'doc-3'],
  {
    diversityFactor: 0.3, // Balance results across documents
    rankingMethod: 'hybrid'
  }
);

// Access document breakdown
Object.entries(multiDocResult.documentBreakdown).forEach(([docId, breakdown]) => {
  console.log(`Document ${docId}: ${breakdown.resultCount} results, avg similarity: ${breakdown.averageSimilarity}`);
});
```

### Advanced Configuration
```typescript
const advancedResult = await vectorSearchService.searchSimilarChunks(
  'deep learning neural networks',
  {
    similarityThreshold: 0.8,
    limit: 20,
    pageRange: { start: 10, end: 50 },
    contentTypes: ['paragraph', 'heading'],
    minConfidence: 0.7,
    rankingMethod: 'hybrid',
    diversityFactor: 0.2,
    boostRecent: true
  }
);
```

### Query Optimization
```typescript
const optimization = await vectorSearchService.optimizeQuery(
  'The AI and ML techniques in the API documentation'
);

console.log('Original:', optimization.originalQuery);
console.log('Optimized:', optimization.optimizedQuery);
console.log('Optimizations:', optimization.optimizations);
console.log('Confidence:', optimization.confidence);
```

## API Integration

### Content Search Endpoint
```
POST /api/quiz/search-content
```

**Request Body:**
```typescript
{
  query: string;
  documentIds: string[];
  pageRange?: { start: number; end: number };
  limit?: number; // 1-100, default 10
  similarityThreshold?: number; // 0.0-1.0, default 0.7
}
```

**Response:**
```typescript
{
  success: boolean;
  chunks: Array<{
    id: string;
    content: string;
    metadata: {
      documentTitle: string;
      pageNumber: number;
      contentType: string;
      similarity: number;
      relevanceScore: number;
      rank: number;
    };
    similarity: number;
  }>;
  totalResults: number;
  error?: string;
}
```

**Performance Headers:**
- `X-Search-Time`: Total search time in milliseconds
- `X-Query-Embedding-Time`: Time to generate query embedding
- `X-Retrieval-Time`: Database retrieval time
- `X-Ranking-Time`: Result ranking time
- `X-Cache-Hit`: Whether result was cached
- `X-Query-Optimizations`: Applied query optimizations

## Configuration Options

### VectorSearchOptions
```typescript
interface VectorSearchOptions {
  similarityThreshold?: number;    // 0.0-1.0, default 0.7
  limit?: number;                  // 1-100, default 10
  pageRange?: { start: number; end: number };
  documentIds?: string[];
  contentTypes?: ('paragraph' | 'heading' | 'list' | 'table' | 'caption')[];
  minConfidence?: number;          // 0.0-1.0
  includeMetadata?: boolean;       // default true
  rankingMethod?: 'similarity' | 'hybrid' | 'rerank'; // default 'hybrid'
  diversityFactor?: number;        // 0.0-1.0, default 0.3
  boostRecent?: boolean;          // default true
}
```

### Ranking Methods
- **similarity**: Pure vector similarity ranking
- **hybrid**: Multi-factor ranking (similarity + recency + content type + confidence)
- **rerank**: Advanced context-aware re-ranking

### Content Type Scoring
- **heading**: 0.9 (highest priority)
- **table**: 0.85
- **list**: 0.8
- **paragraph**: 0.7
- **caption**: 0.6

## Performance Monitoring

### Search Analytics
```typescript
const analytics = await vectorSearchService.getSearchAnalytics('user-id', {
  start: new Date('2024-01-01'),
  end: new Date('2024-12-31')
});

console.log('Total searches:', analytics.totalSearches);
console.log('Average search time:', analytics.averageSearchTime);
console.log('Cache hit rate:', analytics.cacheHitRate);
console.log('Popular queries:', analytics.popularQueries);
```

### Cache Management
```typescript
// Get cache statistics
const stats = vectorSearchService.getCacheStats();
console.log('Cache size:', stats.size);
console.log('Total accesses:', stats.totalAccesses);
console.log('Average age (minutes):', stats.averageAge);

// Clear cache
vectorSearchService.clearCache();
```

## Error Handling

The service provides comprehensive error handling:

- **Authentication Errors**: Invalid or missing user authentication
- **Validation Errors**: Invalid query parameters or options
- **Embedding Errors**: Failures in embedding generation
- **Database Errors**: Supabase connection or query failures
- **Performance Errors**: Timeouts or resource constraints

All errors are logged with detailed information while returning user-friendly error messages.

## Testing

### Unit Tests
- Query optimization functionality
- Cache management and eviction
- Search configuration validation
- Error handling scenarios

### Integration Tests
- End-to-end search workflows
- Multi-document coordination
- Performance monitoring
- Analytics calculation

### Performance Tests
- Query optimization performance
- Cache operation efficiency
- Memory usage patterns
- Large dataset handling

Run tests:
```bash
npm run test -- lib/services/__tests__/vector-search-*.test.ts --run
```

## Security

### Data Isolation
- All searches are automatically filtered by user ID through RLS policies
- Vector embeddings are stored with user association
- Search results only include user's own document chunks

### Input Validation
- Query length and content validation
- Document ID ownership verification
- Parameter range and type checking
- SQL injection prevention through parameterized queries

### Performance Limits
- Maximum result limit (100 items)
- Query timeout protection
- Cache size limits
- Rate limiting support (via API layer)

## Dependencies

- **@supabase/supabase-js**: Database and vector search
- **@/lib/services/embedding-service**: Vector embedding generation
- **@/lib/utils/supabase-helpers**: Authenticated database access
- **@/lib/types**: TypeScript type definitions

## Future Enhancements

### Planned Features
- **Hybrid Search**: Combine vector and keyword search
- **Search Filters**: Advanced filtering by document metadata
- **Result Clustering**: Group similar results for better organization
- **Search Suggestions**: Query auto-completion and suggestions
- **A/B Testing**: Compare different ranking algorithms

### Performance Optimizations
- **Approximate Nearest Neighbor**: Faster similarity search for large datasets
- **Result Streaming**: Stream results for better user experience
- **Parallel Processing**: Concurrent search across multiple document sets
- **Smart Caching**: Predictive caching based on user patterns

## Troubleshooting

### Common Issues

**Slow Search Performance**
- Check vector index status: `EXPLAIN ANALYZE` on search queries
- Verify similarity threshold isn't too low
- Consider reducing result limit for faster responses

**Low Result Quality**
- Increase similarity threshold
- Use query optimization
- Check document processing quality
- Verify embedding model consistency

**Cache Issues**
- Monitor cache hit rates
- Check cache TTL settings
- Verify cache eviction is working
- Clear cache if needed

**Memory Usage**
- Monitor cache size growth
- Check for memory leaks in long-running processes
- Verify cache eviction policies
- Consider reducing cache size limits

### Debug Mode
Enable debug logging by setting environment variable:
```bash
DEBUG_VECTOR_SEARCH=true
```

This will log detailed search performance metrics and query optimization steps.