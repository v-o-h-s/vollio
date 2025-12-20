import { INoteRepository } from "../../../domain/repositories/INoteRepository";
import { Note } from "../../../domain/entities/Note";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { AuthError, AuthErrorSubType } from "../../../shared/errors/AuthError";
import { FastifyBaseLogger } from "fastify";

interface GetNoteInput {
  noteId: string;
  userId: string;
}

export class GetNoteUseCase {
  constructor(
    private noteRepository: INoteRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(input: GetNoteInput): Promise<Note> {
    this.logger.info(
      { noteId: input.noteId, userId: input.userId },
      "Executing GetNoteUseCase"
    );
    const note = await this.noteRepository.getNoteById(input.noteId);

    if (!note) {
      this.logger.warn(
        { noteId: input.noteId },
        "Note not found in GetNoteUseCase"
      );
      throw new NotFoundError("Note not found");
    }

    // Verify ownership
    if (note.getUserId() !== input.userId) {
      this.logger.warn(
        { noteId: input.noteId, userId: input.userId },
        "Forbidden: Ownership verification failed in GetNoteUseCase"
      );
      throw new AuthError(
        "Forbidden: You don't own this note",
        AuthErrorSubType.FORBIDDEN
      );
    }

    this.logger.info(
      { noteId: input.noteId },
      "GetNoteUseCase executed successfully"
    );
    return note;
  }
}
