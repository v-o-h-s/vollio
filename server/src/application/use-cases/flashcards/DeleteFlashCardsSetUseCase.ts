import { IFlashCardsSetRepository } from "../../../domain/repositories/IFlashCardsSetRepository";
import { FastifyBaseLogger } from "fastify";

export class DeleteFlashCardsSetUseCase {
  constructor(
    private flashCardsSetRepository: IFlashCardsSetRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(id: string): Promise<void> {
    this.logger.info({ setId: id }, "Executing DeleteFlashCardsSetUseCase");
    await this.flashCardsSetRepository.delete(id);
    this.logger.info(
      { setId: id },
      "DeleteFlashCardsSetUseCase executed successfully"
    );
  }
}
