import { IQuizRepository } from "../../../domain/repositories/IQuizRepository";
import { FastifyBaseLogger } from "fastify";

import { IAiQuotaService } from "../../../domain/services/quota/IAiQuotaService";

export class DeleteQuizByIdUseCase {
  constructor(
    private quizRepository: IQuizRepository,
    private logger: FastifyBaseLogger,
    private aiQuotaService: IAiQuotaService,
  ) {}

  async execute(id: string, userId: string): Promise<void> {
    this.logger.info({ quizId: id }, "Executing DeleteQuizByIdUseCase");
    const quiz = await this.quizRepository.findById(id);
    await this.quizRepository.delete(id);

    if (quiz) {
      await this.aiQuotaService.releaseQuiz(userId);
    }

    this.logger.info(
      { quizId: id },
      "DeleteQuizByIdUseCase executed successfully",
    );
  }
}
