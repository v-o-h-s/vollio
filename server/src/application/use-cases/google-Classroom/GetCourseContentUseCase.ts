import { IUserGoogleClassroomRepository } from "../../../domain/repositories/IUserGoogleClassroomRepository";
import { IGoogleClassroomService } from "../../../domain/services/IGoogleClassroomService";
import { ClassroomAnnouncementResponse } from "../../../shared/types/lms/classroom";
import { EnsureValidTokenUseCase } from "./EnsureValidTokenUseCase";

export class GetCourseContentUseCase {
  constructor(
    private googleClassroomService: IGoogleClassroomService,
    private userGoogleClassroomRepository: IUserGoogleClassroomRepository,
    private ensureValidTokenUseCase: EnsureValidTokenUseCase
  ) {}

  async execute(courseId: string): Promise<{
    announcements: ClassroomAnnouncementResponse[];
    materials: any[];
  }> {
    // Ensure token is valid and refresh if needed
    await this.ensureValidTokenUseCase.execute();

    const tokens = await this.userGoogleClassroomRepository.getTokens();
    if (!tokens || !tokens.access_token) {
      throw new Error("No access token available");
    }

    const [announcements, materials] = await Promise.all([
      this.googleClassroomService.getAnnouncementsByCourseId(
        tokens.access_token,
        courseId
      ),
      this.googleClassroomService.getCourseWorkMaterialsByCourseId(
        tokens.access_token,
        courseId
      ),
    ]);

    const formattedAnnouncements = (announcements || []).map((announcement) => {
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
    });

    return {
      announcements: formattedAnnouncements,
      materials: materials || [],
    };
  }
}
