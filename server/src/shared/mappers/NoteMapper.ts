import { Note } from "../../domain/entities/Note";
import { NoteData } from "../../shared";

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

  public static fromPersistenceToDomain(data: any): Note {
    return new Note(
      data.id,
      data.title, 
      data.content,
      data.document_id,
      new Date(data.created_at),
      new Date(data.updated_at),
      data.is_summary,
    );
  }

  public static toPersistence(note: Note) {
    return {
      id: note.getId(),
      title: note.getTitle(),
      content: note.getContent(),
      document_id: note.getDocumentId(),
      created_at: note.getCreatedAt(),
      updated_at: note.getUpdatedAt(),
      is_summary: note.isNoteSummary(),
    };
  }
}
