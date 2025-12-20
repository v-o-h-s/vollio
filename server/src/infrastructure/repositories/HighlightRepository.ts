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
import { FastifyBaseLogger } from "fastify";

export class HighlightRepository implements IHighlightRepository {
  constructor(
    private supabaseClient: SupabaseClient,
    private logger: FastifyBaseLogger
  ) {}

  async getAllHighlights(userId: string, pdfId?: string): Promise<Highlight[]> {
    this.logger.info({ userId, pdfId }, "Getting all highlights");
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
      this.logger.error(
        { error, userId, pdfId },
        "Error getting all highlights"
      );
      throw new DatabaseError(error);
    }

    if (!data) {
      this.logger.info({ userId, pdfId }, "No highlights found");
      return [];
    }

    this.logger.info(
      { userId, pdfId, count: data.length },
      "Highlights retrieved successfully"
    );
    return data.map((row) => this.mapRowToHighlight(row));
  }

  async getHighlightById(
    id: string,
    userId: string
  ): Promise<Highlight | null> {
    this.logger.info({ highlightId: id, userId }, "Getting highlight by ID");
    const { data, error } = await this.supabaseClient
      .from("highlights")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        this.logger.info({ highlightId: id, userId }, "Highlight not found");
        return null;
      }
      this.logger.error(
        { error, highlightId: id, userId },
        "Error getting highlight by ID"
      );
      throw new DatabaseError(error);
    }

    if (!data) {
      this.logger.info(
        { highlightId: id, userId },
        "Highlight not found (no data)"
      );
      return null;
    }

    this.logger.info({ highlightId: id }, "Highlight found");
    return this.mapRowToHighlight(data);
  }

  async createHighlight(highlight: Highlight): Promise<Highlight> {
    this.logger.info(
      {
        highlightId: highlight.getId(),
        userId: highlight.getUserId(),
        pdfId: highlight.getPdfId(),
      },
      "Creating highlight"
    );
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
      this.logger.error(
        { error, highlightId: highlight.getId() },
        "Error creating highlight"
      );
      throw new DatabaseError(error);
    }

    this.logger.info(
      { highlightId: data.id },
      "Highlight created successfully"
    );
    return this.mapRowToHighlight(data);
  }

  async updateHighlight(highlight: Highlight): Promise<Highlight> {
    this.logger.info(
      { highlightId: highlight.getId(), userId: highlight.getUserId() },
      "Updating highlight"
    );
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
      this.logger.error(
        { error, highlightId: highlight.getId() },
        "Error updating highlight"
      );
      throw new DatabaseError(error);
    }

    this.logger.info(
      { highlightId: highlight.getId() },
      "Highlight updated successfully"
    );
    return this.mapRowToHighlight(data);
  }

  async deleteHighlight(id: string, userId: string): Promise<void> {
    this.logger.info({ highlightId: id, userId }, "Deleting highlight");
    const { error } = await this.supabaseClient
      .from("highlights")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      this.logger.error(
        { error, highlightId: id, userId },
        "Error deleting highlight"
      );
      throw new DatabaseError(error);
    }
    this.logger.info({ highlightId: id }, "Highlight deleted successfully");
  }

  async getHighlightsByPdfId(
    pdfId: string,
    userId: string
  ): Promise<Highlight[]> {
    this.logger.info({ pdfId, userId }, "Getting highlights by PDF ID");
    const { data, error } = await this.supabaseClient
      .from("highlights")
      .select("*")
      .eq("pdf_id", pdfId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      this.logger.error(
        { error, pdfId, userId },
        "Error getting highlights by PDF ID"
      );
      throw new DatabaseError(error);
    }

    if (!data) {
      this.logger.info({ pdfId, userId }, "No highlights found for PDF");
      return [];
    }

    this.logger.info(
      { pdfId, userId, count: data.length },
      "Highlights retrieved successfully for PDF"
    );
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
