import { IUserGoogleClassroomRepository } from "../../../domain/repositories/IUserGoogleClassroomRepository";
import { IGoogleClassroomService } from "../../../domain/services/IGoogleClassroomService";
import {
  ClassroomAnnouncementResponse,
  ClassroomCourseWorkResponse,
  Course,
} from "../../../shared/types/lms/classroom";
import { EnsureValidTokenUseCase } from "./EnsureValidTokenUseCase";

export type CourseWithContent = Course & {
  content: {
    announcements: ClassroomAnnouncementResponse[];
    materials: ClassroomCourseWorkResponse[];
  };
};

export class GetCoursesWithContentUseCase {
  constructor(
    private googleClassroomService: IGoogleClassroomService,
    private userGoogleClassroomRepository: IUserGoogleClassroomRepository,
    private ensureValidTokenUseCase: EnsureValidTokenUseCase
  ) { }

  async execute(): Promise<CourseWithContent[]> {
    // Ensure token is valid and refresh if needed
    await this.ensureValidTokenUseCase.execute();

    const tokens = await this.userGoogleClassroomRepository.getTokens();
    if (!tokens || !tokens.access_token) {
      throw new Error("No access token available");
    }

    const courses = await this.googleClassroomService.getCourses(
      tokens.access_token
    );

    if (!courses || courses.length === 0) {
      return [];
    }

    // Fetch content for all courses in parallel
    const coursesWithContent = await Promise.all(
      courses.map(async (course: Course) => {
        if (!course.id)
          return { ...course, content: { announcements: [], materials: [] } };

        let announcements: any[] = [];
        let courseWork: any[] = [];

        try {
          announcements = await this.googleClassroomService.getAnnouncementsByCourseId(
            tokens.access_token,
            course.id
          );
        } catch (error: any) {
          console.warn(`Failed to fetch announcements for course ${course.id}:`, error.message);
          announcements = [];
        }

        try {
          courseWork = await this.googleClassroomService.getCourseWorkMaterialsByCourseId(
            tokens.access_token,
            course.id
          );
        } catch (error: any) {
          console.warn(`Failed to fetch course work for course ${course.id}:`, error.message);
          courseWork = [];
        }

        const formattedAnnouncements = (announcements || [])
          .map((announcement) => {
            const driveFiles = (announcement.materials || [])
              .filter((m: any) => m.driveFile && m.driveFile.driveFile)
              .map((m: any) => ({
                id: m.driveFile.driveFile.id,
                title: m.driveFile.driveFile.title,
              }));

            return {
              id: announcement.id,
              courseId: announcement.courseId,
              state: announcement.state,
              alternateLink: announcement.alternateLink,
              updatedAt: announcement.updateTime,
              materials: {
                driveFiles: driveFiles,
              },
            };
          })
          .filter((item: any) => item.materials.driveFiles.length > 0);

        const formattedCourseWork = (courseWork || [])
          .map((work) => {
            const driveFiles = (work.materials || [])
              .filter((m: any) => m.driveFile && m.driveFile.driveFile)
              .map((m: any) => ({
                id: m.driveFile.driveFile.id,
                title: m.driveFile.driveFile.title,
                thumbnailUrl: m.driveFile.driveFile.thumbnailUrl,
              }));

            return {
              id: work.id,
              courseId: work.courseId,
              title: work.title,
              state: work.state,
              alternateLink: work.alternateLink,
              updatedAt: work.updateTime,
              materials: {
                driveFiles: driveFiles,
              },
            };
          })
          .filter((item: any) => item.materials.driveFiles.length > 0);

        return {
          ...course,
          content: {
            announcements: formattedAnnouncements,
            materials: formattedCourseWork,
          },
        };
      })
    );

    return coursesWithContent;
  }
}
