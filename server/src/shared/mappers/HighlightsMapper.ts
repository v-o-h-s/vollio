import { Highlight } from "../../domain/entities/Highlight";
import { HighlightContent } from "../validation/highlightSchemas";
import { HighlightStyle } from "../../domain/entities/Highlight";
import { HighlightType } from "../../domain/entities/Highlight";
import { ScaledPosition } from "../../domain/entities/Highlight";
import { HighlightData } from "@vollio/shared";

export class HighlightsMapper {
  constructor() {}
  static mapRowToHighlight(row: any): Highlight {
    return new Highlight(
      row.id,
      row.user_id,
      row.document_id,
      row.type as HighlightType,
      row.content as HighlightContent,
      row.position as ScaledPosition,
      row.has_note,
      new Date(row.created_at),
      new Date(row.updated_at),
      row.color,
      row.note_id,
      row.tags,
      row.style as HighlightStyle | undefined
    );
  }
  static mapEntityToResponse(highlight: Highlight): HighlightData {
    return {
      id: highlight.getId(),
      userId: highlight.getUserId(),
      documentId: highlight.getDocumentId(),
      type: highlight.getType(),
      content: highlight.getContent(),
      position: highlight.getPosition(),
      hasNote: highlight.getHasNote(),
      createdAt: highlight.getCreatedAt().toISOString(),
      updatedAt: highlight.getUpdatedAt().toISOString(),
      color: highlight.getColor(),
      noteId: highlight.getNoteId(),
      tags: highlight.getTags(),
      style: highlight.getStyle(),
    };
  }
}
