import { INoteRepository } from "../../../domain/repositories/INoteRepository";
import { Note } from "../../../domain/entities/Note";
import { UpdateNoteDTO } from "../../../shared/validation/noteSchemas";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { AuthError, AuthErrorSubType } from "../../../shared/errors/AuthError";
import { FastifyBaseLogger } from "fastify";

interface UpdateNoteInput {
  noteId: string;
  data: UpdateNoteDTO;
}

export class UpdateNoteUseCase {
  constructor(
    private noteRepository: INoteRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(input: UpdateNoteInput): Promise<Note> {
    this.logger.info({ noteId: input.noteId }, "Executing UpdateNoteUseCase");
    if (input.data.content) {
      this.logger.debug(
        { noteId: input.noteId, content: input.data.content },
        "Content updated in UpdateNoteUseCase"
      );
    }
    // Fetch existing note
    const existingNote = await this.noteRepository.getNoteById(input.noteId);

    if (!existingNote) {
      this.logger.warn(
        { noteId: input.noteId },
        "Note not found in UpdateNoteUseCase"
      );
      throw new NotFoundError("Note not found");
    }

    // Create updated note entity with merged data
    const updatedNote = new Note(
      existingNote.getId(),
      input.data.title !== undefined
        ? input.data.title
        : existingNote.getTitle(),
      input.data.content !== undefined
        ? input.data.content
        : existingNote.getContent(),
      existingNote.getDocumentId(),
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
