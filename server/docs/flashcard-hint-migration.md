# Flashcard Hint Field Migration

## Overview

Successfully migrated the flashcard backend from using `explanation` to `hint` field to match frontend expectations and improve semantic clarity.

## Changes Made

### 1. Domain Layer

#### **FlashCard Entity** (`/server/src/domain/entities/FlashCard.ts`)

- ✅ Renamed private field from `explanation` to `hint`
- ✅ Updated constructor parameter from `explanation?` to `hint?`
- ✅ Renamed getter: `getExplanation()` → `getHint()`
- ✅ Renamed setter: `setExplanation()` → `setHint()`
- ✅ Updated `toJSON()` to return `hint` instead of `explanation`

### 2. Infrastructure Layer

#### **FlashCardMapper** (`/server/src/shared/mappers/FlashCardMapper.ts`)

- ✅ Updated `fromPersistenceToDomain()` to read `fc.hint` from database
- ✅ Now correctly maps database `hint` column to entity

#### **FlashCardsSetRepository** (`/server/src/infrastructure/repositories/FlashCardsSetRepository.ts`)

- ✅ Updated `save()` method to use `fc.getHint()` instead of `fc.getExplanation()`
- ✅ Correctly persists `hint` field to database

### 3. Application Layer

#### **CreateFlashCardsSetUseCase** (`/server/src/application/use-cases/flashcards/CreateFlashCardsSetUseCase.ts`)

- ✅ DTO already had `hint?` field (no changes needed)
- ✅ Already passing `c.hint` to FlashCard constructor (line 44)

#### **GenerateGeneralFlashCardsUseCase** (`/server/src/application/use-cases/flashcards/GenerateGeneralFlashCardsUseCase.ts`)

- ✅ Updated line 139: `c.explanation` → `c.hint` (when creating FlashCard from AI response)
- ✅ Updated line 172: `c.getExplanation()` → `c.getHint()` (when validating UUIDs)
- ✅ Updated line 206: Response mapping now uses `hint` instead of `explanation`

### 4. API Response Types

#### **flashcardsRoutes.ts** (`/server/src/shared/types/responses/flashcardsRoutes.ts`)

- ✅ `CreateFlashCardsSetResponse`: Changed `explanation: string` → `hint: string`
- ✅ `FlashCardsSetSummary`: Changed `explanation: string` → `hint: string`
- ✅ `GetFlashCardsSetByIdResponse`: Changed `explanation: string` → `hint: string`

### 5. AI Prompts

#### **flashcards.ts** (`/server/src/infrastructure/ai/generative-ai/prompts/flashcards.ts`)

- ✅ Updated rule: "Include an 'explanation' field..." → "Include a 'hint' field..."
- ✅ Updated JSON schema in prompt: `"explanation": "string (optional)"` → `"hint": "string (optional)"`
- ✅ AI will now generate `hint` field instead of `explanation`

### 6. Database Migration

#### **New Migration** (`/server/src/infrastructure/database/supabase/migrations/038_rename_flashcard_explanation_to_hint.sql`)

```sql
ALTER TABLE flashcards
RENAME COLUMN explanation TO hint;

COMMENT ON COLUMN flashcards.hint IS 'Optional hint or additional context to help understand the flashcard';
```

## Migration Steps

### To Apply Changes:

1. **Run the database migration:**

   ```bash
   cd server
   # Apply migration to your Supabase database
   npx supabase migration up
   # Or manually run the SQL in Supabase dashboard
   ```

2. **Restart the server:**

   ```bash
   npm run dev
   ```

3. **Test the changes:**
   - Create a new flashcard set (manual mode)
   - Generate flashcards with AI (automatic mode)
   - Verify `hint` field is saved and retrieved correctly

## Benefits

1. **Consistency**: Frontend and backend now use the same terminology (`hint`)
2. **Semantic Clarity**: "Hint" is more intuitive than "explanation" for flashcards
3. **Type Safety**: All TypeScript types updated to reflect the change
4. **AI Alignment**: AI prompts now generate the correct field name

## Backward Compatibility

⚠️ **Breaking Change**: This is a breaking change for existing data.

- Existing flashcards with `explanation` data will be automatically renamed to `hint` by the migration
- No data loss - just column rename
- Frontend already expects `hint`, so this fixes the mismatch

## Testing Checklist

- [ ] Manual flashcard creation works
- [ ] AI flashcard generation works
- [ ] Flashcard retrieval returns `hint` field
- [ ] Existing flashcards still display correctly
- [ ] Database migration runs without errors

## Documents Modified

1. `/server/src/domain/entities/FlashCard.ts`
2. `/server/src/shared/mappers/FlashCardMapper.ts`
3. `/server/src/infrastructure/repositories/FlashCardsSetRepository.ts`
4. `/server/src/application/use-cases/flashcards/GenerateGeneralFlashCardsUseCase.ts`
5. `/server/src/shared/types/responses/flashcardsRoutes.ts`
6. `/server/src/infrastructure/ai/generative-ai/prompts/flashcards.ts`

## Documents Created

1. `/server/src/infrastructure/database/supabase/migrations/038_rename_flashcard_explanation_to_hint.sql`

## Summary

All backend code has been successfully updated to use `hint` instead of `explanation` for flashcards. The database migration is ready to be applied. This change ensures consistency between frontend and backend, improving developer experience and reducing confusion.
