import { IHighlightRepository } from "../../../domain/repositories/IHighlightRepository";
import { Highlight, HighlightType, ScaledPosition } from "../../../domain/entities/Highlight";
import { randomUUID } from "crypto";
import { FastifyBaseLogger } from "fastify";

interface CreateHighlightInput {
  userId: string;
  pdfId: string;
  type?: HighlightType;
  content?: { text?: string; image?: string };
  position: ScaledPosition;
  color?: string;
  hasNote?: boolean;
  noteId?: string | null;
  tags?: string[];
  style?: "highlight" | "tagged";
}

export class CreateHighlightUseCase {
  constructor(
    private highlightRepository: IHighlightRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(input: CreateHighlightInput): Promise<Highlight> {
    this.logger.info(
      { pdfId: input.pdfId, userId: input.userId },
      "🎨 Creating new highlight"
    );

    // Create the domain entity
    const highlight = new Highlight(
      randomUUID(),
      input.userId,
      input.pdfId,
      input.type || "text",
      input.content || {},
      input.position,
      input.hasNote || false,
      undefined,
      undefined,
      input.color,
      input.noteId,
      input.tags,
      input.style
    );

    this.logger.info(
      { highlightId: highlight.getId(), pdfId: input.pdfId },
      "💾 Inserting highlight into database"
    );

    const createdHighlight = await this.highlightRepository.createHighlight(
      highlight
    );

    this.logger.info(
      {
        highlightId: createdHighlight.getId(),
        pdfId: input.pdfId,
        userId: input.userId,
      },
      "✅ Highlight created successfully"
    );

    return createdHighlight;
  }
}
