import { INoteRepository } from "../../domain/repositories/INoteRepository";
import { Note } from "../../domain/Note";

export class UpdateNoteUseCase {
  constructor(private noteRepository: INoteRepository) {}

  async execute(note: Note): Promise<Note> {
    return this.noteRepository.updateNote(note);
  }
}
