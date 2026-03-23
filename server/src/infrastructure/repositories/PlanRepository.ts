import { SupabaseClient } from "@supabase/supabase-js";
import { IPlanRepository } from "../../domain/repositories/IPlanRepository";
import { Plan } from "../../domain/entities/Plan";
import { DatabaseError } from "../../shared/errors/DatabaseError";
import { FastifyBaseLogger } from "fastify";
import { PlanMapper } from "../../shared/mappers/PlanMapper";

export class PlanRepository implements IPlanRepository {
  constructor(
    private supabaseClient: SupabaseClient,
    private logger: FastifyBaseLogger,
  ) {}

  async getPlanById(id: string): Promise<Plan | null> {
    const { data, error } = await this.supabaseClient
      .from("plans")
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error) {
      this.logger.error({ error, planId: id }, "Error getting plan by ID");
      throw new DatabaseError(error);
    }

    return data ? PlanMapper.fromPersistenceToDomain(data) : null;
  }

  async getActivePlans(): Promise<Plan[]> {
    const { data, error } = await this.supabaseClient
      .from("plans")
      .select("*")
      .eq("is_active", true);

    if (error) {
      this.logger.error({ error }, "Error getting active plans");
      throw new DatabaseError(error);
    }

    return (data || []).map((row) => PlanMapper.fromPersistenceToDomain(row));
  }

  async getPlanBySlug(slug: string): Promise<Plan | null> {
    const { data, error } = await this.supabaseClient
      .from("plans")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();

    if (error) {
      this.logger.error({ error, slug }, "Error getting plan by slug");
      throw new DatabaseError(error);
    }

    return data ? PlanMapper.fromPersistenceToDomain(data) : null;
  }
}
