# Vollio Agent Guidelines (AGENTS.md)

Welcome, AI coding agent! You are operating in the **Vollio** monorepo. This document contains essential instructions, conventions, and architectural details required to work effectively in this codebase. Your primary goal is to safely and efficiently write high-quality code that conforms to the existing standards.

## 📁 Repository Structure
Vollio is an npm workspaces monorepo containing two main packages:
- **`/client`**: Frontend application using Next.js 15+ (App Router), React 19, Tailwind CSS v4, Shadcn UI, and Vitest.
- **`/server`**: Backend API using Fastify, TypeScript, Awilix (Dependency Injection), Redis, Supabase, and Vitest.

---

## 🛠 Build, Lint, and Test Commands

### Running Development Servers
From the repository root `/home/gyro/Documents/Projects/vollio`:
- **Start both**: `npm run dev`
- **Client only**: `npm run client:dev`
- **Server only**: `npm run server:dev`

### Building
- **Full Build**: `npm run build`
- **Client**: `npm run client:build`
- **Server**: `npm run server:build`

### Linting & Formatting
- **Lint all**: `npm run lint`
- Rely on standard Next.js ESLint rules in the client (`eslint.config.mjs`). Do not disable lint rules unless strictly necessary.

### Testing (Vitest)
Both client and server use Vitest for testing.
- **Run all tests**: `npm test`
- **Run client tests**: `cd client && npm test`
- **Run server tests**: `cd server && npm test`

**🚨 CRITICAL: Running a Single Test 🚨**
To verify your work quickly without running the entire suite, use Vitest directly on the specific file. This is mandatory for iterative agentic development:

```bash
# In the client workspace
cd /home/gyro/Documents/Projects/vollio/client
npx vitest run path/to/your.test.ts

# In the server workspace
cd /home/gyro/Documents/Projects/vollio/server
npx vitest run path/to/your.test.ts
```
*(Always use `npx vitest run <file>` to execute a single test in isolation to save time and token context.)*

---

## 📝 Code Style & Formatting Guidelines

### 1. File Structure and Architecture
- **Client (`/client/app`)**: Use the Next.js App Router paradigm (`page.tsx`, `layout.tsx`, `route.ts`).
- **Client Components (`/client/components`)**: Group by domain or UI function. Use Shadcn UI for base components.
- **Server (`/server/src`)**: Follow Fastify plugin architecture. Use Awilix for Dependency Injection. Route handlers should remain lean, delegating business logic to independent service classes.

### 2. Imports and Exports
- Use **named exports** preferentially (except for Next.js App Router mandatory default exports like `page.tsx` or `layout.tsx`).
- Keep imports ordered logically:
  1. React/Next.js/Node built-ins
  2. Third-party libraries (e.g., `lodash`, `@supabase/supabase-js`)
  3. Internal aliases or relative paths
- Avoid circular dependencies, especially in the Awilix DI setup on the server.

### 3. Types and Interfaces
- **Strict TypeScript**: Always define explicit interfaces/types for props, state, API requests, and API responses.
- Avoid `any`. Use `unknown` if you must bypass type checking temporarily, and narrow types with type guards.
- Suffix types specifically where appropriate (e.g., `UserDTO`, `FetchNotesResponse`, `ButtonProps`).
- In the client, leverage Zod (`zod`) for schema validation of API responses and form inputs.

### 4. Naming Conventions
- **Files/Directories**: 
  - `kebab-case` for standard files/directories (`user-profile.tsx`, `auth-service.ts`).
  - Next.js reserved files remain lowercase (`page.tsx`, `layout.tsx`).
- **Variables/Functions**: `camelCase` (`fetchUserData`, `isLoaded`).
- **Components/Classes**: `PascalCase` (`UserProfile`, `AuthService`).
- **Constants**: `UPPER_SNAKE_CASE` (`MAX_RETRY_COUNT`, `DEFAULT_PAGINATION_LIMIT`).
- **Booleans**: Prefix with `is`, `has`, `should`, or `can` (`isVisible`, `hasError`).

### 5. Error Handling
- **Client**:
  - Do not silently swallow errors.
  - Display user-friendly error messages using `sonner` or `react-toastify`.
  - Use `try/catch` for async operations and check `response.ok` for `fetch` calls.
- **Server**:
  - Throw appropriately typed Fastify errors or standard `Error` classes.
  - Return proper HTTP status codes (400 for bad input, 401/403 for auth, 404 for missing, 500 for internal server error).
  - Use Sentry (`@sentry/node`) for tracking unhandled exceptions if configured.

### 6. React & UI Conventions (Client)
- **Hooks**: Keep components functional and use hooks. Create custom hooks for complex reusable logic and place them in `/client/hooks/`.
- **Tailwind CSS**: Use utility classes inline. Do not extract to arbitrary CSS files unless strictly necessary (e.g., complex animations).
- **Server/Client Components**: By default, components in the `app` directory are Server Components. Use the `"use client"` directive at the very top of the file *only* when you need React state, effects, event listeners, or browser APIs.

### 7. Fastify & Backend Conventions (Server)
- **Dependency Injection**: Always inject services via Awilix. Do not instantiate services manually or use global state.
- **Validation**: Use Fastify's built-in schema validation (using Ajv/TypeBox) for all incoming routes and requests.

---

## 🤖 AI Agent Specific Instructions
1. **Never guess the schema**: Always use the `read` or `glob` tools to inspect existing types, Awilix containers, or Supabase tables before implementing features.
2. **Test before committing**: Write or update tests alongside your code. ALWAYS execute tests (using the single-file method) before concluding the task.
3. **Paths**: Always use absolute paths when utilizing tools like `read`, `write`, or `edit`. Example: `/home/gyro/Documents/Projects/vollio/client/app/page.tsx`.
4. **Be Proactive**: If a user asks to implement a feature, consider related adjustments (like updating a matching interface, modifying mock data in tests, or exporting the new component in an `index.ts`).
5. **No Chitchat**: Write code, run tests, and complete the task autonomously. Avoid long prose unless explaining a complex architectural decision.