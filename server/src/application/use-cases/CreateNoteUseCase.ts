import { INoteRepository } from "../../domain/repositories/INoteRepository";
import { Note } from "../../domain/Note";

export class CreateNoteUseCase {
  constructor(private noteRepository: INoteRepository) {}

  async execute(note: Note): Promise<Note> {
    return this.noteRepository.createNote(note);
  }
}
