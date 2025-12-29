import {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyPluginOptions,
} from "fastify";
import fp from "fastify-plugin";
import {
  ExplainTextDTO,
  AssistantDTO,
  GenerateSummaryDTO,
} from "@vollio/shared";
import {
  ExplainTextDTOSchema,
  AssistantDTOSchema,
  GenerateSummaryDTOSchema,
} from "../../shared/validation/aiSchemas";
import { validateBody } from "../../shared/validation/validator";

const aiRoutesHandler: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  options: FastifyPluginOptions
): Promise<void> => {
  fastify.post<{ Body: ExplainTextDTO }>(
    `${options.prefix}/explain`,
    {
      schema: {
        
        
        body: ExplainTextDTOSchema,
        
      },
      preHandler: validateBody(ExplainTextDTOSchema),
    },
    async (request, reply) => {
      const aiController = request.diScope.resolve("aiController");
      return aiController.explainText(request, reply);
    }
  );

  fastify.post<{ Body: AssistantDTO }>(
    `${options.prefix}/assistant`,
    {
      schema: {
        
        
        body: AssistantDTOSchema,
        
      },
      preHandler: validateBody(AssistantDTOSchema),
    },
    async (request, reply) => {
      const aiController = request.diScope.resolve("aiController");
      return aiController.assistantChat(request, reply);
    }
  );

  fastify.post<{ Body: GenerateSummaryDTO }>(
    `${options.prefix}/generate-summary`,
    {
      schema: {
        
        
        body: GenerateSummaryDTOSchema,
      },
      preHandler: validateBody(GenerateSummaryDTOSchema),
    },
    async (request, reply) => {
      const aiController = request.diScope.resolve("aiController");
      return aiController.generateSummary(request, reply);
    }
  );
};

export const aiRoutes = fp(aiRoutesHandler, {
  name: "ai-routes",
  fastify: "5.x",
});
