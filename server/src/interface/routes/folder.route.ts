import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyPluginAsync,
} from "fastify";
import fp from "fastify-plugin";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../../shared/validation/validator";
import {
  createFolderSchema,
  updateFolderSchema,
  folderIdParamsSchema,
  deleteFolderQuerySchema,
  CreateFolderDTO,
  UpdateFolderDTO,
  FolderIdParams,
  DeleteFolderQuery,
} from "../../shared/validation/folderSchemas";

const folderRoutesHandler: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  options: FastifyPluginOptions
): Promise<void> => {
  // Get all folders for authenticated user
  fastify.get(`${options.prefix}/`, async (request, reply) => {
    const folderController = request.diScope.resolve("folderController") as any;
    return folderController.getAllFolders(request, reply);
  });

  // Create a new folder
  // /api/v1/folders/
  fastify.post<{ Body: CreateFolderDTO }>(
    `${options.prefix}/`,
    {
      preHandler: validateBody(createFolderSchema),
    },
    async (request, reply) => {
      const folderController = request.diScope.resolve("folderController") as any;
      return folderController.createFolder(request, reply);
    }
  );

  // Get a specific folder by ID
  // /api/v1/folders/:id
  fastify.get<{ Params: FolderIdParams }>(
    `${options.prefix}/:id`,
    {
      preHandler: validateParams(folderIdParamsSchema),
    },
    async (request, reply) => {
      const folderController = request.diScope.resolve("folderController") as any;
      return folderController.getFolderById(request, reply);
    }
  );

  // Update a folder
  // /api/v1/folders/:id
  fastify.put<{ Params: FolderIdParams; Body: UpdateFolderDTO }>(
    `${options.prefix}/:id`,
    {
      preHandler: [
        validateParams(folderIdParamsSchema),
        validateBody(updateFolderSchema),
      ],
    },
    async (request, reply) => {
      const folderController = request.diScope.resolve("folderController") as any;
      return folderController.updateFolder(request, reply);
    }
  );

  // Delete a folder
  // /api/v1/folders/:id
  fastify.delete<{
    Params: FolderIdParams;
    Querystring: DeleteFolderQuery;
  }>(
    `${options.prefix}/:id`,
    {
      preHandler: [
        validateParams(folderIdParamsSchema),
        validateQuery(deleteFolderQuerySchema),
      ],
    },
    async (request, reply) => {
      const folderController = request.diScope.resolve("folderController") as any;
      return folderController.deleteFolder(request, reply);
    }
  );
};

export const folderRoutes = fp(folderRoutesHandler, {
  name: "folder-routes",
  fastify: "5.x",
});
