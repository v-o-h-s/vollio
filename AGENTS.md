# Vollio Agent Guidelines

## 🚀 Build, Lint, and Test Commands

This project is a TypeScript monorepo using npm workspaces.

### Root Commands
- **Install dependencies:** `npm install`
- **Build all workspaces:** `npm run build`
- **Lint all workspaces:** `npm run lint`
- **Run all tests:** `npm run test`
- **Development (Client & Server):** `npm run dev`

### Workspace-Specific Commands

#### Server (`/server`)
- **Build:** `npm run build --workspace=server`
- **Lint:** `npm run lint --workspace=server`
- **Run all tests:** `npm test --workspace=server`
- **Run single test:** `npx vitest run src/path/to/test.test.ts --workspace=server`
- **Dev mode:** `npm run dev --workspace=server`

#### Client (`/client`)
- **Build:** `npm run build --workspace=client`
- **Lint:** `npm run lint --workspace=client`
- **Run all tests:** `npm test --workspace=client`
- **Run single test:** `npx vitest run path/to/test.test.ts --workspace=client`
- **Dev mode:** `npm run dev --workspace=client`

---

## 🛠 Code Style & Guidelines

### 1. Project Structure (Clean Architecture)
The **Server** follows a Clean Architecture pattern:
- `domain/`: Entities and Repository interfaces. No dependencies.
- `application/`: Use Cases and Application Services.
- `infrastructure/`: Concrete implementations (Repositories, AI Services, Database).
- `interface/`: Routes and Controllers (Fastify).

The **Client** follows a feature-based structure in `client/features/`.

### 2. Naming Conventions
- **Classes/Interfaces:** PascalCase (e.g., `NoteController`, `INoteRepository`).
- **Files:** PascalCase for Classes (e.g., `AuthService.ts`), camelCase for routes/utils (e.g., `note.route.ts`).
- **Variables/Functions:** camelCase.
- **Interfaces:** Prefix with `I` (e.g., `IEmbeddingService`).

### 3. Imports & Types
- **Absolute Imports:** Prefer `@/` paths in the client for clarity.
- **Shared Package:** Use `@vollio/shared` for DTOs and types shared between client and server.
- **Explicit Typing:** Always define return types for functions and use `satisfies` for response objects.
- **Dependencies:** Use constructor injection in the server (managed by Awilix).

### 4. Error Handling
- **Server:** Use custom error classes from `shared/errors/` (e.g., `ValidationError`, `ServerError`).
- **Validation:** Use `ajv` schemas in `shared/validation/` and `preHandler` hooks for request validation.
- **Client:** Use `react-toastify` or `sonner` for user-facing errors.

### 5. Formatting
- **Indentation:** 2 spaces (Client/Shared), 4 spaces (Server - check local file).
- **Quotes:** Double quotes for strings in Client components; Server varies (adhere to local file).
- **Semicolons:** Always use semicolons.

---

## 🤖 AI Agent Best Practices
- **Read Before Write:** Always use `Read` on related files (Controller -> UseCase -> Repository) before modifying logic.
- **Verification:** After any change, run `npm run lint` and relevant tests.
- **Consistency:** If adding a new feature, follow the pattern of existing features (e.g., `document-view` in client).
- **Security:** Never commit secrets. Check `.env.example` if available.
