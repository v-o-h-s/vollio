import { SupabaseClient } from "@supabase/supabase-js";
import { ISettingsRepository } from "../../domain/repositories/ISettingsRepository";
import { Tag } from "@vollio/shared";
import { DatabaseError } from "../../shared/errors/DatabaseError";
import { FastifyBaseLogger } from "fastify";

export class SettingsRepository implements ISettingsRepository {
  constructor(
    private supabaseClient: SupabaseClient,

    private logger: FastifyBaseLogger
  ) {}

  async getUserTags(): Promise<Tag[]> {
    this.logger.info("Getting user tags from database");

    // We store tags in a user_preferences table
    const { data, error } = await this.supabaseClient
      .from("user_preferences")
      .select("tags")
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        this.logger.info("No user preferences found, returning empty tags");
        return [];
      }
      this.logger.error({ error }, "Error getting user tags");
      throw new DatabaseError(error);
    }

    return (data?.tags as Tag[]) || [];
  }

  async upsertUserTags(tags: Tag[]): Promise<Tag[]> {
    this.logger.info({ count: tags.length }, "Upserting user tags to database");

    // Get the authenticated user ID
    const { data: { user }, error: authError } = await this.supabaseClient.auth.getUser();
    
    if (authError || !user) {
      this.logger.error({ error: authError }, "Unauthorized: Could not get user for upserting tags");
      throw new DatabaseError({ message: "Unauthorized: User not found", code: "401" } as any);
    }

    const { data, error } = await this.supabaseClient
      .from("user_preferences")
      .upsert(
        {
          user_id: user.id,
          tags: tags,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select("tags")
      .single();

    if (error) {
      this.logger.error({ error }, "Error upserting user tags");
      throw new DatabaseError(error);
    }

    return (data?.tags as Tag[]) || [];
  }
}
