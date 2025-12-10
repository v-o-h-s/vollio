import { IHighlightRepository } from "../../../domain/repositories/IHighlightRepository";
import { Highlight } from "../../../domain/entities/Highlight";
import { FastifyBaseLogger } from "fastify";

interface GetHighlightByIdInput {
  userId: string;
  highlightId: string;
}

export class GetHighlightByIdUseCase {
  constructor(
    private highlightRepository: IHighlightRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(input: GetHighlightByIdInput): Promise<Highlight> {
    this.logger.info(
      { highlightId: input.highlightId, userId: input.userId },
      "🎨 Fetching highlight by ID"
    );

    const highlight = await this.highlightRepository.getHighlightById(
      input.highlightId,
      input.userId
    );

    if (!highlight) {
      this.logger.warn(
        { highlightId: input.highlightId, userId: input.userId },
        "Highlight not found or access denied"
      );
      throw new Error("Highlight not found or access denied");
    }

    this.logger.info(
      { highlightId: input.highlightId },
      "✅ Highlight retrieved successfully"
    );

    return highlight;
  }
}
