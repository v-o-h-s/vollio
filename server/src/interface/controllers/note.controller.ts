import { FastifyRequest, FastifyReply } from "fastify";
import { CreateNoteUseCase } from "../../application/use-cases/CreateNoteUseCase";
import { UpdateNoteUseCase } from "../../application/use-cases/UpdateNoteUseCase";
import { DeleteNoteUseCase } from "../../application/use-cases/DeleteNoteUseCase";
import { GetNoteUseCase } from "../../application/use-cases/getNote";
import { GetAllUserNotesUseCase } from "../../application/use-cases/getAllUserNotesUseCase";
import {
  CreateNoteDTO,
  UpdateNoteDTO,
  NoteIdParams,
} from "../../shared/validation/noteSchemas";
import { Note } from "../../domain/Note";
import { randomUUID } from "crypto";

export class NoteController {
  constructor(
    private createNoteUseCase: CreateNoteUseCase,
    private updateNoteUseCase: UpdateNoteUseCase,
    private deleteNoteUseCase: DeleteNoteUseCase,
    private getNoteUseCase: GetNoteUseCase,
    private getAllUserNotesUseCase: GetAllUserNotesUseCase
  ) { }

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

    const { title, content, pdfId } = request.body;

    const note = new Note(
      randomUUID(),
      userId,
      title,
      content,
      pdfId,
      new Date(),
      new Date()
    );

    const createdNote = await this.createNoteUseCase.execute(note);

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
    try {
      const userId = request.user?.id;
      if (!userId) {
        reply.status(401).send({ error: "Unauthorized" });
        return;
      }

      const { id } = request.params;

      const note = await this.getNoteUseCase.execute(id);

      if (!note) {
        reply.status(404).send({ error: "Note not found" });
        return;
      }

      // Verify the note belongs to the user
      if (note.getUserId() !== userId) {
        reply.status(403).send({ error: "Forbidden" });
        return;
      }

      reply.status(200).send({
        success: true,
        data: note.toJSON(),
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Update a note
   */
  async updateNote(
    request: FastifyRequest<{ Params: NoteIdParams; Body: UpdateNoteDTO }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const userId = request.user?.id;
      if (!userId) {
        reply.status(401).send({ error: "Unauthorized" });
        return;
      }

      const { id } = request.params;
      const { title, content } = request.body;

      // First, get the existing note to verify ownership
      const existingNote = await this.getNoteUseCase.execute(id);

      if (!existingNote) {
        reply.status(404).send({ error: "Note not found" });
        return;
      }

      // Verify the note belongs to the user
      if (existingNote.getUserId() !== userId) {
        reply.status(403).send({ error: "Forbidden" });
        return;
      }

      // Create updated note with new data
      const updatedNote = new Note(
        existingNote.getId(),
        existingNote.getUserId(),
        title !== undefined ? title : existingNote.getTitle(),
        content !== undefined ? content : existingNote.getContent(),
        existingNote.getPdfId(),
        existingNote.getCreatedAt(),
        new Date() // Update timestamp
      );

      const result = await this.updateNoteUseCase.execute(updatedNote);

      reply.status(200).send({
        success: true,
        data: result.toJSON(),
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Delete a note
   */
  async deleteNote(
    request: FastifyRequest<{ Params: NoteIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    try {
      const userId = request.user?.id;
      if (!userId) {
        reply.status(401).send({ error: "Unauthorized" });
        return;
      }

      const { id } = request.params;

      // First, get the existing note to verify ownership
      const existingNote = await this.getNoteUseCase.execute(id);

      if (!existingNote) {
        reply.status(404).send({ error: "Note not found" });
        return;
      }

      // Verify the note belongs to the user
      if (existingNote.getUserId() !== userId) {
        reply.status(403).send({ error: "Forbidden" });
        return;
      }

      await this.deleteNoteUseCase.execute(id);

      reply.status(200).send({
        success: true,
        message: "Note deleted successfully",
      });
    } catch (error) {
      throw error;
    }
  }
}
