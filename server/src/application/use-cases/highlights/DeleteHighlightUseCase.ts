import { IHighlightRepository } from "../../../domain/repositories/IHighlightRepository";
import { FastifyBaseLogger } from "fastify";

interface DeleteHighlightInput {
  userId: string;
  highlightId: string;
}

export class DeleteHighlightUseCase {
  constructor(
    private highlightRepository: IHighlightRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(input: DeleteHighlightInput): Promise<void> {
    this.logger.info(
      { highlightId: input.highlightId, userId: input.userId },
      "🎨 Deleting highlight"
    );

    // Verify highlight exists and belongs to user
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
      "💾 Deleting highlight from database"
    );

    await this.highlightRepository.deleteHighlight(input.highlightId, input.userId);

    this.logger.info(
      {
        highlightId: input.highlightId,
        userId: input.userId,
      },
      "✅ Highlight deleted successfully"
    );
  }
}
