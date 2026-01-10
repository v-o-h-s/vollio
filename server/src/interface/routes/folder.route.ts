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
import { FolderController } from "../controllers/folder.controller";

const folderRoutesHandler: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  options: FastifyPluginOptions
): Promise<void> => {
  // Get all folders for authenticated user
  fastify.get(
    `${options.prefix}/`,
    {
      schema: {
        
        
        
      },
    },
    async (request, reply) => {
      const folderController = request.diScope.resolve<FolderController>(
        "folderController"
      );
      return folderController.getAllFolders(request, reply);
    }
  );

  // Create a new folder
  fastify.post<{ Body: CreateFolderDTO }>(
    `${options.prefix}/`,
    {
      schema: {
        
        
        body: createFolderSchema,
        
      },
      preHandler: validateBody(createFolderSchema),
    },
    async (request, reply) => {
      const folderController = request.diScope.resolve<FolderController>(
        "folderController"
      );
      return folderController.createFolder(request, reply);
    }
  );

  // Get a specific folder by ID
  fastify.get<{ Params: FolderIdParams }>(
    `${options.prefix}/:id`,
    {
      schema: {
        
        
        params: folderIdParamsSchema,
        
      },
      preHandler: validateParams(folderIdParamsSchema),
    },
    async (request, reply) => {
      const folderController = request.diScope.resolve<FolderController>(
        "folderController"
      );
      return folderController.getFolderById(request, reply);
    }
  );

  // Update a folder
  fastify.put<{ Params: FolderIdParams; Body: UpdateFolderDTO }>(
    `${options.prefix}/:id`,
    {
      schema: {
        
        
        params: folderIdParamsSchema,
        body: updateFolderSchema,
        
      },
      preHandler: [
        validateParams(folderIdParamsSchema),
        validateBody(updateFolderSchema),
      ],
    },
    async (request, reply) => {
      const folderController = request.diScope.resolve<FolderController>(
        "folderController"
      );
      return folderController.updateFolder(request, reply);
    }
  );

  // Delete a folder
  fastify.delete<{
    Params: FolderIdParams;
    Querystring: DeleteFolderQuery;
  }>(
    `${options.prefix}/:id`,
    {
      schema: {
        
        
        params: folderIdParamsSchema,
        querystring: deleteFolderQuerySchema,
        
      },
      preHandler: [
        validateParams(folderIdParamsSchema),
        validateQuery(deleteFolderQuerySchema),
      ],
    },
    async (request, reply) => {
      const folderController = request.diScope.resolve<FolderController>(
        "folderController"
      );
      return folderController.deleteFolder(request, reply);
    }
  );
};

export const folderRoutes = fp(folderRoutesHandler, {
  name: "folder-routes",
  fastify: "5.x",
});

