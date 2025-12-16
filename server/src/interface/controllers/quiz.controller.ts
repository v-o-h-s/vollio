import { FastifyReply, FastifyRequest } from "fastify";
import { CreateQuizDTO } from "../../shared/validation/quizSchemas";
import { CreateQuizResponse } from "../../shared/types/responses/quizRoutes";
import { ResponseFormatter } from "../../shared/utils/ResponseFormatter";
export class QuizController {

    constructor() { }
    async createQuiz(
        request: FastifyRequest<{ Body: CreateQuizDTO }>,
        reply: FastifyReply
    ): Promise<void> {
        ResponseFormatter.success(reply, null, "Quiz created successfully");
    }
}