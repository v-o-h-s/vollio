import { type SupabaseClient } from "@supabase/supabase-js";

import { Note } from "../../domain/Note";
import { INoteRepository } from "../../domain/repositories/INoteRepository";
import { DatabaseError } from "../../shared/errors/DatabaseError";

export class NoteRepository implements INoteRepository {
  constructor(private supabase: SupabaseClient) { }

  async createNote(note: Note): Promise<Note> {
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

    if (error) throw new DatabaseError(error);
    if (!data) throw new DatabaseError({ message: "Failed to create note" });

    return this.mapToDomain(data);
  }

  async updateNote(note: Note): Promise<Note> {
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

    if (error) throw new DatabaseError(error);
    if (!data)
      throw new DatabaseError({ message: "Note not found or not updated" });

    return this.mapToDomain(data);
  }

  async deleteNote(noteId: string): Promise<void> {
    const { error } = await this.supabase
      .from("notes")
      .delete()
      .eq("id", noteId);

    if (error) throw new DatabaseError(error);
  }

  async getNoteById(noteId: string): Promise<Note | null> {
    const { data, error } = await this.supabase
      .from("notes")
      .select("*")
      .eq("id", noteId)
      .single();

    if (error) {
      // Handle "not found" specifically if needed, or return null
      if (error.code === "PGRST116") return null;
      throw new DatabaseError(error);
    }

    return data ? this.mapToDomain(data) : null;
  }

  async getNotesByUserId(userId: string): Promise<Note[]> {
    // With RLS, we might not strictly need to filter by userId if the policy handles it,
    // but it's good practice to be explicit.
    const { data, error } = await this.supabase
      .from("notes")
      .select("*")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false });

    if (error) throw new DatabaseError(error);

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
