import { FastifyReply, FastifyRequest } from "fastify";
import { CreateQuizDTO } from "../../shared/validation/quizSchemas";
import { CreateQuizResponse } from "@vollio/shared";
import { ResponseFormatter } from "../../shared/utils/ResponseFormatter";
import { CreateGeneralQuizUseCase } from "../../application/use-cases/quizzes/CreateGeneralQuizUseCase";
import { CreateUserPromptQuizUseCase } from "../../application/use-cases/quizzes/CreateUserPromptQuizUseCase";
import { GetAllQuizzesUseCase } from "../../application/use-cases/quizzes/GetAllquizzesUseCase";
import { GetQuizByIdUseCase } from "../../application/use-cases/quizzes/GetQuizByIdUseCase";
import { DeleteQuizByIdUseCase } from "../../application/use-cases/quizzes/DeleteQuizByIdUseCase";
import { UnauthorizedErrorObject } from "../../shared/types/error";
export class QuizController {
  constructor(
    private createQuizUseCase: CreateGeneralQuizUseCase,
    private createUserPromptQuizUseCase: CreateUserPromptQuizUseCase,
    private getAllQuizzesUseCase: GetAllQuizzesUseCase,
    private getQuizByIdUseCase: GetQuizByIdUseCase,
    private deleteQuizByIdUseCase: DeleteQuizByIdUseCase
  ) {}
  async createQuiz(
    request: FastifyRequest<{ Body: CreateQuizDTO }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      return ResponseFormatter.error(
        reply,
        UnauthorizedErrorObject,
        401,
        "Unauthorized"
      );
    }
    const data = request.body;

    let quizResponse: CreateQuizResponse;
    if (data.userPrompt) {
      quizResponse = await this.createUserPromptQuizUseCase.execute(
        data,
        userId
      );
    } else {
      quizResponse = await this.createQuizUseCase.execute(data, userId);
    }
    return ResponseFormatter.success(
      reply,
      quizResponse,
      "quiz created successfully"
    );
  }
  async getAllQuizzes(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      return ResponseFormatter.error(
        reply,
        UnauthorizedErrorObject,
        401,
        "Unauthorized"
      );
    }
    const quizzes = await this.getAllQuizzesUseCase.execute();
    return ResponseFormatter.success(
      reply,
      quizzes,
      "quizzes retrieved successfully"
    );
  }

  async getQuizById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      return ResponseFormatter.error(
        reply,
        UnauthorizedErrorObject,
        401,
        "Unauthorized"
      );
    }
    const quiz = await this.getQuizByIdUseCase.execute(request.params.id);
    return ResponseFormatter.success(
      reply,
      quiz,
      "quiz retrieved successfully"
    );
  }

  async deleteQuizById(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      return ResponseFormatter.error(
        reply,
        UnauthorizedErrorObject,
        401,
        "Unauthorized"
      );
    }
    await this.deleteQuizByIdUseCase.execute(request.params.id);
    return ResponseFormatter.success(reply, null, "quiz deleted successfully");
  }
}
