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
import { QuizController } from "../controllers/quiz.controller";

const quizHandler: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
): Promise<void> => {
  fastify.post<{ Body: CreateQuizDTO }>(
    `${opts.prefix}`,
    {
      config: {
        rateLimit: { cost: 20, category: "ai" },
      },
      schema: {
        body: createQuizSchema,
      },
      preHandler: validateBody(createQuizSchema),
    },
    async (request, reply) => {
      const quizController = request.diScope.resolve<QuizController>("quizController");
      return quizController.createQuiz(request, reply);
    }
  );
  fastify.get<{ Params: { id: string } }>(
    `${opts.prefix}/:id`,
    {
      schema: {
        params: quizIdParamsSchema,
      },
      preHandler: validateParams(quizIdParamsSchema),
    },
    async (request, reply) => {
      const quizController = request.diScope.resolve<QuizController>("quizController");
      return quizController.getQuizById(request, reply);
    }
  );

  fastify.delete<{ Params: { id: string } }>(
    `${opts.prefix}/:id`,
    {
      schema: {
        params: quizIdParamsSchema,
      },
      preHandler: validateParams(quizIdParamsSchema),
    },
    async (request, reply) => {
      const quizController = request.diScope.resolve<QuizController>("quizController");
      return quizController.deleteQuizById(request, reply);
    }
  );

  fastify.get(
    `${opts.prefix}`,
    {
      schema: {},
    },
    async (request, reply) => {
      const quizController = request.diScope.resolve<QuizController>("quizController");
      return quizController.getAllQuizzes(request, reply);
    }
  );
};

export const quizRoutes = fp(quizHandler, {
  name: "quiz-routes",
  fastify: "5.x",
});
