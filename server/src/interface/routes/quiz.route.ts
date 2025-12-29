import {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyPluginOptions,
} from "fastify";
import {
  CreateQuizDTO,
  createQuizSchema,
  quizIdParamsSchema,
} from "../../shared/validation/quizSchemas";
import {
  validateBody,
  validateParams,
} from "../../shared/validation/validator";
import fp from "fastify-plugin";
const quizHandler: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
): Promise<void> => {
  fastify.post<{ Body: CreateQuizDTO }>(
    `${opts.prefix}`,
    {
      schema: {
        tags: ["Quizzes"],
        summary: "Create a new quiz",
        body: createQuizSchema,
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              data: { type: "object", additionalProperties: true },
              error: { type: "object", nullable: true },
            },
          },
        },
      },
      preHandler: validateBody(createQuizSchema),
    },
    async (request, reply) => {
      const quizController = request.diScope.resolve("quizController");
      return quizController.createQuiz(request, reply);
    }
  );

  fastify.get<{ Params: { id: string } }>(
    `${opts.prefix}/:id`,
    {
      schema: {
        tags: ["Quizzes"],
        summary: "Get quiz by ID",
        params: quizIdParamsSchema,
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              data: { type: "object", additionalProperties: true },
              error: { type: "object", nullable: true },
            },
          },
        },
      },
      preHandler: validateParams(quizIdParamsSchema),
    },
    async (request, reply) => {
      const quizController = request.diScope.resolve("quizController");
      return quizController.getQuizById(request, reply);
    }
  );

  fastify.delete<{ Params: { id: string } }>(
    `${opts.prefix}/:id`,
    {
      schema: {
        tags: ["Quizzes"],
        summary: "Delete quiz by ID",
        params: quizIdParamsSchema,
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              data: { type: "null" },
              error: { type: "object", nullable: true },
            },
          },
        },
      },
      preHandler: validateParams(quizIdParamsSchema),
    },
    async (request, reply) => {
      const quizController = request.diScope.resolve("quizController");
      return quizController.deleteQuizById(request, reply);
    }
  );

  fastify.get(
    `${opts.prefix}`,
    {
      schema: {
        tags: ["Quizzes"],
        summary: "Get all user quizzes",
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              data: {
                type: "array",
                items: { type: "object", additionalProperties: true },
              },
              error: { type: "object", nullable: true },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const quizController = request.diScope.resolve("quizController");
      return quizController.getAllQuizzes(request, reply);
    }
  );
};

export const quizRoutes = fp(quizHandler, {
  name: "quiz-routes",
  fastify: "5.x",
});
