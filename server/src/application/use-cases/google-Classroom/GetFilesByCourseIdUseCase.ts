import { IUserGoogleClassroomRepository } from "../../../domain/repositories/IUserGoogleClassroomRepository";
import { IGoogleClassroomService } from "../../../domain/services/IGoogleClassroomService";
import { EnsureValidTokenUseCase } from "./EnsureValidTokenUseCase";

export class GetFilesByCourseIdUseCase {
    private googleClassroomService: IGoogleClassroomService;
    private userGoogleClassroomRepository: IUserGoogleClassroomRepository;
    private ensureValidTokenUseCase: EnsureValidTokenUseCase;

    constructor(
        googleClassroomService: IGoogleClassroomService,
        userGoogleClassroomRepository: IUserGoogleClassroomRepository,
        ensureValidTokenUseCase: EnsureValidTokenUseCase
    ) {
        this.googleClassroomService = googleClassroomService;
        this.userGoogleClassroomRepository = userGoogleClassroomRepository;
        this.ensureValidTokenUseCase = ensureValidTokenUseCase;
    }

    async execute(courseId: string): Promise<any[]> {
        // Ensure token is valid and refresh if needed
        await this.ensureValidTokenUseCase.execute();

        const tokens = await this.userGoogleClassroomRepository.getTokens();
        if (!tokens || !tokens.access_token) {
            throw new Error("No access token available");
        }

        return this.googleClassroomService.getFilesByCourseId(
            tokens.access_token,
            courseId
        );
    }
}
