import { SupabaseClient } from "@supabase/supabase-js";
import { IUserGoogleClassroomRepository } from "../../domain/repositories/IUserGoogleClassroomRepository";
import { GoogleOAuthTokenResponse } from "../../shared/types/lms";
import { DatabaseError } from "../../shared/errors/DatabaseError";

export class UserGoogleClassroomRepository
  implements IUserGoogleClassroomRepository {
  private supabaseClient: SupabaseClient;
  constructor(supabaseClient: SupabaseClient) {
    this.supabaseClient = supabaseClient;
  }

  async saveTokens(tokens: GoogleOAuthTokenResponse): Promise<void> {
    const { data, error } = await this.supabaseClient
      .from("user_google_classroom")
      .upsert({
        access_token: tokens.access_token,
        expires_in: tokens.expires_in,
        refresh_token: tokens.refresh_token,
        scope: tokens.scope,
        token_type: tokens.token_type,
        token_expiry: tokens.token_expiry,
      });
    if (error) throw new DatabaseError(error);
  }

  async updateTokens(tokens: Partial<GoogleOAuthTokenResponse>): Promise<void> {
    // Build upsert payload with only the fields to update
    const upsertData: Record<string, any> = {};
    
    if (tokens.access_token) upsertData.access_token = tokens.access_token;
    if (tokens.expires_in !== undefined) upsertData.expires_in = tokens.expires_in;
    if (tokens.token_expiry) upsertData.token_expiry = tokens.token_expiry;
    if (tokens.scope) upsertData.scope = tokens.scope;
    if (tokens.token_type) upsertData.token_type = tokens.token_type;
    if (tokens.refresh_token) upsertData.refresh_token = tokens.refresh_token;

    // Use upsert to safely update without needing explicit WHERE clause
    // Supabase RLS will still ensure user isolation
    const { error } = await this.supabaseClient
      .from("user_google_classroom")
      .upsert(upsertData);
      
    if (error) throw new DatabaseError(error);
  }

  async getTokens(): Promise<GoogleOAuthTokenResponse | null> {
    const { data, error } = await this.supabaseClient
      .from("user_google_classroom")
      .select()
      .single();
    if (error) {
      // Handle case where no tokens exist for this user
      if (error.code === 'PGRST116') return null;
      throw new DatabaseError(error);
    }
    return data;
  }

  async deleteTokens(): Promise<void> {
    const { error } = await this.supabaseClient
      .from("user_google_classroom")
      .delete()
      .single();
    if (error) throw new DatabaseError(error);
  }

  async isTokenValid(): Promise<boolean> {
    const tokens = await this.getTokens();
    if (!tokens) return false;
    const tokenExpiry = new Date(tokens.token_expiry);
    return tokenExpiry > new Date();
  }
}
