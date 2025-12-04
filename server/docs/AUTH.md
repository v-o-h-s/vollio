# Fastify Authentication Guide

## Overview

The Noto backend implements **JWT-based authentication** using Supabase Auth and Fastify. The authentication flow is stateless and cookie-based, leveraging Supabase's Session tokens stored as HTTP-only cookies.

**Key Principle**: The backend is stateless - it doesn't store user sessions. Instead, it verifies JWT tokens from cookies on every request.

## How It Works - Step by Step

### 1. Frontend sends request with cookies

The frontend makes a request to the backend with authentication cookies:

```
GET /api/notes
Cookie: sb-sgihxxokwpsahogqrlla-auth-token=<JWT_TOKEN>
```

### 2. Backend receives cookies

The FastifyCookie plugin parses incoming cookies and makes them available in `req.cookies`:

```typescript
// In src/server.ts
app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET || "dev-secret",
});
```

**Important**: The `COOKIE_SECRET` is used to verify cookie integrity, not to verify JWT tokens.

### 3. Create Supabase client with cookies

The `createUserClient` function extracts Supabase cookies and creates a Supabase client:

```typescript
// File: src/infrastructure/supabase.ts
export async function createUserClient(req: FastifyRequest) {
    const supabase = createServerClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll: () => {
                    return Object.entries(req.cookies || {})
                        .filter(([name]) => name.startsWith('sb-'))
                        .map(([name, value]) => ({ name, value: value || '' }));
                },
            },
        }
    );

    return { supabase };
}
```

**What this does**:
- Filters for Supabase cookies (names starting with `sb-`)
- Handles split cookies (`.0`, `.1` suffixes) automatically
- Creates a Supabase client configured with these cookies
- Does NOT verify authentication yet - just initializes the client

### 4. Verify JWT token using getClaims()

The auth plugin calls `supabase.auth.getClaims()` to verify the JWT:

```typescript
// File: src/plugins/auth.ts
const { data, error } = await supabase.auth.getClaims()
```

**What `getClaims()` does**:
- Extracts the JWT token from the Supabase client's cookies
- Verifies the JWT signature using Supabase's public key
- Validates expiration, issuer, and other claims
- Returns user claims if valid, error if invalid

**JWT claims contain**:
```json
{
  "sub": "user-id",
  "email": "user@example.com",
  "phone": "1234567890",
  "user_metadata": { /* custom data */ },
  "role": "authenticated"
}
```

### 5. Extract user info and attach to request

If verification succeeds, extract claims and create a User object:

```typescript
if (error || !data || !data.claims) {
    reply.status(401).send({ error: 'Not authenticated' });
    return;
}

const user: User = {
    id: data.claims.sub,              // User's unique ID
    email: data.claims.email,         // User's email
    phone: data.claims.phone,         // User's phone (optional)
    user_metadata: data.claims['user_metadata'],  // Custom metadata
    role: data.claims.role            // Role (usually 'authenticated')
}
req.user = user
```

Now the user is available throughout the request lifecycle via `req.user`.

### 6. Access user in route handlers

Protected routes can now safely use the authenticated user:

```typescript
app.get('/api/notes', async (req: FastifyRequest, reply: FastifyReply) => {
    if (!req.user) {
        return reply.status(401).send({ error: 'Not authenticated' });
    }

    // req.user is now available and verified
    const userId = req.user.id;
    const userEmail = req.user.email;
    // ... fetch user's data
});
```

## Complete Authentication Flow Diagram

```
┌─────────────────────────────────────────────────────────────┐
│ Frontend                                                    │
│ Makes request with cookies: Cookie: sb-auth-token=<JWT>   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Fastify Cookie Plugin (server.ts)                           │
│ Parses cookies from headers → req.cookies                   │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ createUserClient() (infrastructure/supabase.ts)             │
│ • Extracts 'sb-*' cookies                                   │
│ • Creates Supabase client with cookies                      │
│ • Returns { supabase }                                      │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│ Auth Plugin preHandler Hook (plugins/auth.ts)               │
│ • Gets supabase client                                      │
│ • Calls supabase.auth.getClaims()                           │
└────────────────────┬────────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
   ✅ Valid JWT              ❌ Invalid/Missing
        │                         │
        ▼                         ▼
   Extract claims          Return 401 Unauthorized
   Create User object
   Attach to req.user
        │
        ▼
   Request continues to handler
   with authenticated user
```


