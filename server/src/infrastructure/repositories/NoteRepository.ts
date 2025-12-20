import { type SupabaseClient } from "@supabase/supabase-js";

import { Note } from "../../domain/entities/Note";
import { INoteRepository } from "../../domain/repositories/INoteRepository";
import { DatabaseError } from "../../shared/errors/DatabaseError";
import { FastifyBaseLogger } from "fastify";

export class NoteRepository implements INoteRepository {
  constructor(
    private supabase: SupabaseClient,
    private logger: FastifyBaseLogger
  ) {}

  async createNote(note: Note): Promise<Note> {
    this.logger.info({ noteId: note.getId() }, "Creating note");
    const { data, error } = await this.supabase
      .from("notes")
      .insert({
        id: note.getId(),
        title: note.getTitle(),
        content: note.getContent(),
        pdf_id: note.getPdfId(),
        created_at: note.getCreatedAt(),
        updated_at: note.getUpdatedAt(),
      })
      .select()
      .single();

    if (error) {
      this.logger.error({ error, noteId: note.getId() }, "Error creating note");
      throw new DatabaseError(error);
    }
    if (!data) {
      this.logger.error(
        { noteId: note.getId() },
        "Failed to create note: no data returned"
      );
      throw new DatabaseError({ message: "Failed to create note" });
    }

    this.logger.info({ noteId: note.getId() }, "Note created successfully");
    return this.mapToDomain(data);
  }

  async updateNote(note: Note): Promise<Note> {
    this.logger.info({ noteId: note.getId() }, "Updating note");
    const { data, error } = await this.supabase
      .from("notes")
      .update({
        title: note.getTitle(),
        content: note.getContent(),
        updated_at: new Date(), // Update timestamp
      })
      .eq("id", note.getId())
      .select()
      .single();

    if (error) {
      this.logger.error({ error, noteId: note.getId() }, "Error updating note");
      throw new DatabaseError(error);
    }
    if (!data) {
      this.logger.error(
        { noteId: note.getId() },
        "Note not found or not updated"
      );
      throw new DatabaseError({ message: "Note not found or not updated" });
    }

    this.logger.info({ noteId: note.getId() }, "Note updated successfully");
    return this.mapToDomain(data);
  }

  async deleteNote(noteId: string): Promise<void> {
    this.logger.info({ noteId }, "Deleting note");
    const { error } = await this.supabase
      .from("notes")
      .delete()
      .eq("id", noteId);

    if (error) {
      this.logger.error({ error, noteId }, "Error deleting note");
      throw new DatabaseError(error);
    }
    this.logger.info({ noteId }, "Note deleted successfully");
  }

  async getNoteById(noteId: string): Promise<Note | null> {
    this.logger.info({ noteId }, "Getting note by ID");
    const { data, error } = await this.supabase
      .from("notes")
      .select("*")
      .eq("id", noteId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        this.logger.info({ noteId }, "Note not found");
        return null;
      }
      this.logger.error({ error, noteId }, "Error getting note by ID");
      throw new DatabaseError(error);
    }

    this.logger.info({ noteId }, "Note found");
    return data ? this.mapToDomain(data) : null;
  }

  async getNotesByUserId(userId: string): Promise<Note[]> {
    this.logger.info({ userId }, "Getting notes by user ID");
    const { data, error } = await this.supabase
      .from("notes")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) {
      this.logger.error({ error, userId }, "Error getting notes by user ID");
      throw new DatabaseError(error);
    }

    this.logger.info(
      { userId, count: data?.length || 0 },
      "Notes retrieved for user"
    );
    return (data || []).map((item) => this.mapToDomain(item));
  }

  private mapToDomain(data: any): Note {
    return new Note(
      data.id,
      data.user_id,
      data.title,
      data.content,
      data.pdf_id,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }
}
