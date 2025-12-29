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
  fastify.get(
    `${opts.prefix}/`,
    {
      schema: {
        
        
        
      },
    },
    async (request, reply) => {
      const documentController = request.diScope.resolve("documentController");
      return documentController.getAllDocuments(request, reply);
    }
  );

  fastify.get<{ Params: { documentId: string } }>(
    `${opts.prefix}/google-drive/:documentId`,
    {
      schema: {
        
        
        params: {
          type: "object",
          properties: {
            documentId: { type: "string" },
          },
          required: ["documentId"],
        },
        
      },
    },
    async (request, reply) => {
      const documentController = request.diScope.resolve("documentController");
      return documentController.getDocumentFromGoogleDrive(request, reply);
    }
  );

  fastify.head<{ Querystring: { token: string } }>(
    `${opts.prefix}/stream`,
    {
      schema: {
        
        
        querystring: {
          type: "object",
          properties: {
            token: { type: "string" },
          },
          required: ["token"],
        },
        
      },
    },
    async (request, reply) => {
      const documentController = request.diScope.resolve("documentController");
      return documentController.streamDocumentHead(request, reply);
    }
  );

  fastify.get<{ Querystring: { token: string } }>(
    `${opts.prefix}/stream`,
    {
      schema: {
        
        
        querystring: {
          type: "object",
          properties: {
            token: { type: "string" },
          },
          required: ["token"],
        },
        
      },
    },
    async (request, reply) => {
      const documentController = request.diScope.resolve("documentController");
      return documentController.streamDocument(request, reply);
    }
  );

  fastify.post<{ Body: { documentGoogleDriveId: string } }>(
    `${opts.prefix}/google-drive`,
    {
      schema: {
        
        
        body: {
          type: "object",
          properties: {
            documentGoogleDriveId: { type: "string" },
          },
          required: ["documentGoogleDriveId"],
        },
        
      },
    },
    async (request, reply) => {
      const documentController = request.diScope.resolve("documentController");
      return documentController.addDocumentFromGoogleDrive(request, reply);
    }
  );

  fastify.post(
    `${opts.prefix}/upload`,
    {
      schema: {
        
        
        
        
      },
    },
    async (request, reply) => {
      const documentController = request.diScope.resolve("documentController");
      return documentController.uploadDocument(request, reply);
    }
  );

  fastify.get<{ Params: DocumentIdParams }>(
    `${opts.prefix}/:id`,
    {
      schema: {
        
        
        params: documentIdParamsSchema,
        
      },
      preHandler: validateParams(documentIdParamsSchema),
    },
    async (request, reply) => {
      const documentController = request.diScope.resolve("documentController");
      return documentController.getDocumentById(request, reply);
    }
  );

  fastify.delete<{ Params: DocumentIdParams }>(
    `${opts.prefix}/:id`,
    {
      schema: {
        
        
        params: documentIdParamsSchema,
        
      },
      preHandler: validateParams(documentIdParamsSchema),
    },
    async (request, reply) => {
      const documentController = request.diScope.resolve("documentController");
      return documentController.deleteDocument(request, reply);
    }
  );

  fastify.patch<{ Params: DocumentIdParams; Body: MoveDocumentDTO }>(
    `${opts.prefix}/:id/move`,
    {
      schema: {
        
        
        params: documentIdParamsSchema,
        body: moveDocumentSchema,
        
      },
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

  fastify.put<{ Params: DocumentIdParams; Body: RenameDocumentDTO }>(
    `${opts.prefix}/:id/rename`,
    {
      schema: {
        
        
        params: documentIdParamsSchema,
        body: renameDocumentSchema,
        
      },
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
