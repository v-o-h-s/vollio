import { IQuizRepository } from "../../../domain/repositories/IQuizRepository";
import { QuizMapper } from "../../../shared/mappers/QuizMapper";
import { GetQuizByIdResponse } from "../../../shared/types/responses/quizRoutes";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { FastifyBaseLogger } from "fastify";

export class GetQuizByIdUseCase {
  constructor(
    private quizRepository: IQuizRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(id: string): Promise<GetQuizByIdResponse> {
    this.logger.info({ quizId: id }, "Executing GetQuizByIdUseCase");
    const quiz = await this.quizRepository.findById(id);
    if (!quiz) {
      this.logger.warn({ quizId: id }, "Quiz not found in GetQuizByIdUseCase");
      throw new NotFoundError("Quiz not found");
    }
    this.logger.info(
      { quizId: id },
      "GetQuizByIdUseCase executed successfully"
    );
    return QuizMapper.fromDomainToInterface(quiz);
  }
}
