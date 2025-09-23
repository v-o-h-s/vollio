/**
 * Demo script to test the embedding service functionality
 * This can be run to verify the service works correctly
 */

import { embeddingService } from './embedding-service';

async function demonstrateEmbeddingService() {
  console.log('🚀 Starting Embedding Service Demo...\n');

  try {
    // Test 1: Single embedding generation
    console.log('📝 Test 1: Generating single embedding...');
    const singleText = 'This is a test document about artificial intelligence and machine learning.';
    
    const singleResult = await embeddingService.generateEmbedding(singleText, {
      cacheEnabled: true,
      validateQuality: true
    });
    
    console.log(`✅ Generated embedding for text: "${singleText.substring(0, 50)}..."`);
    console.log(`   - Embedding dimensions: ${singleResult.embedding.length}`);
    console.log(`   - Token count: ${singleResult.tokenCount}`);
    console.log(`   - Quality score: ${singleResult.qualityScore?.toFixed(3) || 'N/A'}`);
    console.log(`   - Processing time: ${singleResult.processingTime}ms`);
    console.log(`   - Cached: ${singleResult.cached}\n`);

    // Test 2: Batch embedding generation
    console.log('📚 Test 2: Generating batch embeddings...');
    const batchTexts = [
      'Natural language processing is a subfield of artificial intelligence.',
      'Machine learning algorithms can learn patterns from data.',
      'Deep learning uses neural networks with multiple layers.',
      'Computer vision enables machines to interpret visual information.',
      'Reinforcement learning involves learning through trial and error.'
    ];

    const batchResult = await embeddingService.generateBatchEmbeddings(batchTexts, {
      batchSize: 3,
      cacheEnabled: true,
      validateQuality: true
    });

    if (batchResult.success) {
      console.log(`✅ Generated ${batchResult.totalProcessed} embeddings`);
      console.log(`   - Total processing time: ${batchResult.totalTime}ms`);
      console.log(`   - Average quality score: ${batchResult.averageQualityScore?.toFixed(3) || 'N/A'}`);
      console.log(`   - Cache hit rate: ${(batchResult.cacheHitRate * 100).toFixed(1)}%\n`);
    } else {
      console.error(`❌ Batch processing failed: ${batchResult.error}\n`);
    }

    // Test 3: Cache performance
    console.log('🔄 Test 3: Testing cache performance...');
    const cacheTestText = singleText; // Reuse the same text
    
    const cachedResult = await embeddingService.generateEmbedding(cacheTestText, {
      cacheEnabled: true
    });
    
    console.log(`✅ Cache test completed`);
    console.log(`   - Result cached: ${cachedResult.cached}`);
    console.log(`   - Processing time: ${cachedResult.processingTime}ms\n`);

    // Test 4: Cache statistics
    console.log('📊 Test 4: Cache statistics...');
    const cacheStats = embeddingService.getCacheStats();
    console.log(`✅ Cache statistics:`);
    console.log(`   - Cache size: ${cacheStats.size} entries`);
    console.log(`   - Total accesses: ${cacheStats.totalAccesses}`);
    console.log(`   - Average age: ${cacheStats.averageAge.toFixed(2)} hours\n`);

    // Test 5: Model information
    console.log('🤖 Test 5: Model information...');
    const activeModels = embeddingService.getActiveModels();
    console.log(`✅ Active models (${activeModels.length}):`);
    activeModels.forEach(model => {
      console.log(`   - ${model.name} v${model.version} (${model.dimensions}D, max ${model.maxTokens} tokens)`);
    });

    console.log('\n🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('❌ Demo failed:', error instanceof Error ? error.message : 'Unknown error');
    
    if (error instanceof Error && error.message.includes('API key')) {
      console.log('\n💡 Note: This demo requires a valid DeepSeek API key in the DEEPSEEK_AP_KEY environment variable.');
    }
  }
}

// Export for potential use in other files
export { demonstrateEmbeddingService };

// Run demo if this file is executed directly
if (require.main === module) {
  demonstrateEmbeddingService();
} 