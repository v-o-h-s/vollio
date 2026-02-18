import { Resources } from "../../domain/entities/Resources";

export class ResourcesMapper {
  public static fromPersistenceToDomain(row: any): Resources {
    return new Resources(
      row.user_id,
      row.plan_id,
      Number(row.used_ai_tokens || 0),
      Number(row.used_storage_bytes || 0),
      Number(row.used_documents || 0),
      Number(row.max_ai_tokens || 0),
      Number(row.max_storage_bytes || 0),
      Number(row.max_documents || 0),
      new Date(row.created_at),
      new Date(row.updated_at),
    );
  }

  public static toPersistence(resources: Resources) {
    return {
      user_id: resources.getUserId(),
      plan_id: resources.getPlanId(),
      used_ai_tokens: resources.getUsedAiTokens(),
      used_storage_bytes: resources.getUsedStorageBytes(),
      used_documents: resources.getUsedDocuments(),
      max_ai_tokens: resources.getMaxAiTokens(),
      max_storage_bytes: resources.getMaxStorageBytes(),
      max_documents: resources.getMaxDocuments(),
      updated_at: new Date().toISOString(),
    };
  }
}
