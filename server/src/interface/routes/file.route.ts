import {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyPluginOptions,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import fp from "fastify-plugin";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../../shared/validation/validator";
import {
  fileIdParamsSchema,
  moveFileSchema,
  renameFileSchema,
  FileIdParams,
  MoveFileDTO,
  RenameFileDTO,
  validateQuerySchema,
} from "../../shared/validation/fileSchemas";

const fileRoutesHandler: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
): Promise<void> => {
  // Get all files - Must be before /:id route to avoid route matching issues
  fastify.get(`${opts.prefix}/`, async (request, reply) => {
    const fileController = request.diScope.resolve("fileController");
    return fileController.getAllFiles(request, reply);
  });

  // used like when you click on some pdf from google drive (but return like general file fetch)
  // /api/v1/files/google-drive/:id
  fastify.get<{ Params: { fileId: string } }>(
    `${opts.prefix}/google-drive/:id`,
    async (request, reply) => {
      const fileController = request.diScope.resolve("fileController");
      return fileController.getFileFromGoogleDrive(request, reply);
    }
  );
  // HEAD request for PDF metadata (used by PDF.js before streaming)
  fastify.head<{ Querystring: { token: string } }>(
    `${opts.prefix}/stream`,
    async (request, reply) => {
      const fileController = request.diScope.resolve("fileController");
      return fileController.streamFileHead(request, reply);
    }
  );

  // GET request to stream file content
  fastify.get<{ Querystring: { token: string } }>(
    `${opts.prefix}/stream`,
    // preHandler: validateQuery(validateQuerySchema),
    async (request, reply) => {
      const fileController = request.diScope.resolve("fileController");
      return fileController.streamFile(request, reply);
    }
  );
  // add file from google drive
  fastify.post<{ Body: { fileGoogleDriveId: string } }>(
    `${opts.prefix}/google-drive`,
    async (request, reply) => {
      const fileController = request.diScope.resolve("fileController");
      return fileController.addFileFromGoogleDrive(request, reply);
    }
  );

  // Upload file
  fastify.post(`${opts.prefix}/upload`, async (request, reply) => {
    const fileController = request.diScope.resolve("fileController");
    return fileController.uploadFile(request, reply);
  });

  // Get file by ID
  fastify.get<{ Params: FileIdParams }>(
    `${opts.prefix}/:id`,
    {
      preHandler: validateParams(fileIdParamsSchema),
    },
    async (request, reply) => {
      const fileController = request.diScope.resolve("fileController");
      return fileController.getFileById(request, reply);
    }
  );

  // Delete file
  fastify.delete<{ Params: FileIdParams }>(
    `${opts.prefix}/:id`,
    {
      preHandler: validateParams(fileIdParamsSchema),
    },
    async (request, reply) => {
      const fileController = request.diScope.resolve("fileController");
      return fileController.deleteFile(request, reply);
    }
  );

  // Move file
  fastify.patch<{ Params: FileIdParams; Body: MoveFileDTO }>(
    `${opts.prefix}/:id/move`,
    {
      preHandler: [
        validateParams(fileIdParamsSchema),
        validateBody(moveFileSchema),
      ],
    },
    async (request, reply) => {
      const fileController = request.diScope.resolve("fileController");
      return fileController.moveFile(request, reply);
    }
  );

  // Rename file
  fastify.put<{ Params: FileIdParams; Body: RenameFileDTO }>(
    `${opts.prefix}/:id/rename`,
    {
      preHandler: [
        validateParams(fileIdParamsSchema),
        validateBody(renameFileSchema),
      ],
    },
    async (request, reply) => {
      const fileController = request.diScope.resolve("fileController");
      return fileController.renameFile(request, reply);
    }
  );
};

export const fileRoutes = fp(fileRoutesHandler, {
  name: "file-routes",
  fastify: "5.x",
});
