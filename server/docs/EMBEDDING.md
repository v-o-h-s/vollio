# Embeddings — Design & Implementation ✅

This document summarizes the embedding pipeline, database schema, RLS policies, maintenance jobs, and the runtime pieces we implemented.

## Overview

- We store text chunks from PDFs alongside vector embeddings in the `embeddings` table.
- Embeddings are generated in batches (14 chunks per request) by the embedding service and persisted with RLS and triggers to ensure ownership and safety.

## Key files / migrations

- `src/infrastructure/database/supabase/migrations/030_add_embedding_table(very important).sql` — creates the `embeddings` table and `search_embeddings()` function (512-dim vectors).
- `src/infrastructure/database/supabase/migrations/031_add_embeddings_rls.sql` — enables Row Level Security, auto-populates `user_id` from `auth.uid()` (trigger), adds `updated_at` trigger, and creates SELECT/INSERT/UPDATE/DELETE policies.
- `src/infrastructure/database/supabase/migrations/032_add_embeddings_ttl_and_index.sql` — creates index on `created_at` and a `pg_cron` scheduled cleanup that deletes rows older than 14 hours in safe batches.

## Schema (embeddings)

Table: `embeddings`

- id UUID PRIMARY KEY DEFAULT gen_random_uuid()
- user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE
- document_id UUID NOT NULL REFERENCES pdfs(id) ON DELETE CASCADE
- content TEXT NOT NULL
- embedding VECTOR(512) NOT NULL
- chunk_index INT NOT NULL
- token_count INT
- metadata JSONB
- created_at TIMESTAMPTZ DEFAULT now()
- updated_at TIMESTAMPTZ DEFAULT now()

Indexes:

- `idx_embeddings_user_id` on (`user_id`)
- `idx_embeddings_document_id` on (`document_id`)
- `idx_embeddings_created_at` on (`created_at`) — used for TTL cleanup
- `idx_embeddings_embedding` using IVFFlat (`embedding vector_cosine_ops`) with lists=100 (tunable)

Notes:

- We use 512 dimensions to match the Qwen3 embedding model in production.
- IVFFlat was chosen as a reasonable default; we can switch to HNSW for better recall depending on dataset size.

## RLS, triggers and ownership

- `auto_set_user_id_for_embeddings()` — trigger run BEFORE INSERT to set `NEW.user_id = auth.uid()` if missing and verify it matches `auth.uid()`; SECURITY DEFINER.
- `update_embeddings_updated_at()` — sets `updated_at = now()` on UPDATE.
- RLS policies (pattern consistent with other tables):
  - SELECT / INSERT / UPDATE / DELETE policies use `auth.uid() = user_id`.
  - We drop policies first to make the migration idempotent.

Rationale: storing `user_id` directly on the row simplifies policy checks and makes ownership explicit.

## Search function

Function: `search_embeddings(query_embedding vector(512), match_threshold float default 0.7, match_count int default 10)`

- Returns table: id, user_id, document_id, content, similarity (cosine-based), chunk_index, metadata
- Uses `embeddings.embedding <-> query_embedding` operator to rank by distance and computes similarity as (1 - distance) for a cosine-like score.
- Note: the function uses the same dimension (512) as the table vector type.

Usage (RPC):

```sql
SELECT * FROM search_embeddings(your_query_vector::vector(512), 0.75, 10);
-- or via RPC: SELECT * FROM search_embeddings(query_embedding := ARRAY[...], match_threshold := 0.7, match_count := 10);
```

## Service & repository behavior

- `EmbeddingService` (src/infrastructure/services/EmbeddingService.ts)
  - Batches chunks into groups of 14 (`EmbeddingConfig.BATCH_SIZE = 14`) and calls the embedding provider (VoyageAI client) for each batch.
  - Validates response shape (uses typed `EmbeddingListResponse` / `EmbeddingItem`) and extracts `embedding: number[]` from each item.

- `EmbeddingStorageRepository` (src/infrastructure/repositories/EmbeddingStorageRepository.ts)
  - `storeEmbedding(documentId: string, embeddings: number[][], chunks: Chunk[])` batch-inserts rows into `embeddings` table.
  - `searchSimilarEmbeddings(queryEmbedding, matchThreshold?, matchCount?)` calls the `search_embeddings` RPC and maps results to an array.
  - Uses `DatabaseError` and optional logging for errors.

- `EmbeddFileBYIdUseCase` ties everything together: fetch file content, chunk, generate embeddings, store them.

## TTL cleanup (cron job)

- Migration `032` adds `idx_embeddings_created_at` and a function `cleanup_old_embeddings(batch_size INT DEFAULT 1000)` which deletes rows older than 14 hours in batches and sleeps briefly between batches to reduce DB pressure.
- We schedule a pg_cron job `embeddings_cleanup` (hourly) that calls `cleanup_old_embeddings(1000)`.

Important: some managed DB environments may not allow `pg_cron` — if that’s the case, run the cleanup from an external worker using the Supabase service role key.

## Sample SQL snippets & tests

- Count rows older than 14 hours:

```sql
SELECT count(*) FROM embeddings WHERE created_at < now() - interval '14 hours';
```

- Dry-run select of rows to be deleted (limit)

```sql
SELECT id, created_at, document_id FROM embeddings
WHERE created_at < now() - interval '14 hours'
ORDER BY created_at
LIMIT 100;
```

- Manual delete (one-time):

```sql
SELECT cleanup_old_embeddings(1000);
```

## Security & operational notes

- For ingestion from backend jobs, prefer using the Supabase `service_role` or the server `createServiceClient()` to bypass RLS safely and set `user_id` explicitly (or let the trigger set it for user-scoped requests).
- Be cautious about storing raw embeddings or metadata that might be sensitive. Apply encryption at rest policies if necessary.

## Next recommended steps

1. Add a DB trigger to forbid inserting an embedding whose `document_id` does not belong to `user_id` (stronger DB-level safety), or verify this in ingestion code.
2. Add SQL integration tests that:
   - Insert a row as `service_role` then confirm `auth.uid()` cannot read it as a different user,
   - Confirm `search_embeddings()` returns expected ordered results when invoking with a known vector.
3. Consider switching to HNSW index if recall becomes a priority.

---

If you'd like, I can add the quick SQL test snippets and a small script to run them (or add unit/integration tests in the test suite). Tell me which you prefer and I'll implement it next. ✅
