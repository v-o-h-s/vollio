# Clerk to Supabase Auth Migration

## Summary

This document details the complete migration from Clerk authentication to Supabase Auth with Google OAuth.

## Changes Made

### 1. Package Dependencies

**Removed:**

- `@clerk/nextjs` - Uninstalled and removed from package.json

**Added:**

- Already using `@supabase/ssr` and `@supabase/supabase-js`

### 2. Code Changes

#### App Layout (`app/layout.tsx`)

- ✅ Removed `ClerkProvider` wrapper
- ✅ Removed Clerk import

#### Components

**LandingHeader (`components/landing/LandingHeader.tsx`)**

- ✅ Removed Clerk imports (`SignInButton`, `SignedIn`, `SignedOut`, `UserButton`)
- ✅ Replaced with simple Link to `/sign-in`

**FloatingNavigation (`components/navigation/FloatingNavigation.tsx`)**

- ✅ Removed `useUser` and `SignOutButton` from Clerk
- ✅ Implemented Supabase auth with `createClient()`
- ✅ Added `useEffect` to fetch user data
- ✅ Implemented custom sign-out handler with `supabase.auth.signOut()`
- ✅ Updated user metadata access to use Supabase structure

**DashboardSidebar (`components/dashboard-sidebar.tsx`)**

- ✅ Removed `useUser` and `SignOutButton` from Clerk
- ✅ Implemented Supabase auth with `createClient()`
- ✅ Added `useEffect` to fetch user data
- ✅ Implemented custom sign-out handler
- ✅ Updated user metadata access

#### Hooks

**useAIService (`hooks/use-ai-service.ts`)**

- ✅ Removed `useAuth` from Clerk
- ✅ Added `createClient` from Supabase
- ✅ Added `useEffect` import
- ✅ Implemented auth check using Supabase session
- ✅ Updated `isAuthenticated` state management

#### Tests

**supabaseClient.test.ts (`lib/__tests__/supabaseClient.test.ts`)**

- ✅ Removed Clerk mock imports

### 3. Documentation Updates

**README.md**

- ✅ Removed Clerk from tech stack description
- ✅ Updated authentication description to "Supabase Auth with Google OAuth"
- ✅ Removed Clerk prerequisite
- ✅ Removed Clerk environment variables section
- ✅ Updated authentication security section
- ✅ Updated common issues section

**ERROR_HANDLING.md (`docs/ERROR_HANDLING.md`)**

- ✅ Removed Clerk import example
- ✅ Updated authentication example to use Supabase

**Supabase README (`supabase/README.md`)**

- ✅ Removed Clerk integration setup section
- ✅ Removed Clerk environment variables
- ✅ Removed Clerk prerequisite
- ✅ Updated RLS function documentation to use `auth.uid()`
- ✅ Updated RLS policy example

### 4. File Deletions

- ✅ Removed `.clerk/` directory

### 5. Build Artifacts

- ✅ Cleaned `.next/` directory to remove old build artifacts

## Authentication Flow

### Old Flow (Clerk)

1. User clicks sign-in
2. Clerk handles OAuth
3. Clerk creates session
4. JWT token contains user info
5. Middleware reads Clerk session

### New Flow (Supabase)

1. User clicks sign-in → `/sign-in` page
2. Click "Sign in with Google" button
3. Supabase Auth handles OAuth redirect
4. OAuth callback to `/api/auth/v1/callback`
5. Session created via `supabase.auth.exchangeCodeForSession()`
6. Cookies set by Supabase SSR
7. Middleware reads session via `supabase.auth.getUser()`
8. User redirected to `/dashboard/pdfs`

## User Data Access

### Old (Clerk)

```typescript
const { user } = useUser();
const name = user?.fullName;
const email = user?.emailAddresses[0]?.emailAddress;
const avatar = user?.imageUrl;
```

### New (Supabase)

```typescript
const supabase = createClient();
const {
  data: { user },
} = await supabase.auth.getUser();
const name = user?.user_metadata?.full_name;
const email = user?.email;
const avatar = user?.user_metadata?.avatar_url;
```

## Sign Out

### Old (Clerk)

```typescript
<SignOutButton redirectUrl="/">
  <div>Log out</div>
</SignOutButton>
```

### New (Supabase)

```typescript
const handleSignOut = async () => {
  await supabase.auth.signOut();
  router.push("/");
};

<button onClick={handleSignOut}>Log out</button>;
```

## Environment Variables

### Removed

```env
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
CLERK_SECRET_KEY
```

### Required

```env
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
NEXT_PUBLIC_GOOGLE_CLIENT_ID
```

## Testing Checklist

- [ ] Sign in with Google works
- [ ] Session persists after page reload
- [ ] Sign out works correctly
- [ ] Protected routes redirect to sign-in
- [ ] User profile data displays correctly
- [ ] Cross-tab session synchronization works
- [ ] RLS policies enforce user isolation
- [ ] No console errors related to Clerk

## Known Issues

None - migration complete!

## Rollback Plan

If needed, rollback by:

1. `npm install @clerk/nextjs`
2. Restore ClerkProvider in `app/layout.tsx`
3. Git revert all component changes
4. Restore `.env.local` Clerk variables

## Notes

- All Clerk references have been removed from source code
- Documentation has been updated to reflect Supabase Auth
- Build artifacts cleaned to remove old references
- Migration is complete and ready for testing
