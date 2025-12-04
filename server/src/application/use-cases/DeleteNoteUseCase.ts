import { INoteRepository } from "../../domain/repositories/INoteRepository";
import { NotFoundError } from "../../shared/errors/NotFoundError";
import { AuthError, AuthErrorSubType } from "../../shared/errors/AuthError";

interface DeleteNoteInput {
  noteId: string;
  userId: string;
}

export class DeleteNoteUseCase {
  constructor(private noteRepository: INoteRepository) {}

  async execute(input: DeleteNoteInput): Promise<void> {
    // Fetch existing note
    const existingNote = await this.noteRepository.getNoteById(input.noteId);

    if (!existingNote) {
      throw new NotFoundError("Note not found");
    }

    // Verify ownership
    if (existingNote.getUserId() !== input.userId) {
      throw new AuthError(
        "Forbidden: You don't own this note",
        AuthErrorSubType.FORBIDDEN
      );
    }

    return this.noteRepository.deleteNote(input.noteId);
  }
}
