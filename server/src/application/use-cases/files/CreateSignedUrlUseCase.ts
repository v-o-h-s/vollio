import "dotenv/config";
interface SignedPdfTokenPayload {
    fileId: string;
    userId: string;
    purpose: "pdf-stream";
}
import jwt from "jsonwebtoken";
import { FileRepository } from "../../../infrastructure/repositories/FileRepository";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
export class CreateSignedUrlUseCase {
    constructor(private fileRepository: FileRepository) { }
    async execute(fileId: string, userId: string): Promise<string> {
        const file = await this.fileRepository.getFileById(fileId);
        if (!file) {
            throw new NotFoundError("File not found");
        }

        const payload: SignedPdfTokenPayload = {
            fileId,
            userId,
            purpose: "pdf-stream",
        };
        const token: string = jwt.sign(payload, process.env.JWT_SECRET || "jwt-secret", { expiresIn: "5m" });

        return `${process.env.BACKEND_BASE_URL}/api/v1/files/stream?token=${token}`;

    }
}