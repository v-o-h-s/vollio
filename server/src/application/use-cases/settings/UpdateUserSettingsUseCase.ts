import { UserSettings } from "@vollio/shared";
import { ISettingsRepository } from "../../../domain/repositories/ISettingsRepository";
import { FastifyBaseLogger } from "fastify";

interface UpdateUserSettingsInput {
  settings: UserSettings;
}

export class UpdateUserSettingsUseCase {
  constructor(
    private settingsRepository: ISettingsRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(input: UpdateUserSettingsInput): Promise<UserSettings> {
    this.logger.info("Executing UpdateUserSettingsUseCase");

    // We only store custom tags in the database
    const customTags = input.settings.tags.filter(tag => !tag.isDefault);

    await this.settingsRepository.upsertUserTags(customTags);

    this.logger.info(
      { customTagsCount: customTags.length },
      "UpdateUserSettingsUseCase executed successfully"
    );

    return input.settings;
  }
}
