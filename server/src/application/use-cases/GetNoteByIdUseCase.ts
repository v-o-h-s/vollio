import { INoteRepository } from "../../domain/repositories/INoteRepository";
import { Note } from "../../domain/Note";
import { NotFoundError } from "../../shared/errors/NotFoundError";
import { AuthError, AuthErrorSubType } from "../../shared/errors/AuthError";

interface GetNoteInput {
  noteId: string;
  userId: string;
}

export class GetNoteUseCase {
  constructor(private noteRepository: INoteRepository) {}

  async execute(input: GetNoteInput): Promise<Note> {
    const note = await this.noteRepository.getNoteById(input.noteId);

    if (!note) {
      throw new NotFoundError("Note not found");
    }

    // Verify ownership
    if (note.getUserId() !== input.userId) {
      throw new AuthError(
        "Forbidden: You don't own this note",
        AuthErrorSubType.FORBIDDEN
      );
    }

    return note;
  }
}
