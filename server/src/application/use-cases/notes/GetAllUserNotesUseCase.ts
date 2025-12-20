import { INoteRepository } from "../../../domain/repositories/INoteRepository";
import { Note } from "../../../domain/entities/Note";
import { FastifyBaseLogger } from "fastify";

export class GetAllUserNotesUseCase {
  constructor(
    private noteRepository: INoteRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(userId: string): Promise<Note[]> {
    this.logger.info({ userId }, "Executing GetAllUserNotesUseCase");
    const notes = await this.noteRepository.getNotesByUserId(userId);
    this.logger.info(
      { userId, count: notes.length },
      "GetAllUserNotesUseCase executed successfully"
    );
    return notes;
  }
}
