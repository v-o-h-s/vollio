import { SupabaseClient } from "@supabase/supabase-js";
import { IHighlightRepository } from "../../domain/repositories/IHighlightRepository";
import {
  Highlight,
  HighlightType,
  ScaledPosition,
  HighlightStyle,
  HighlightContent,
} from "../../domain/entities/Highlight";
import { DatabaseError } from "../../shared/errors/DatabaseError";

export class HighlightRepository implements IHighlightRepository {
  private supabaseClient: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabaseClient = supabaseClient;
  }

  async getAllHighlights(userId: string, pdfId?: string): Promise<Highlight[]> {
    let query = this.supabaseClient
      .from("highlights")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (pdfId) {
      query = query.eq("pdf_id", pdfId);
    }

    const { data, error } = await query;

    if (error) {
      throw new DatabaseError(error);
    }

    if (!data) {
      return [];
    }

    return data.map((row) => this.mapRowToHighlight(row));
  }

  async getHighlightById(id: string, userId: string): Promise<Highlight | null> {
    const { data, error } = await this.supabaseClient
      .from("highlights")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new DatabaseError(error);
    }

    if (!data) {
      return null;
    }

    return this.mapRowToHighlight(data);
  }

  async createHighlight(highlight: Highlight): Promise<Highlight> {
    const { data, error } = await this.supabaseClient
      .from("highlights")
      .insert({
        id: highlight.getId(),
        user_id: highlight.getUserId(),
        pdf_id: highlight.getPdfId(),
        type: highlight.getType(),
        content: highlight.getContent(),
        position: highlight.getPosition(),
        color: highlight.getColor(),
        has_note: highlight.hasNoteAttached(),
        note_id: highlight.getNoteId(),
        tags: highlight.getTags(),
        style: highlight.getStyle(),
      })
      .select("*")
      .single();

    if (error) {
      throw new DatabaseError(error);
    }

    return this.mapRowToHighlight(data);
  }

  async updateHighlight(highlight: Highlight): Promise<Highlight> {
    const { data, error } = await this.supabaseClient
      .from("highlights")
      .update({
        color: highlight.getColor(),
        content: highlight.getContent(),
        has_note: highlight.hasNoteAttached(),
        note_id: highlight.getNoteId(),
        position: highlight.getPosition(),
        type: highlight.getType(),
        pdf_id: highlight.getPdfId(),
        tags: highlight.getTags(),
        style: highlight.getStyle(),
        updated_at: new Date().toISOString(),
      })
      .eq("id", highlight.getId())
      .eq("user_id", highlight.getUserId())
      .select("*")
      .single();

    if (error) {
      throw new DatabaseError(error);
    }

    return this.mapRowToHighlight(data);
  }

  async deleteHighlight(id: string, userId: string): Promise<void> {
    const { error } = await this.supabaseClient
      .from("highlights")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      throw new DatabaseError(error);
    }
  }

  async getHighlightsByPdfId(
    pdfId: string,
    userId: string
  ): Promise<Highlight[]> {
    const { data, error } = await this.supabaseClient
      .from("highlights")
      .select("*")
      .eq("pdf_id", pdfId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new DatabaseError(error);
    }

    if (!data) {
      return [];
    }

    return data.map((row) => this.mapRowToHighlight(row));
  }

  /**
   * Map database row to Highlight entity
   */
  private mapRowToHighlight(row: any): Highlight {
    return new Highlight(
      row.id,
      row.user_id,
      row.pdf_id,
      row.type as HighlightType,
      row.content as HighlightContent,
      row.position as ScaledPosition,
      row.has_note,
      new Date(row.created_at),
      new Date(row.updated_at),
      row.color,
      row.note_id,
      row.tags,
      row.style as HighlightStyle | undefined
    );
  }
}
