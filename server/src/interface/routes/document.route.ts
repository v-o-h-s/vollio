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
import { guardResource } from "../../shared/utils/ResourceGuard";

import {
  documentIdParamsSchema,
  moveDocumentSchema,
  renameDocumentSchema,
  DocumentIdParams,
  MoveDocumentDTO,
  RenameDocumentDTO,
  getStorageUrlSchema,
  createDocumentSchema,
} from "../../shared/validation/documentSchemas";
import { GetStorageUrlDto, CreateDocumentDto } from "@vollio/shared";
import { DocumentController } from "../controllers/document.controller";
import {
  AIRateLimitingDegrees,
  RateLimitingDegrees,
  PrefixTypes,
} from "../../shared/utils/rate-limiting";

const documentRoutesHandler: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions,
): Promise<void> => {
  // Get all documents - Must be before /:id route to avoid route matching issues
  fastify.get(
    `${opts.prefix}/`,
    {
      config: {
        rateLimit: {
          request: { cost: RateLimitingDegrees.LOW },
        },
      },
      schema: {},
    },
    async (request, reply) => {
      const documentController =
        request.diScope.resolve<DocumentController>("documentController");
      return documentController.getAllDocuments(request, reply);
    },
  );
  // should be deleted since we are trying to centerlize getting file (one endpoint for all resources of documents)
  // fastify.get<{ Params: { documentId: string } }>(
  //   `${opts.prefix}/google-drive/:documentId`,
  //   {
  //     config: {
  //       rateLimit: { cost: 5 },
  //     },
  //     schema: {
  //       params: {
  //         type: "object",
  //         properties: {
  //           documentId: { type: "string" },
  //         },
  //         required: ["documentId"],
  //       },
  //     },
  //   },
  //   async (request, reply) => {
  //     const documentController =
  //       request.diScope.resolve<DocumentController>("documentController");
  //     return documentController.getDocumentFromGoogleDrive(request, reply);
  //   }
  // );

  fastify.post<{ Body: { documentGoogleDriveId: string } }>(
    `${opts.prefix}/google-drive`,
    {
      config: {
        rateLimit: {
          request: { cost: RateLimitingDegrees.MEDIUM },
        },
      },
      schema: {
        body: {
          type: "object",
          properties: {
            documentGoogleDriveId: { type: "string" },
          },
          required: ["documentGoogleDriveId"],
        },
      },
      preHandler: guardResource("storage"),
    },
    async (request, reply) => {
      const documentController =
        request.diScope.resolve<DocumentController>("documentController");
      return documentController.addDocumentFromGoogleDrive(request, reply);
    },
  );

  fastify.post<{ Body: GetStorageUrlDto }>(
    `${opts.prefix}/upload-url`,
    {
      config: {
        rateLimit: {
          request: { cost: RateLimitingDegrees.VERY_HIGH },
        },
      },
      schema: {
        body: getStorageUrlSchema,
      },
      preHandler: [guardResource("storage"), validateBody(getStorageUrlSchema)],
    },
    async (request, reply) => {
      const documentController =
        request.diScope.resolve<DocumentController>("documentController");
      return documentController.getStorageUrl(request, reply);
    },
  );

  fastify.get<{ Params: DocumentIdParams }>(
    `${opts.prefix}/:id`,
    {
      config: {
        rateLimit: {
          request: { cost: RateLimitingDegrees.MEDIUM },
        },
      },
      schema: {
        params: documentIdParamsSchema,
      },
      preHandler: validateParams(documentIdParamsSchema),
    },
    async (request, reply) => {
      const documentController =
        request.diScope.resolve<DocumentController>("documentController");
      return documentController.getDocumentById(request, reply);
    },
  );

  fastify.delete<{ Params: DocumentIdParams }>(
    `${opts.prefix}/:id`,
    {
      config: {
        rateLimit: {
          request: { cost: RateLimitingDegrees.LOW },
        },
      },
      schema: {
        params: documentIdParamsSchema,
      },
      preHandler: validateParams(documentIdParamsSchema),
    },
    async (request, reply) => {
      const documentController =
        request.diScope.resolve<DocumentController>("documentController");
      return documentController.deleteDocument(request, reply);
    },
  );

  fastify.patch<{ Params: DocumentIdParams; Body: MoveDocumentDTO }>(
    `${opts.prefix}/:id/move`,
    {
      config: {
        rateLimit: {
          request: { cost: RateLimitingDegrees.LOW },
        },
      },
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
      const documentController =
        request.diScope.resolve<DocumentController>("documentController");
      return documentController.moveDocument(request, reply);
    },
  );

  fastify.put<{ Params: DocumentIdParams; Body: RenameDocumentDTO }>(
    `${opts.prefix}/:id/rename`,
    {
      config: {
        rateLimit: {
          request: { cost: RateLimitingDegrees.LOW },
        },
      },
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
      const documentController =
        request.diScope.resolve<DocumentController>("documentController");
      return documentController.renameDocument(request, reply);
    },
  );
  fastify.post<{ Params: DocumentIdParams }>(
    `${opts.prefix}/:id/generate-summary`,
    {
      config: {
        rateLimit: {
          request: { cost: RateLimitingDegrees.VERY_HIGH },
          ai: { cost: AIRateLimitingDegrees.DOCUMENT },
        },
      },
      schema: {
        params: documentIdParamsSchema,
      },
      preHandler: [guardResource("ai"), validateParams(documentIdParamsSchema)],
    },
    async (request, reply) => {
      const documentController =
        request.diScope.resolve<DocumentController>("documentController");
      return documentController.generateSummary(request, reply);
    },
  );

  fastify.post<{ Body: CreateDocumentDto }>(
    `${opts.prefix}/finish-upload`,
    {
      config: {
        rateLimit: {
          request: { cost: RateLimitingDegrees.LOW },
        },
      },
      schema: {
        body: createDocumentSchema,
      },
      preHandler: [
        guardResource("storage"),
        validateBody(createDocumentSchema),
      ],
    },
    async (request, reply) => {
      const documentController =
        request.diScope.resolve<DocumentController>("documentController");
      return documentController.createDocument(request, reply);
    },
  );
};

export const documentRoutes = fp(documentRoutesHandler, {
  name: "document-routes",
  fastify: "5.x",
});
