import { FastifyReply, FastifyRequest } from "fastify";
import { AddFileFromGoogleDriveUseCase } from "../../application/use-cases/files/AddFileFromGoogleDriveUseCase";
import { GetFileFromGoogleDriveUseCase } from "../../application/use-cases/files/GetFileFromGoogleDriveUseCase";
import { GetAllFilesUseCase } from "../../application/use-cases/files/GetAllFilesUseCase";
import { GetFileByIdUseCase } from "../../application/use-cases/files/GetFileByIdUseCase";
import { UploadFileUseCase } from "../../application/use-cases/files/UploadFileUseCase";
import { DeleteFileUseCase } from "../../application/use-cases/files/DeleteFileUseCase";
import { MoveFileUseCase } from "../../application/use-cases/files/MoveFileUseCase";
import { RenameFileUseCase } from "../../application/use-cases/files/RenameFileUseCase";
import { MoveFileDTO, RenameFileDTO, FileIdParams } from "../../shared/validation/fileSchemas";
import { StreamFileUseCase } from "../../application/use-cases/files/StreamFileUseCase";
import {
  AddFileFromGoogleDriveResponse,
  DeleteFileResponse,
  GetAllFilesResponse,
  GetFileByIdResponse,
  GetFileFromGoogleDriveResponse,
  MoveFileResponse,
  RenameFileResponse,
  StreamFileResponse,
  UploadFileResponse,
} from "../../shared/types/responses/fileRoutes";
import { error } from "console";

export class FileController {
  constructor(
    private addFileFromGoogleDriveUseCase: AddFileFromGoogleDriveUseCase,
    private getFileFromGoogleDriveUseCase: GetFileFromGoogleDriveUseCase,
    private getAllFilesUseCase: GetAllFilesUseCase,
    private getFileByIdUseCase: GetFileByIdUseCase,
    private uploadFileUseCase: UploadFileUseCase,
    private deleteFileUseCase: DeleteFileUseCase,
    private moveFileUseCase: MoveFileUseCase,
    private renameFileUseCase: RenameFileUseCase,
    private streamFileUseCase: StreamFileUseCase
  ) { }
  // add pdf from google drive
  async addFileFromGoogleDrive(
    request: FastifyRequest<{
      Body: { fileGoogleDriveId: string };
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

    const { fileGoogleDriveId } = request.body;

    await this.addFileFromGoogleDriveUseCase.execute(fileGoogleDriveId);
    reply.status(200).send({
      success: true,
      message: "File added successfully",
      data: null,
      error: null,
    } satisfies AddFileFromGoogleDriveResponse);
  }
  // get pdf from google drive
  async getFileFromGoogleDrive(
    req: FastifyRequest<{ Params: { fileId: string } }>,
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
    const { fileId } = req.params;
    const { file, content } = await this.getFileFromGoogleDriveUseCase.execute(
      fileId
    );

    res.header("Content-Type", file.getMimeType());
    res.header(
      "Content-Disposition",
      `inline; filename="${file.getFileName()}"`
    );
    res.send(content);
  }

  async getAllFiles(
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

    const pdfs = await this.getAllFilesUseCase.execute(userId);

    reply.status(200).send({
      success: true,
      message: "Files fetched successfully",
      data: {
        pdfs,
        totalCount: pdfs.length,
      },
      error: null,
    } satisfies GetAllFilesResponse);
  }
  // you may use this one when like click on pdf from supabase storage
  async getFileById(
    request: FastifyRequest<{ Params: FileIdParams }>,
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

    const result = await this.getFileByIdUseCase.execute(request.params.id);

    reply.status(200).send({
      success: true,
      message: "File fetched successfully",
      data: result,
      error: null,
    } satisfies GetFileByIdResponse);
  }
  // upload file to supabase storage
  // pls use formdata in the frontend to send the file
  async uploadFile(
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
        message: "No file provided",
        data: null,
        error: { message: "No file provided" },
      });
      return;
    }

    const fileBuffer = await data.toBuffer();

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

    await this.uploadFileUseCase.execute({
      fileBuffer,
      filename: data.filename,
      fileSize: fileBuffer.length,
      userId,
      folderId,
    });

    reply.status(200).send({
      success: true,
      message: "File uploaded successfully",
      data: null,
      error: null,
    });
  }

  async deleteFile(
    request: FastifyRequest<{ Params: FileIdParams }>,
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

    await this.deleteFileUseCase.execute(request.params.id);

    reply.status(200).send({
      success: true,
      message: "File deleted successfully",
      data: null,
      error: null,
    } satisfies DeleteFileResponse);
  }

  async moveFile(
    request: FastifyRequest<{ Params: FileIdParams; Body: MoveFileDTO }>,
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

    await this.moveFileUseCase.execute({
      fileId: request.params.id,
      folderId: request.body.folderId ?? null,
      userId,
    });

    reply.status(200).send({
      success: true,
      message: "File moved successfully",
      data: null,
      error: null
    } satisfies MoveFileResponse);
  }

  async renameFile(
    request: FastifyRequest<{ Params: FileIdParams; Body: RenameFileDTO }>,
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

    const updatedFile = await this.renameFileUseCase.execute({
      fileId: request.params.id,
      filename: request.body.filename,
    });

    reply.status(200).send({
      success: true,
      message: "File renamed successfully",
      data: null,
      error: null,
    } satisfies RenameFileResponse);
  }

  async streamFile(
    request: FastifyRequest<{ Params: { id: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      reply.status(401).send({
        success: false,
        status: 401,
        data: null,
        error: { message: "Not authenticated" },
      });
      return;
    }

    const { id } = request.params;
    const stream = await this.streamFileUseCase.execute(id);
    reply.type("application/pdf");
    return reply.send(stream);

  }

}
