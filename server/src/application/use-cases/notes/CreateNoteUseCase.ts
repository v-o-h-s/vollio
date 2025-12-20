import { INoteRepository } from "../../../domain/repositories/INoteRepository";
import { Note } from "../../../domain/entities/Note";
import { CreateNoteDTO } from "../../../shared/validation/noteSchemas";
import { randomUUID } from "crypto";
import { FastifyBaseLogger } from "fastify";

interface CreateNoteInput extends CreateNoteDTO {
  userId: string;
}

export class CreateNoteUseCase {
  constructor(
    private noteRepository: INoteRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(input: CreateNoteInput): Promise<Note> {
    this.logger.info(
      { userId: input.userId, title: input.title },
      "Executing CreateNoteUseCase"
    );
    // Create the domain entity
    const note = new Note(
      randomUUID(),
      input.userId,
      input.title,
      input.content,
      input.pdfId
    );

    const result = await this.noteRepository.createNote(note);
    this.logger.info(
      { noteId: result.getId() },
      "CreateNoteUseCase executed successfully"
    );
    return result;
  }
}
