# Flashcards — Design & Implementation ✅

This document summarizes the flashcard generation pipeline, manual creation workflow, database schema, and supporting infrastructure.

## Overview

- Flashcards can be generated using Generative AI (Gemini Flash) based on document embeddings or created manually.
- Fully integrated with Supabase RLS and automated ownership triggers.
- Monitored by the AI Quota system to limit total flashcard sets allowed per tier plan.

## Key documents / migrations

- `src/infrastructure/database/supabase/migrations/037_add_the_flashcards_table.sql` — Core schema for flashcard sets and individual flashcards.
- `src/infrastructure/database/supabase/migrations/038_add_flashcards_rls.sql` — RLS policies and user ownership triggers for all flashcard-related tables.
- `src/infrastructure/database/supabase/migrations/040_add_flashcards_hints.sql` — Added hints to the flashcard entity.
- `src/infrastructure/database/supabase/migrations/055_add_quiz_flashcard_quota_columns.sql` — Expanded resources to support quota tracking for subsets.

## Schema (flashcards)

Table: `flash_cards_sets` (Root Aggregate)

- id UUID PRIMARY KEY
- name TEXT
- user_id UUID REFERENCES auth.users
- document_id UUID REFERENCES documents (nullable for standalone)
- language ENUM (en, fr, ar)
- created_at TIMESTAMPTZ

Table: `flash_cards`

- id UUID PRIMARY KEY
- set_id UUID REFERENCES flash_cards_sets
- front TEXT
- back TEXT
- hint TEXT
- position INT

## Generative Pipeline

1. **Quota Validation**: Verifies the User Entity has an available flashcard allowance (`remainingFlashcards() > 0`).
2. **Context Retrieval**: Relevant chunks are fetched from the `embeddings` table for the selected document.
3. **Batched Prompting**: Content is processed in batches to respect model context limits.
4. **Data Synchronization**: AI completion arrays generate standard JSON schemas, auto-cleaning missing UUIDs via local generators.
5. **Billing Integration**: Completing the process writes token counts into memory and decrements the user's available subset quota using `AiQuotaService`.
6. **Persistence**: Transaction-safe multi-table insert via `FlashCardsSetRepository`.

## Security & Storage

- **Quota Guards**: Flashcard creations (both Generative & Manual) rely on explicit `ValidationErrors` immediately denying generation if they exceed permitted set boundaries.
- **Quota Restoration**: Deleting an indexed flashcard payload correctly targets the user's allowance and reimburses available slots avoiding orphaned counters.
- **Trigger-based Ownership**: `auto_set_user_id` triggers ensure that `user_id` is automatically set to `auth.uid()` upon insertion, preventing identity spoofing.
- **Cascade Deletes**: Deleting a Set automatically purges all related cards.
- **RLS**: Strict Row Level Security prevents users from accessing or modifying items they don't own.

## Features Supported

- **Hints**: Optional hints for cards.
- **AI Title**: Automated naming based on document content if unlabeled.
- **Batched Generation**: Support for large documents mapping output size constraints.
- **Manual Construction**: Skips AI billing arrays entirely, simply asserting `Resource` deduction for tracking layout sizing arrays.
