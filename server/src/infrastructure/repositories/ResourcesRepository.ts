import { SupabaseClient } from "@supabase/supabase-js";
import { FastifyBaseLogger } from "fastify";
import { IResourcesRepository } from "../../domain/repositories/IResourcesRepository";
import { Resources } from "../../domain/entities/Resources";
import { ResourcesMapper } from "../../shared/mappers/ResourcesMapper";
import { DatabaseError } from "../../shared/errors/DatabaseError";

export class ResourcesRepository implements IResourcesRepository {
  constructor(
    protected supabaseClient: SupabaseClient,
    protected logger: FastifyBaseLogger,
  ) {}

  async getByUserId(userId: string): Promise<Resources | null> {
    const { data, error } = await this.supabaseClient
      .from("resources")
      .select("*")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      this.logger.error({ error, userId }, "Error getting user resources");
      throw new DatabaseError(error);
    }

    return data ? ResourcesMapper.fromPersistenceToDomain(data) : null;
  }

  async upsert(resources: Resources): Promise<Resources> {
    const { data, error } = await this.supabaseClient
      .from("resources")
      .upsert(ResourcesMapper.toPersistence(resources))
      .select()
      .single();

    if (error) {
      this.logger.error(
        { error, userId: resources.getUserId() },
        "Error upserting user resources",
      );
      throw new DatabaseError(error);
    }

    return ResourcesMapper.fromPersistenceToDomain(data);
  }

  async delete(userId: string): Promise<void> {
    const { error } = await this.supabaseClient
      .from("resources")
      .delete()
      .eq("user_id", userId);

    if (error) {
      this.logger.error({ error, userId }, "Error deleting user resources");
      throw new DatabaseError(error);
    }
  }
}
