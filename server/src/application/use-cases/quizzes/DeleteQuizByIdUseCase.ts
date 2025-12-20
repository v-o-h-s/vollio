import { IQuizRepository } from "../../../domain/repositories/IQuizRepository";
import { FastifyBaseLogger } from "fastify";

export class DeleteQuizByIdUseCase {
  constructor(
    private quizRepository: IQuizRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(id: string): Promise<void> {
    this.logger.info({ quizId: id }, "Executing DeleteQuizByIdUseCase");
    await this.quizRepository.delete(id);
    this.logger.info(
      { quizId: id },
      "DeleteQuizByIdUseCase executed successfully"
    );
  }
}
