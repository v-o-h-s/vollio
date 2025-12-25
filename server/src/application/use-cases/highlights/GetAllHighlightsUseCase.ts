import { IHighlightRepository } from "../../../domain/repositories/IHighlightRepository";
import { Highlight } from "../../../domain/entities/Highlight";
import { FastifyBaseLogger } from "fastify";
import { HighlightData } from '@vollio/shared';
import { HighlightsMapper } from "../../../shared/mappers/HighlightsMapper";

interface GetAllHighlightsInput {
  userId: string;
  pdfId?: string;
}

export class GetAllHighlightsUseCase {
  constructor(
    private highlightRepository: IHighlightRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(input: GetAllHighlightsInput): Promise<HighlightData[]> {
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

    return highlights.map((highlight) =>
      HighlightsMapper.mapEntityToResponse(highlight)
    );
  }
}
