# Paddle Billing Integration

This document outlines the architecture and implementation details of the Paddle Billing integration within the Vollio backend.

## Architecture

The billing system follows the project's **Clean Architecture** principles:

1.  **Infrastructure Layer**:
    - `src/infrastructure/services/PaddleService.ts` implements the `IPaddleService` and handles the raw SDK calls.
    - The service is registered as a singleton in `src/plugins/container.ts`.
2.  **Interface Layer**:
    - `src/interface/routes/billing.route.ts` defines the billing endpoints.
    - `src/interface/controllers/billing.controller.ts` handles the incoming HTTP requests.
3.  **Application Layer**:
    - `src/domain/services/IPaddleService.ts` defines the contract for billing operations.
    - `src/application/use-cases/billing/HandleBillingWebhookUseCase.ts` contains the core logic for processing billing notifications.

## Webhook Security

To ensure security, all incoming webhooks are verified using the Paddle SDK's signature verification:

1.  **Raw Body Capture**: The `fastify-raw-body` plugin is configured in `src/server.ts` to capture the raw request body specifically for the `/api/v1/billing/webhook` route.
2.  **Signature Verification**: The `HandleBillingWebhookUseCase` calls `paddleService.verifyWebhook(rawBody, signature)` which uses the SDK's `unmarshal` method to verify the `paddle-signature` header against our `PADDLE_WEBHOOK_SECRET`.

## Handled Webhook Events

We currently handle the following Paddle events to manage the subscription lifecycle and payment history:

| Event Name              | Description                                               | Internal Action                                            |
| :---------------------- | :-------------------------------------------------------- | :--------------------------------------------------------- |
| `subscription.created`  | Fired when a user completes checkout.                     | Create subscription record in DB, set user tier to "pro".  |
| `subscription.updated`  | Fired on any change (renewal, plan change, pause/resume). | Update subscription dates, status, and plan in DB.         |
| `subscription.past_due` | Fired when a renewal payment fails.                       | Mark subscription as past due, notify user (grace period). |
| `subscription.canceled` | Fired when the subscription ends.                         | Revoke pro access, set user back to "free" tier.           |
| `transaction.created`   | Fired when a new transaction is generated.                | Create a transaction/invoice record in DB.                 |
| `transaction.updated`   | Fired when a transaction status changes.                  | Update the transaction record status in DB.                |
| `transaction.paid`      | Fired when payment is successfully collected.             | Extend current period end, record the payment.             |
| `transaction.completed` | Fired when a transaction is fully processed.              | Finalize transaction record in DB.                         |

## Environment Variables

The following environment variables are required:

- `PADDLE_API_KEY`: Your Paddle API key (Sandbox or Production).
- `PADDLE_WEBHOOK_SECRET`: The secret key for your notification destination in the Paddle Dashboard.

## Data Schema

We maintain two primary tables for billing:

- `plans`: Stores the available subscription tiers and their corresponding Paddle Price IDs.
- `transactions`: Stores a history of all payments and status changes for auditing and invoices.
- `subscriptions`: (Modified) Linked to a specific plan and stores current status and period end.
