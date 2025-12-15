import { IFileRepository } from "../../../domain/repositories/IFileRepository";
import { IUserGoogleClassroomRepository } from "../../../domain/repositories/IUserGoogleClassroomRepository";
import { IGoogleDriveService } from "../../../domain/services/IGoogleDriveService";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { Readable } from "stream";
import jwt from "jsonwebtoken";
import "dotenv/config";
import { EnsureValidTokenUseCase } from "../google-Classroom/EnsureValidTokenUseCase";
interface SignedPdfTokenPayload {
    fileId: string;
    userId: string;
    purpose: "pdf-stream";
}
/**
 * Use case to stream a file from Google Drive using a signed URL token
 * check auth and token validity
 * 
 */
export class StreamFileUseCase {
    constructor(
        private googleDriveService: IGoogleDriveService,
        private userGoogleClassroomRepository: IUserGoogleClassroomRepository,
        private fileRepository: IFileRepository,
        private ensureValidTokenUseCase: EnsureValidTokenUseCase
    ) { }

    async execute(token: string): Promise<Readable> {
        let payload: SignedPdfTokenPayload;
        try {
            payload = jwt.verify(token, process.env.JWT_SECRET!) as SignedPdfTokenPayload;
        } catch (err) {
            throw new NotFoundError("Invalid or expired token");
        }
        const { fileId, userId, purpose } = payload;
        if (purpose !== "pdf-stream") {
            throw new NotFoundError("Invalid token purpose");
        }

        // Ensure user has valid tokens (auto-refreshes if expired)
        await this.ensureValidTokenUseCase.execute(userId);

        // Get tokens after ensuring validity
        const tokens = await this.userGoogleClassroomRepository.getTokens(userId);
        if (!tokens) {
            throw new NotFoundError("No Google Classroom tokens found for user");
        }
        // Fetch file metadata from repository
        const file = await this.fileRepository.getFileById(fileId);
        if (!file || !file.getGoogleFileId()) {
            throw new NotFoundError("File not found");
        }

       
// Stream file from Google Drive
        const stream = await this.googleDriveService.streamFile(tokens.access_token, file.getGoogleFileId()!);
        return stream;
    }
}