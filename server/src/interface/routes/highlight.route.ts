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
import { HighlightController } from "../controllers/highlight.controller";
import { RateLimitingDegrees } from "../../shared/utils/rate-limiting";

const highlightRoutesHandler: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  _options: FastifyPluginOptions,
): Promise<void> => {
  // get highlights by document ID
  fastify.get<{ Querystring: HighlightDocumentIdParams }>(
    `${_options.prefix}`,
    {
      config: {
        rateLimit: {
          request: { cost: RateLimitingDegrees.LOW },
        },
      },
      schema: {
        querystring: highlightDocumentIdParamsSchema,
      },
      preHandler: validateQuery(highlightDocumentIdParamsSchema),
    },
    async (request, reply) => {
      const highlightController = request.diScope.resolve<HighlightController>(
        "highlightController",
      );
      return highlightController.getHighlightsByDocumentId(request, reply);
    },
  );

  // Create a new highlight
  fastify.post<{ Body: CreateHighlightDTO }>(
    `${_options.prefix}`,
    {
      config: {
        rateLimit: {
          request: { cost: RateLimitingDegrees.LOW },
        },
      },
      schema: {
        body: createHighlightSchema,
      },
      preHandler: validateBody(createHighlightSchema),
    },
    async (request, reply) => {
      const highlightController = request.diScope.resolve<HighlightController>(
        "highlightController",
      );
      return highlightController.createHighlight(request, reply);
    },
  );

  // Get a specific highlight by ID
  fastify.get<{ Params: HighlightIdParams }>(
    `${_options.prefix}/:id`,
    {
      config: {
        rateLimit: {
          request: { cost: RateLimitingDegrees.LOW },
        },
      },
      schema: {
        params: highlightIdParamsSchema,
      },
      preHandler: validateParams(highlightIdParamsSchema),
    },
    async (request, reply) => {
      const highlightController = request.diScope.resolve<HighlightController>(
        "highlightController",
      );
      return highlightController.getHighlightById(request, reply);
    },
  );

  // Update a highlight
  fastify.patch<{
    Params: HighlightIdParams;
    Body: UpdateHighlightDTO;
  }>(
    `${_options.prefix}/:id`,
    {
      config: {
        rateLimit: {
          request: { cost: RateLimitingDegrees.LOW },
        },
      },
      schema: {
        params: highlightIdParamsSchema,
        body: updateHighlightSchema,
      },
      preHandler: [
        validateParams(highlightIdParamsSchema),
        validateBody(updateHighlightSchema),
      ],
    },
    async (request, reply) => {
      const highlightController = request.diScope.resolve<HighlightController>(
        "highlightController",
      );
      return highlightController.updateHighlight(request, reply);
    },
  );

  // Delete a highlight
  fastify.delete<{ Params: HighlightIdParams }>(
    `${_options.prefix}/:id`,
    {
      config: {
        rateLimit: {
          request: { cost: RateLimitingDegrees.LOW },
        },
      },
      schema: {
        params: highlightIdParamsSchema,
      },
      preHandler: validateParams(highlightIdParamsSchema),
    },
    async (request, reply) => {
      const highlightController = request.diScope.resolve<HighlightController>(
        "highlightController",
      );
      return highlightController.deleteHighlight(request, reply);
    },
  );

  // Count highlights by tag
  fastify.get<{ Params: { tagName: string } }>(
    `${_options.prefix}/tags/:tagName/count`,
    {
      config: {
        rateLimit: {
          request: { cost: RateLimitingDegrees.LOW },
        },
      },
    },
    async (request, reply) => {
      const highlightController = request.diScope.resolve<HighlightController>(
        "highlightController",
      );
      return highlightController.countHighlightsByTag(request, reply);
    },
  );

  // Delete highlights by tag
  fastify.delete<{ Params: { tagName: string } }>(
    `${_options.prefix}/tags/:tagName`,
    {
      config: {
        rateLimit: {
          request: { cost: RateLimitingDegrees.LOW },
        },
      },
    },
    async (request, reply) => {
      const highlightController = request.diScope.resolve<HighlightController>(
        "highlightController",
      );
      return highlightController.deleteHighlightsByTag(request, reply);
    },
  );
};

export const highlightRoutes = fp(highlightRoutesHandler, {
  name: "highlight-routes",
  fastify: "5.x",
});
