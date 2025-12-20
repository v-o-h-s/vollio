# Quizzes — Design & Implementation ✅

This document summarizes the quiz generation pipeline, database schema, and supporting infrastructure.

## Overview

- Quizzes are generated using Generative AI (Gemini 2.0 Flash) based on document embeddings.
- Features include batched generation (summary-based context), automated difficulty adjustment, and multi-language support.
- Fully integrated with Supabase RLS and automated ownership triggers.

## Key files / migrations

- `src/infrastructure/database/supabase/migrations/033_add_the_quiz_table.sql` — Core schema for quizzes, questions, and specific answer types.
- `src/infrastructure/database/supabase/migrations/034_add_quiz_rls.sql` — RLS policies and user ownership triggers for all quiz-related tables.
- `src/infrastructure/database/supabase/migrations/035_remove_fill_blanks_and_short_answer.sql` — Simplification migration (purged unused question types).
- `src/infrastructure/database/supabase/migrations/036_add_title_to_quizzes.sql` — Added support for AI-generated quiz titles.

## Schema (quizzes)

Table: `quizzes` (Root Aggregate)

- id UUID PRIMARY KEY
- title TEXT (AI-generated)
- user_id UUID REFERENCES auth.users
- document_id UUID REFERENCES pdfs
- language ENUM (en, fr, ar)
- difficulty_level ENUM (easy, medium, hard)
- number_of_questions INT
- time_limit_minutes INT
- explanation_level ENUM (none, brief, detailed)

Table: `quiz_questions` (Polymorphic Base)

- id UUID PRIMARY KEY
- quiz_id UUID REFERENCES quizzes
- type ENUM (mcq, true_false)
- text TEXT
- points INT
- explanation TEXT
- position INT

Table: `mcq_options`

- id UUID PRIMARY KEY
- question_id UUID REFERENCES quiz_questions
- text TEXT
- is_correct BOOLEAN
- position INT

Table: `true_false_answers`

- question_id UUID PRIMARY KEY REFERENCES quiz_questions
- correct_answer BOOLEAN

## Generation Pipeline

1. **Context Retrieval**: Relevant chunks are fetched from the `embeddings` table for the selected document.
2. **Batched Prompting**: Content is processed in batches (67 chunks) to respect model context limits.
3. **Summary Propagation**: A summary from each batch is passed to the next to maintain cohesive context during long quiz generation.
4. **Sanitization**: Auto-cleaning of AI response IDs to ensure valid UUIDs are persisted.
5. **Persistence**: Transaction-safe multi-table insert via `QuizRepository`.

## Security

- **Trigger-based Ownership**: `auto_set_user_id` triggers ensure that `user_id` is automatically set to `auth.uid()` upon insertion, preventing identity spoofing.
- **Cascade Deletes**: Deleting a quiz automatically purges all related questions, options, and answers.
- **RLS**: Strict Row Level Security prevents users from accessing or modifying quizzes they don't own.

## Features Supported

- **MCQ**: Multiple choice questions with configurable correct options.
- **True/False**: Simple boolean checks.
- **AI Title**: Automated naming based on document content.
- **Batched Generation**: Support for large documents.
