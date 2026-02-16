import { FastifyBaseLogger } from "fastify";
import { EventName } from "@paddle/paddle-node-sdk";
import { IPaddleService } from "../../../domain/services/IPaddleService";

export class HandleBillingWebhookUseCase {
  constructor(
    private logger: FastifyBaseLogger,
    private paddleService: IPaddleService,
  ) {}

  async execute(rawBody: string, signature: string): Promise<void> {
    let event: any;

    // The Service now handles the verification and parsing
    event = await this.paddleService.verifyWebhook(rawBody, signature);

    const eventType = event.eventType;
    const eventId = event.eventId;

    this.logger.info(
      { eventType, eventId, occurredAt: event.occurredAt, provider: "paddle" },
      "Received Verified Billing Webhook",
    );

    switch (event.eventType) {
      // ──────────────────────────────────────
      // Subscription Events
      // ──────────────────────────────────────

      case EventName.SubscriptionCreated:
        // Fired when a user completes checkout for a subscription.
        // → Create subscription record in DB, set user tier to "pro".
        this.logger.info(
          {
            subscriptionId: event.data.id,
            customerId: event.data.customerId,
          },
          "Subscription created",
        );
        // TODO: create subscription in DB
        break;

      case EventName.SubscriptionUpdated:
        // Fired on any subscription change: renewal dates bumped,
        // plan changed, paused, resumed, etc.
        // → Update subscription record (dates, status, plan).
        this.logger.info(
          { subscriptionId: event.data.id, status: event.data.status },
          "Subscription updated",
        );
        // TODO: update subscription in DB
        break;

      case EventName.SubscriptionPastDue:
        // Fired when a monthly renewal payment fails.
        // → Flag user, show warning, optionally give a grace period.
        this.logger.warn(
          {
            subscriptionId: event.data.id,
            customerId: event.data.customerId,
          },
          "Subscription past due",
        );
        // TODO: mark subscription as past_due, notify user
        break;

      case EventName.SubscriptionCanceled:
        // Fired when the subscription ends (user or merchant canceled).
        // → Set user back to "free" tier, revoke pro access.
        this.logger.info(
          {
            subscriptionId: event.data.id,
            customerId: event.data.customerId,
          },
          "Subscription canceled",
        );
        // TODO: update user tier to free, deactivate subscription
        break;

      // ──────────────────────────────────────
      // Transaction Events
      // ──────────────────────────────────────

      case EventName.TransactionCreated:
        // Fired when a new transaction is generated (checkout or renewal).
        // → Create a transaction/invoice record in your DB.
        this.logger.info(
          { transactionId: event.data.id, status: event.data.status },
          "Transaction created",
        );
        // TODO: store transaction record
        break;

      case EventName.TransactionUpdated:
        // Fired when a transaction status changes (draft → ready → paid).
        // → Update the transaction record status.
        this.logger.info(
          { transactionId: event.data.id, status: event.data.status },
          "Transaction updated",
        );
        // TODO: update transaction status in DB
        break;

      case EventName.TransactionPaid:
        // Fired when payment is successfully collected (initial AND renewals).
        // → Extend current_period_end, log the payment, confirm access.
        this.logger.info({ transactionId: event.data.id }, "Transaction paid");
        // TODO: extend subscription period, record payment
        break;

      case EventName.TransactionCompleted:
        // Fired when a transaction is fully processed and finalized.
        // → Mark the transaction as complete in your records.
        this.logger.info(
          { transactionId: event.data.id },
          "Transaction completed",
        );
        // TODO: finalize transaction record
        break;

      default:
        this.logger.warn({ eventType }, "Unhandled Paddle webhook event type");
        break;
    }
  }
}
