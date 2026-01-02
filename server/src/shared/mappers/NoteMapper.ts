import { Note } from "../../domain/entities/Note";
import { NoteData } from "@vollio/shared";
export class NoteMapper {
  public static fromDomainToInterface(note: Note): NoteData {
    return {
      id: note.getId(),
      title: note.getTitle(),
      content: note.getContent(),
      documentId: note.getDocumentId(),
      createdAt: note.getCreatedAt(),
      updatedAt: note.getUpdatedAt(),
      isSummary: note.isNoteSummary(),
    };
  }
}
