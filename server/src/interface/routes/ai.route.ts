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
        tags: ["AI"],
        summary: "Explain selected text using AI",
        body: ExplainTextDTOSchema,
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              data: {
                type: "object",
                properties: {
                  title: { type: "string" },
                  content: { type: "object", additionalProperties: true },
                },
              },
              error: { type: "object", nullable: true },
            },
          },
        },
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
        tags: ["AI"],
        summary: "Chat with AI Assistant",
        body: AssistantDTOSchema,
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              data: {
                type: "object",
                properties: {
                  content: { type: "object", additionalProperties: true },
                },
              },
              error: { type: "object", nullable: true },
            },
          },
        },
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
        tags: ["AI"],
        summary: "Generate AI Summary for a document",
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
