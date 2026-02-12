import {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyPluginOptions,
} from "fastify";
import fp from "fastify-plugin";
import { AssistantDTO } from "@vollio/shared";
import { AssistantDTOSchema } from "../../shared/validation/aiSchemas";
import { validateBody } from "../../shared/validation/validator";
import { AssistantController } from "../controllers/assistant.controller";
import { RateLimitingDegrees } from "../../shared/utils/rate-limiting";

const assistantRoutesHandler: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
): Promise<void> => {
  fastify.post<{ Body: AssistantDTO }>(
    `${options.prefix}/`,
    {
      config: {
        rateLimit: { cost: RateLimitingDegrees.MEDIUM },
      },
      schema: {
        body: AssistantDTOSchema,
      },
      preHandler: validateBody(AssistantDTOSchema),
    },
    async (request, reply) => {
      const assistantController = request.diScope.resolve<AssistantController>(
        "assistantController",
      );
      return assistantController.assistantChat(request, reply);
    },
  );
};

export const assistantRoutes = fp(assistantRoutesHandler, {
  name: "assistant-routes",
  fastify: "5.x",
});
