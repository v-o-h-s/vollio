import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyPluginAsync,
} from "fastify";
import fp from "fastify-plugin";
import { BillingController } from "../controllers/billing.controller";

const billingRoutesHandler: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
): Promise<void> => {
  fastify.post(`${options.prefix}/webhook`, async (request, reply) => {
    const billingController =
      request.diScope.resolve<BillingController>("billingController");
    return billingController.handleWebhook(request, reply);
  });
};

export const billingRoutes = fp(billingRoutesHandler, {
  name: "billing-routes",
  fastify: "5.x",
});
