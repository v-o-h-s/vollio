import { FastifyBaseLogger } from "fastify";
import { EventName } from "@paddle/paddle-node-sdk";
import { IPaddleService } from "../../../domain/services/IPaddleService";
import { ISubscriptionRepository } from "../../../domain/repositories/ISubscriptionRepository";
import { IPlanRepository } from "../../../domain/repositories/IPlanRepository";
import { IResourcesRepository } from "../../../domain/repositories/IResourcesRepository";
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
        const paddleSubscriptionId = data.id;
        const paddleCustomerId = data.customerId;
        const status = data.status;
        const currentPeriodEnd = data.currentBillingPeriod?.endsAt
          ? new Date(data.currentBillingPeriod.endsAt)
          : null;

        // Extract priceId from the first item
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

        // Find existing subscription by userId or paddleSubscriptionId
        let subscription =
          await this.subscriptionRepository.getSubscriptionByUserId(userId);

        if (!subscription) {
          subscription =
            await this.subscriptionRepository.getSubscriptionByPaddleId(
              paddleSubscriptionId,
            );
        }

        if (subscription) {
          // Update existing
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
          // Create new
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

        // ──────────────────────────────────────
        // Resources Logic
        // ──────────────────────────────────────
        if (planId && status === "active") {
          const plan = await this.planRepository.getPlanById(planId);
          if (plan) {
            let resources = await this.resourcesRepository.getByUserId(userId);

            if (!resources) {
              // First time: Initialize with plan limits
              resources = new Resources(
                userId,
                planId,
                plan.getMaxAiTokens() || 0,
                plan.getMaxStorageBytes() || 0,
              );
            } else {
              // Renewal/Upgrade: Update limits using the entity method
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
          this.logger.info(
            { subscriptionId: subscription.getId(), status: data.status },
            "Subscription marked as past due",
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
          this.logger.info(
            { subscriptionId: subscription.getId(), status: data.status },
            "Subscription canceled in DB",
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
