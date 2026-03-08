import { Tag } from "../../shared";

export interface ISettingsRepository {
  getUserTags(): Promise<Tag[]>;
  upsertUserTags(tags: Tag[]): Promise<Tag[]>;
}
