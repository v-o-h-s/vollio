import { FastifyRequest, FastifyReply } from "fastify";
import { IEvents } from "@paddle/paddle-node-sdk";
import { HandlePaddleWebhookUseCase } from "../../application/use-cases/billing/HandlePaddleWebhookUseCase";

export class BillingController {
  constructor(private handlePaddleWebhookUseCase: HandlePaddleWebhookUseCase) {}

  /**
   * POST /api/webhooks/paddle
   * Receives webhooks from Paddle
   */
  async handleWebhook(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const rawBody = (request as any).rawBody;
    const signature = request.headers["paddle-signature"] as string;
    await this.handlePaddleWebhookUseCase.execute(rawBody, signature);
    reply.status(200).send({ success: true });
  }
}
