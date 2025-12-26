# Database Management Guide

This guide outlines the procedures for managing the Supabase database, including migrations, type generation, and schema updates.

## Overview

The project uses Supabase as the backend database. We manage the database schema using SQL migrations and generate TypeScript types to ensure type safety across the application.

## Directory Structure

- **`supabase/migrations/`**: Contains SQL migration files.
- **`lib/types/database.ts`**: Contains the generated TypeScript definitions for the database schema.
- **`lib/utils/supabase-helpers.ts`**: Contains utility functions for interacting with the database.

## Workflow for Updating the Database

1.  **Create a Migration**:

    - Create a new SQL file in `supabase/migrations/` with a timestamp prefix (e.g., `20231027120000_add_tags_to_highlights.sql`).
    - Write the SQL commands to modify the schema (CREATE TABLE, ALTER TABLE, etc.).

2.  **Apply Migration**:

    - Use the Supabase CLI or the Supabase Dashboard's SQL Editor to apply the migration.
    - _Note: Ensure you have the necessary permissions._

3.  **Update TypeScript Types**:

    - After the schema changes are applied, you need to update the TypeScript types.
    - Run the type generation command (if available in `package.json` or via Supabase CLI):
      ```bash
      npx supabase gen types typescript --project-id <your-project-id> > lib/types/database.ts
      ```
    - Alternatively, manually update `lib/types/database.ts` if you are not using the CLI generator, but automatic generation is preferred.

4.  **Update Application Code**:
    - Update any DTOs (Data Transfer Objects) in `lib/dto/`.
    - Update mappers and type guards in `lib/utils/supabase-helpers.ts`.
    - Update API routes and frontend components to reflect the schema changes.

## Best Practices

- **Row Level Security (RLS)**: Always enable RLS on tables and define appropriate policies.
- **Indexes**: Add indexes for columns that are frequently queried (e.g., `user_id`, `document_id`).
- **Foreign Keys**: Use foreign keys to maintain data integrity.
- **Backups**: Ensure database backups are configured (handled by Supabase platform).

## Common Operations

### Adding a New Table

1.  Create migration file.
2.  Define table with `id`, `created_at`, `updated_at`, etc.
3.  Enable RLS.
4.  Add policies for SELECT, INSERT, UPDATE, DELETE.
5.  Generate types.

### Modifying a Column

1.  Create migration file.
2.  Use `ALTER TABLE table_name ALTER COLUMN column_name ...`.
3.  Generate types.

## Troubleshooting

- **Type Mismatch**: If you see type errors after a schema change, ensure you have regenerated `lib/types/database.ts`.
- **Permission Denied**: Check RLS policies if you cannot access data.
