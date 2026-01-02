import { INoteRepository } from "../../../domain/repositories/INoteRepository";
import { Note } from "../../../domain/entities/Note";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { AuthError, AuthErrorSubType } from "../../../shared/errors/AuthError";
import { FastifyBaseLogger } from "fastify";
import { NoteIdParams } from "@vollio/shared";

export class GetNoteUseCase {
  constructor(
    private noteRepository: INoteRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(input: NoteIdParams): Promise<Note> {
    this.logger.info({ noteId: input.id }, "Executing GetNoteUseCase");
    const note = await this.noteRepository.getNoteById(input.id);

    if (!note) {
      this.logger.warn(
        { noteId: input.id },
        "Note not found in GetNoteUseCase"
      );
      throw new NotFoundError("Note not found");
    }
    this.logger.info(
      { noteId: input.id },
      "GetNoteUseCase executed successfully"
    );
    return note;
  }
}
