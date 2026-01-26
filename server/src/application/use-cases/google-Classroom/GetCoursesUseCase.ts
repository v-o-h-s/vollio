import { IUserGoogleClassroomRepository } from "../../../domain/repositories/IUserGoogleClassroomRepository";
import { IGoogleClassroomService } from "../../../domain/services/IGoogleClassroomService";
import { Course, CourseListResponse } from "@vollio/shared";
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

  async execute(): Promise<CourseListResponse[]> {
    // Ensure token is valid and refresh if needed
    await this.ensureValidTokenUseCase.execute();

    const tokens = await this.userGoogleClassroomRepository.getTokens();
    if (!tokens || !tokens.access_token) {
      throw new Error("No access token available");
    }

    const courses = await this.googleClassroomService.getCourses(tokens.access_token);

    // Map to CourseListResponse with only required fields
    return courses.map((course: Course) => ({
      id: course.id,
      name: course.name,
      updateTime: course.updateTime,
      courseState: course.courseState,
      alternateLink: course.alternateLink,
    }));
  }
}
