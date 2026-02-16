import { IEvents, Paddle } from "@paddle/paddle-node-sdk";

export interface IPaddleService {
  /**
   * Verifies a webhook signature and returns the parsed event.
   * @param rawBody The raw request body as string
   * @param signature The paddle-signature header value
   */
  verifyWebhook(rawBody: string, signature: string): Promise<IEvents>;

  /**
   * Returns the underlying Paddle SDK instance.
   */
  getSDK(): Paddle;
}
