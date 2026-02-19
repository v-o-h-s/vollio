import { FastifyRequest, FastifyReply } from "fastify";
import { GetAllUserFoldersUseCase } from "../../application/use-cases/folders/GetAllUserFoldersUseCase";
import { CreateFolderUseCase } from "../../application/use-cases/folders/CreateFolderUseCase";
import { GetFolderByIdUseCase } from "../../application/use-cases/folders/GetFolderByIdUseCase";
import { UpdateFolderUseCase } from "../../application/use-cases/folders/UpdateFolderUseCase";
import { DeleteFolderUseCase } from "../../application/use-cases/folders/DeleteFolderUseCase";
import {
  CreateFolderDTO,
  UpdateFolderDTO,
  FolderIdParams,
} from "../../shared/validation/folderSchemas";
import {
  CreateFolderResponse,
  UpdateFolderResponse,
  GetAllFoldersResponse,
  GetFolderByIdResponse,
  DeleteFolderResponse,
  FolderData,
} from "@vollio/shared";
import { ResponseFormatter } from "../../shared/utils/ResponseFormatter";
import { UnauthorizedErrorObject } from "../../shared/types/error";

export class FolderController {
  constructor(
    private getAllUserFoldersUseCase: GetAllUserFoldersUseCase,
    private createFolderUseCase: CreateFolderUseCase,
    private getFolderByIdUseCase: GetFolderByIdUseCase,
    private updateFolderUseCase: UpdateFolderUseCase,
    private deleteFolderUseCase: DeleteFolderUseCase,
  ) {}

  /**
   * GET /api/folders - List user's folders with Document counts
   */
  async getAllFolders(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      return ResponseFormatter.error(reply, UnauthorizedErrorObject, 401);
    }

    const folders = await this.getAllUserFoldersUseCase.execute({ userId });

    const foldersData: FolderData[] = folders.map((folder) => ({
      ...folder.toJSON(),
      document_count: (folder as any).documentCount,
    }));

    ResponseFormatter.success<GetAllFoldersResponse["data"]>(
      reply,
      {
        folders: foldersData,
        totalCount: folders.length,
      },
      "Folders retrieved successfully",
    );
  }

  /**
   * POST /api/folders - Create a new folder
   */
  async createFolder(
    request: FastifyRequest<{ Body: CreateFolderDTO }>,
    reply: FastifyReply,
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      return ResponseFormatter.error(reply, UnauthorizedErrorObject, 401);
    }

    const createdFolder = await this.createFolderUseCase.execute({
      userId,
      name: request.body.name,
      parentId: request.body.parentId,
    });

    ResponseFormatter.success<CreateFolderResponse["data"]>(
      reply,
      createdFolder.toJSON(),
      "Folder created successfully",
      201,
    );
  }

  /**
   * GET /api/folders/:id - Get a specific folder by ID
   */
  async getFolderById(
    request: FastifyRequest<{ Params: FolderIdParams }>,
    reply: FastifyReply,
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      return ResponseFormatter.error(reply, UnauthorizedErrorObject, 401);
    }

    const folder = await this.getFolderByIdUseCase.execute({
      userId,
      folderId: request.params.id,
    });

    const folderData: FolderData = folder.toJSON();

    ResponseFormatter.success<GetFolderByIdResponse["data"]>(
      reply,
      folderData,
      "Folder retrieved successfully",
    );
  }

  /**
   * PUT /api/folders/:id - Update a folder
   */
  async updateFolder(
    request: FastifyRequest<{ Params: FolderIdParams; Body: UpdateFolderDTO }>,
    reply: FastifyReply,
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      return ResponseFormatter.error(reply, UnauthorizedErrorObject, 401);
    }

    const updatedFolder = await this.updateFolderUseCase.execute({
      userId,
      folderId: request.params.id,
      name: request.body.name,
      parentId: request.body.parentId,
    });

    ResponseFormatter.success<UpdateFolderResponse["data"]>(
      reply,
      updatedFolder.toJSON(),
      "Folder updated successfully",
    );
  }

  /**
   * DELETE /api/folders/:id - Delete a folder
   */
  async deleteFolder(
    request: FastifyRequest<{
      Params: FolderIdParams;
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      return ResponseFormatter.error(reply, UnauthorizedErrorObject, 401);
    }

    await this.deleteFolderUseCase.execute({
      userId,
      folderId: request.params.id,
    });

    ResponseFormatter.success<DeleteFolderResponse["data"]>(
      reply,
      null,
      "Folder deleted successfully",
    );
  }
}
