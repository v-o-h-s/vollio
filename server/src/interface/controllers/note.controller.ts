import { FastifyRequest, FastifyReply } from "fastify";
import { CreateNoteUseCase } from "../../application/use-cases/notes/CreateNoteUseCase";
import { UpdateNoteUseCase } from "../../application/use-cases/notes/UpdateNoteUseCase";
import { DeleteNoteUseCase } from "../../application/use-cases/notes/DeleteNoteUseCase";
import { GetNoteUseCase } from "../../application/use-cases/notes/GetNoteByIdUseCase";
import { GetAllUserNotesUseCase } from "../../application/use-cases/notes/GetAllUserNotesUseCase";
import {
  CreateNoteDTO,
  UpdateNoteDTO,
  NoteIdParams,
} from "../../shared/validation/noteSchemas";

export class NoteController {
  constructor(
    private createNoteUseCase: CreateNoteUseCase,
    private updateNoteUseCase: UpdateNoteUseCase,
    private deleteNoteUseCase: DeleteNoteUseCase,
    private getNoteUseCase: GetNoteUseCase,
    private getAllUserNotesUseCase: GetAllUserNotesUseCase
  ) {}

  /**
   * Create a new note
   */
  async createNote(
    request: FastifyRequest<{ Body: CreateNoteDTO }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      reply.status(401).send({ error: "Unauthorized" });
      return;
    }

    const createdNote = await this.createNoteUseCase.execute({
      userId,
      ...request.body,
    });

    reply.status(201).send({
      success: true,
      data: createdNote.toJSON(),
    });
  }

  /**
   * Get all notes for the authenticated user
   */
  async getAllNotes(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      reply.status(401).send({ error: "Unauthorized" });
      return;
    }

    const notes = await this.getAllUserNotesUseCase.execute(userId);

    reply.status(200).send({
      success: true,
      data: notes.map((note) => note.toJSON()),
    });
  }

  /**
   * Get a specific note by ID
   */
  async getNoteById(
    request: FastifyRequest<{ Params: NoteIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      reply.status(401).send({ error: "Unauthorized" });
      return;
    }

    const { id } = request.params;

    const note = await this.getNoteUseCase.execute({
      noteId: id,
      userId,
    });

    reply.status(200).send({
      success: true,
      data: note.toJSON(),
    });
  }

  /**
   * Update a note
   */
  async updateNote(
    request: FastifyRequest<{ Params: NoteIdParams; Body: UpdateNoteDTO }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      reply.status(401).send({ error: "Unauthorized" });
      return;
    }

    const { id } = request.params;

    const result = await this.updateNoteUseCase.execute({
      noteId: id,
      userId,
      data: request.body,
    });

    reply.status(200).send({
      success: true,
      data: result.toJSON(),
    });
  }

  /**
   * Delete a note
   */
  async deleteNote(
    request: FastifyRequest<{ Params: NoteIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      reply.status(401).send({ error: "Unauthorized" });
      return;
    }

    const { id } = request.params;

    await this.deleteNoteUseCase.execute({
      noteId: id,
      userId,
    });

    reply.status(200).send({
      success: true,
      message: "Note deleted successfully",
    });
  }
}
