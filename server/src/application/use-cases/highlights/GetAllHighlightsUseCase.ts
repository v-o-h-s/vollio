import { IHighlightRepository } from "../../../domain/repositories/IHighlightRepository";
import { Highlight } from "../../../domain/entities/Highlight";
import { FastifyBaseLogger } from "fastify";

interface GetAllHighlightsInput {
  userId: string;
  pdfId?: string;
}

export class GetAllHighlightsUseCase {
  constructor(
    private highlightRepository: IHighlightRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(input: GetAllHighlightsInput): Promise<Highlight[]> {
    this.logger.info(
      { userId: input.userId, pdfId: input.pdfId },
      "🎨 Fetching highlights"
    );

    const highlights = await this.highlightRepository.getAllHighlights(
      input.userId,
      input.pdfId
    );

    this.logger.info(
      { count: highlights.length, userId: input.userId },
      `✅ Fetched ${highlights.length} highlights`
    );

    return highlights;
  }
}
