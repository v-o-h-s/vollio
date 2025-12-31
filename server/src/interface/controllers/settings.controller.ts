import { FastifyReply, FastifyRequest } from "fastify";
import { GetUserSettingsUseCase } from "../../application/use-cases/settings/GetUserSettingsUseCase";
import { UpdateUserSettingsUseCase } from "../../application/use-cases/settings/UpdateUserSettingsUseCase";
import { UserSettings } from "@vollio/shared";

export class SettingsController {
  constructor(
    private getUserSettingsUseCase: GetUserSettingsUseCase,
    private updateUserSettingsUseCase: UpdateUserSettingsUseCase
  ) {}

  async getSettings(request: FastifyRequest, reply: FastifyReply) {
    try {
      const settings = await this.getUserSettingsUseCase.execute();
      return reply.send({
        success: true,
        data: settings,
      });
    } catch (error: any) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: { message: error.message || "Internal server error" },
      });
    }
  }

  async updateSettings(request: FastifyRequest, reply: FastifyReply) {
    try {
      const settings = request.body as UserSettings;
      const updatedSettings = await this.updateUserSettingsUseCase.execute({ settings });
      return reply.send({
        success: true,
        data: updatedSettings,
      });
    } catch (error: any) {
      request.log.error(error);
      return reply.status(500).send({
        success: false,
        error: { message: error.message || "Internal server error" },
      });
    }
  }
}
