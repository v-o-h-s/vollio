import { UserSettings } from "../../../shared";
import { ISettingsRepository } from "../../../domain/repositories/ISettingsRepository";
import { DEFAULT_TAGS } from "../../../shared/constants/tags";
import { FastifyBaseLogger } from "fastify";

export class GetUserSettingsUseCase {
  constructor(
    private settingsRepository: ISettingsRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(): Promise<UserSettings> {
    this.logger.info("Executing GetUserSettingsUseCase");
    
    const userTags = await this.settingsRepository.getUserTags();
    
    const settings: UserSettings = {
      tags: [...DEFAULT_TAGS, ...userTags],
    };

    this.logger.info(
      { customTagsCount: userTags.length },
      "GetUserSettingsUseCase executed successfully"
    );

    return settings;
  }
}