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

    const [announcements, courseWork] = await Promise.all([
      this.googleClassroomService.getAnnouncementsByCourseId(
        tokens.access_token,
        courseId
      ),
      this.googleClassroomService.getCourseWorkMaterialsByCourseId(
        tokens.access_token,
        courseId
      ),
    ]);

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
      .filter((item) => item.materials.driveFiles.length > 0);

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
      .filter((item) => item.materials.driveFiles.length > 0);

    return {
      announcements: formattedAnnouncements,
      materials: formattedCourseWork,
    };
  }
}
