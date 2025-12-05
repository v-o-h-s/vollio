import { IUserGoogleClassroomRepository } from "../../../domain/repositories/IUserGoogleClassroomRepository";

export class IsConnectedToGoogleClassroomUseCase {
    private userGoogleClassroomRepository: IUserGoogleClassroomRepository;

    constructor(
        userGoogleClassroomRepository: IUserGoogleClassroomRepository
    ) {
        this.userGoogleClassroomRepository = userGoogleClassroomRepository;
    }

    async execute(): Promise<boolean> {
        const tokens = await this.userGoogleClassroomRepository.getTokens();
        return tokens !== null;
    }
}
