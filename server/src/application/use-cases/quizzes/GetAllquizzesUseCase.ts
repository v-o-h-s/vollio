import { IQuizRepository } from "../../../domain/repositories/IQuizRepository";
import { GetAllQuizzesResponse } from "../../../shared/types/responses/quizRoutes";
import { QuizMapper } from "../../../shared/mappers/QuizMapper";
import { FastifyBaseLogger } from "fastify";

export class GetAllQuizzesUseCase {
  constructor(
    private quizRepository: IQuizRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(): Promise<GetAllQuizzesResponse> {
    this.logger.info("Executing GetAllQuizzesUseCase");
    const quizzes = await this.quizRepository.findAll();
    if (!quizzes) {
      this.logger.info("No quizzes found in GetAllQuizzesUseCase");
      return [];
    }
    this.logger.info(
      { count: quizzes.length },
      "GetAllQuizzesUseCase executed successfully"
    );
    return quizzes.map((quiz) => QuizMapper.fromDomainToInterface(quiz));
  }
}
