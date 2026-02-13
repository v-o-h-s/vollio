# AI Token Quota System

This document details the specialized Rate Limiting system for AI-driven features in Vollio. Unlike standard API rate limiting (requests/min), this system manages **LLM Token Consumption** to control costs and ensure fair usage.

## 1. Core Principles

The AI Quota system is built on three key principles:

1.  **Token-based Accounting**: Usage is measured in Model Tokens (Input + Output), aligning with provider billing (OpenAI, Anthropic, etc.).
2.  **Multi-Tiered Buckets**: Usage is throttled across different time horizons (Minute, Day, Month).
3.  **Force Consumption**: Ensures accurate billing even if requests exceed estimates or race conditions occur.

---

## 2. Bucket Architecture

Every user has three concurrent token buckets. A request is only allowed if **ALL** buckets have sufficient tokens.

| Bucket      | Purpose          | Policy               | Default Capacity | Refill Rate       |
| :---------- | :--------------- | :------------------- | :--------------- | :---------------- |
| **Monthly** | Main Budget      | Hard Cap (Fail Fast) | 10,000,000       | ~3.8 tokens/sec   |
| **Daily**   | Fair Usage       | Pacing               | 1,000,000        | ~11.5 tokens/sec  |
| **Minute**  | Abuse Protection | Burst Limit          | 100,000          | ~1,666 tokens/sec |

_Note: Capacities are configurable via environment variables (`MAX_AI_TOKENS_PER_...`)._

---

## 3. The "Force Consumption" Workflow

AI operations have variable costs that are only known _after_ execution (output tokens). To handle this safely, we use a two-phase process:

### Phase 1: Pre-Flight Check (The Guard)

- **Location**: `rateLimiterPlugin` (Fastify Middleware)
- **Trigger**: Before request processing.
- **Logic**:
  1.  **Estimate Cost**: Based on endpoint type (e.g., Chat = 5000, Summary = 50,000).
  2.  **Check Balance**: Verify user has enough tokens in Month, Day, AND Minute buckets.
  3.  **Decision**:
      - If `Balance < Estimate`: **Block Request** (429 Too Many Requests).
      - If `Balance >= Estimate`: **Allow Request**.

### Phase 2: Execution & Billing (The Accountant)

- **Location**: `AiQuotaService.ts` (Domain Service)
- **Trigger**: After AI generation completes.
- **Logic**:
  1.  **Calculate Actual Cost**: `Input Tokens + (Output Tokens * Ratio)`.
  2.  **Force Deduct**: Call Redis with `force=true`.
  3.  **Update Balance**: Tokens are removed from Month, Day, and Minute buckets.
  4.  **Negative Balance**: If a user runs out during generation, their balance goes specific negative (debt). Subsequent requests will be blocked by Phase 1 until the debt is paid off by refill.

---

## 4. Cost Estimates

These estimates are used for the **Pre-Flight Check**.

| Operation            | Estimated Cost | Description                                |
| :------------------- | :------------- | :----------------------------------------- |
| **Chat / Assistant** | 5,000 Tokens   | Single turn conversation.                  |
| **Flashcards**       | 50,000 Tokens  | Generating 10-20 cards from a document.    |
| **Quizzes**          | 50,000 Tokens  | Generating 5-10 questions from a document. |
| **Summary**          | 50,000 Tokens  | Summarizing a long document.               |
| **Standard API**     | 1,000 Tokens   | Fallback for unknown AI routes.            |

---

## 5. Headers & Client Integration

The server sends the following headers with every authenticated AI request, allowing the frontend to display accurate quotas:

- `X-AI-Remaining-Month`: Remaining monthly budget.
- `X-AI-Remaining-Day`: Remaining daily allowance.
- `X-AI-Remaining-Minute`: Remaining burst capacity.

**Example Usage**:

> "You have used 80% of your daily AI limit."

---

## 6. Error Handling

When the AI Quota is exceeded, the server returns a `429 Too Many Requests` status with a specific error body:

```json
{
  "statusCode": 429,
  "error": "Too Many Requests",
  "message": "Monthly AI quota reached.",
  "retryAfter": 3600 // Seconds until sufficient refill
}
```
