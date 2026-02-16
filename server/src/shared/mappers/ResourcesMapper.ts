import { Resources } from "../../domain/entities/Resources";

export class ResourcesMapper {
  public static fromPersistenceToDomain(row: any): Resources {
    return new Resources(
      row.user_id,
      row.plan_id,
      Number(row.remaining_ai_tokens),
      Number(row.remaining_storage_bytes),
      new Date(row.created_at),
      new Date(row.updated_at),
    );
  }

  public static toPersistence(resources: Resources) {
    return {
      user_id: resources.getUserId(),
      plan_id: resources.getPlanId(),
      remaining_ai_tokens: resources.getRemainingAiTokens(),
      remaining_storage_bytes: resources.getRemainingStorageBytes(),
      updated_at: new Date().toISOString(),
    };
  }
}
