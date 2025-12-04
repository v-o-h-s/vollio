import { INoteRepository } from "../../domain/repositories/INoteRepository";
import { Note } from "../../domain/Note";

export class GetNoteUseCase {
  constructor(private noteRepository: INoteRepository) {}

  async execute(noteId: string): Promise<Note | null> {
    return this.noteRepository.getNoteById(noteId);
  }
}
