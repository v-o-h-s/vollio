import { INoteRepository } from "../../domain/repositories/INoteRepository";
import { Note } from "../../domain/Note";

export class GetAllUserNotesUseCase {
  constructor(private noteRepository: INoteRepository) {}

  async execute(userId: string): Promise<Note[]> {
    return this.noteRepository.getNotesByUserId(userId);
  }
}
