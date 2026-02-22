# File / Quota Resources — Quotas ✅

This document catalogs how the backend manages restricted asset limitations (Like total quizzes or flashcards) that sit independent of pure API ratelimiting.

## Overview

While standard API rate limiting protects our infrastructure requests over time scales (Minute/Hour limits mapped in `RATE_LIMITING.md` and computational tokens in `API_QUOTA.md`), structural limitations prevent databases from infinitely expanding per user (Total Documents, Quizzes, Flashcards).

## Architecture

Unlike Token-Bucket paradigms (LLM Generation), structural quotas update integer counters whenever structural endpoints trigger.

1. `domain/entities/Plan.ts`: Defines what a user’s tier allows (e.g. 5 Quizzes, 5 Flashcard sets).
2. `domain/entities/Resources.ts`: Defines the actual working counter instances allocated per User (e.g. User has consumed 2 quizzes).
3. `AiQuotaService.ts` / `DocumentQuotaService.ts`: These domain services interface with incoming requests and intercept payload resolutions to assert validity based on the counters.

### Flow Example: Create Quiz

- User POST requests Quiz creation.
- `CreateGeneralQuizUseCase.ts` queries `AiQuotaService.canCreateQuiz(userId)`.
- `AiQuotaService` pulls the `Resources` entity from Supabase for that specific User ID. It queries the integer value mapping (e.g. `usedQuizzes >= maxQuizzes`).
- If false, Fastify immediately throws `QuotaExceededError` or `ValidationError` mapped intercept. No further logic executes.
- If True, it continues logic to execution. Token limiters (for Generative completions) are pinged simultaneously at completion to register costs, but it finally updates the DB structural resource column (`used_quizzes += 1`).

### Flow Example: Delete Quiz

- User DELETE requests a targeted entity (Quiz or Flashcard array).
- `DeleteQuizByIdUseCase.ts` requests a query mapping on the ID.
- Assuming the Query isn't mocked/falsified (A valid entity existed and RLS passes), the Delete resolves.
- `DeleteQuizByIdUseCase.ts` queries `AiQuotaService.releaseQuiz(userId)`.
- It restores the user's available count locally and then upserts `-1` back into the user tables ensuring their limit capacity resets safely.

## Database Migrations

Resource quotas hook directly into automated user triggers:

- `055_add_quiz_flashcard_quota_columns.sql`: Creates core metrics (`max_quizzes`, `used_flashcards`) inside the `.resources` and `.plans` arrays.
- `056_update_new_user_trigger_quiz_flashcard.sql`: Forces Supabase to inject Free Tier logic natively whenever `auth.uid` hooks a new identity to map their free resources immediately without relying on Fastify backend interception (Eliminates race hazards).
