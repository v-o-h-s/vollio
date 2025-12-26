#!/bin/bash

# Script to apply the flashcard hint migration
# This renames the 'explanation' column to 'hint' in the flashcards table

echo "🔄 Applying flashcard hint migration..."
echo ""

# Check if we're in the server directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: Please run this script from the server directory"
    exit 1
fi

# Check if Supabase CLI is available
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI not found. You can:"
    echo "   1. Install it: npm install -g supabase"
    echo "   2. Or manually run the migration SQL in your Supabase dashboard"
    echo ""
    echo "📄 Migration document: src/infrastructure/database/supabase/migrations/038_rename_flashcard_explanation_to_hint.sql"
    exit 1
fi

# Apply the migration
echo "📦 Applying migration 038_rename_flashcard_explanation_to_hint.sql..."
supabase migration up

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Migration applied successfully!"
    echo ""
    echo "Next steps:"
    echo "  1. Restart your server: npm run dev"
    echo "  2. Test flashcard creation and retrieval"
    echo "  3. Verify the 'hint' field is working correctly"
else
    echo ""
    echo "❌ Migration failed. Please check the error above."
    echo ""
    echo "Manual migration:"
    echo "  Run this SQL in your Supabase dashboard:"
    echo "  ALTER TABLE flashcards RENAME COLUMN explanation TO hint;"
fi
