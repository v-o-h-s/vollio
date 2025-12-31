import { IHighlightRepository } from "../../../domain/repositories/IHighlightRepository";
import { FastifyBaseLogger } from "fastify";

export class CountHighlightsByTagUseCase {
  constructor(
    private highlightRepository: IHighlightRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(userId: string, tagName: string): Promise<number> {
    this.logger.info({ userId, tagName }, "Executing CountHighlightsByTagUseCase");
    return this.highlightRepository.countHighlightsByTag(userId, tagName);
  }
}
