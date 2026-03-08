import { IHighlightRepository } from "../../../domain/repositories/IHighlightRepository";
import { Highlight } from "../../../domain/entities/Highlight";
import { FastifyBaseLogger } from "fastify";
import { HighlightData } from "../../../shared";
import { HighlightsMapper } from "../../../shared/mappers/HighlightsMapper";

interface GetAllHighlightsInput {
  userId: string;
  documentId?: string;
}

export class GetAllHighlightsUseCase {
  constructor(
    private highlightRepository: IHighlightRepository,
    private logger: FastifyBaseLogger,
  ) {}

  async execute(input: GetAllHighlightsInput): Promise<HighlightData[]> {
    this.logger.info(
      { userId: input.userId, documentId: input.documentId },
      "🎨 Fetching highlights",
    );

    const highlights = await this.highlightRepository.getAllHighlights(
      input.userId,
      input.documentId,
    );

    this.logger.info(
      { count: highlights.length, userId: input.userId },
      `✅ Fetched ${highlights.length} highlights`,
    );

    return highlights.map((highlight) =>
      HighlightsMapper.fromDomainToInterface(highlight),
    );
  }
}
