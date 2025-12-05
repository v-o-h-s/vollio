import { SupabaseClient } from "@supabase/supabase-js";
import { IUserGoogleClassroomRepository } from "../../domain/repositories/IUserGoogleClassroomRepository";
import { GoogleOAuthTokenResponse } from "../../shared/types/lms";
import { DatabaseError } from "../../shared/errors/DatabaseError";

export class UserGoogleClassroomRepository
  implements IUserGoogleClassroomRepository
{
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
      });
    if (error) throw new DatabaseError(error);
  }
  async getTokens(): Promise<GoogleOAuthTokenResponse | null> {
    const { data, error } = await this.supabaseClient
      .from("user_google_classroom")
      .select()
      .single();
    if (error) throw new DatabaseError(error);
    return data;
  }
}
