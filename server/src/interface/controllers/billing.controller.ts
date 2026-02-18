import { FastifyRequest, FastifyReply } from "fastify";
import { HandleBillingWebhookUseCase } from "../../application/use-cases/billing/HandleBillingWebhookUseCase";

export class BillingController {
  constructor(
    private handleBillingWebhookUseCase: HandleBillingWebhookUseCase,
  ) {}

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
    await this.handleBillingWebhookUseCase.execute(rawBody, signature);
    reply.status(200).send({ success: true });
  }
}
