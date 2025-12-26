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
  DeleteFolderQuery,
} from "../../shared/validation/folderSchemas";
import {
  CreateFolderResponse,
  UpdateFolderResponse,
  GetAllFoldersResponse,
  GetFolderByIdResponse,
  DeleteFolderResponse,
  FolderData,
} from '@vollio/shared';

export class FolderController {
  constructor(
    private getAllUserFoldersUseCase: GetAllUserFoldersUseCase,
    private createFolderUseCase: CreateFolderUseCase,
    private getFolderByIdUseCase: GetFolderByIdUseCase,
    private updateFolderUseCase: UpdateFolderUseCase,
    private deleteFolderUseCase: DeleteFolderUseCase
  ) {}

  /**
   * GET /api/folders - List user's folders with Document counts
   */
  async getAllFolders(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      reply.status(401).send({
        success: false,
        message: "Unauthorized",
        data: null,
        error: "User must be authenticated",
      });
      return;
    }

    const folders = await this.getAllUserFoldersUseCase.execute({ userId });

    const foldersData: FolderData[] = folders.map((folder) => ({
      ...folder.toJSON(),
      document_count: (folder as any).documentCount,
    }));

    reply.status(200).send({
      success: true,
      message: "Folders retrieved successfully",
      data: {
        folders: foldersData,
        totalCount: folders.length,
      },
      error: null,
    } satisfies GetAllFoldersResponse);
  }

  /**
   * POST /api/folders - Create a new folder
   */
  async createFolder(
    request: FastifyRequest<{ Body: CreateFolderDTO }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      reply.status(401).send({
        success: false,
        message: "Unauthorized",
        data: null,
        error: "User must be authenticated",
      });
      return;
    }

   await this.createFolderUseCase.execute({
      userId,
      name: request.body.name,
      parentId: request.body.parentId,
    });

   

    reply.status(201).send({
      success: true,
      message: "Folder created successfully",
      data: null,
      error: null,
    } satisfies CreateFolderResponse);
  }

  /**
   * GET /api/folders/:id - Get a specific folder by ID
   */
  async getFolderById(
    request: FastifyRequest<{ Params: FolderIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      reply.status(401).send({
        success: false,
        message: "Unauthorized",
        data: null,
        error: "User must be authenticated",
      });
      return;
    }

    const folder = await this.getFolderByIdUseCase.execute({
      userId,
      folderId: request.params.id,
    });

    const folderData: FolderData = folder.toJSON();

    reply.status(200).send({
      success: true,
      message: "Folder retrieved successfully",
      data: folderData,
      error: null,
    } satisfies GetFolderByIdResponse);
  }

  /**
   * PUT /api/folders/:id - Update a folder
   */
  async updateFolder(
    request: FastifyRequest<{ Params: FolderIdParams; Body: UpdateFolderDTO }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      reply.status(401).send({
        success: false,
        message: "Unauthorized",
        data: null,
        error: "User must be authenticated",
      });
      return;
    }

   await this.updateFolderUseCase.execute({
      userId,
      folderId: request.params.id,
      name: request.body.name,
      parentId: request.body.parentId,
    });

    reply.status(200).send({
      success: true,
      message: "Folder updated successfully",
      data: null,
      error: null,
    } satisfies UpdateFolderResponse);
  }

  /**
   * DELETE /api/folders/:id - Delete a folder
   */
  async deleteFolder(
    request: FastifyRequest<{
      Params: FolderIdParams;
      Querystring: DeleteFolderQuery;
    }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      reply.status(401).send({
        success: false,
        message: "Unauthorized",
        data: null,
        error: "User must be authenticated",
      });
      return;
    }

    await this.deleteFolderUseCase.execute({
      userId,
      folderId: request.params.id,
      moveContentsTo: request.query.moveContentsTo,
    });

    reply.status(200).send({
      success: true,
      message: "Folder deleted successfully",
      data: null,
      error: null,
    } satisfies DeleteFolderResponse);
  }
}
