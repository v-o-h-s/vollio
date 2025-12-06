import { IUserGoogleClassroomRepository } from "../../../domain/repositories/IUserGoogleClassroomRepository";
import { IGoogleClassroomService } from "../../../domain/services/IGoogleClassroomService";
import { ClassroomAnnouncementResponse } from "../../../shared/types/lms/classroom";
import { EnsureValidTokenUseCase } from "./EnsureValidTokenUseCase";

export class GetAnnouncementsByCourseIdUseCase {
  constructor(
    private googleClassroomService: IGoogleClassroomService,
    private userGoogleClassroomRepository: IUserGoogleClassroomRepository,
    private ensureValidTokenUseCase: EnsureValidTokenUseCase
  ) {}

  async execute(courseId: string): Promise<ClassroomAnnouncementResponse[]> {
    // Ensure token is valid and refresh if needed
    await this.ensureValidTokenUseCase.execute();

    const tokens = await this.userGoogleClassroomRepository.getTokens();
    if (!tokens || !tokens.access_token) {
      throw new Error("No access token available");
    }

    const announcements =
      await this.googleClassroomService.getAnnouncementsByCourseId(
        tokens.access_token,
        courseId
      );

    if (!announcements || announcements.length === 0) {
      return [];
    }

    return announcements.map((announcement) => {
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
  }
}
