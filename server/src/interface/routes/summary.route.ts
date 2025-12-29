import {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyPluginOptions,
} from "fastify";
import {
  CreateSummaryDTO,
  CreateSummaryDTOSchema,
  DeleteSummaryDTO,
  DeleteSummaryDTOSchema,
  GetSummaryByDocumentIdDTO,
  GetSummaryByDocumentIdDTOSchema,
  GetSummaryByIdDTO,
  GetSummaryByIdDTOSchema,
  UpdateSummaryDTO,
  UpdateSummaryDTOSchema,
} from "../../shared/validation/summarySchema";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../../shared/validation/validator";
import fp from "fastify-plugin";

const summaryHandler: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
): Promise<void> => {
  fastify.post<{ Body: CreateSummaryDTO }>(
    `${opts.prefix}`,
    {
      schema: {
        tags: ["Summaries"],
        summary: "Create a new summary",
        body: CreateSummaryDTOSchema,
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
      preHandler: validateBody(CreateSummaryDTOSchema),
    },
    async (request, reply) => {
      const summaryController = request.diScope.resolve("summaryController");
      return summaryController.createSummary(request, reply);
    }
  );

  fastify.delete<{ Body: DeleteSummaryDTO }>(
    `${opts.prefix}`,
    {
      schema: {
        tags: ["Summaries"],
        summary: "Delete a summary",
        body: DeleteSummaryDTOSchema,
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
      preHandler: validateBody(DeleteSummaryDTOSchema),
    },
    async (request, reply) => {
      const summaryController = request.diScope.resolve("summaryController");
      return summaryController.deleteSummary(request, reply);
    }
  );

  fastify.patch<{ Body: UpdateSummaryDTO }>(
    `${opts.prefix}`,
    {
      schema: {
        tags: ["Summaries"],
        summary: "Update existing summary",
        body: UpdateSummaryDTOSchema,
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
      preHandler: validateBody(UpdateSummaryDTOSchema),
    },
    async (request, reply) => {
      const summaryController = request.diScope.resolve("summaryController");
      return summaryController.updateSummary(request, reply);
    }
  );

  fastify.get<{ Querystring: GetSummaryByDocumentIdDTO }>(
    `${opts.prefix}`,
    {
      schema: {
        tags: ["Summaries"],
        summary: "Get summaries by Document ID",
        querystring: GetSummaryByDocumentIdDTOSchema,
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
      preHandler: validateQuery(GetSummaryByDocumentIdDTOSchema),
    },
    async (request, reply) => {
      const summaryController = request.diScope.resolve("summaryController");
      return summaryController.getSummariesByDocumentId(request, reply);
    }
  );

  fastify.get<{ Params: GetSummaryByIdDTO }>(
    `${opts.prefix}/:id`,
    {
      schema: {
        tags: ["Summaries"],
        summary: "Get summary by ID",
        params: GetSummaryByIdDTOSchema,
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
      preHandler: validateParams(GetSummaryByIdDTOSchema),
    },
    async (request, reply) => {
      const summaryController = request.diScope.resolve("summaryController");
      return summaryController.getSummaryById(request, reply);
    }
  );
};
export const summaryRoutes = fp(summaryHandler, {
  name: "summary-routes",
  fastify: "5.x",
});
