import { IHighlightRepository } from "../../../domain/repositories/IHighlightRepository";
import { Highlight } from "../../../domain/entities/Highlight";
import { HighlightsMapper } from "../../../shared/mappers/HighlightsMapper";
import { HighlightData } from "../../../shared/types/responses/highlightRoutes";

export class GetHighlightsByDocumentIdUseCase {
  constructor(private highlightRepository: IHighlightRepository) {}

  async execute(documentId: string): Promise<HighlightData[]> {
    const highlights: Highlight[] =
      await this.highlightRepository.getHighlightsByDocumentId(documentId);
    return highlights.map((highlight) =>
      HighlightsMapper.mapEntityToResponse(highlight)
    );
  }
}
