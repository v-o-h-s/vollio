import { INoteRepository } from "../../../domain/repositories/INoteRepository";
import { Note } from "../../../domain/entities/Note";
import { CreateNoteDTO } from "../../../shared/validation/noteSchemas";
import { randomUUID } from "crypto";

interface CreateNoteInput extends CreateNoteDTO {
  userId: string;
}

export class CreateNoteUseCase {
  constructor(private noteRepository: INoteRepository) {}

  async execute(input: CreateNoteInput): Promise<Note> {
    // Create the domain entity
    const note = new Note(
      randomUUID(),
      input.userId,
      input.title,
      input.content,
      input.pdfId
    );

    return this.noteRepository.createNote(note);
  }
}
