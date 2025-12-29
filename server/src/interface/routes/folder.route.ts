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
  fastify.get(
    `${options.prefix}/`,
    {
      schema: {
        tags: ["Folders"],
        summary: "Get all user folders",
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              data: {
                type: "array",
                items: { type: "object", additionalProperties: true },
              },
              error: { type: "object", nullable: true },
            },
          },
        },
      },
    },
    async (request, reply) => {
      const folderController = request.diScope.resolve(
        "folderController"
      ) as any;
      return folderController.getAllFolders(request, reply);
    }
  );

  // Create a new folder
  fastify.post<{ Body: CreateFolderDTO }>(
    `${options.prefix}/`,
    {
      schema: {
        tags: ["Folders"],
        summary: "Create a new folder",
        body: createFolderSchema,
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              data: { type: "object", additionalProperties: true },
              error: { type: "object", nullable: true },
            },
          },
        },
      },
      preHandler: validateBody(createFolderSchema),
    },
    async (request, reply) => {
      const folderController = request.diScope.resolve(
        "folderController"
      ) as any;
      return folderController.createFolder(request, reply);
    }
  );

  // Get a specific folder by ID
  fastify.get<{ Params: FolderIdParams }>(
    `${options.prefix}/:id`,
    {
      schema: {
        tags: ["Folders"],
        summary: "Get folder by ID",
        params: folderIdParamsSchema,
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              data: { type: "object", additionalProperties: true },
              error: { type: "object", nullable: true },
            },
          },
        },
      },
      preHandler: validateParams(folderIdParamsSchema),
    },
    async (request, reply) => {
      const folderController = request.diScope.resolve(
        "folderController"
      ) as any;
      return folderController.getFolderById(request, reply);
    }
  );

  // Update a folder
  fastify.put<{ Params: FolderIdParams; Body: UpdateFolderDTO }>(
    `${options.prefix}/:id`,
    {
      schema: {
        tags: ["Folders"],
        summary: "Update folder",
        params: folderIdParamsSchema,
        body: updateFolderSchema,
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              data: { type: "object", additionalProperties: true },
              error: { type: "object", nullable: true },
            },
          },
        },
      },
      preHandler: [
        validateParams(folderIdParamsSchema),
        validateBody(updateFolderSchema),
      ],
    },
    async (request, reply) => {
      const folderController = request.diScope.resolve(
        "folderController"
      ) as any;
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
        tags: ["Folders"],
        summary: "Delete folder",
        params: folderIdParamsSchema,
        querystring: deleteFolderQuerySchema,
        response: {
          200: {
            type: "object",
            properties: {
              success: { type: "boolean" },
              message: { type: "string" },
              data: { type: "null" },
              error: { type: "object", nullable: true },
            },
          },
        },
      },
      preHandler: [
        validateParams(folderIdParamsSchema),
        validateQuery(deleteFolderQuerySchema),
      ],
    },
    async (request, reply) => {
      const folderController = request.diScope.resolve(
        "folderController"
      ) as any;
      return folderController.deleteFolder(request, reply);
    }
  );
};

export const folderRoutes = fp(folderRoutesHandler, {
  name: "folder-routes",
  fastify: "5.x",
});
