import { INoteRepository } from "../../../domain/repositories/INoteRepository";
import { Note } from "../../../domain/entities/Note";
import { FastifyBaseLogger } from "fastify";

export class GetAllUserNotesUseCase {
  constructor(
    private noteRepository: INoteRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(): Promise<Note[]> {
    this.logger.info("Executing GetAllUserNotesUseCase");
    const notes = await this.noteRepository.getNotesByUserId();
    this.logger.info(
      { count: notes.length },
      "GetAllUserNotesUseCase executed successfully"
    );
    return notes;
  }
}
