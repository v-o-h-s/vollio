import { INoteRepository } from "../../domain/repositories/INoteRepository";

export class DeleteNoteUseCase {
  constructor(private noteRepository: INoteRepository) {}

  async execute(noteId: string): Promise<void> {
    return this.noteRepository.deleteNote(noteId);
  }
}
