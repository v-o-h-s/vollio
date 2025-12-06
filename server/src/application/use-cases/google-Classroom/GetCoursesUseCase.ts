import { IUserGoogleClassroomRepository } from "../../../domain/repositories/IUserGoogleClassroomRepository";
import { IGoogleClassroomService } from "../../../domain/services/IGoogleClassroomService";
import { ClassroomCourse } from "../../../shared/types/lms/classroom";
import { EnsureValidTokenUseCase } from "./EnsureValidTokenUseCase";

export class GetCoursesUseCase {
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

  async execute(): Promise<ClassroomCourse[]> {
    // Ensure token is valid and refresh if needed
    await this.ensureValidTokenUseCase.execute();

    const tokens = await this.userGoogleClassroomRepository.getTokens();
    if (!tokens || !tokens.access_token) {
      throw new Error("No access token available");
    }

    return this.googleClassroomService.getCourses(tokens.access_token);
  }
}
