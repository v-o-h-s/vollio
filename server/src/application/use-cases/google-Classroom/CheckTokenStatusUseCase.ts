import { IUserGoogleClassroomRepository } from "../../../domain/repositories/IUserGoogleClassroomRepository";
// Use case to check if Google Classroom token is valid
export class CheckTokenStatusUseCase {
    private userGoogleClassroomRepository: IUserGoogleClassroomRepository;
    constructor(
        userGoogleClassroomRepository: IUserGoogleClassroomRepository
    ) {
        this.userGoogleClassroomRepository = userGoogleClassroomRepository;
    }
    async execute(userId?: string): Promise<boolean> {
        return await this.userGoogleClassroomRepository.isTokenValid(userId);
    }
}