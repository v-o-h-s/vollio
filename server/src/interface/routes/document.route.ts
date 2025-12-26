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
  documentIdParamsSchema,
  moveDocumentSchema,
  renameDocumentSchema,
  DocumentIdParams,
  MoveDocumentDTO,
  RenameDocumentDTO,
  validateQuerySchema,
} from "../../shared/validation/documentSchemas";

const documentRoutesHandler: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
): Promise<void> => {
  // Get all documents - Must be before /:id route to avoid route matching issues
  fastify.get(`${opts.prefix}/`, async (request, reply) => {
    const documentController = request.diScope.resolve("documentController");
    return documentController.getAllDocuments(request, reply);
  });

  // used like when you click on some document from google drive (but return like general document fetch)
  // /api/v1/documents/google-drive/:id
  fastify.get<{ Params: { documentId: string } }>(
    `${opts.prefix}/google-drive/:id`,
    async (request, reply) => {
      const documentController = request.diScope.resolve("documentController");
      return documentController.getDocumentFromGoogleDrive(request, reply);
    }
  );
  // HEAD request for Document metadata (used by Document.js before streaming)
  fastify.head<{ Querystring: { token: string } }>(
    `${opts.prefix}/stream`,
    async (request, reply) => {
      const documentController = request.diScope.resolve("documentController");
      return documentController.streamDocumentHead(request, reply);
    }
  );

  // GET request to stream document content
  fastify.get<{ Querystring: { token: string } }>(
    `${opts.prefix}/stream`,
    // preHandler: validateQuery(validateQuerySchema),
    async (request, reply) => {
      const documentController = request.diScope.resolve("documentController");
      return documentController.streamDocument(request, reply);
    }
  );
  // add document from google drive
  fastify.post<{ Body: { documentGoogleDriveId: string } }>(
    `${opts.prefix}/google-drive`,
    async (request, reply) => {
      const documentController = request.diScope.resolve("documentController");
      return documentController.addDocumentFromGoogleDrive(request, reply);
    }
  );

  // Upload document
  fastify.post(`${opts.prefix}/upload`, async (request, reply) => {
    const documentController = request.diScope.resolve("documentController");
    return documentController.uploadDocument(request, reply);
  });

  // Get document by ID
  fastify.get<{ Params: DocumentIdParams }>(
    `${opts.prefix}/:id`,
    {
      preHandler: validateParams(documentIdParamsSchema),
    },
    async (request, reply) => {
      const documentController = request.diScope.resolve("documentController");
      return documentController.getDocumentById(request, reply);
    }
  );

  // Delete document
  fastify.delete<{ Params: DocumentIdParams }>(
    `${opts.prefix}/:id`,
    {
      preHandler: validateParams(documentIdParamsSchema),
    },
    async (request, reply) => {
      const documentController = request.diScope.resolve("documentController");
      return documentController.deleteDocument(request, reply);
    }
  );

  // Move document
  fastify.patch<{ Params: DocumentIdParams; Body: MoveDocumentDTO }>(
    `${opts.prefix}/:id/move`,
    {
      preHandler: [
        validateParams(documentIdParamsSchema),
        validateBody(moveDocumentSchema),
      ],
    },
    async (request, reply) => {
      const documentController = request.diScope.resolve("documentController");
      return documentController.moveDocument(request, reply);
    }
  );

  // Rename document
  fastify.put<{ Params: DocumentIdParams; Body: RenameDocumentDTO }>(
    `${opts.prefix}/:id/rename`,
    {
      preHandler: [
        validateParams(documentIdParamsSchema),
        validateBody(renameDocumentSchema),
      ],
    },
    async (request, reply) => {
      const documentController = request.diScope.resolve("documentController");
      return documentController.renameDocument(request, reply);
    }
  );
};

export const documentRoutes = fp(documentRoutesHandler, {
  name: "document-routes",
  fastify: "5.x",
});
