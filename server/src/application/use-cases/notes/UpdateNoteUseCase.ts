import { INoteRepository } from "../../../domain/repositories/INoteRepository";
import { Note } from "../../../domain/entities/Note";
import { UpdateNoteDTO } from "../../../shared/validation/noteSchemas";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { AuthError, AuthErrorSubType } from "../../../shared/errors/AuthError";
import { FastifyBaseLogger } from "fastify";

interface UpdateNoteInput {
  noteId: string;
  userId: string;
  data: UpdateNoteDTO;
}

export class UpdateNoteUseCase {
  constructor(
    private noteRepository: INoteRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(input: UpdateNoteInput): Promise<Note> {
    this.logger.info(
      { noteId: input.noteId, userId: input.userId },
      "Executing UpdateNoteUseCase"
    );
    // Fetch existing note
    const existingNote = await this.noteRepository.getNoteById(input.noteId);

    if (!existingNote) {
      this.logger.warn(
        { noteId: input.noteId },
        "Note not found in UpdateNoteUseCase"
      );
      throw new NotFoundError("Note not found");
    }

    // Verify ownership
    if (existingNote.getUserId() !== input.userId) {
      this.logger.warn(
        { noteId: input.noteId, userId: input.userId },
        "Forbidden: Ownership verification failed in UpdateNoteUseCase"
      );
      throw new AuthError(
        "Forbidden: You don't own this note",
        AuthErrorSubType.FORBIDDEN
      );
    }

    // Create updated note entity with merged data
    const updatedNote = new Note(
      existingNote.getId(),
      existingNote.getUserId(),
      input.data.title !== undefined
        ? input.data.title
        : existingNote.getTitle(),
      input.data.content !== undefined
        ? input.data.content
        : existingNote.getContent(),
      existingNote.getPdfId(),
      existingNote.getCreatedAt(),
      new Date() // Update timestamp
    );

    const result = await this.noteRepository.updateNote(updatedNote);
    this.logger.info(
      { noteId: result.getId() },
      "UpdateNoteUseCase executed successfully"
    );
    return result;
  }
}
