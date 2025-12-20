import { IQuizRepository } from "../../../domain/repositories/IQuizRepository";
import { GetAllQuizzesResponse } from "../../../shared/types/responses/quizRoutes";
import { QuizMapper } from "../../../shared/mappers/QuizMapper";

export class GetAllQuizzesUseCase {
  constructor(private quizRepository: IQuizRepository) {}

  async execute(): Promise<GetAllQuizzesResponse> {
    const quizzes = await this.quizRepository.findAll();
    if (!quizzes) {
      return []
    }
    return quizzes.map((quiz) => QuizMapper.fromDomainToInterface(quiz));
  }
}
