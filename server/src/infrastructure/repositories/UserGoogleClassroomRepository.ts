import { SupabaseClient } from "@supabase/supabase-js";
import { IUserGoogleClassroomRepository } from "../../domain/repositories/IUserGoogleClassroomRepository";
import { GoogleOAuthTokenResponse } from "../../shared/types/lms";

export class UserGoogleClassroomRepository
  implements IUserGoogleClassroomRepository
{
  private supabaseClient: SupabaseClient;
  constructor(supabaseClient: SupabaseClient) {
    this.supabaseClient = supabaseClient;
  }

  async saveTokens(
    userId: string,
    tokens: GoogleOAuthTokenResponse
  ): Promise<void> {
    const { data, error } = await this.supabaseClient
      .from("user_google_classroom")
      .upsert({
        access_token: tokens.access_token,
        expires_in: tokens.expires_in,
        refresh_token: tokens.refresh_token,
        scope: tokens.scope,
        token_type: tokens.token_type,
      });
    if (error) throw error;
  }
  async getTokens(userId: string): Promise<GoogleOAuthTokenResponse | null> {
    const { data, error } = await this.supabaseClient
      .from("user_google_classroom")
      .select()
      .eq("user_id", userId)
      .single();
    if (error) throw error;
    return data;
  }
}
