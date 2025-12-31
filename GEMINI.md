# GEMINI.md - Project Context

## Project Overview
**Name:** Vollio (Monorepo)
**Description:** A full-stack note-taking application designed for modern needs, featuring rich text editing, PDF support, and AI capabilities.

## Architecture
The project is a **monorepo** managed by npm workspaces, consisting of:
*   **Client (`client/`):** A Next.js application handling the user interface.
*   **Server (`server/`):** A Fastify Node.js server handling API requests, authentication, and AI processing.
*   **Shared (`packages/shared/`):** Shared utilities and types (inferred from structure).

## Getting Started

### Prerequisites
*   Node.js (>= 18.0.0 recommended)
*   npm (>= 9.0.0)
*   Supabase instance (for database and auth)

### Installation
Install dependencies for all workspaces from the root directory:
```bash
npm install
```

### Running Development Server
Start both the client and server concurrently:
```bash
npm run dev
```
*   **Frontend:** `http://localhost:3000` (typically, or check console output)
*   **Backend:** `http://localhost:4000` (or configured port)

## Key Commands

| Action | Command (Root) | Description |
| :--- | :--- | :--- |
| **Install** | `npm install` | Install all dependencies. |
| **Dev (All)** | `npm run dev` | Start client and server in dev mode. |
| **Build (All)** | `npm run build` | Build both projects. |
| **Test (All)** | `npm test` | Run tests for all workspaces. |
| **Lint** | `npm run lint` | Lint code across workspaces. |

### Workspace Specific
You can run commands for specific workspaces using the `-w` or `--workspace` flag, or by navigating to the directory.

**Client:**
*   `npm run dev --workspace=client`
*   `npm run test --workspace=client` (Uses Vitest)

**Server:**
*   `npm run dev --workspace=server`
*   `npm run build --workspace=server`

## Project Structure

*   **`client/`**: Next.js 16 App Router application.
    *   `app/`: App router pages and layouts.
    *   `components/`: React components (UI, Editor, Dashboard, etc.).
    *   `docs/`: Frontend-specific documentation (Architecture, UI Style, Notes System, etc.).
    *   `lib/`: Utility functions and types.
    *   `hooks/`: Custom React hooks.
*   **`server/`**: Fastify backend implementing **Clean Architecture**.
    *   `src/`: Main source code directory (Domain, Application, Interface, Infrastructure).
    *   `docs/`: Backend-specific documentation including:
        *   `api_endpoints/`: Detailed summaries of available API endpoints.
        *   `AUTH.md`, `QUIZ.md`, `EMBEDDING.md`: Feature-specific logic and implementation details.
        *   `RULES.md`: Backend coding standards and architectural rules.
    *   `src/domain/`: Core business entities, repository interfaces, and domain services.
    *   `src/application/`: Use cases implementing business logic and application services.
    *   `src/interface/`: API entry points, including Fastify routes and controllers.
    *   `src/infrastructure/`: Concrete implementations of repositories (Supabase), AI services, and external integrations.
    *   `src/plugins/`: Fastify plugins for Dependency Injection (Awilix), Auth, and more.
    *   `src/shared/`: Common utilities, constants, and global error handlers.
*   **`.agent/rules/`**: Specific project rules for AI agents.

## Development Standards

### Technology Stack
*   **Language:** TypeScript
*   **Frontend:** Next.js (App Router), Tailwind CSS, Redux Toolkit, Radix UI, TipTap (Editor).
*   **Backend:** Fastify, Awilix (Dependency Injection), Supabase (Database & Auth).
*   **AI:** OpenRouter, HuggingFace, VoyageAI (Embeddings).
*   **Testing:** Vitest.

### Architectural Principles (Backend)
1.  **Dependency Rule:** Dependencies only point inwards. Domain and Application layers are independent of Infrastructure.
2.  **Dependency Injection:** All services and repositories are managed by Awilix and injected into controllers/use-cases.
3.  **Encapsulation:** Use-cases encapsulate a single business action.

### Coding Rules (from `.agent/rules`)
1.  **Type Consistency:** Ensure type changes (Entity, DTO, Server Response) maintain compatibility across the application.

## Configuration
*   **Environment Variables:**
    *   Backend: `.env` (requires `SUPABASE_URL`, `SUPABASE_KEY`, etc.)
    *   Frontend: `.env.local` (requires `NEXT_PUBLIC_SUPABASE_URL`, etc.)
