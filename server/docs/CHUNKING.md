# Chunks — Design & Implementation ✅

This document summarizes the chunk storage pipeline, database schema, RLS policies, and maintenance jobs.

## Overview

- We store text chunks from Documents in the `chunks` table (previously called `embeddings`).
- Chunks are created when documents are processed for AI analysis, quiz generation, flashcard creation, and summarization.
- Note: Vector embedding functionality has been removed. Chunks now only store text content and metadata.

## Key documents / migrations

- Database migrations for the `chunks` table
- RLS policies for row-level security
- TTL cleanup jobs for old chunks

## Schema (chunks)

Table: `chunks`

- id UUID PRIMARY KEY DEFAULT gen_random_uuid()
- user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
- document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE
- content TEXT NOT NULL
- token_count INT
- metadata JSONB
- created_at TIMESTAMPTZ DEFAULT now()
- updated_at TIMESTAMPTZ DEFAULT now()

Indexes:

- `idx_chunks_user_id` on (`user_id`)
- `idx_chunks_document_id` on (`document_id`)
- `idx_chunks_created_at` on (`created_at`) — used for TTL cleanup

## RLS, triggers and ownership

- Trigger to set `user_id = auth.uid()` on INSERT
- `updated_at` trigger on UPDATE
- RLS policies:
  - SELECT / INSERT / UPDATE / DELETE policies use `auth.uid() = user_id`

## Service & repository behavior

- `ChunkingService` (src/infrastructure/services/ChunkingService.ts)
  - Breaks down large text content into smaller, manageable chunks for AI processing.

- `ChunkRepository` (src/infrastructure/repositories/ChunkRepository.ts)
  - `storeChunks(documentId: string, chunks: Chunk[])` batch-inserts rows into `chunks` table.
  - `getDocumentChunks(documentId: string)` retrieves all chunks for a document.
  - `isDocumentChunked(documentId: string)` checks if a document has been chunked.
  - Uses `DatabaseError` and optional logging for errors.

- `ChunkDocumentByIdUseCase` ties everything together: fetch document content, chunk, store chunks.
- `EnsureDocumentChunkedUseCase` ensures a document is chunked before AI processing.

## TTL cleanup (cron job)

- Cleanup function deletes rows older than a configurable time period in batches.
- Scheduled cron job runs cleanup periodically.

Important: some managed DB environments may not allow `pg_cron` — if that's the case, run the cleanup from an external worker using the Supabase service role key.

## Security & operational notes

- For ingestion from backend jobs, prefer using the Supabase `service_role` or the server `createServiceClient()` to bypass RLS safely.
- Be cautious about storing raw content or metadata that might be sensitive. Apply encryption at rest policies if necessary.

---

Last updated: February 2026
