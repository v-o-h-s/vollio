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
import { HighlightsMapper } from "../../shared/mappers/HighlightsMapper";

export class HighlightRepository implements IHighlightRepository {
  constructor(
    private supabaseClient: SupabaseClient,
    private logger: FastifyBaseLogger
  ) {}

  async getAllHighlights(
    userId: string,
    documentId?: string
  ): Promise<Highlight[]> {
    this.logger.info({ userId, documentId }, "Getting all highlights");
    let query = this.supabaseClient
      .from("highlights")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (documentId) {
      query = query.eq("document_id", documentId);
    }

    const { data, error } = await query;

    if (error) {
      this.logger.error(
        { error, userId, documentId },
        "Error getting all highlights"
      );
      throw new DatabaseError(error);
    }

    if (!data) {
      this.logger.info({ userId, documentId }, "No highlights found");
      return [];
    }

    this.logger.info(
      { userId, documentId, count: data.length },
      "Highlights retrieved successfully"
    );
    return data.map((row) => HighlightsMapper.mapRowToHighlight(row));
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
    return HighlightsMapper.mapRowToHighlight(data);
  }

  async createHighlight(highlight: Highlight): Promise<Highlight> {
    this.logger.info(
      {
        highlightId: highlight.getId(),
        userId: highlight.getUserId(),
        documentId: highlight.getDocumentId(),
      },
      "Creating highlight"
    );
    const { data, error } = await this.supabaseClient
      .from("highlights")
      .insert({
        id: highlight.getId(),
        user_id: highlight.getUserId(),
        document_id: highlight.getDocumentId(),
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
    return HighlightsMapper.mapRowToHighlight(data);
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
        document_id: highlight.getDocumentId(),
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
    return HighlightsMapper.mapRowToHighlight(data);
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

  async getHighlightsByDocumentIdAndUserId(
    documentId: string,
    userId: string
  ): Promise<Highlight[]> {
    this.logger.info(
      { documentId, userId },
      "Getting highlights by Document ID"
    );
    const { data, error } = await this.supabaseClient
      .from("highlights")
      .select("*")
      .eq("document_id", documentId)
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      this.logger.error(
        { error, documentId, userId },
        "Error getting highlights by Document ID"
      );
      throw new DatabaseError(error);
    }

    if (!data) {
      this.logger.info(
        { documentId, userId },
        "No highlights found for Document"
      );
      return [];
    }

    this.logger.info(
      { documentId, userId, count: data.length },
      "Highlights retrieved successfully for Document"
    );
    return data.map((row) => HighlightsMapper.mapRowToHighlight(row));
  }

  async getHighlightsByDocumentId(documentId: string): Promise<Highlight[]> {
    this.logger.info({ documentId }, "Getting highlights by document ID");
    const { data, error } = await this.supabaseClient
      .from("highlights")
      .select("*")
      .eq("document_id", documentId)
      .order("created_at", { ascending: false });

    if (error) {
      this.logger.error(
        { error, documentId },
        "Error getting highlights by document ID"
      );
      throw new DatabaseError(error);
    }

    if (!data) {
      this.logger.info({ documentId }, "No highlights found for document");
      return [];
    }

    this.logger.info(
      { documentId, count: data.length },
      "Highlights retrieved successfully for document"
    );
    return data.map((row) => HighlightsMapper.mapRowToHighlight(row));
  }

  async countHighlightsByTag(userId: string, tagName: string): Promise<number> {
    this.logger.info({ userId, tagName }, "Counting highlights by tag");
    const { count, error } = await this.supabaseClient
      .from("highlights")
      .select("*", { count: "exact", head: true })
      .eq("user_id", userId)
      .contains("tags", [tagName]);

    if (error) {
      this.logger.error({ error, userId, tagName }, "Error counting highlights by tag");
      throw new DatabaseError(error);
    }

    return count || 0;
  }

  async deleteHighlightsByTag(userId: string, tagName: string): Promise<void> {
    this.logger.info({ userId, tagName }, "Deleting highlights by tag");
    const { error } = await this.supabaseClient
      .from("highlights")
      .delete()
      .eq("user_id", userId)
      .contains("tags", [tagName]);

    if (error) {
      this.logger.error({ error, userId, tagName }, "Error deleting highlights by tag");
      throw new DatabaseError(error);
    }

    this.logger.info({ userId, tagName }, "Highlights with tag deleted successfully");
  }
}
