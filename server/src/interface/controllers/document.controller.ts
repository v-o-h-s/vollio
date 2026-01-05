import { FastifyReply, FastifyRequest } from "fastify";
import { AddDocumentFromGoogleDriveUseCase } from "../../application/use-cases/documents/AddDocumentFromGoogleDriveUseCase";
import { GetDocumentFromGoogleDriveUseCase } from "../../application/use-cases/documents/GetDocumentFromGoogleDriveUseCase";
import { GetAllDocumentsUseCase } from "../../application/use-cases/documents/GetAllDocumentsUseCase";
import { GetDocumentByIdUseCase } from "../../application/use-cases/documents/GetDocumentByIdUseCase";
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
  CreateSignedUrlResponse,
  DeleteDocumentResponse,
  GetAllDocumentsResponse,
  GetDocumentByIdResponse,
  GetDocumentFromGoogleDriveResponse,
  GetNoteByIdResponse,
  GetStorageUrlData,
  GetStorageUrlDto,
  GetStorageUrlResponse,
  MoveDocumentResponse,
  NoteData,
  RenameDocumentResponse,
} from "@vollio/shared";
import { GenerateSummaryUseCase } from "../../application/use-cases/documents/GenerateSummaryUseCase";
import { ResponseFormatter } from "../../shared/utils/ResponseFormatter";
import { GetStorageUrlUseCase } from "../../application/use-cases/documents/GetStorageUrlUseCase";
import { CreateDocumentUseCase } from "../../application/use-cases/documents/CreateDocumentUseCase";
import { CreateDocumentDto } from "@vollio/shared";

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
    private createDocumentUseCase: CreateDocumentUseCase
  ) {}
  // add document from google drive
  async addDocumentFromGoogleDrive(
    request: FastifyRequest<{
      Body: { documentGoogleDriveId: string };
    }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      reply.status(401).send({
        success: false,
        message: "User not authenticated",
        data: null,
        error: "Unauthorized",
      });
      return;
    }

    const { documentGoogleDriveId } = request.body;

    await this.addDocumentFromGoogleDriveUseCase.execute(documentGoogleDriveId);
    reply.status(200).send({
      success: true,
      message: "Document added successfully",
      data: null,
      error: null,
    } satisfies AddDocumentFromGoogleDriveResponse);
  }
  // get document from google drive
  async getDocumentFromGoogleDrive(
    req: FastifyRequest<{ Params: { documentId: string } }>,
    res: FastifyReply
  ): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).send({
        success: false,
        message: "User not authenticated",
        data: null,
        error: "Unauthorized",
      });
      return;
    }
    const { documentId } = req.params;
    const { document, content } =
      await this.getDocumentFromGoogleDriveUseCase.execute(documentId, userId);

    res.header("Content-Type", document.getMimeType());
    res.header("Content-Disposition", `inline; name="${document.getName()}"`);
    res.send(content);
  }

  async getAllDocuments(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      reply.status(401).send({
        success: false,
        message: "Not authenticated",
        data: null,
        error: { message: "Not authenticated" },
      });
      return;
    }

    const documents = await this.getAllDocumentsUseCase.execute(userId);

    reply.status(200).send({
      success: true,
      message: "Documents fetched successfully",
      data: {
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
      error: null,
    } satisfies GetAllDocumentsResponse);
  }
  // you may use this one when like click on document from supabase storage
  async getDocumentById(
    request: FastifyRequest<{ Params: DocumentIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      reply.status(401).send({
        success: false,
        message: " Not authenticated",
        data: null,
        error: { message: "Not authenticated" },
      });
      return;
    }

    const result = await this.getDocumentByIdUseCase.execute(
      request.params.id,
      userId
    );

    reply.status(200).send({
      success: true,
      message: "Document fetched successfully",
      data: {
        id: result.id,
        name: result.name,
        size: result.size,
        mimeType: result.mimeType,
        uploadedAt: result.uploadedAt,
        folderId: result.folderId,
        isGoogleDriveDocument: result.isGoogleDriveDocument,
        documentUrl: result.documentUrl,
      },
      error: null,
    } satisfies GetDocumentByIdResponse);
  }
  // upload document to supabase storage
  // pls use formdata in the frontend to send the document
  async deleteDocument(
    request: FastifyRequest<{ Params: DocumentIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      reply.status(401).send({
        success: false,
        message: "Not authenticated",
        data: null,
        error: { message: "Not authenticated" },
      });
      return;
    }

    await this.deleteDocumentUseCase.execute(request.params.id);

    reply.status(200).send({
      success: true,
      message: "Document deleted successfully",
      data: null,
      error: null,
    } satisfies DeleteDocumentResponse);
  }

  async moveDocument(
    request: FastifyRequest<{
      Params: DocumentIdParams;
      Body: MoveDocumentDTO;
    }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      reply.status(401).send({
        success: false,
        message: "Not authenticated",
        data: null,
        error: { message: "Not authenticated" },
      });
      return;
    }

    await this.moveDocumentUseCase.execute({
      documentId: request.params.id,
      folderId: request.body.folderId ?? null,
      userId,
    });

    reply.status(200).send({
      success: true,
      message: "Document moved successfully",
      data: null,
      error: null,
    } satisfies MoveDocumentResponse);
  }

  async renameDocument(
    request: FastifyRequest<{
      Params: DocumentIdParams;
      Body: RenameDocumentDTO;
    }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      reply.status(401).send({
        success: false,
        message: "Not authenticated",
        data: null,
        error: { message: "Not authenticated" },
      });
      return;
    }

    const updatedDocument = await this.renameDocumentUseCase.execute({
      documentId: request.params.id,
      name: request.body.name,
    });

    reply.status(200).send({
      success: true,
      message: "Document renamed successfully",
      data: null,
      error: null,
    } satisfies RenameDocumentResponse);
  }

  /**
   * generate note for document
   */
  async generateSummary(
    request: FastifyRequest<{ Params: DocumentIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      reply.status(401).send({ error: "Unauthorized" });
      return;
    }

    const result = await this.generateSummaryUseCase.execute(
      {
        id: request.params.id,
      },
      userId
    );
    ResponseFormatter.success<NoteData>(
      reply,
      result,
      "Summary generated successfully"
    );
  }

  async getStorageUrl(
    request: FastifyRequest<{ Body: GetStorageUrlDto }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      reply.status(401).send({ error: "Unauthorized" });
      return;
    }

    const result = await this.getStorageUrlUseCase.execute({
      userId,
      name: request.body.name,
    });
    ResponseFormatter.success<GetStorageUrlData>(
      reply,
      result,
      "Storage URL retrieved successfully"
    );
  }

  async createDocument(
    request: FastifyRequest<{ Body: CreateDocumentDto }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      reply.status(401).send({ error: "Unauthorized" });
      return;
    }

    const result = await this.createDocumentUseCase.execute({
      ...request.body,
      userId,
    });
    ResponseFormatter.success<{ id: string }>(
      reply,
      result,
      "Document created successfully"
    );
  }
}
