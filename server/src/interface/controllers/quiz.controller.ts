import { FastifyReply, FastifyRequest } from "fastify";
import { CreateQuizDTO } from "../../shared/validation/quizSchemas";
import { CreateQuizResponse } from "../../shared/types/responses/quizRoutes";
import { ResponseFormatter } from "../../shared/utils/ResponseFormatter";
import { CreateGeneralQuizUseCase } from "../../application/use-cases/quizzes/CreateGeneralQuizUseCase";
export class QuizController {
  constructor(private createQuizUseCase: CreateGeneralQuizUseCase) {}
  async createQuiz(
    request: FastifyRequest<{ Body: CreateQuizDTO }>,
    reply: FastifyReply
  ): Promise<void> {
    const data = request.body;
    const quizResponse: CreateQuizResponse =
      await this.createQuizUseCase.execute(data);
    return ResponseFormatter.success(
      reply,
      quizResponse,
      "quiz created successfully"
    );
  }
}
