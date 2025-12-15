import { IUserGoogleClassroomRepository } from "../../../domain/repositories/IUserGoogleClassroomRepository";
import { IGoogleClassroomService } from "../../../domain/services/IGoogleClassroomService";
import { GoogleClassroomService } from "../../../infrastructure/services/GoogleClassroomService";
// should be deleted copied from EnsureValidTokenUseCase
export class RefreshTokenAndUpdateTheDatabaseUseCase {
    private googleClassroomService: IGoogleClassroomService;
    private userGoogleClassroomRepository: IUserGoogleClassroomRepository;
    constructor(
        googleClassroomService: IGoogleClassroomService,
        userGoogleClassroomRepository: IUserGoogleClassroomRepository
    ) {
        this.googleClassroomService = googleClassroomService;
        this.userGoogleClassroomRepository = userGoogleClassroomRepository;
    }
    async execute(userId?: string): Promise<void> {
        const tokens = await this.userGoogleClassroomRepository.getTokens(userId);
        if (!tokens || !tokens.refresh_token) {
            throw new Error("No refresh token available");
        }
        const newTokens =
            await this.googleClassroomService.refreshAccessToken(
                tokens.refresh_token
            );
        // Use updateTokens to avoid overwriting refresh_token with undefined
        await this.userGoogleClassroomRepository.updateTokens(newTokens);
    }
}