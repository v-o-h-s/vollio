import { FastifyReply, FastifyRequest } from "fastify";
import { AddDocumentFromGoogleDriveUseCase } from "../../application/use-cases/documents/AddDocumentFromGoogleDriveUseCase";
import { GetDocumentFromGoogleDriveUseCase } from "../../application/use-cases/documents/GetDocumentFromGoogleDriveUseCase";
import { GetAllDocumentsUseCase } from "../../application/use-cases/documents/GetAllDocumentsUseCase";
import { GetDocumentByIdUseCase } from "../../application/use-cases/documents/GetDocumentByIdUseCase";
import { UploadDocumentUseCase } from "../../application/use-cases/documents/UploadDocumentUseCase";
import { DeleteDocumentUseCase } from "../../application/use-cases/documents/DeleteDocumentUseCase";
import { MoveDocumentUseCase } from "../../application/use-cases/documents/MoveDocumentUseCase";
import { RenameDocumentUseCase } from "../../application/use-cases/documents/RenameDocumentUseCase";
import {
  MoveDocumentDTO,
  RenameDocumentDTO,
  DocumentIdParams,
} from "../../shared/validation/documentSchemas";
import { StreamDocumentUseCase } from "../../application/use-cases/documents/StreamDocumentUseCase";
import {
  AddDocumentFromGoogleDriveResponse,
  CreateSignedUrlResponse,
  DeleteDocumentResponse,
  GetAllDocumentsResponse,
  GetDocumentByIdResponse,
  GetDocumentFromGoogleDriveResponse,
  MoveDocumentResponse,
  RenameDocumentResponse,
  StreamDocumentResponse,
  UploadDocumentResponse,
} from "@vollio/shared";

export class DocumentController {
  constructor(
    private addDocumentFromGoogleDriveUseCase: AddDocumentFromGoogleDriveUseCase,
    private getDocumentFromGoogleDriveUseCase: GetDocumentFromGoogleDriveUseCase,
    private getAllDocumentsUseCase: GetAllDocumentsUseCase,
    private getDocumentByIdUseCase: GetDocumentByIdUseCase,
    private uploadDocumentUseCase: UploadDocumentUseCase,
    private deleteDocumentUseCase: DeleteDocumentUseCase,
    private moveDocumentUseCase: MoveDocumentUseCase,
    private renameDocumentUseCase: RenameDocumentUseCase,
    private streamDocumentUseCase: StreamDocumentUseCase
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
      await this.getDocumentFromGoogleDriveUseCase.execute(documentId);

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

    const result = await this.getDocumentByIdUseCase.execute(request.params.id);

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
  async uploadDocument(
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

    const data = await request.file();
    if (!data) {
      reply.status(400).send({
        success: false,
        message: "No document provided",
        data: null,
        error: { message: "No document provided" },
      });
      return;
    }

    const documentBuffer = await data.toBuffer();

    // Get folderId from form fields
    let folderId: string | null = null;
    const folderIdField = data.fields.folderId;
    if (folderIdField) {
      if (Array.isArray(folderIdField)) {
        folderId = (folderIdField[0] as any).value || null;
      } else {
        folderId = (folderIdField as any).value || null;
      }
    }

    await this.uploadDocumentUseCase.execute({
      documentBuffer,
      name: data.filename,
      size: documentBuffer.length,
      userId,
      folderId,
    });

    reply.status(200).send({
      success: true,
      message: "Document uploaded successfully",
      data: null,
      error: null,
    });
  }

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

  async streamDocumentHead(
    request: FastifyRequest<{ Querystring: { token: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const { token } = request.query;

    if (!token) {
      reply.status(400).send({
        success: false,
        message: "Token is required",
        data: null,
        error: { message: "Token is required" },
      });
      return;
    }

    try {
      // Token validation (we don't need the stream, just validate access)
      await this.streamDocumentUseCase.execute(token);

      // Send headers only with 200 OK for HEAD requests
      reply
        .header("Access-Control-Allow-Origin", "*")
        .header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
        .header("Access-Control-Allow-Headers", "Content-Type, Range")
        .header(
          "Access-Control-Expose-Headers",
          "Content-Length, Content-Range, Accept-Ranges"
        )
        .header("Content-Type", "application/pdf")
        .header("Content-Disposition", "inline; filename=document.pdf")
        .header("Accept-Ranges", "bytes")
        .header("Cache-Control", "no-cache, no-store, must-revalidate")
        .send();
    } catch (err: any) {
      const statusCode = err.statusCode || 500;
      const message = err.message || "Failed to access document";

      reply.status(statusCode).send({
        success: false,
        message,
        data: null,
        error: { message },
      });
    }
  }

  async streamDocument(
    request: FastifyRequest<{ Querystring: { token: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const { token } = request.query;

    if (!token) {
      reply.status(400).send({
        success: false,
        message: "Token is required",
        data: null,
        error: { message: "Token is required" },
      });
      return;
    }

    try {
      // Token validation happens inside StreamDocumentUseCase.execute()
      const stream = await this.streamDocumentUseCase.execute(token);

      // Set CORS headers explicitly for Document.js and use 206 Partial Content for streaming
      reply
        .status(206)
        .header("Access-Control-Allow-Origin", "*")
        .header("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS")
        .header("Access-Control-Allow-Headers", "Content-Type, Range")
        .header(
          "Access-Control-Expose-Headers",
          "Content-Length, Content-Range, Accept-Ranges"
        )
        .header("Content-Type", "application/pdf")
        .header("Content-Disposition", "inline; filename=document.pdf")
        .header("Accept-Ranges", "bytes")
        .header("Cache-Control", "no-cache, no-store, must-revalidate");

      // Pipe stream directly without JSON wrapper
      return reply.send(stream);
    } catch (err: any) {
      const statusCode = err.statusCode || 500;
      const message = err.message || "Failed to stream document";

      reply.status(statusCode).send({
        success: false,
        message,
        data: null,
        error: { message },
      });
    }
  }
}
