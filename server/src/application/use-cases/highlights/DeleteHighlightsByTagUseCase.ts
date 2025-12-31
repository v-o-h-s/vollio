import { IHighlightRepository } from "../../../domain/repositories/IHighlightRepository";
import { FastifyBaseLogger } from "fastify";

export class DeleteHighlightsByTagUseCase {
  constructor(
    private highlightRepository: IHighlightRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(userId: string, tagName: string): Promise<void> {
    this.logger.info({ userId, tagName }, "Executing DeleteHighlightsByTagUseCase");
    await this.highlightRepository.deleteHighlightsByTag(userId, tagName);
  }
}
