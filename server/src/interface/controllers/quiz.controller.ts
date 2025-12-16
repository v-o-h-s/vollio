import { FastifyReply, FastifyRequest } from "fastify";
import { CreateQuizDTO } from "../../shared/validation/quizSchemas";

export class QuizController {

    constructor() { }
    async createQuiz(
        request: FastifyRequest<{ Body: CreateQuizDTO }>,
        reply: FastifyReply
    ): Promise<void> {

    }
}