import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions } from "fastify";
import { CreateQuizDTO, createQuizSchema } from "../../shared/validation/quizSchemas";
import { validateBody } from "../../shared/validation/validator";
import fp from "fastify-plugin";
const quizHandler: FastifyPluginAsync = async (
    fastify: FastifyInstance,
    opts: FastifyPluginOptions
): Promise<void> => {
    fastify.post<{ Body: CreateQuizDTO }>(
        `${opts.prefix}/`,
        {
            preHandler: validateBody(createQuizSchema),
        },
        async (request, reply) => {
            const quizController = request.diScope.resolve("quizController");
            return quizController.createQuiz(request, reply);
        }
    );
};

export const quizRoutes = fp(quizHandler, {
    name: "quiz-routes",
    fastify: "5.x",
});

