import { IDocumentRepository } from "../../../domain/repositories/IDocumentRepository";
import { IGoogleDriveService } from "../../../domain/services/IGoogleDriveService";
import { UserGoogleClassroomRepository } from "../../../infrastructure/repositories/UserGoogleClassroomRepository";
import { ServerError } from "../../../shared/errors/ServerError";
import { EnsureValidTokenUseCase } from "../google-Classroom/EnsureValidTokenUseCase";
import { NotFoundError } from "../../../shared/errors/NotFoundError";
import { FastifyBaseLogger } from "fastify";

export class GetDocumentFromGoogleDriveUseCase {
  constructor(
    private documentRepository: IDocumentRepository,
    private googleDriveService: IGoogleDriveService,
    private ensureValidTokenUseCase: EnsureValidTokenUseCase,
    private userGoogleClassroomRepository: UserGoogleClassroomRepository,
    private logger: FastifyBaseLogger
  ) {}

  async execute(documentId: string) {
    this.logger.info({ documentId }, "Executing GetDocumentFromGoogleDriveUseCase");
    await this.ensureValidTokenUseCase.execute();
    const tokens = await this.userGoogleClassroomRepository.getTokens();
    if (!tokens || !tokens.access_token) {
      this.logger.error(
        "No access token available in GetDocumentFromGoogleDriveUseCase"
      );
      throw new ServerError("No access token available");
    }
    const document = await this.documentRepository.getDocumentById(documentId);
    if (!document) {
      this.logger.warn(
        { documentId },
        "Document not found in GetDocumentFromGoogleDriveUseCase (repository)"
      );
      throw new NotFoundError("Document not found");
    }
    if (!document.getGoogleDocumentId()) {
      this.logger.warn(
        { documentId },
        "Document has no Google Drive ID in GetDocumentFromGoogleDriveUseCase"
      );
      throw new NotFoundError("Document not found");
    }
    const data: Buffer = await this.googleDriveService.getDocumentById(
      tokens.access_token,
      document.getGoogleDocumentId()!
    );

    if (!data) {
      this.logger.warn(
        { googleDocumentId: document.getGoogleDocumentId() },
        "Document not found in Google Drive during GetDocumentFromGoogleDriveUseCase"
      );
      throw new NotFoundError("document is not found in google drive");
    }

    this.logger.info(
      { documentId },
      "GetDocumentFromGoogleDriveUseCase executed successfully"
    );
    return { document, content: data };
  }
}
