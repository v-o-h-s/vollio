import { IDocumentRepository } from "../../../domain/repositories/IDocumentRepository";
import crypto from "crypto";
import { IGoogleDriveService } from "../../../domain/services/IGoogleDriveService";
import { UserGoogleClassroomRepository } from "../../../infrastructure/repositories/UserGoogleClassroomRepository";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { ServerError } from "../../../shared/errors/ServerError";
import { EnsureValidTokenUseCase } from "../google-Classroom/EnsureValidTokenUseCase";
import { Document } from "../../../domain/entities/Document";
import { FastifyBaseLogger } from "fastify";

export class AddDocumentFromGoogleDriveUseCase {
  constructor(
    private documentRepository: IDocumentRepository,
    private googleDriveService: IGoogleDriveService,
    private userGoogleClassroomRepository: UserGoogleClassroomRepository,
    private ensureValidTokenUseCase: EnsureValidTokenUseCase,
    private logger: FastifyBaseLogger,
  ) {}

  async execute(documentGoogleDriveId: string): Promise<void> {
    this.logger.info(
      { documentGoogleDriveId },
      "Executing AddDocumentFromGoogleDriveUseCase",
    );
    // Ensure valid token and refresh it if not valid
    await this.ensureValidTokenUseCase.execute();
    const tokens = await this.userGoogleClassroomRepository.getTokens();
    if (!tokens || !tokens.access_token) {
      this.logger.error(
        "No access token available in AddDocumentFromGoogleDriveUseCase",
      );
      throw new ServerError("No access token available");
    }
    const data = await this.googleDriveService.getDocumentMetadata(
      tokens.access_token,
      documentGoogleDriveId,
    );
    if (!data) {
      this.logger.warn(
        { documentGoogleDriveId },
        "Document not found in Google Drive",
      );
      throw new NotFoundError("document is not found");
    }
    const documentId = crypto.randomUUID();

    const document = new Document(
      documentId,
      data.name,
      data.size,
      null,
      data.id,
      data.mimeType,
      null,
    );

    await this.documentRepository.addDocument(document);
    this.logger.info(
      { documentId, documentGoogleDriveId },
      "AddDocumentFromGoogleDriveUseCase executed successfully",
    );
  }
}
