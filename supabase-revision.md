# Supabase Usage Audit & Best Practices Report

**Generated:** February 9, 2026  
**Project:** Vollio  
**Audited By:** OpenCode AI Assistant

---

## Executive Summary

This document provides a comprehensive audit of Supabase usage across the Vollio codebase, identifying current practices, security vulnerabilities, performance issues, and best practice recommendations. The audit was conducted using Supabase MCP tools and the Supabase Postgres Best Practices skill.

### Overall Assessment
- **Security:** ⚠️ Moderate concerns identified
- **Performance:** ⚠️ Several optimization opportunities
- **Architecture:** ✅ Good separation of concerns
- **RLS Policies:** ✅ Properly implemented across all tables

---

## Table of Contents
1. [Critical Security Issues](#1-critical-security-issues)
2. [Performance Issues](#2-performance-issues)
3. [Query Optimization Opportunities](#3-query-optimization-opportunities)
4. [Architecture & Code Quality](#4-architecture--code-quality)
5. [Best Practices to Implement](#5-best-practices-to-implement)
6. [Positive Findings](#6-positive-findings)

---

## 1. Critical Security Issues

### 1.1 Function `search_path` Not Set (22 Functions Affected) 🔴 HIGH PRIORITY

**Issue:** All database functions lack a fixed `search_path`, making them vulnerable to search_path attacks where malicious users can hijack function behavior by creating identically named functions in different schemas.

**Affected Functions:**
- `cleanup_old_embeddings`
- `update_updated_at_column`
- `auto_set_user_id_for_highlights`
- `initialize_user_token_quota`
- `search_embeddings`
- `update_highlights_updated_at`
- `handle_updated_at`
- `set_summaries_user_id`
- `count_documents_in_folder`
- `auto_set_user_id_for_notes`
- `update_user_google_classroom_updated_at`
- `reset_monthly_token_quotas`
- `get_folder_path`
- `update_summaries_updated_at`
- `update_notes_updated_at`
- `update_embeddings_updated_at`
- `set_user_id_from_auth`
- `auto_set_user_id_for_user_preferences`
- `auto_set_user_id_for_embeddings`
- `set_updated_at_column`
- `reset_daily_token_quotas`
- And more...

**Best Practice Solution:**
```sql
-- Fix example for a function
CREATE OR REPLACE FUNCTION public.search_embeddings(...)
RETURNS TABLE(...)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp  -- ADD THIS LINE
AS $$
BEGIN
  -- function body
END;
$$;
```

**Remediation:** https://supabase.com/docs/guides/database/database-linter?lint=0011_function_search_path_mutable

**Impact:** High - Could allow privilege escalation attacks

---

### 1.2 Extension in Public Schema 🟡 MEDIUM

**Issue:** The `vector` extension is installed in the `public` schema instead of a dedicated extensions schema.

**Current State:**
```sql
-- Extension installed in public schema
CREATE EXTENSION vector;
```

**Best Practice:**
```sql
-- Create extensions schema
CREATE SCHEMA IF NOT EXISTS extensions;
-- Move vector extension
CREATE EXTENSION IF NOT EXISTS vector WITH SCHEMA extensions;
```

**Benefits:**
- Prevents conflicts with user tables
- Better security isolation
- Cleaner public schema

**Remediation:** https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public

---

### 1.3 Leaked Password Protection Disabled 🟡 MEDIUM

**Issue:** Supabase Auth's leaked password protection (HaveIBeenPwned integration) is currently disabled.

**Current:** Password validation does not check against compromised password databases.

**Best Practice:** Enable in Supabase Dashboard:
1. Go to Authentication > Policies
2. Enable "Leaked Password Protection"

**Benefits:**
- Prevents users from using compromised passwords
- Improves overall account security
- No performance impact (async check)

**Remediation:** https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection

---

### 1.4 Postgres Version Outdated 🟡 MEDIUM

**Current Version:** `supabase-postgres-17.4.1.069`  
**Status:** Security patches available

**Action:** Upgrade to the latest Postgres version to receive security patches.

**Remediation:** https://supabase.com/docs/guides/platform/upgrading

---

## 2. Performance Issues

### 2.1 Unindexed Foreign Keys 🔴 HIGH PRIORITY

**Issue:** Two tables have foreign keys without covering indexes, causing full table scans on joins.

#### 2.1.1 `chunks.user_id` Foreign Key
```sql
-- Current: Foreign key exists but no index
ALTER TABLE chunks ADD CONSTRAINT embeddings_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id);

-- Missing index causes slow queries like:
SELECT * FROM chunks WHERE user_id = '...';
```

**Best Practice Solution:**
```sql
CREATE INDEX idx_chunks_user_id ON public.chunks(user_id);
```

**Impact:** Every query filtering by `user_id` performs a sequential scan instead of an index scan.

#### 2.1.2 `folders.user_id` Foreign Key
```sql
-- Current: Foreign key exists but no index
ALTER TABLE folders ADD CONSTRAINT folders_user_id_fkey 
  FOREIGN KEY (user_id) REFERENCES auth.users(id);
```

**Best Practice Solution:**
```sql
CREATE INDEX idx_folders_user_id ON public.folders(user_id);
```

**Impact:** Queries like `SELECT * FROM folders WHERE user_id = '...'` will be slow with many folders.

**Remediation:** https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys

---

### 2.2 RLS Policies Re-evaluating `auth.uid()` Per Row 🔴 HIGH PRIORITY

**Issue:** Multiple RLS policies call `auth.uid()` or `current_setting()` for each row, causing severe performance degradation at scale.

**Affected Tables:**
- `highlights` (policy: "Users can view their own highlights")
- `notes` (policy: "Users can view their own notes")
- `documents` (policy: "Users can view their own documents")
- `folders` (policy: "Users can view their own folders")
- `quizzes`, `quiz_questions`, `mcq_options`, `true_false_answers`
- `flashcard_sets`, `flashcards`
- `summaries`, `user_preferences`, `user_token_quotas`, `token_usage_logs`
- `user_google_classroom`

**Current Anti-Pattern:**
```sql
-- ❌ BAD: Re-evaluates auth.uid() for EVERY ROW
CREATE POLICY "Users can view their own highlights"
  ON public.highlights
  FOR SELECT
  USING (auth.uid() = user_id);
```

**Best Practice Solution:**
```sql
-- ✅ GOOD: Uses cached session variable
CREATE POLICY "Users can view their own highlights"
  ON public.highlights
  FOR SELECT
  USING (
    (SELECT auth.uid()) = user_id  -- Subquery evaluated once
  );
```

**Even Better with Session Variable:**
```sql
-- ✅ BEST: Pre-computed session variable
-- Set at connection time:
SET LOCAL app.current_user_id = auth.uid();

-- Then use in policy:
CREATE POLICY "Users can view their own highlights"
  ON public.highlights
  FOR SELECT
  USING (
    current_setting('app.current_user_id', true)::uuid = user_id
  );
```

**Performance Impact:**
- **Before:** O(n) - auth function called for each row
- **After:** O(1) - auth function called once per query

**Remediation:** https://supabase.com/docs/guides/database/database-linter?lint=0004_auth_rls_initplan

---

### 2.3 Missing Composite Indexes for Common Query Patterns

#### 2.3.1 `documents` - User + Folder Queries
**Current Code Pattern:**
```typescript
// DocumentRepository.ts:81-89
const { data, error } = await this.supabaseClient
  .from("documents")
  .select("*, folders(id, name, parent_id)")
  .order("uploaded_at", { ascending: false });
```

**Issue:** No composite index for `(user_id, uploaded_at)` despite RLS filtering by `user_id` and ordering by `uploaded_at`.

**Best Practice:**
```sql
CREATE INDEX idx_documents_user_uploaded 
  ON public.documents(user_id, uploaded_at DESC);
```

#### 2.3.2 `highlights` - User + Document Queries
**Current Code Pattern:**
```typescript
// HighlightRepository.ts:25-29
let query = this.supabaseClient
  .from("highlights")
  .select("*")
  .eq("user_id", userId)
  .order("created_at", { ascending: false });
```

**Best Practice:**
```sql
CREATE INDEX idx_highlights_user_document 
  ON public.highlights(user_id, document_id);

CREATE INDEX idx_highlights_user_created 
  ON public.highlights(user_id, created_at DESC);
```

#### 2.3.3 `notes` - User + Document Queries
**Best Practice:**
```sql
CREATE INDEX idx_notes_user_document 
  ON public.notes(user_id, document_id) 
  WHERE is_deleted = false;  -- Partial index for active notes only
```

---

### 2.4 `chunks` Table - Missing Vector Index Optimization

**Current Implementation:**
```sql
-- Using default IVFFlat index with lists=100 (from migration 030)
CREATE INDEX IF NOT EXISTS idx_embeddings_vector 
  ON public.embeddings 
  USING ivfflat (embedding vector_cosine_ops) 
  WITH (lists = 100);
```

**Issue:** The `lists` parameter should scale with table size. Formula: `lists = sqrt(rows)`.

**Best Practice for Current Size (2 rows):**
- With 2 rows: Use `lists = 1` or no vector index yet
- Plan for scale: When reaching 10,000 rows, use `lists = 100`
- At 100,000 rows, use `lists = 316`
- At 1,000,000 rows, use `lists = 1000`

**Migration Strategy:**
```sql
-- Drop and recreate with optimal parameters as data grows
DROP INDEX IF EXISTS idx_embeddings_vector;

-- For 10K-100K rows:
CREATE INDEX idx_embeddings_vector 
  ON public.embeddings 
  USING ivfflat (embedding vector_cosine_ops) 
  WITH (lists = 100);

-- Consider HNSW for better query performance (Postgres 16+)
CREATE INDEX idx_embeddings_vector_hnsw 
  ON public.embeddings 
  USING hnsw (embedding vector_cosine_ops) 
  WITH (m = 16, ef_construction = 64);
```

**Remediation:** https://supabase.com/docs/guides/ai/vector-indexes

---

### 2.5 Connection Management Issues

**Issue:** No explicit connection pooling configuration visible in codebase.

**Current State:**
```typescript
// server/src/infrastructure/database/supabase/supabase.ts:7-12
export function createServiceClient() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}
```

**Best Practices to Implement:**

1. **Use Supabase Connection Pooler** (Transaction Mode)
   ```env
   # .env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_POOLER_URL=https://your-project.pooler.supabase.com  # Add this
   ```

2. **Configure Global Settings**
   ```typescript
   import { createClient } from '@supabase/supabase-js';

   export function createServiceClient() {
     return createClient(
       process.env.SUPABASE_POOLER_URL!,  // Use pooler for backend
       process.env.SUPABASE_SERVICE_ROLE_KEY!,
       {
         auth: { persistSession: false },  // Don't store sessions server-side
         global: {
           headers: {
             'x-application-name': 'vollio-server'  // For monitoring
           }
         },
         db: {
           schema: 'public'
         }
       }
     );
   }
   ```

3. **Monitor Connection Count**
   ```sql
   -- Query to check active connections
   SELECT count(*) 
   FROM pg_stat_activity 
   WHERE datname = current_database();
   ```

**Remediation:** https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler

---

## 3. Query Optimization Opportunities

### 3.1 N+1 Query Problem in Document Fetching

**Current Code:**
```typescript
// DocumentRepository.ts:79-89
async getAllDocumentsByUserId(userId: string): Promise<Document[]> {
  const { data, error } = await this.supabaseClient
    .from("documents")
    .select(`
      *,
      folders(id, name, parent_id)
    `)
    .order("uploaded_at", { ascending: false });
  // ...
}
```

**Issue:** Using `.select("*, folders(...)")` but not filtering by `userId` in the query. RLS handles filtering, but the query plan is suboptimal.

**Best Practice:**
```typescript
async getAllDocumentsByUserId(userId: string): Promise<Document[]> {
  // Explicitly filter by user_id for better query planning
  const { data, error } = await this.supabaseClient
    .from("documents")
    .select(`
      *,
      folders!inner(id, name, parent_id)
    `)
    .eq("user_id", userId)  // Explicit filter helps query planner
    .order("uploaded_at", { ascending: false });
  // ...
}
```

**Benefits:**
- Query planner can use `idx_documents_user_uploaded` index more effectively
- Clearer intent in code
- Better performance at scale

---

### 3.2 Inefficient Folder Hierarchy Queries

**Current Implementation:**
```typescript
// FolderRepository.ts uses RPC call:
await this.supabaseClient.rpc('get_folder_descendants', {
  folder_uuid: folderId
});
```

**Issue:** Recursive CTEs can be slow for deep hierarchies.

**Best Practice:** Use materialized path or closure table pattern.

**Option 1: Materialized Path**
```sql
-- Add to folders table
ALTER TABLE folders ADD COLUMN path text;
ALTER TABLE folders ADD COLUMN depth integer DEFAULT 0;

-- Update trigger to maintain path
CREATE OR REPLACE FUNCTION update_folder_path()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.parent_id IS NULL THEN
    NEW.path = NEW.id::text;
    NEW.depth = 0;
  ELSE
    SELECT path || '.' || NEW.id::text, depth + 1
    INTO NEW.path, NEW.depth
    FROM folders
    WHERE id = NEW.parent_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Query all descendants efficiently
SELECT * FROM folders 
WHERE path LIKE '5c6d8f9a-1b2c-3d4e-5f6g-7h8i9j0k1l2m.%';
```

**Option 2: Indexed Recursive Query**
```sql
-- Ensure parent_id has index (already exists: idx_folders_parent_id)
-- Use WITH RECURSIVE but add LIMIT for safety
WITH RECURSIVE folder_tree AS (
  SELECT id, name, parent_id, 1 as level
  FROM folders
  WHERE id = $1
  
  UNION ALL
  
  SELECT f.id, f.name, f.parent_id, ft.level + 1
  FROM folders f
  INNER JOIN folder_tree ft ON f.parent_id = ft.id
  WHERE ft.level < 10  -- Prevent infinite loops
)
SELECT * FROM folder_tree;
```

---

### 3.3 Batch Insert Optimization

**Current Code:**
```typescript
// ChunkRepository.ts:20-33
async storeChunks(documentId: string, chunks: Chunk[]): Promise<void> {
  const rows = chunks.map((chunk) => ({
    document_id: documentId,
    content: chunk.text,
    token_count: chunk.tokenCount,
    metadata: chunk.metadata,
  }));

  const { error } = await this.supabaseClient.from("chunks").insert(rows);
  // ...
}
```

**Issue:** Inserting potentially large arrays without batching or transaction control.

**Best Practice:**
```typescript
async storeChunks(documentId: string, chunks: Chunk[]): Promise<void> {
  const BATCH_SIZE = 1000;  // Optimal batch size
  const rows = chunks.map((chunk) => ({
    document_id: documentId,
    content: chunk.text,
    token_count: chunk.tokenCount,
    metadata: chunk.metadata,
  }));

  // Batch insert in chunks of 1000
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await this.supabaseClient
      .from("chunks")
      .insert(batch);
    
    if (error) {
      this.logger?.error({ err: error, batch: i }, "Failed to insert chunk batch");
      throw new DatabaseError(error);
    }
  }
}
```

**Benefits:**
- Prevents memory issues with large documents
- Better error recovery (partial success possible)
- More predictable performance

**Remediation:** https://supabase.com/docs/guides/database/postgres/row-level-security#performance

---

### 3.4 `SELECT *` Anti-Pattern

**Found in Multiple Repositories:**
```typescript
// DocumentRepository.ts:44
.select("*")

// HighlightRepository.ts:26
.select("*")

// NoteRepository.ts:28
.select("*")
```

**Issue:** Fetching all columns when only specific fields are needed.

**Best Practice:**
```typescript
// Instead of:
.select("*")

// Use explicit columns:
.select("id, name, size, storage_path, mime_type, folder_id, uploaded_at")

// Even better - define type-safe selects:
const DOCUMENT_SELECT = "id, name, size, storage_path, mime_type, folder_id, uploaded_at" as const;

const { data } = await this.supabaseClient
  .from("documents")
  .select(DOCUMENT_SELECT)
  .eq("id", id)
  .single();
```

**Benefits:**
- Reduces bandwidth
- Faster query execution
- Prevents accidentally exposing sensitive columns
- Better TypeScript type inference

---

## 4. Architecture & Code Quality

### 4.1 ✅ Positive: Clean Architecture Separation

**Excellent separation of concerns:**
```
domain/          - Pure business logic, no Supabase dependency
application/     - Use cases orchestrating domain logic
infrastructure/  - Supabase implementations (repositories, services)
interface/       - API routes and controllers
```

**Best Practice Observed:** Dependency Injection with Awilix properly separates `adminSupabaseClient` (service role) from `supabaseClient` (user context).

---

### 4.2 ✅ Positive: User Context Properly Handled

**Server-side user client creation:**
```typescript
// supabase.ts:16-44
export async function createUserClient(req: FastifyRequest) {
  const supabase = createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        getAll: () => {
          const cookies = Object.entries(req.cookies || {})
            .filter(([name]) => name.startsWith("sb-"))
            .map(([name, value]) => ({ name, value: value || "" }));
          return cookies;
        },
      },
    },
  );
  return { supabase };
}
```

**Best Practice Confirmed:** Using `@supabase/ssr` for proper cookie handling in Fastify.

---

### 4.3 ⚠️ Missing: Prepared Statements for RPC Calls

**Current Code:**
```typescript
// ChunkRepository.ts:40-44
const { data, error } = await this.supabaseClient.rpc("search_chunks", {
  query_vector: queryVector,
  match_threshold: matchThreshold,
  match_count: matchCount,
});
```

**Best Practice:** RPC calls are already parameterized, but ensure the function definition uses proper parameter binding:

```sql
-- Good (already implemented):
CREATE FUNCTION search_chunks(
  query_vector vector(1536),
  match_threshold float,
  match_count int
)
```

---

### 4.4 ⚠️ Missing: Database Transactions

**Issue:** No transaction handling found in repositories for multi-step operations.

**Example:** Creating a quiz with questions and options should be atomic.

**Current Code:**
```typescript
// QuizRepository.ts - inserts quiz, questions, and options separately
// If one insert fails, partial data remains
```

**Best Practice:**
```typescript
async saveQuiz(quiz: QuizEntity): Promise<QuizEntity> {
  // Use Supabase transactions (via RPC or direct SQL)
  const { data, error } = await this.adminSupabaseClient.rpc(
    'create_quiz_with_questions',
    {
      quiz_data: quizDto,
      questions_data: questionsDto,
      options_data: optionsDto
    }
  );
  
  // Or use explicit transaction:
  const { data, error } = await this.adminSupabaseClient
    .from('quizzes')
    .insert(quizData)
    .select()
    .single();
  
  if (error) throw new DatabaseError(error);
  
  // Continue with dependent inserts...
}
```

**Better Alternative - Use Database-Level Transaction:**
```sql
-- Create atomic operation in database
CREATE OR REPLACE FUNCTION create_quiz_with_questions(
  quiz_data jsonb,
  questions_data jsonb[],
  options_data jsonb[]
)
RETURNS jsonb
LANGUAGE plpgsql
SET search_path = public, pg_temp
AS $$
DECLARE
  quiz_id uuid;
BEGIN
  -- Insert quiz
  INSERT INTO quizzes (...)
  VALUES (...)
  RETURNING id INTO quiz_id;
  
  -- Insert questions and options
  -- All in one transaction
  
  RETURN jsonb_build_object('quiz_id', quiz_id);
END;
$$;
```

---

### 4.5 ⚠️ Environment Variable Validation Missing

**Current Code:**
```typescript
// supabase.ts:9-10
process.env.SUPABASE_URL!,
process.env.SUPABASE_SERVICE_ROLE_KEY!,
```

**Issue:** Using non-null assertion (`!`) without runtime validation.

**Best Practice:**
```typescript
function getRequiredEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
}

export function createServiceClient() {
  return createClient(
    getRequiredEnv('SUPABASE_URL'),
    getRequiredEnv('SUPABASE_SERVICE_ROLE_KEY'),
  );
}
```

---

## 5. Best Practices to Implement

### 5.1 Row-Level Security (RLS) Performance Optimization

**Current State:** ✅ RLS enabled on all tables  
**Issue:** ⚠️ Performance degradation due to per-row function evaluation

**Best Practice Pattern:**
```sql
-- Instead of:
CREATE POLICY "policy_name" ON table_name
  FOR SELECT
  USING (auth.uid() = user_id);

-- Use:
CREATE POLICY "policy_name" ON table_name
  FOR SELECT
  USING (
    (SELECT auth.uid()) = user_id  -- Evaluated once per query
  );

-- Or even better - use security definer functions:
CREATE OR REPLACE FUNCTION current_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT auth.uid();
$$;

-- Then use in policies:
CREATE POLICY "policy_name" ON table_name
  FOR SELECT
  USING (current_user_id() = user_id);
```

**Apply to all tables:**
- documents
- folders
- chunks
- highlights
- notes
- quizzes
- quiz_questions
- mcq_options
- true_false_answers
- flashcard_sets
- flashcards
- summaries
- user_preferences
- user_token_quotas
- token_usage_logs
- user_google_classroom

---

### 5.2 Implement Query Result Caching

**Best Practice:** Cache frequently accessed, rarely changed data.

**Example: User Preferences**
```typescript
// Implement in-memory cache with TTL
import { LRUCache } from 'lru-cache';

const userPrefsCache = new LRUCache<string, UserPreferences>({
  max: 1000,  // Max 1000 users cached
  ttl: 1000 * 60 * 5,  // 5 minutes
});

async getUserPreferences(userId: string): Promise<UserPreferences> {
  // Check cache first
  const cached = userPrefsCache.get(userId);
  if (cached) return cached;
  
  // Fetch from database
  const { data, error } = await this.supabaseClient
    .from('user_preferences')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error) throw new DatabaseError(error);
  
  // Cache result
  userPrefsCache.set(userId, data);
  return data;
}
```

---

### 5.3 Implement Monitoring and Observability

**Best Practices:**

1. **Enable Postgres Extensions**
   ```sql
   CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
   CREATE EXTENSION IF NOT EXISTS pg_trgm;  -- For text search optimization
   ```

2. **Add Query Logging**
   ```typescript
   // Wrapper around Supabase client for query logging
   class MonitoredSupabaseClient {
     async query(table: string, operation: string, params: any) {
       const start = Date.now();
       try {
         const result = await this.client.from(table)[operation](params);
         const duration = Date.now() - start;
         
         this.logger.info({
           table,
           operation,
           duration,
           success: !result.error
         });
         
         return result;
       } catch (error) {
         this.logger.error({ table, operation, error });
         throw error;
       }
     }
   }
   ```

3. **Set Up Performance Monitoring**
   ```sql
   -- Query to identify slow queries
   SELECT 
     query,
     calls,
     total_exec_time,
     mean_exec_time,
     max_exec_time
   FROM pg_stat_statements
   WHERE mean_exec_time > 100  -- Queries slower than 100ms
   ORDER BY mean_exec_time DESC
   LIMIT 20;
   ```

---

### 5.4 Implement Soft Delete Pattern Consistently

**Current State:** Only `notes` table has `is_deleted` column.

**Best Practice:** Implement across all user-generated content tables.

**Benefits:**
- Data recovery possible
- Audit trail maintained
- Cascading deletes avoided

**Implementation:**
```sql
-- Add to all relevant tables
ALTER TABLE documents ADD COLUMN is_deleted boolean DEFAULT false;
ALTER TABLE highlights ADD COLUMN is_deleted boolean DEFAULT false;
ALTER TABLE quizzes ADD COLUMN is_deleted boolean DEFAULT false;
-- etc.

-- Create partial indexes for active records only
CREATE INDEX idx_documents_active 
  ON documents(user_id, uploaded_at) 
  WHERE is_deleted = false;

-- Update RLS policies
CREATE POLICY "Users can view active documents"
  ON documents
  FOR SELECT
  USING (
    (SELECT auth.uid()) = user_id 
    AND is_deleted = false
  );
```

---

### 5.5 Implement Database Health Checks

**Best Practice:** Add health check endpoints that verify database connectivity.

```typescript
// Add to health check route
async function checkDatabaseHealth() {
  try {
    const { data, error } = await supabaseClient
      .from('documents')
      .select('count')
      .limit(1)
      .single();
    
    return {
      database: {
        status: error ? 'unhealthy' : 'healthy',
        latency: Date.now() - start,
        error: error?.message
      }
    };
  } catch (error) {
    return {
      database: {
        status: 'unhealthy',
        error: error.message
      }
    };
  }
}
```

---

### 5.6 Implement Connection Retry Logic

**Best Practice:** Add exponential backoff for transient database errors.

```typescript
async function withRetry<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error) {
      const isRetryable = 
        error.code === 'PGRST301' ||  // Temporary unavailable
        error.code === '08006' ||      // Connection failure
        error.code === '57P03';        // Cannot connect now
      
      if (!isRetryable || attempt === maxRetries - 1) {
        throw error;
      }
      
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}
```

---

## 6. Positive Findings

### 6.1 ✅ Excellent: RLS Enabled on All Tables

All 16 tables have RLS enabled with appropriate policies:
- documents
- folders
- user_google_classroom
- highlights
- notes
- chunks
- quizzes
- quiz_questions
- mcq_options
- true_false_answers
- flashcard_sets
- flashcards
- summaries
- user_preferences
- user_token_quotas
- token_usage_logs

**This prevents data leaks at the database level.**

---

### 6.2 ✅ Good: Proper Use of Service Role vs User Client

**Service Role (Admin Client):**
- Used for: TokenQuotaRepository (bypasses RLS for admin operations)
- Registered as singleton in DI container

**User Client (Scoped):**
- Created per-request with user cookies
- Used for: All user-facing operations
- Properly scoped in DI container

---

### 6.3 ✅ Good: Comprehensive Indexing Strategy

Most tables have appropriate indexes:
- Primary keys on all tables
- Foreign key indexes (except 2 missing)
- Temporal indexes (`created_at`, `updated_at`)
- Composite indexes for common queries
- GIN indexes for JSONB columns
- GIN indexes for array columns (`tags`)

**Missing only 2 user_id indexes (documented above).**

---

### 6.4 ✅ Good: Proper Error Handling

Repositories consistently:
- Check for `PGRST116` (not found) errors
- Throw custom `DatabaseError` with context
- Log errors with structured logging
- Return `null` for not found vs throwing for errors

---

### 6.5 ✅ Good: Migration Management

Well-organized migration files with:
- Descriptive names
- Sequential numbering
- Proper constraints and indexes
- RLS policies included
- Triggers for automatic fields

---

### 6.6 ✅ Good: Type Safety with TypeScript

Strong typing throughout:
- Domain entities separate from DTOs
- Repository interfaces define contracts
- Mappers convert between DB and domain models

---

### 6.7 ✅ Good: Storage Security

Storage bucket policies properly configured:
- User-based access control
- File type restrictions (images bucket)
- RLS using `storage_requesting_user_id()`

---

## Summary of Action Items

### Immediate Priority (Do First)

1. **Fix all function `search_path` issues** (22 functions)
   - Add `SET search_path = public, pg_temp` to all functions
   - Estimated time: 2-3 hours
   - Impact: HIGH - Prevents security vulnerabilities

2. **Add missing foreign key indexes**
   ```sql
   CREATE INDEX idx_chunks_user_id ON public.chunks(user_id);
   CREATE INDEX idx_folders_user_id ON public.folders(user_id);
   ```
   - Estimated time: 5 minutes
   - Impact: HIGH - Immediate performance improvement

3. **Optimize RLS policies** (all tables)
   - Wrap `auth.uid()` in subqueries
   - Estimated time: 1-2 hours
   - Impact: HIGH - Significant performance improvement at scale

### High Priority (Do Soon)

4. **Enable leaked password protection**
   - Enable in Supabase Dashboard
   - Estimated time: 2 minutes
   - Impact: MEDIUM - Security improvement

5. **Add composite indexes** for common query patterns
   ```sql
   CREATE INDEX idx_documents_user_uploaded ON documents(user_id, uploaded_at DESC);
   CREATE INDEX idx_highlights_user_document ON highlights(user_id, document_id);
   CREATE INDEX idx_notes_user_document ON notes(user_id, document_id) WHERE is_deleted = false;
   ```
   - Estimated time: 30 minutes
   - Impact: MEDIUM-HIGH - Performance improvement

6. **Move vector extension** to dedicated schema
   - Estimated time: 15 minutes
   - Impact: MEDIUM - Better schema organization

### Medium Priority (Plan For)

7. **Implement connection pooling** configuration
8. **Add batch insert logic** for large operations
9. **Implement database transactions** for multi-step operations
10. **Add query result caching** for frequently accessed data
11. **Replace `SELECT *`** with explicit column selects

### Low Priority (Nice to Have)

12. **Implement soft delete** across all tables
13. **Add monitoring and observability** tooling
14. **Implement connection retry logic**
15. **Optimize vector index parameters** as data grows
16. **Upgrade Postgres version** (when available)

---

## Additional Resources

- [Supabase Database Linter](https://supabase.com/docs/guides/database/database-linter)
- [Postgres Performance Guide](https://wiki.postgresql.org/wiki/Performance_Optimization)
- [Supabase RLS Performance](https://supabase.com/docs/guides/database/postgres/row-level-security#performance)
- [pgvector Best Practices](https://github.com/pgvector/pgvector#best-practices)
- [Connection Pooling Guide](https://supabase.com/docs/guides/database/connecting-to-postgres#connection-pooler)

---

**End of Report**
