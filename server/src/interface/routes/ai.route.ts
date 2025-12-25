import {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyPluginOptions,
} from "fastify";
import fp from "fastify-plugin";
import { ExplainTextDTO } from "@vollio/shared";
import { ExplainTextDTOSchema } from "../../shared/validation/aiSchemas";
import { validateBody } from "../../shared/validation/validator";

const aiRoutesHandler: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  options: FastifyPluginOptions
): Promise<void> => {
  fastify.post<{ Body: ExplainTextDTO }>(
    `${options.prefix}/explain`,
    {
      preHandler: validateBody(ExplainTextDTOSchema),
    },
    async (request, reply) => {
      const aiController = request.diScope.resolve("aiController");
      return aiController.explainText(request, reply);
    }
  );
};

export const aiRoutes = fp(aiRoutesHandler, {
  name: "ai-routes",
  fastify: "5.x",
});
