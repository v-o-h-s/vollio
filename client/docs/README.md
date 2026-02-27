# Vollio Frontend Documentation

This directory contains detailed documentation for the Vollio frontend architecture, features, and standards.

## 📚 Documentation Index

- [Authentication & Security](./AUTHENTICATION.md) - How we handle Supabase Auth & RLS.
- [API & RTK Query](./API_HOOKS.md) - Endpoint definitions and cache management.
- [Notes & Editor](./NOTES_SYSTEM.md) - The Notion-style block editor architecture.
- [UI & Styling](./UI_STYLE.md) - Design tokens, Tailwind configuration, and components.
- [Mathematics](./MATHEMATICS.md) - Coordinate systems and PDF geometry logic.
- [Error Handling & Sentry](./ERROR_HANDLING.md) - Global error strategy and Sentry integration.

---

## 🛡️ Sentry & Error Handling Strategy (Latest)

We use a two-tier "Opaque Error" strategy to balance developer visibility with user security/UX.

### 1. Global Sentry Capture (`apiSlice.ts`)

All API errors are intercepted at the base query level.

- **What is reported:** All `5xx` server errors, network timeouts, and `400` bad requests.
- **What is ignored:** Expected business logic results like `401 Unauthorized`, `403 Quota Exceeded`, `404 Not Found`, and `409 Conflict`.
- **Meta-data:** Every report automatically includes the API path, HTTP method, and the specific RTK endpoint name.

### 2. User-Facing Transformation (`rtk-error-transform.ts`)

Errors are scrubbed before reaching the UI components.

- **Whitelist System**: Only "Safe" error names (e.g., `ValidationError`, `QuotaExceededError`) are allowed to show their raw server message to the user.
- **Blackbox System**: Technical errors (like database crashes) are replaced with a polite generic message: _"An unexpected error occurred. Please try again later."_

This ensures that sensitive server details never leak to the client, while developers still get full diagnostic data in the Sentry dashboard.
