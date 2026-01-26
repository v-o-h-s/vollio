import { SupabaseClient } from "@supabase/supabase-js";
import { IUserGoogleClassroomRepository } from "../../domain/repositories/IUserGoogleClassroomRepository";
import { GoogleOAuthTokenResponse } from "@vollio/shared";
import { DatabaseError } from "../../shared/errors/DatabaseError";
import { createServiceClient } from "../database/supabase/supabase";
import { FastifyBaseLogger } from "fastify";

export class UserGoogleClassroomRepository
  implements IUserGoogleClassroomRepository
{
  private supabaseAdmin: SupabaseClient = createServiceClient();
  constructor(
    private supabaseClient: SupabaseClient,
    private logger: FastifyBaseLogger
  ) {}

  async saveTokens(tokens: GoogleOAuthTokenResponse): Promise<void> {
    this.logger.info("Saving Google Classroom tokens");
    const tokenExpiry = new Date();
    tokenExpiry.setSeconds(tokenExpiry.getSeconds() + tokens.expires_in);
    const { error } = await this.supabaseClient
      .from("user_google_classroom")
      .upsert({
        access_token: tokens.access_token,
        expires_in: tokens.expires_in,
        refresh_token: tokens.refresh_token,
        scope: tokens.scope,
        token_type: tokens.token_type,
        token_expiry: tokenExpiry.toISOString(),
      });
    if (error) {
      this.logger.error({ error }, "Error saving Google Classroom tokens");
      throw new DatabaseError(error);
    }
  }

  async updateTokens(tokens: Partial<GoogleOAuthTokenResponse>): Promise<void> {
    this.logger.info("Updating Google Classroom tokens");
    // Build upsert payload with only the fields to update
    const upsertData: Record<string, any> = {};

    if (tokens.access_token) upsertData.access_token = tokens.access_token;
    if (tokens.expires_in !== undefined)
      upsertData.expires_in = tokens.expires_in;
    if (tokens.token_expiry) upsertData.token_expiry = tokens.token_expiry;
    if (tokens.scope) upsertData.scope = tokens.scope;
    if (tokens.token_type) upsertData.token_type = tokens.token_type;
    if (tokens.refresh_token) upsertData.refresh_token = tokens.refresh_token;

    // Use upsert to safely update without needing explicit WHERE clause
    // Supabase RLS will still ensure user isolation
    const { error } = await this.supabaseClient
      .from("user_google_classroom")
      .upsert(upsertData);

    if (error) {
      this.logger.error({ error }, "Error updating Google Classroom tokens");
      throw new DatabaseError(error);
    }
  }

  async getTokens(userId?: string): Promise<GoogleOAuthTokenResponse | null> {
    this.logger.info({ userId }, "Getting Google Classroom tokens");
    if (userId) {
      const { data, error } = await this.supabaseAdmin
        .from("user_google_classroom")
        .select()
        .eq("user_id", userId)
        .single();
      if (error) {
        // Handle case where no tokens exist for this user
        if (error.code === "PGRST116") {
          this.logger.info(
            { userId },
            "No Google Classroom tokens found for user"
          );
          return null;
        }
        this.logger.error(
          { error, userId },
          "Error getting Google Classroom tokens"
        );
        throw new DatabaseError(error);
      }
      return data;
    }
    const { data, error } = await this.supabaseClient
      .from("user_google_classroom")
      .select()
      .single();
    if (error) {
      // Handle case where no tokens exist for this user
      if (error.code === "PGRST116") {
        this.logger.info("No Google Classroom tokens found for current user");
        return null;
      }
      this.logger.error(
        { error },
        "Error getting Google Classroom tokens for current user"
      );
      throw new DatabaseError(error);
    }
    return data;
  }

  async deleteTokens(): Promise<void> {
    this.logger.info("Deleting Google Classroom tokens");
    const { error } = await this.supabaseClient
      .from("user_google_classroom")
      .delete()
      .single();
    if (error) {
      this.logger.error({ error }, "Error deleting Google Classroom tokens");
      throw new DatabaseError(error);
    }
  }

  async isTokenValid(userId?: string): Promise<boolean> {
    const tokens = await this.getTokens(userId);
    if (!tokens) return false;
    const tokenExpiry = new Date(tokens.token_expiry);
    const isValid = tokenExpiry > new Date();
    this.logger.info(
      { userId, isValid },
      "Checked Google Classroom token validity"
    );
    return isValid;
  }
}
