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
  createHighlightSchema,
  updateHighlightSchema,
  highlightIdParamsSchema,
  getHighlightsQuerySchema,
  CreateHighlightDTO,
  UpdateHighlightDTO,
  HighlightIdParams,
  HighlightDocumentIdParams,
  GetHighlightsQuery,
  highlightDocumentIdParamsSchema,
} from "../../shared/validation/highlightSchemas";

const highlightRoutesHandler: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
): Promise<void> => {
  // get highlights by document ID
  fastify.get<{ Querystring: HighlightDocumentIdParams }>(
    `${_options.prefix}`,
    {
      schema: {
        tags: ["Highlights"],
        summary: "Get highlights by Document ID",
        querystring: highlightDocumentIdParamsSchema,
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
      preHandler: validateQuery(highlightDocumentIdParamsSchema),
    },
    async (request, reply) => {
      const highlightController = request.diScope.resolve(
        "highlightController"
      ) as any;
      return highlightController.getHighlightsByDocumentId(request, reply);
    }
  );

  // Create a new highlight
  fastify.post<{ Body: CreateHighlightDTO }>(
    `${_options.prefix}`,
    {
      schema: {
        tags: ["Highlights"],
        summary: "Create a new highlight",
        body: createHighlightSchema,
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
      preHandler: validateBody(createHighlightSchema),
    },
    async (request, reply) => {
      const highlightController = request.diScope.resolve(
        "highlightController"
      ) as any;
      return highlightController.createHighlight(request, reply);
    }
  );

  // Get a specific highlight by ID
  fastify.get<{ Params: HighlightIdParams }>(
    `${_options.prefix}/:id`,
    {
      schema: {
        tags: ["Highlights"],
        summary: "Get highlight by ID",
        params: highlightIdParamsSchema,
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
      preHandler: validateParams(highlightIdParamsSchema),
    },
    async (request, reply) => {
      const highlightController = request.diScope.resolve(
        "highlightController"
      ) as any;
      return highlightController.getHighlightById(request, reply);
    }
  );

  // Update a highlight
  fastify.patch<{
    Params: HighlightIdParams;
    Body: UpdateHighlightDTO;
  }>(
    `${_options.prefix}/:id`,
    {
      schema: {
        tags: ["Highlights"],
        summary: "Update highlight",
        params: highlightIdParamsSchema,
        body: updateHighlightSchema,
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
        validateParams(highlightIdParamsSchema),
        validateBody(updateHighlightSchema),
      ],
    },
    async (request, reply) => {
      const highlightController = request.diScope.resolve(
        "highlightController"
      ) as any;
      return highlightController.updateHighlight(request, reply);
    }
  );

  // Delete a highlight
  fastify.delete<{ Params: HighlightIdParams }>(
    `${_options.prefix}/:id`,
    {
      schema: {
        tags: ["Highlights"],
        summary: "Delete highlight",
        params: highlightIdParamsSchema,
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
      preHandler: validateParams(highlightIdParamsSchema),
    },
    async (request, reply) => {
      const highlightController = request.diScope.resolve(
        "highlightController"
      ) as any;
      return highlightController.deleteHighlight(request, reply);
    }
  );
};

export const highlightRoutes = fp(highlightRoutesHandler, {
  name: "highlight-routes",
  fastify: "5.x",
});
