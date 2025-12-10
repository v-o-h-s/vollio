import { IHighlightRepository } from "../../../domain/repositories/IHighlightRepository";
import { Highlight, HighlightContent, ScaledPosition } from "../../../domain/entities/Highlight";
import { FastifyBaseLogger } from "fastify";

interface UpdateHighlightInput {
  userId: string;
  highlightId: string;
  color?: string;
  content?: HighlightContent;
  hasNote?: boolean;
  noteId?: string | null;
  position?: ScaledPosition;
  type?: "text" | "area";
  pdfId?: string;
  tags?: string[];
  style?: "highlight" | "tagged";
}

export class UpdateHighlightUseCase {
  constructor(
    private highlightRepository: IHighlightRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(input: UpdateHighlightInput): Promise<Highlight> {
    this.logger.info(
      { highlightId: input.highlightId, userId: input.userId },
      "🎨 Updating highlight"
    );

    // Get existing highlight
    const existingHighlight = await this.highlightRepository.getHighlightById(
      input.highlightId,
      input.userId
    );

    if (!existingHighlight) {
      this.logger.warn(
        { highlightId: input.highlightId, userId: input.userId },
        "Highlight not found or access denied"
      );
      throw new Error("Highlight not found or access denied");
    }

    // Apply updates
    if (input.color !== undefined) {
      existingHighlight.setColor(input.color);
    }
    if (input.hasNote !== undefined) {
      existingHighlight.setHasNote(input.hasNote);
    }
    if (input.noteId !== undefined) {
      existingHighlight.setNoteId(input.noteId);
    }
    if (input.tags !== undefined) {
      existingHighlight.setTags(input.tags);
    }
    if (input.style !== undefined) {
      existingHighlight.setStyle(input.style);
    }

    this.logger.info(
      { highlightId: input.highlightId },
      "💾 Updating highlight in database"
    );

    const updatedHighlight = await this.highlightRepository.updateHighlight(
      existingHighlight
    );

    this.logger.info(
      {
        highlightId: input.highlightId,
        userId: input.userId,
      },
      "✅ Highlight updated successfully"
    );

    return updatedHighlight;
  }
}
