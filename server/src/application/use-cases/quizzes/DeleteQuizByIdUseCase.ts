import { IQuizRepository } from "../../../domain/repositories/IQuizRepository";

export class DeleteQuizByIdUseCase {
  constructor(private quizRepository: IQuizRepository) {}

  async execute(id: string): Promise<void> {
    await this.quizRepository.delete(id);
  }
}
