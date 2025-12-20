import { INoteRepository } from "../../../domain/repositories/INoteRepository";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { AuthError, AuthErrorSubType } from "../../../shared/errors/AuthError";
import { FastifyBaseLogger } from "fastify";

interface DeleteNoteInput {
  noteId: string;
  userId: string;
}

export class DeleteNoteUseCase {
  constructor(
    private noteRepository: INoteRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(input: DeleteNoteInput): Promise<void> {
    this.logger.info(
      { noteId: input.noteId, userId: input.userId },
      "Executing DeleteNoteUseCase"
    );
    // Fetch existing note
    const existingNote = await this.noteRepository.getNoteById(input.noteId);

    if (!existingNote) {
      this.logger.warn(
        { noteId: input.noteId },
        "Note not found in DeleteNoteUseCase"
      );
      throw new NotFoundError("Note not found");
    }

    // Verify ownership
    if (existingNote.getUserId() !== input.userId) {
      this.logger.warn(
        { noteId: input.noteId, userId: input.userId },
        "Forbidden: Ownership verification failed in DeleteNoteUseCase"
      );
      throw new AuthError(
        "Forbidden: You don't own this note",
        AuthErrorSubType.FORBIDDEN
      );
    }

    await this.noteRepository.deleteNote(input.noteId);
    this.logger.info(
      { noteId: input.noteId },
      "DeleteNoteUseCase executed successfully"
    );
  }
}
