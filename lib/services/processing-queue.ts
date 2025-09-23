import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export interface ProcessingJob {
  id: string;
  userId: string;
  documentId: string;
  pdfBuffer: Buffer;
  documentTitle: string;
  options: any;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
  error?: string;
  result?: any;
}

export interface QueueStats {
  totalJobs: number;
  pendingJobs: number;
  processingJobs: number;
  completedJobs: number;
  failedJobs: number;
  averageProcessingTime: number;
}

export class ProcessingQueue extends EventEmitter {
  private jobs: Map<string, ProcessingJob> = new Map();
  private processingJobs: Set<string> = new Set();
  private maxConcurrentJobs: number;
  private processingTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private readonly JOB_TIMEOUT = 10 * 60 * 1000; // 10 minutes

  constructor(maxConcurrentJobs: number = 3) {
    super();
    this.maxConcurrentJobs = maxConcurrentJobs;
    
    // Start processing loop
    this.startProcessingLoop();
  }

  /**
   * Add a job to the processing queue
   */
  addJob(
    userId: string,
    documentId: string,
    pdfBuffer: Buffer,
    documentTitle: string,
    options: any = {}
  ): string {
    const jobId = uuidv4();
    
    const job: ProcessingJob = {
      id: jobId,
      userId,
      documentId,
      pdfBuffer,
      documentTitle,
      options,
      status: 'pending',
      progress: 0
    };

    this.jobs.set(jobId, job);
    this.emit('jobAdded', job);
    
    // Try to start processing immediately
    this.processNextJob();
    
    return jobId;
  }

  /**
   * Get job status
   */
  getJob(jobId: string): ProcessingJob | undefined {
    return this.jobs.get(jobId);
  }

  /**
   * Get jobs for a specific user
   */
  getUserJobs(userId: string): ProcessingJob[] {
    return Array.from(this.jobs.values()).filter(job => job.userId === userId);
  }

  /**
   * Cancel a job
   */
  cancelJob(jobId: string): boolean {
    const job = this.jobs.get(jobId);
    if (!job) return false;

    if (job.status === 'pending') {
      job.status = 'failed';
      job.error = 'Job cancelled by user';
      job.completedAt = new Date();
      this.emit('jobCancelled', job);
      return true;
    }

    if (job.status === 'processing') {
      // Can't cancel processing jobs immediately, but mark for cancellation
      job.error = 'Cancellation requested';
      this.emit('jobCancellationRequested', job);
      return true;
    }

    return false;
  }

  /**
   * Remove completed or failed jobs older than specified time
   */
  cleanupOldJobs(maxAgeMs: number = 24 * 60 * 60 * 1000): number {
    const cutoffTime = new Date(Date.now() - maxAgeMs);
    let removedCount = 0;

    for (const [jobId, job] of this.jobs.entries()) {
      if ((job.status === 'completed' || job.status === 'failed') &&
          job.completedAt && job.completedAt < cutoffTime) {
        this.jobs.delete(jobId);
        removedCount++;
      }
    }

    if (removedCount > 0) {
      this.emit('jobsCleanedUp', removedCount);
    }

    return removedCount;
  }

  /**
   * Get queue statistics
   */
  getStats(): QueueStats {
    const jobs = Array.from(this.jobs.values());
    const completedJobs = jobs.filter(j => j.status === 'completed');
    
    const totalProcessingTime = completedJobs.reduce((sum, job) => {
      if (job.startedAt && job.completedAt) {
        return sum + (job.completedAt.getTime() - job.startedAt.getTime());
      }
      return sum;
    }, 0);

    return {
      totalJobs: jobs.length,
      pendingJobs: jobs.filter(j => j.status === 'pending').length,
      processingJobs: jobs.filter(j => j.status === 'processing').length,
      completedJobs: completedJobs.length,
      failedJobs: jobs.filter(j => j.status === 'failed').length,
      averageProcessingTime: completedJobs.length > 0 ? totalProcessingTime / completedJobs.length : 0
    };
  }

  /**
   * Start the processing loop
   */
  private startProcessingLoop(): void {
    setInterval(() => {
      this.processNextJob();
      this.checkTimeouts();
    }, 1000); // Check every second
  }

  /**
   * Process the next pending job if capacity allows
   */
  private async processNextJob(): Promise<void> {
    if (this.processingJobs.size >= this.maxConcurrentJobs) {
      return; // At capacity
    }

    // Find next pending job
    const pendingJob = Array.from(this.jobs.values())
      .find(job => job.status === 'pending');

    if (!pendingJob) {
      return; // No pending jobs
    }

    // Start processing
    await this.processJob(pendingJob);
  }

  /**
   * Process a specific job
   */
  private async processJob(job: ProcessingJob): Promise<void> {
    job.status = 'processing';
    job.startedAt = new Date();
    job.progress = 0;
    
    this.processingJobs.add(job.id);
    this.emit('jobStarted', job);

    // Set timeout
    const timeout = setTimeout(() => {
      this.timeoutJob(job.id);
    }, this.JOB_TIMEOUT);
    this.processingTimeouts.set(job.id, timeout);

    try {
      // Import services dynamically to avoid circular dependencies
      const { documentProcessingService } = await import('./document-processing');
      const { getAuthenticatedSupabaseClient } = await import('../supabaseClient');
      
      // Get Supabase client
      const supabaseClient = await getAuthenticatedSupabaseClient();

      // Update database status to processing
      await supabaseClient
        .from('document_processing_status')
        .update({
          status: 'processing',
          processing_started_at: job.startedAt.toISOString(),
        })
        .eq('user_id', job.userId)
        .eq('document_id', job.documentId);

      // Update progress
      job.progress = 10;
      this.emit('jobProgress', job);

      // Process the document
      const result = await documentProcessingService.processDocument(
        job.pdfBuffer,
        job.documentTitle,
        job.options
      );

      // Update progress
      job.progress = 70;
      this.emit('jobProgress', job);

      if (result.success) {
        // Store chunks in database
        await this.storeChunksInDatabase(supabaseClient, job, result.chunks);
        
        // Update final status
        await supabaseClient
          .from('document_processing_status')
          .update({
            status: 'completed',
            total_chunks: result.chunks.length,
            processed_chunks: result.chunks.length,
            processing_completed_at: new Date().toISOString(),
          })
          .eq('user_id', job.userId)
          .eq('document_id', job.documentId);

        job.status = 'completed';
        job.result = result;
        job.progress = 100;
        this.emit('jobCompleted', job);
      } else {
        // Update failed status
        await supabaseClient
          .from('document_processing_status')
          .update({
            status: 'failed',
            error_message: result.error || 'Processing failed',
            processing_completed_at: new Date().toISOString(),
          })
          .eq('user_id', job.userId)
          .eq('document_id', job.documentId);

        job.status = 'failed';
        job.error = result.error || 'Processing failed';
        this.emit('jobFailed', job);
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      try {
        // Update failed status in database
        const { getAuthenticatedSupabaseClient } = await import('../supabaseClient');
        const supabaseClient = await getAuthenticatedSupabaseClient();
        
        await supabaseClient
          .from('document_processing_status')
          .update({
            status: 'failed',
            error_message: errorMessage,
            processing_completed_at: new Date().toISOString(),
          })
          .eq('user_id', job.userId)
          .eq('document_id', job.documentId);
      } catch (dbError) {
        console.error('Failed to update database status:', dbError);
      }

      job.status = 'failed';
      job.error = errorMessage;
      this.emit('jobFailed', job);
    } finally {
      job.completedAt = new Date();
      this.processingJobs.delete(job.id);
      
      // Clear timeout
      const timeout = this.processingTimeouts.get(job.id);
      if (timeout) {
        clearTimeout(timeout);
        this.processingTimeouts.delete(job.id);
      }

      // Try to process next job
      setTimeout(() => this.processNextJob(), 100);
    }
  }

  /**
   * Handle job timeout
   */
  private timeoutJob(jobId: string): void {
    const job = this.jobs.get(jobId);
    if (job && job.status === 'processing') {
      job.status = 'failed';
      job.error = 'Job timed out';
      job.completedAt = new Date();
      this.processingJobs.delete(jobId);
      this.emit('jobTimeout', job);
    }
  }

  /**
   * Check for timed out jobs
   */
  private checkTimeouts(): void {
    const now = new Date();
    
    for (const job of this.jobs.values()) {
      if (job.status === 'processing' && job.startedAt) {
        const processingTime = now.getTime() - job.startedAt.getTime();
        if (processingTime > this.JOB_TIMEOUT) {
          this.timeoutJob(job.id);
        }
      }
    }
  }

  /**
   * Update job progress (called by processing service)
   */
  updateJobProgress(jobId: string, progress: number): void {
    const job = this.jobs.get(jobId);
    if (job && job.status === 'processing') {
      job.progress = Math.max(0, Math.min(100, progress));
      this.emit('jobProgress', job);
    }
  }

  /**
   * Pause the queue
   */
  pause(): void {
    this.maxConcurrentJobs = 0;
    this.emit('queuePaused');
  }

  /**
   * Resume the queue
   */
  resume(maxConcurrentJobs: number = 3): void {
    this.maxConcurrentJobs = maxConcurrentJobs;
    this.emit('queueResumed');
    this.processNextJob();
  }

  /**
   * Store processed chunks in the database
   */
  private async storeChunksInDatabase(supabaseClient: any, job: ProcessingJob, chunks: any[]): Promise<void> {
    if (chunks.length === 0) return;

    // Delete existing chunks for this document (in case of reprocessing)
    await supabaseClient
      .from('document_chunks')
      .delete()
      .eq('user_id', job.userId)
      .eq('document_id', job.documentId);

    // Prepare chunks for database insertion
    const dbChunks = chunks.map(chunk => ({
      id: chunk.id,
      user_id: job.userId,
      document_id: job.documentId,
      chunk_index: chunk.chunkIndex,
      content: chunk.content,
      embedding: chunk.embedding || null, // pgvector handles arrays directly
      token_count: chunk.tokenCount,
      page_number: chunk.pageNumber,
      section_title: chunk.sectionTitle,
      metadata: chunk.metadata,
    }));

    // Insert chunks in batches to avoid query size limits
    const batchSize = 100;
    for (let i = 0; i < dbChunks.length; i += batchSize) {
      const batch = dbChunks.slice(i, i + batchSize);
      
      const { error } = await supabaseClient
        .from('document_chunks')
        .insert(batch);

      if (error) {
        throw new Error(`Failed to store chunks batch ${i / batchSize + 1}: ${error.message}`);
      }

      // Update progress
      const progress = 70 + Math.floor((i + batch.length) / dbChunks.length * 20);
      job.progress = progress;
      this.emit('jobProgress', job);
    }

    console.log(`✅ Stored ${chunks.length} chunks in database for document ${job.documentId}`);
  }

  /**
   * Clear all jobs
   */
  clear(): void {
    // Cancel all processing jobs
    for (const jobId of this.processingJobs) {
      this.cancelJob(jobId);
    }

    this.jobs.clear();
    this.processingJobs.clear();
    
    // Clear all timeouts
    for (const timeout of this.processingTimeouts.values()) {
      clearTimeout(timeout);
    }
    this.processingTimeouts.clear();

    this.emit('queueCleared');
  }
}

// Global queue instance
export const processingQueue = new ProcessingQueue();