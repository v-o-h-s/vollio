# Supabase Auth Pattern for API Handlers

## Updated Pattern (After Clerk Removal)

When creating API handlers that need authentication, use this pattern:

### ✅ **Correct Pattern**

```typescript
import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { Logger } from "@/lib/utils/logger";

export async function handler(request: NextRequest) {
  const supabase = await createClient();

  // Get authenticated user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    Logger.warn("🔐 Unauthorized access attempt");
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Now you have user.id to use
  Logger.info(`👤 Processing request for user: ${user.id}`);

  // For INSERT operations, include user_id
  const { data, error } = await supabase
    .from("table_name")
    .insert({
      field1: value1,
      field2: value2,
      user_id: user.id, // ← Important!
    })
    .select()
    .single();

  // For SELECT/UPDATE/DELETE, RLS will automatically filter by user_id
  // But you should still get the user for logging purposes
}
```

### ❌ **Incorrect Pattern (Missing user_id)**

```typescript
// DON'T DO THIS - Will cause RLS violation
const { data, error } = await supabase.from("notes").insert({
  title,
  content,
  // ❌ Missing user_id!
});
```

## Key Points

1. **Always get the user first**:

   ```typescript
   const {
     data: { user },
     error: authError,
   } = await supabase.auth.getUser();
   ```

2. **Always check if user exists**:

   ```typescript
   if (authError || !user) {
     return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
   }
   ```

3. **Always include user_id in INSERT operations**:

   ```typescript
   .insert({
     ...yourData,
     user_id: user.id,  // ← Required!
   })
   ```

4. **For SELECT/UPDATE/DELETE**:
   - RLS policies will automatically filter by `auth.uid()`
   - But still get the user for auth check and logging

## Handler Types

### CREATE (POST)

```typescript
const { data, error } = await supabase.from("table").insert({
  ...data,
  user_id: user.id, // Required
});
```

### READ (GET)

```typescript
// RLS automatically filters to user's data
const { data, error } = await supabase.from("table").select("*");
```

### UPDATE (PATCH)

```typescript
// RLS automatically ensures user can only update their data
const { data, error } = await supabase
  .from("table")
  .update({ ...updates })
  .eq("id", id);
```

### DELETE (DELETE)

```typescript
// RLS automatically ensures user can only delete their data
const { data, error } = await supabase.from("table").delete().eq("id", id);
```

## Files That Need This Pattern

Update these handlers with the correct Supabase Auth pattern:

### ✅ Already Updated

- [x] `/app/api/notes/handlers/createNote.ts`

### ⚠️ Need to Update

- [ ] `/app/api/pdfs/upload/route.ts`
- [ ] `/app/api/highlights/handlers/createHighlight.ts`
- [ ] `/app/api/folders/handlers/createFolder.ts`
- [ ] `/app/api/summaries/handlers/*`
- [ ] Any other handlers that insert data

## Common Mistakes

1. **Forgetting to include `user_id` in INSERT**

   - Error: `new row violates row-level security policy`
   - Fix: Add `user_id: user.id` to the insert

2. **Not checking authentication**

   - Error: Unauthorized users can access data
   - Fix: Always call `getUser()` and check for errors

3. **Using wrong user ID**
   - Old: `userId` from Clerk
   - New: `user.id` from Supabase Auth

## RLS Policies

Your RLS policies should look like this:

```sql
-- For SELECT
CREATE POLICY "Users can only view their own data" ON table_name
  FOR SELECT
  USING (user_id = auth.uid()::text);

-- For INSERT
CREATE POLICY "Users can only create their own data" ON table_name
  FOR INSERT
  WITH CHECK (user_id = auth.uid()::text);

-- For UPDATE
CREATE POLICY "Users can only update their own data" ON table_name
  FOR UPDATE
  USING (user_id = auth.uid()::text)
  WITH CHECK (user_id = auth.uid()::text);

-- For DELETE
CREATE POLICY "Users can only delete their own data" ON table_name
  FOR DELETE
  USING (user_id = auth.uid()::text);
```

## Testing

After updating handlers, test:

1. ✅ Create operation works
2. ✅ Read returns only user's data
3. ✅ Update works for user's data
4. ✅ Delete works for user's data
5. ✅ Unauthorized access is blocked
6. ✅ No RLS violations in logs

---

**Remember**: Every INSERT operation must include `user_id: user.id`!
