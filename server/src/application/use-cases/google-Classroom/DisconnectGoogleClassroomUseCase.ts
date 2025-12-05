import { IUserGoogleClassroomRepository } from "../../../domain/repositories/IUserGoogleClassroomRepository";

export class DisconnectGoogleClassroomUseCase {
    private userGoogleClassroomRepository: IUserGoogleClassroomRepository;
    
    constructor(
        userGoogleClassroomRepository: IUserGoogleClassroomRepository
    ) {
        this.userGoogleClassroomRepository = userGoogleClassroomRepository;
    }
    
    async execute(): Promise<void> {
        await this.userGoogleClassroomRepository.deleteTokens();
    }
}
