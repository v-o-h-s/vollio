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
  GenerateSummaryDTO,
} from "../../shared/validation/noteSchemas";
import {
  CreateNoteResponse,
  GetAllNotesResponse,
  GetNoteByIdResponse,
  UpdateNoteResponse,
  DeleteNoteResponse,
} from "../../shared";
import { ResponseFormatter } from "../../shared/utils/ResponseFormatter";
import { UnauthorizedErrorObject } from "../../shared/types/error";

export class NoteController {
  constructor(
    private createNoteUseCase: CreateNoteUseCase,
    private updateNoteUseCase: UpdateNoteUseCase,
    private deleteNoteUseCase: DeleteNoteUseCase,
    private getNoteUseCase: GetNoteUseCase,
    private getAllUserNotesUseCase: GetAllUserNotesUseCase,
  ) {}

  /**
   * Create a new note
   */
  async createNote(
    request: FastifyRequest<{ Body: CreateNoteDTO }>,
    reply: FastifyReply,
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      return ResponseFormatter.error(reply, UnauthorizedErrorObject, 401);
    }

    const createdNote = await this.createNoteUseCase.execute({
      ...request.body,
    });

    ResponseFormatter.success<CreateNoteResponse["data"]>(
      reply,
      createdNote.toJSON(),
      "Note created successfully",
      201,
    );
  }

  /**
   * Get all notes for the authenticated user
   */
  async getAllNotes(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      return ResponseFormatter.error(reply, UnauthorizedErrorObject, 401);
    }

    const notes = await this.getAllUserNotesUseCase.execute();

    ResponseFormatter.success<GetAllNotesResponse["data"]>(
      reply,
      notes.map((note) => note.toJSON()),
      "Notes retrieved successfully",
    );
  }

  /**
   * Get a specific note by ID
   */
  async getNoteById(
    request: FastifyRequest<{ Params: NoteIdParams }>,
    reply: FastifyReply,
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      return ResponseFormatter.error(reply, UnauthorizedErrorObject, 401);
    }

    const { id } = request.params;

    const note = await this.getNoteUseCase.execute({
      id,
    });

    ResponseFormatter.success<GetNoteByIdResponse["data"]>(
      reply,
      note.toJSON(),
      "Note retrieved successfully",
    );
  }

  /**
   * Update a note
   */
  async updateNote(
    request: FastifyRequest<{ Params: NoteIdParams; Body: UpdateNoteDTO }>,
    reply: FastifyReply,
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      return ResponseFormatter.error(reply, UnauthorizedErrorObject, 401);
    }

    const { id } = request.params;

    const result = await this.updateNoteUseCase.execute({
      noteId: id,
      data: request.body,
    });

    ResponseFormatter.success<UpdateNoteResponse["data"]>(
      reply,
      result.toJSON(),
      "Note updated successfully",
    );
  }

  /**
   * Delete a note
   */
  async deleteNote(
    request: FastifyRequest<{ Params: NoteIdParams }>,
    reply: FastifyReply,
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

    ResponseFormatter.success<DeleteNoteResponse["data"]>(
      reply,
      null,
      "Note deleted successfully",
    );
  }
}
