import { IFileRepository } from "../../../domain/repositories/IFileRepository";
import { IUserGoogleClassroomRepository } from "../../../domain/repositories/IUserGoogleClassroomRepository";
import { IGoogleClassroomService } from "../../../domain/services/IGoogleClassroomService";
import { CheckTokenStatusUseCase } from "../google-Classroom/CheckTokenStatusUseCase";
import { File } from "../../../domain/entities/File";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
export class StreamFileUseCase {
    constructor(private ensureValidTokenUseCase: CheckTokenStatusUseCase,
        private googleDriveService: IGoogleClassroomService,
        private userGoogleClassroomRepository: IUserGoogleClassroomRepository,
        private fileRepo: IFileRepository
    ) { }

    async execute(fileId: string): Promise<import("stream").Readable> {
        const file = await this.fileRepo.getFileById(fileId);

        if (!file) {
            throw new NotFoundError("File not found");
        }

        const fileGoogleDriveId = file.getGoogleFileId();
        if (!fileGoogleDriveId) {
            throw new NotFoundError("File is not linked to Google Drive");
        }

        const isTokenValid = await this.ensureValidTokenUseCase.execute();
        if (!isTokenValid) {
            throw new Error("Invalid Google Classroom Token");
        }

        const tokens = await this.userGoogleClassroomRepository.getTokens();
        if (!tokens || !tokens.access_token) {
            throw new Error("No access token available.");
        }
        
        const stream = await this.googleDriveService.streamFile(tokens.access_token, fileGoogleDriveId);
        return stream;
    }
}