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
  GetHighlightsQuery,
} from "../../shared/validation/highlightSchemas";

const highlightRoutesHandler: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  _options: FastifyPluginOptions
): Promise<void> => {
  // Get all highlights
  fastify.get<{ Querystring: GetHighlightsQuery }>(
    "/",
    {
      preHandler: validateQuery(getHighlightsQuerySchema),
    },
    async (request, reply) => {
      const highlightController = request.diScope.resolve(
        "highlightController"
      ) as any;
      return highlightController.getAllHighlights(request, reply);
    }
  );

  // Create a new highlight
  fastify.post<{ Body: CreateHighlightDTO }>(
    "/",
    {
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
    "/:id",
    {
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
    "/:id",
    {
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
    "/:id",
    {
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
