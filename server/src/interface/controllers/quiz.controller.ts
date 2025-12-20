import { FastifyReply, FastifyRequest } from "fastify";
import { CreateQuizDTO } from "../../shared/validation/quizSchemas";
import { CreateQuizResponse } from "../../shared/types/responses/quizRoutes";
import { ResponseFormatter } from "../../shared/utils/ResponseFormatter";
import { CreateGeneralQuizUseCase } from "../../application/use-cases/quizzes/CreateGeneralQuizUseCase";
import { CreateUserPromptQuizUseCase } from "../../application/use-cases/quizzes/CreateUserPromptQuizUseCase";
export class QuizController {
  constructor(
    private createQuizUseCase: CreateGeneralQuizUseCase,
    private createUserPromptQuizUseCase: CreateUserPromptQuizUseCase
  ) {}
  async createQuiz(
    request: FastifyRequest<{ Body: CreateQuizDTO }>,
    reply: FastifyReply
  ): Promise<void> {
    const data = request.body;

    let quizResponse: CreateQuizResponse;
    if (data.userPrompt) {
      quizResponse = await this.createUserPromptQuizUseCase.execute(data);
    } else {
      quizResponse = await this.createQuizUseCase.execute(data);
    }
    return ResponseFormatter.success(
      reply,
      quizResponse,
      "quiz created successfully"
    );
  }
}
