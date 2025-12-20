import { IQuizRepository } from "../../../domain/repositories/IQuizRepository";
import { Quiz } from "../../../domain/entities/Quiz";
import { QuizMapper } from "../../../shared/mappers/QuizMapper";
import { GetQuizByIdResponse } from "../../../shared/types/responses/quizRoutes";
import { NotFoundError } from "../../../shared/errors/NotFoundError";

export class GetQuizByIdUseCase {
  constructor(private quizRepository: IQuizRepository) {}

  async execute(id: string): Promise<GetQuizByIdResponse> {
    const quiz = await this.quizRepository.findById(id);
    if (!quiz) {
      throw new NotFoundError("Quiz not found");
    }
    return QuizMapper.fromDomainToInterface(quiz);
  }
}
