import {
  Environment,
  LogLevel,
  Paddle,
  IEvents,
} from "@paddle/paddle-node-sdk";
import { FastifyBaseLogger } from "fastify";
import { IPaddleService } from "../../domain/services/IPaddleService";

export interface PaddleConfig {
  apiKey: string;
  webhookSecret: string;
  isProduction: boolean;
}

export class PaddleService implements IPaddleService {
  private paddle: Paddle;
  private webhookSecret: string;

  constructor(
    private logger: FastifyBaseLogger,
    config: PaddleConfig,
  ) {
    this.webhookSecret = config.webhookSecret;
    this.paddle = new Paddle(config.apiKey, {
      environment: config.isProduction
        ? Environment.production
        : Environment.sandbox,
      logLevel: config.isProduction ? LogLevel.error : LogLevel.verbose,
    });
  }

  /**
   * Verifies a webhook signature and returns the parsed event.
   */
  async verifyWebhook(rawBody: string, signature: string): Promise<IEvents> {
    try {
      const event = await this.paddle.webhooks.unmarshal(
        rawBody,
        this.webhookSecret,
        signature,
      );
      return event as any;
    } catch (error) {
      this.logger.error({ error }, "Paddle Signature Verification Failed");
      throw error;
    }
  }

  /**
   * Get the underlying SDK instance if needed for specific calls
   */
  getSDK(): Paddle {
    return this.paddle;
  }
}
