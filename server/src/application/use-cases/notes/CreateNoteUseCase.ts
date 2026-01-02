import { INoteRepository } from "../../../domain/repositories/INoteRepository";
import { Note } from "../../../domain/entities/Note";
import { CreateNoteDTO } from "../../../shared/validation/noteSchemas";
import { randomUUID } from "crypto";
import { FastifyBaseLogger } from "fastify";

export class CreateNoteUseCase {
  constructor(
    private noteRepository: INoteRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(input: CreateNoteDTO): Promise<Note> {
    this.logger.info({ title: input.title }, "Executing CreateNoteUseCase");
    // Create the domain entity
    const note = new Note(
      input.id || randomUUID(),
      input.title,
      input.content,
      input.documentId
    );

    const result = await this.noteRepository.createNote(note);
    this.logger.info(
      { noteId: result.getId() },
      "CreateNoteUseCase executed successfully"
    );
    return result;
  }
}
