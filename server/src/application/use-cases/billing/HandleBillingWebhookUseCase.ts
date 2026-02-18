import { FastifyBaseLogger } from "fastify";
import { EventName } from "@paddle/paddle-node-sdk";
import { IPaddleService } from "../../../domain/services/IPaddleService";
import { ISubscriptionRepository } from "../../../domain/repositories/ISubscriptionRepository";
import { IPlanRepository } from "../../../domain/repositories/IPlanRepository";
import { IResourcesRepository } from "../../../domain/repositories/IResourcesRepository";
import { IPlanService } from "../../../domain/services/IPlanService";
import { Subscription } from "../../../domain/entities/Subscription";
import { Resources } from "../../../domain/entities/Resources";
import { randomUUID } from "node:crypto";

export class HandleBillingWebhookUseCase {
  constructor(
    private logger: FastifyBaseLogger,
    private paddleService: IPaddleService,
    private subscriptionRepository: ISubscriptionRepository,
    private planRepository: IPlanRepository,
    private resourcesRepository: IResourcesRepository,
    private planService: IPlanService,
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

    const data = event.data;
    const customData = data.customData;
    const userId = customData?.userId;

    if (!userId && eventType.startsWith("subscription.")) {
      this.logger.error(
        { eventId, eventType },
        "Webhook received without userId in customData",
      );
      // We might want to try finding the user by paddle_customer_id as a fallback
      // but typically userId should always be there if we passed it during checkout.
      return;
    }

    switch (event.eventType) {
      // ──────────────────────────────────────
      // Subscription Events
      // ──────────────────────────────────────

      case EventName.SubscriptionCreated:
      case EventName.SubscriptionUpdated: {
        /**
         * This block synchronizes our local database with Paddle subscription events.
         * It performs four main tasks:
         * 1. Extracts the subscription state and dates from the event.
         * 2. Maps the Paddle Price ID to our internal system Plan.
         * 3. Creates or updates the Subscription record to track billing status.
         * 4. Initializes or refills the user's Resources (AI tokens/storage) based on the plan.
         */

        // 1. Extract core data from the Paddle event
        const paddleSubscriptionId = data.id;
        const paddleCustomerId = data.customerId;
        const status = data.status;
        const currentPeriodEnd = data.currentBillingPeriod?.endsAt
          ? new Date(data.currentBillingPeriod.endsAt)
          : null;

        // 2. Map the Paddle Price ID to our internal Plan ID
        const item = data.items?.[0];
        const priceId = item?.priceId;

        let planId: string | null = null;

        if (priceId) {
          const plan =
            await this.planRepository.getPlanByPaddlePriceId(priceId);
          if (plan) {
            planId = plan.getId();
          } else {
            this.logger.warn(
              { priceId, paddleSubscriptionId },
              "No plan found for Paddle Price ID",
            );
          }
        }

        // 3. Sync the Subscription record (Create or Update)
        let subscription =
          await this.subscriptionRepository.getSubscriptionByUserId(userId);

        if (!subscription) {
          subscription =
            await this.subscriptionRepository.getSubscriptionByPaddleId(
              paddleSubscriptionId,
            );
        }

        if (subscription) {
          // Update existing subscription state
          subscription.setStatus(status);
          subscription.setPlanId(planId);
          subscription.setCurrentPeriodEnd(currentPeriodEnd);
          // Note: you might need to add setPaddleIds if they can change, but usually they don't.
          await this.subscriptionRepository.updateSubscription(subscription);
          this.logger.info(
            { subscriptionId: subscription.getId(), userId },
            "Subscription updated in DB",
          );
        } else {
          // Create new subscription record if it doesn't exist
          subscription = new Subscription(
            randomUUID(),
            userId,
            status,
            paddleCustomerId,
            paddleSubscriptionId,
            planId,
            priceId,
            currentPeriodEnd,
          );
          await this.subscriptionRepository.createSubscription(subscription);
          this.logger.info(
            { subscriptionId: subscription.getId(), userId },
            "Subscription created in DB",
          );
        }

        // 4. Provision or Refill User Resources if the subscription is active
        if (planId && status === "active") {
          const plan = await this.planRepository.getPlanById(planId);
          if (plan) {
            let resources = await this.resourcesRepository.getByUserId(userId);

            if (!resources) {
              // Initialize resources for first-time premium users
              const maxAiTokens = plan.getMaxAiTokens() || 0;
              const maxStorageBytes = plan.getMaxStorageBytes() || 0;

              resources = new Resources(
                userId,
                planId,
                0, // used tokens
                0, // used storage
                0, // used documents
                maxAiTokens,
                maxStorageBytes,
                plan.getMaxDocuments() || 0,
              );
            } else {
              // Reset/Refill resources on renewal or plan change (upgrade/downgrade)
              // This method now correctly preserves storage usage by only resetting AI token usage
              resources.updateFromPlan(plan);
            }

            await this.resourcesRepository.upsert(resources);
            this.logger.info(
              { userId, planId },
              "Resources updated/reset for user",
            );
          }
        }
        break;
      }

      case EventName.SubscriptionPastDue: {
        const paddleSubscriptionId = data.id;
        const subscription =
          await this.subscriptionRepository.getSubscriptionByPaddleId(
            paddleSubscriptionId,
          );

        if (subscription) {
          subscription.setStatus(data.status);
          await this.subscriptionRepository.updateSubscription(subscription);

          // Downgrade resources to Free plan limits immediately on payment failure
          await this.planService.downgradeUserToFreePlan(userId);

          this.logger.info(
            {
              subscriptionId: subscription.getId(),
              status: data.status,
              userId,
            },
            "Subscription marked as past due and resources downgraded",
          );
        }
        break;
      }

      case EventName.SubscriptionCanceled: {
        const paddleSubscriptionId = data.id;
        const subscription =
          await this.subscriptionRepository.getSubscriptionByPaddleId(
            paddleSubscriptionId,
          );

        if (subscription) {
          subscription.setStatus(data.status);
          await this.subscriptionRepository.updateSubscription(subscription);

          // Final downgrade: User is no longer a subscriber
          await this.planService.downgradeUserToFreePlan(userId);

          this.logger.info(
            {
              subscriptionId: subscription.getId(),
              status: data.status,
              userId,
            },
            "Subscription canceled and resources downgraded",
          );
        }
        break;
      }

      // ──────────────────────────────────────
      // Transaction Events
      // ──────────────────────────────────────

      case EventName.TransactionCreated:
      case EventName.TransactionUpdated:
      case EventName.TransactionPaid:
      case EventName.TransactionCompleted:
        // TODO: Implement transaction logging if needed
        this.logger.info(
          { transactionId: data.id, status: data.status },
          "Transaction event received (logging only for now)",
        );
        break;

      default:
        this.logger.warn({ eventType }, "Unhandled Paddle webhook event type");
        break;
    }
  }
}
