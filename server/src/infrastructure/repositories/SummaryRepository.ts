import { ISummaryRepository } from "../../domain/repositories/ISummaryRepository";
import { SupabaseClient } from "@supabase/supabase-js";
import { Summary } from "../../domain/entities/Summary";
import { DatabaseError } from "../../shared/errors/DatabaseError";

export class SummaryRepository implements ISummaryRepository {
  private supabaseClient: SupabaseClient;

  constructor(supabaseClient: SupabaseClient) {
    this.supabaseClient = supabaseClient;
  }
  async createSummary(summary: Summary): Promise<Summary> {
    const { error } = await this.supabaseClient
      .from("summaries")
      .insert(summary);
    if (error) {
      throw new DatabaseError(error);
    }
    return summary;
  }

  async deleteSummaryRow(summaryId: string): Promise<void> {
    const { error } = await this.supabaseClient
      .from("summaries")
      .delete()
      .eq("id", summaryId);
    if (error) {
      throw new DatabaseError(error);
    }
  }
  async getSummaryById(summaryId: string): Promise<Summary | null> {
    const { data, error } = await this.supabaseClient
      .from("summaries")
      .select("*")
      .eq("id", summaryId)
      .single();
    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new DatabaseError(error);
    }
    return data;
  }
  async getSummariesByDocumentId(documentId: string): Promise<Summary[]> {
    const { data, error } = await this.supabaseClient
      .from("summaries")
      .select("*")
      .eq("pdf_id", documentId);
    if (error) {
      throw new DatabaseError(error);
    }
    return data;
  }
  async deleteSummariesByDocumentId(documentId: string): Promise<void> {
    const { error } = await this.supabaseClient
      .from("summaries")
      .delete()
      .eq("pdf_id", documentId);
    if (error) {
      throw new DatabaseError(error);
    }
  }
  async updateSummaryMainPoints(
    summaryId: string,
    mainPoints: string[]
  ): Promise<void> {
    const { error } = await this.supabaseClient
      .from("summaries")
      .update({ main_points: mainPoints })
      .eq("id", summaryId);
    if (error) {
      throw new DatabaseError(error);
    }
  }
  async updateSummaryText(
    summaryId: string,
    text: string | null
  ): Promise<void> {
    const { error } = await this.supabaseClient
      .from("summaries")
      .update({ text: text ?? null })
      .eq("id", summaryId);
    if (error) {
      throw new DatabaseError(error);
    }
  }
  async updateSummary(summary: Summary): Promise<void> {
    const { error } = await this.supabaseClient
      .from("summaries")
      .update(summary)
      .eq("id", summary.getId());
    if (error) {
      throw new DatabaseError(error);
    }
  }
}
