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
        tags: ["Documents"],
        summary: "Get all user documents",
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
      const documentController = request.diScope.resolve("documentController");
      return documentController.getAllDocuments(request, reply);
    }
  );

  fastify.get<{ Params: { documentId: string } }>(
    `${opts.prefix}/google-drive/:documentId`,
    {
      schema: {
        tags: ["Documents"],
        summary: "Get document from Google Drive",
        params: {
          type: "object",
          properties: {
            documentId: { type: "string" },
          },
          required: ["documentId"],
        },
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
        tags: ["Documents"],
        summary: "Get document stream metadata (HEAD)",
        querystring: {
          type: "object",
          properties: {
            token: { type: "string" },
          },
          required: ["token"],
        },
        security: [],
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
        tags: ["Documents"],
        summary: "Stream document content",
        querystring: {
          type: "object",
          properties: {
            token: { type: "string" },
          },
          required: ["token"],
        },
        security: [],
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
        tags: ["Documents"],
        summary: "Add document from Google Drive",
        body: {
          type: "object",
          properties: {
            documentGoogleDriveId: { type: "string" },
          },
          required: ["documentGoogleDriveId"],
        },
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
        tags: ["Documents"],
        summary: "Upload document",
        consumes: ["multipart/form-data"],
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
        tags: ["Documents"],
        summary: "Get document by ID",
        params: documentIdParamsSchema,
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
        tags: ["Documents"],
        summary: "Delete document by ID",
        params: documentIdParamsSchema,
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
        tags: ["Documents"],
        summary: "Move document to folder",
        params: documentIdParamsSchema,
        body: moveDocumentSchema,
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
        tags: ["Documents"],
        summary: "Rename document",
        params: documentIdParamsSchema,
        body: renameDocumentSchema,
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
