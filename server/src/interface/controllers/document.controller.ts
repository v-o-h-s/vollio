import { FastifyReply, FastifyRequest } from "fastify";
import { AddDocumentFromGoogleDriveUseCase } from "../../application/use-cases/documents/AddDocumentFromGoogleDriveUseCase";
import { GetDocumentFromGoogleDriveUseCase } from "../../application/use-cases/documents/GetDocumentFromGoogleDriveUseCase";
import { GetAllDocumentsUseCase } from "../../application/use-cases/documents/GetAllDocumentsUseCase";
import {
  GetDocumentByIdResult,
  GetDocumentByIdUseCase,
} from "../../application/use-cases/documents/GetDocumentByIdUseCase";
import { DeleteDocumentUseCase } from "../../application/use-cases/documents/DeleteDocumentUseCase";
import { MoveDocumentUseCase } from "../../application/use-cases/documents/MoveDocumentUseCase";
import { RenameDocumentUseCase } from "../../application/use-cases/documents/RenameDocumentUseCase";
import {
  MoveDocumentDTO,
  RenameDocumentDTO,
  DocumentIdParams,
} from "../../shared/validation/documentSchemas";
import { getStorageUrlSchema } from "../../shared/validation/documentSchemas";
import {
  AddDocumentFromGoogleDriveResponse,
  DeleteDocumentResponse,
  GetAllDocumentsResponse,
  GetDocumentByIdResponse,
  GetStorageUrlData,
  GetStorageUrlDto,
  MoveDocumentResponse,
  NoteData,
  RenameDocumentResponse,
} from "@vollio/shared";
import { GenerateSummaryUseCase } from "../../application/use-cases/documents/GenerateSummaryUseCase";
import { ResponseFormatter } from "../../shared/utils/ResponseFormatter";
import { GetStorageUrlUseCase } from "../../application/use-cases/documents/GetStorageUrlUseCase";
import { CreateDocumentUseCase } from "../../application/use-cases/documents/CreateDocumentUseCase";
import { CreateDocumentDto } from "@vollio/shared";
import { withRetry } from "@vollio/shared";
import { NotFoundError } from "../../shared/errors/NotFoundError";
import { UnauthorizedErrorObject } from "../../shared/types/error";
export class DocumentController {
  constructor(
    private addDocumentFromGoogleDriveUseCase: AddDocumentFromGoogleDriveUseCase,
    private getDocumentFromGoogleDriveUseCase: GetDocumentFromGoogleDriveUseCase,
    private getAllDocumentsUseCase: GetAllDocumentsUseCase,
    private getDocumentByIdUseCase: GetDocumentByIdUseCase,
    private deleteDocumentUseCase: DeleteDocumentUseCase,
    private moveDocumentUseCase: MoveDocumentUseCase,
    private renameDocumentUseCase: RenameDocumentUseCase,
    private generateSummaryUseCase: GenerateSummaryUseCase,
    private getStorageUrlUseCase: GetStorageUrlUseCase,
    private createDocumentUseCase: CreateDocumentUseCase,
  ) {}
  // add document from google drive
  async addDocumentFromGoogleDrive(
    request: FastifyRequest<{
      Body: { documentGoogleDriveId: string };
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      return ResponseFormatter.error(reply, UnauthorizedErrorObject, 401);
    }

    const { documentGoogleDriveId } = request.body;

    await this.addDocumentFromGoogleDriveUseCase.execute(
      documentGoogleDriveId,
      userId,
    );
    ResponseFormatter.success<AddDocumentFromGoogleDriveResponse["data"]>(
      reply,
      null,
      "Document added successfully",
    );
  }

  // // get document from google drive by document ID
  // async getDocumentFromGoogleDrive(
  //   request: FastifyRequest<{
  //     Params: { documentId: string };
  //   }>,
  //   reply: FastifyReply
  // ): Promise<void> {
  //   const userId = request.user?.id;
  //   if (!userId) {
  //     reply.status(401).send({
  //       success: false,
  //       message: "User not authenticated",
  //       data: null,
  //       error: "Unauthorized",
  //     });
  //     return;
  //   }

  //   const { documentId } = request.params;

  //   const result = await this.getDocumentFromGoogleDriveUseCase.execute(
  //     documentId,
  //     userId
  //   );
  //   reply.status(200).send({
  //     success: true,
  //     message: "Document fetched from Google Drive successfully",
  //     data: {
  //       id: result.document.getId(),
  //       name: result.document.getName(),
  //     },
  //     error: null,
  //   });
  // }

  async getAllDocuments(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      return ResponseFormatter.error(reply, UnauthorizedErrorObject, 401);
    }

    const documents = await this.getAllDocumentsUseCase.execute(userId);

    ResponseFormatter.success<GetAllDocumentsResponse["data"]>(
      reply,
      {
        documents: documents.map((d) => ({
          id: d.id,
          name: d.name,
          size: d.size,
          mimeType: d.mimeType,
          uploadedAt: d.uploadedAt,
          folderId: d.folderId,
          isGoogleDriveDocument: d.isGoogleDriveDocument,
        })),
        totalCount: documents.length,
      },
      "Documents fetched successfully",
    );
  }
  // you may use this one when like click on document from supabase storage
  async getDocumentById(
    request: FastifyRequest<{ Params: DocumentIdParams }>,
    reply: FastifyReply,
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      return ResponseFormatter.error(reply, UnauthorizedErrorObject, 401);
    }

    const result = await withRetry(
      () => this.getDocumentByIdUseCase.execute(request.params.id, userId),
      {
        retries: 4,
        shouldRetry: (error) => {
          if (error instanceof NotFoundError) {
            return false;
          }
          return true;
        },
      },
    );

    ResponseFormatter.success<GetDocumentByIdResponse["data"]>(
      reply,
      {
        id: result.id,
        name: result.name,
        size: result.size,
        mimeType: result.mimeType,
        uploadedAt: result.uploadedAt,
        folderId: result.folderId,
        isGoogleDriveDocument: result.isGoogleDriveDocument,
        documentUrl: result.documentUrl,
      },
      "Document fetched successfully",
    );
  }
  // upload document to supabase storage
  // pls use formdata in the frontend to send the document
  async deleteDocument(
    request: FastifyRequest<{ Params: DocumentIdParams }>,
    reply: FastifyReply,
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      return ResponseFormatter.error(reply, UnauthorizedErrorObject, 401);
    }

    await this.deleteDocumentUseCase.execute(request.params.id);

    ResponseFormatter.success<DeleteDocumentResponse["data"]>(
      reply,
      null,
      "Document deleted successfully",
    );
  }

  async moveDocument(
    request: FastifyRequest<{
      Params: DocumentIdParams;
      Body: MoveDocumentDTO;
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      return ResponseFormatter.error(reply, UnauthorizedErrorObject, 401);
    }

    await this.moveDocumentUseCase.execute({
      documentId: request.params.id,
      folderId: request.body.folderId ?? null,
      userId,
    });

    ResponseFormatter.success<MoveDocumentResponse["data"]>(
      reply,
      null,
      "Document moved successfully",
    );
  }

  async renameDocument(
    request: FastifyRequest<{
      Params: DocumentIdParams;
      Body: RenameDocumentDTO;
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      return ResponseFormatter.error(reply, UnauthorizedErrorObject, 401);
    }

    const updatedDocument = await this.renameDocumentUseCase.execute({
      documentId: request.params.id,
      name: request.body.name,
    });

    ResponseFormatter.success<RenameDocumentResponse["data"]>(
      reply,
      null,
      "Document renamed successfully",
    );
  }

  /**
   * generate note for document
   */
  async generateSummary(
    request: FastifyRequest<{ Params: DocumentIdParams }>,
    reply: FastifyReply,
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      return ResponseFormatter.error(reply, UnauthorizedErrorObject, 401);
    }

    const result = await this.generateSummaryUseCase.execute(
      {
        id: request.params.id,
      },
      userId,
    );
    ResponseFormatter.success<NoteData>(
      reply,
      result.note,
      "Summary generated successfully",
    );
  }

  async getStorageUrl(
    request: FastifyRequest<{ Body: GetStorageUrlDto }>,
    reply: FastifyReply,
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      return ResponseFormatter.error(reply, UnauthorizedErrorObject, 401);
    }

    const result = await this.getStorageUrlUseCase.execute({
      userId,
      name: request.body.name,
    });
    ResponseFormatter.success<GetStorageUrlData>(
      reply,
      result,
      "Storage URL retrieved successfully",
    );
  }

  async createDocument(
    request: FastifyRequest<{ Body: CreateDocumentDto }>,
    reply: FastifyReply,
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      return ResponseFormatter.error(reply, UnauthorizedErrorObject, 401);
    }

    const result = await this.createDocumentUseCase.execute({
      ...request.body,
      userId,
    });
    ResponseFormatter.success<{ id: string }>(
      reply,
      result,
      "Document created successfully",
    );
  }
}
