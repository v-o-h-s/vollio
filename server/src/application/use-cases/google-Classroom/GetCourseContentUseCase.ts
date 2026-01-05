import { IUserGoogleClassroomRepository } from "../../../domain/repositories/IUserGoogleClassroomRepository";
import { IGoogleClassroomService } from "../../../domain/services/IGoogleClassroomService";
import {
  ClassroomAnnouncementResponse,
  ClassroomCourseWorkResponse,
} from "../../../shared/types/lms/classroom";
import { EnsureValidTokenUseCase } from "./EnsureValidTokenUseCase";

export class GetCourseContentUseCase {
  constructor(
    private googleClassroomService: IGoogleClassroomService,
    private userGoogleClassroomRepository: IUserGoogleClassroomRepository,
    private ensureValidTokenUseCase: EnsureValidTokenUseCase
  ) {}

  async execute(courseId: string): Promise<{
    announcements: ClassroomAnnouncementResponse[];
    materials: ClassroomCourseWorkResponse[];
  }> {
    // Ensure token is valid and refresh if needed
    await this.ensureValidTokenUseCase.execute();

    const tokens = await this.userGoogleClassroomRepository.getTokens();
    if (!tokens || !tokens.access_token) {
      throw new Error("No access token available");
    }

    // Fetch announcements and course work with error handling
    let announcements: any[] = [];
    let courseWork: any[] = [];

    try {
      announcements =
        await this.googleClassroomService.getAnnouncementsByCourseId(
          tokens.access_token,
          courseId
        );
    } catch (error: any) {
      console.warn(
        `Failed to fetch announcements for course ${courseId}:`,
        error.message
      );
      // Gracefully handle 404 or other errors - return empty array
      announcements = [];
    }

    try {
      courseWork =
        await this.googleClassroomService.getCourseWorkMaterialsByCourseId(
          tokens.access_token,
          courseId
        );
    } catch (error: any) {
      console.warn(
        `Failed to fetch course work for course ${courseId}:`,
        error.message
      );
      // Gracefully handle 404 or other errors - return empty array
      courseWork = [];
    }

    const formattedAnnouncements = (announcements || [])
      .map((announcement) => {
        const driveDocuments = (announcement.materials || [])
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
            driveDocuments: driveDocuments,
          },
        };
      })
      .filter((item) => item.materials.driveDocuments.length > 0);

    const formattedCourseWork = (courseWork || [])
      .map((work) => {
        const driveDocuments = (work.materials || [])
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
            driveDocuments: driveDocuments,
          },
        };
      })
      .filter((item) => item.materials.driveDocuments.length > 0);

    return {
      announcements: formattedAnnouncements,
      materials: formattedCourseWork,
    };
  }
}
