# Chunk Management Service

The ChunkManagementService provides comprehensive chunk operations, versioning, analytics, and quality optimization for the RAG-enhanced PDF quiz generation system.

## Features

### Core Functionality
- **Chunk Creation**: Create new chunks with automatic quality scoring and versioning
- **Chunk Updates**: Update existing chunks with version tracking and change reasons
- **Chunk Retrieval**: Get chunks with complete version history and analytics

### Quality Management
- **Quality Scoring**: Automatic calculation of chunk quality metrics including:
  - Content length and token density
  - Structural coherence based on content type
  - Semantic coherence using sentence structure analysis
  - Information density through unique concept detection
  - Readability assessment
  - Duplicate detection scoring
- **Quality Filtering**: Filter chunks by minimum quality thresholds
- **Quality Updates**: Recalculate and update quality scores for existing chunks

### Versioning System
- **Version Tracking**: Maintain complete version history for all chunk modifications
- **Change Reasons**: Track reasons for each version change
- **Version Limits**: Configurable maximum versions per chunk with automatic cleanup

### Analytics & Usage Tracking
- **Usage Recording**: Track chunk usage in quiz generation, content search, and similarity search
- **Performance Metrics**: Comprehensive analytics including:
  - Total chunks and quality distribution
  - Most used chunks with relevance scores
  - Usage statistics and patterns
- **Success Tracking**: Monitor successful vs failed chunk utilizations

### Optimization Features
- **Deduplication**: Identify and remove duplicate chunks across documents
- **Cleanup Operations**: Remove orphaned chunks, old versions, and unused content
- **Performance Monitoring**: Track chunk performance and usage patterns

## Usage

### Basic Setup

```typescript
import { ChunkManagementService } from '@/lib/services/chunk-management-service';

// Create service with custom options
const chunkService = new ChunkManagementService({
  enableVersioning: true,
  enableAnalytics: true,
  enableQualityScoring: true,
  qualityThreshold: 0.6,
  deduplicationThreshold: 0.95,
  maxVersionsPerChunk: 10
});
```

### Creating Chunks

```typescript
const chunk = await chunkService.createChunk(userId, documentId, {
  content: 'This is the chunk content...',
  tokenCount: 150,
  pageNumber: 1,
  chunkIndex: 0,
  metadata: {
    documentTitle: 'Sample Document',
    extractionMethod: 'syncfusion',
    processingVersion: '1.0',
    contentType: 'paragraph'
  }
});
```

### Updating Chunks

```typescript
const updatedChunk = await chunkService.updateChunk(chunkId, {
  content: 'Updated content...',
  changeReason: 'Content improvement based on user feedback'
});
```

### Recording Usage

```typescript
await chunkService.recordUsage(
  chunkId,
  'quiz_generation',
  0.85, // relevance score
  true  // success
);
```

### Getting Performance Metrics

```typescript
const metrics = await chunkService.getPerformanceMetrics(userId, documentIds);
console.log(`Total chunks: ${metrics.totalChunks}`);
console.log(`Average quality: ${metrics.averageQuality}`);
console.log(`High quality chunks: ${metrics.highQualityChunks}`);
```

### Deduplication

```typescript
const result = await chunkService.deduplicateChunks(userId, documentIds);
console.log(`Removed ${result.duplicatesRemoved} duplicates`);
console.log(`Freed ${result.spaceFreed} bytes`);
```

### Cleanup Operations

```typescript
const result = await chunkService.performCleanup(userId, {
  removeOrphanedChunks: true,
  removeOldVersions: true,
  updateQualityScores: true,
  removeUnusedChunks: false,
  maxAge: 30
});
```

## Quality Metrics

The service calculates comprehensive quality metrics for each chunk:

### Structural Coherence (0.0 - 1.0)
- Based on content type (heading, table, list, paragraph)
- Considers structural elements like numbers, bullets, formatting
- Higher scores for well-structured content

### Semantic Coherence (0.0 - 1.0)
- Analyzes sentence structure and vocabulary
- Considers transition words and connectors
- Evaluates topic consistency through repeated key terms

### Information Density (0.0 - 1.0)
- Measures unique concepts and technical terms
- Considers proper nouns, numbers, and acronyms
- Higher scores for information-rich content

### Readability (0.0 - 1.0)
- Based on sentence and word complexity
- Optimal ranges for sentence length and word length
- Penalizes overly complex or overly simple text

### Overall Quality Score
Weighted combination of all metrics:
- Structural Coherence: 20%
- Semantic Coherence: 25%
- Information Density: 20%
- Readability: 15%
- Duplicate Score (inverted): 20%

## API Endpoints

### Chunk Management
- `GET /api/chunks/management?action=metrics` - Get performance metrics
- `GET /api/chunks/management?action=filter&minQuality=0.7` - Filter by quality
- `POST /api/chunks/management` - Perform management operations

### Versioning
- `GET /api/chunks/versions?chunkId=...` - Get chunk with versions
- `POST /api/chunks/versions` - Create new version
- `DELETE /api/chunks/versions?chunkId=...` - Clean old versions

### Usage Analytics
- `GET /api/chunks/usage?action=metrics` - Get usage analytics
- `POST /api/chunks/usage` - Record usage
- `PUT /api/chunks/usage` - Update analytics

## Database Schema

### Core Tables
- `document_chunks` - Main chunk storage with quality scores
- `chunk_versions` - Version history with change tracking
- `chunk_analytics` - Usage statistics and performance data
- `chunk_quality_scores` - Detailed quality metrics

### Key Features
- Row Level Security (RLS) for user data isolation
- Automatic timestamps and triggers
- Efficient indexes for vector search and analytics
- Foreign key constraints for data integrity

## Configuration Options

```typescript
interface ChunkManagementOptions {
  enableVersioning?: boolean;        // Default: true
  enableAnalytics?: boolean;         // Default: true
  enableQualityScoring?: boolean;    // Default: true
  qualityThreshold?: number;         // Default: 0.6
  deduplicationThreshold?: number;   // Default: 0.95
  maxVersionsPerChunk?: number;      // Default: 10
}
```

## Error Handling

The service includes comprehensive error handling:
- Database operation failures
- Invalid chunk data validation
- Missing chunk references
- Quality calculation errors
- Cleanup operation failures

All errors are logged and user-friendly messages are provided to the client.

## Performance Considerations

- Efficient database queries with proper indexing
- Batch operations for bulk updates
- Configurable limits to prevent resource exhaustion
- Background processing for heavy operations
- Caching of frequently accessed data

## Testing

Comprehensive test suite covering:
- Quality metric calculations
- Content similarity algorithms
- Token estimation accuracy
- Database operations (mocked)
- Error handling scenarios
- Configuration validation

Run tests with:
```bash
npm test lib/services/__tests__/chunk-management-service.simple.test.ts
```