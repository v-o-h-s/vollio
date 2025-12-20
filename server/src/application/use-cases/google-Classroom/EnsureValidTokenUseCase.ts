import { IUserGoogleClassroomRepository } from "../../../domain/repositories/IUserGoogleClassroomRepository";
import { IGoogleClassroomService } from "../../../domain/services/IGoogleClassroomService";
import { FastifyBaseLogger } from "fastify";

// Use case to ensure Google Classroom token is valid, refreshing if necessary
export class EnsureValidTokenUseCase {
  constructor(
    private googleClassroomService: IGoogleClassroomService,
    private userGoogleClassroomRepository: IUserGoogleClassroomRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(userId?: string): Promise<void> {
    this.logger.info({ userId }, "Executing EnsureValidTokenUseCase");
    // Check if token is valid
    const isTokenValid = await this.userGoogleClassroomRepository.isTokenValid(
      userId
    );

    // If token is expired, refresh it
    if (!isTokenValid) {
      this.logger.info(
        { userId },
        "Google Classroom token expired, refreshing..."
      );
      const tokens = await this.userGoogleClassroomRepository.getTokens(userId);
      if (!tokens || !tokens.refresh_token) {
        this.logger.error(
          { userId },
          "No refresh token available during EnsureValidTokenUseCase"
        );
        throw new Error(
          "No refresh token available. Please reconnect Google Classroom."
        );
      }

      const newTokens = await this.googleClassroomService.refreshAccessToken(
        tokens.refresh_token
      );

      // Update with new tokens (only updates changed fields)
      await this.userGoogleClassroomRepository.updateTokens(newTokens);
      this.logger.info(
        { userId },
        "Google Classroom token refreshed successfully"
      );
    } else {
      this.logger.info({ userId }, "Google Classroom token is still valid");
    }
  }
}
