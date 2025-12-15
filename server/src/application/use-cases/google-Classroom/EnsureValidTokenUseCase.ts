import { IUserGoogleClassroomRepository } from "../../../domain/repositories/IUserGoogleClassroomRepository";
import { IGoogleClassroomService } from "../../../domain/services/IGoogleClassroomService";
// Use case to ensure Google Classroom token is valid, refreshing if necessary
export class EnsureValidTokenUseCase {
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
        // Check if token is valid
        const isTokenValid = await this.userGoogleClassroomRepository.isTokenValid(userId);
        
        // If token is expired, refresh it
        if (!isTokenValid) {
            const tokens = await this.userGoogleClassroomRepository.getTokens(userId);
            if (!tokens || !tokens.refresh_token) {
                throw new Error("No refresh token available. Please reconnect Google Classroom.");
            }
            
            const newTokens = await this.googleClassroomService.refreshAccessToken(
                tokens.refresh_token
            );
            
            // Update with new tokens (only updates changed fields)
            await this.userGoogleClassroomRepository.updateTokens(newTokens);
        }
    }
}
