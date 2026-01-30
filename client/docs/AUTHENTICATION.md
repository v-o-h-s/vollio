# Authentication Workflow

## Overview

Vollio uses **Supabase Authentication** integrated with **Next.js App Router**. The authentication system relies on server-side rendering (SSR) best practices, using HTTP-only cookies to manage sessions securely across the client and server.

## Architecture

The authentication flow involves several key components handling the lifecycle of a user session:

### 1. Supabase Clients (`client/lib/supabase/`)

We use `@supabase/ssr` to handle cookie-based authentication.

- **`client.ts`**: Creates a browser client for client-side components using `createBrowserClient`.
- **`server.ts`**: Creates a server client for Server Components, Actions, and Route Handlers using `createServerClient`. It reads cookies directly from the request.
- **`proxy.ts`**: A specialized client for Middleware. It handles the reading and writing of cookies to manage session refreshing.

### 2. Sign In (`client/app/sign-in/page.tsx`)

The interaction starts here.

- The user clicks "Continue with Google".
- The app calls `supabase.auth.signInWithOAuth`.
- **Critical Detail**: The `redirectTo` URL is dynamically generated using `window.location.origin` to support both local development (`localhost`) and production (`vollio.xyz`) without code changes.
  ```typescript
  const redirectUrl = `${window.location.origin}/api/auth/v1/callback?next=/documents`;
  ```

### 3. Callback Handler (`client/app/api/auth/v1/callback/route.ts`)

This API route is the destination where Supabase redirects the user after a successful login.

- **Input**: query parameters `code` (auth code) and `next` (destination).
- **Process**:
  1.  Exchanges the `code` for a Supabase session using `exchangeCodeForSession(code)`.
  2.  This automatically sets `sb-access-token` and `sb-refresh-token` cookies.
  3.  Determines the correct redirect URL, creating a seamless transition whether on `localhost` or behind a production load balancer.
- **Output**: Redirects the user to the `next` path (default: `/documents`).

### 4. Middleware Session Management

The middleware ensures the user's session remains active.

- It calls `updateSession` (from `lib/supabase/proxy.ts`) on every request.
- **Why?** Supabase tokens expire. The middleware checks the token validity and refreshes it if necessary by updating the cookies. This prevents the user from being randomly logged out while browsing.
- If no user is found for protected routes, it redirects to `/sign-in`.

## The detailed Workflow

1.  **User Action**: User visits `/sign-in` and clicks "Google Login".
2.  **Redirect**: User is taken to Google's consent screen.
3.  **Callback**: Google sends user back to Supabase, which redirects to our `/api/auth/v1/callback`.
4.  **Token Exchange (Server-Side)**:
    - The server receives the `code`.
    - It talks to Supabase to get the Session.
    - Cookies are set on the response headers.
5.  **Final Redirect**: User lands on `/documents` with valid cookies.
6.  **Subsequent Requests**:
    - Browser sends cookies with every request.
    - Middleware refreshes tokens if needed.
    - `apiSlice` (RTK Query) includes these cookies (`credentials: 'include'`) when talking to the backend.
    - The Backend (Fastify) validates these tokens to allow access to data.

## Environment Handling

The code is designed to be **environment-agnostic**:

- **Localhost**: Uses `localhost:3000` / `localhost:3001`.
- **Production**: Uses `window.location.origin` to detect the actual domain.
- **Supabase**: Requires both Local and Production URLs to be allowed in the Supabase Dashboard under Authentication -> URL Configuration.
