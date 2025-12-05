import { IUserGoogleClassroomRepository } from "../../../domain/repositories/IUserGoogleClassroomRepository";

export class CheckTokenStatusUseCase {
    private userGoogleClassroomRepository: IUserGoogleClassroomRepository;
    constructor(
        userGoogleClassroomRepository: IUserGoogleClassroomRepository
    ) {
        this.userGoogleClassroomRepository = userGoogleClassroomRepository;
    }
    async execute(): Promise<boolean> {
        return await this.userGoogleClassroomRepository.isTokenValid();
    }
}