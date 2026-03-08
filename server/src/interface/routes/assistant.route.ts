import {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyPluginOptions,
} from "fastify";
import fp from "fastify-plugin";
import { AssistantDTO } from "../../shared";
import { AssistantDTOSchema } from "../../shared/validation/aiSchemas";
import { validateBody } from "../../shared/validation/validator";
import { guardResource } from "../../shared/utils/ResourceGuard";
import { AssistantController } from "../controllers/assistant.controller";

import {
  AIRateLimitingDegrees,
  RateLimitingDegrees,
} from "../../shared/utils/rate-limiting";

const assistantRoutesHandler: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
): Promise<void> => {
  fastify.post<{ Body: AssistantDTO }>(
    `${options.prefix}/`,
    {
      config: {
        rateLimit: {
          request: { cost: RateLimitingDegrees.MEDIUM },
          ai: { cost: AIRateLimitingDegrees.CHAT },
        },
      },
      schema: {
        body: AssistantDTOSchema,
      },
      preHandler: [guardResource("ai"), validateBody(AssistantDTOSchema)],
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
