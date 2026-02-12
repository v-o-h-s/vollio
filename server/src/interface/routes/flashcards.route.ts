import {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyPluginOptions,
} from "fastify";
import {
  CreateFlashCardsDTO,
  createFlashCardsSchema,
  CreateManualFlashCardsDTO,
  createManualFlashCardsSchema,
  FlashCardsSetIdParams,
  flashCardsSetIdParamsSchema,
} from "../../shared/validation/flashcardSchemas";
import {
  validateBody,
  validateParams,
} from "../../shared/validation/validator";
import { FlashCardsController } from "../controllers/flashcards.controller";
import fp from "fastify-plugin";
import { RateLimitingDegrees } from "../../shared/utils/rate-limiting";

const flashcardsHandler: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions,
): Promise<void> => {
  // AI Generation
  fastify.post<{ Body: CreateFlashCardsDTO }>(
    `${opts.prefix}/generate-from-document`,
    {
      config: {
        rateLimit: { cost: RateLimitingDegrees.VERY_HIGH, category: "ai" },
      },
      schema: {
        body: createFlashCardsSchema,
      },
      preHandler: validateBody(createFlashCardsSchema),
    },
    async (request, reply) => {
      const flashCardsController =
        request.diScope.resolve<FlashCardsController>("flashCardsController");
      return flashCardsController.generateFlashCardsSet(request, reply);
    },
  );

  fastify.get<{ Params: FlashCardsSetIdParams }>(
    `${opts.prefix}/:id`,
    {
      config: {
        rateLimit: { cost: RateLimitingDegrees.LOW },
      },
      schema: {
        params: flashCardsSetIdParamsSchema,
      },
      preHandler: validateParams(flashCardsSetIdParamsSchema),
    },
    async (request, reply) => {
      const flashCardsController =
        request.diScope.resolve<FlashCardsController>("flashCardsController");
      return flashCardsController.getFlashCardsSetById(request, reply);
    },
  );

  fastify.get<{ Params: { documentId: string } }>(
    `${opts.prefix}/document/:documentId`,
    {
      config: {
        rateLimit: { cost: RateLimitingDegrees.LOW },
      },
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
      const flashCardsController =
        request.diScope.resolve<FlashCardsController>("flashCardsController");
      return flashCardsController.getFlashCardsSetsByDocumentId(request, reply);
    },
  );

  fastify.delete<{ Params: FlashCardsSetIdParams }>(
    `${opts.prefix}/:id`,
    {
      config: {
        rateLimit: { cost: RateLimitingDegrees.LOW },
      },
      schema: {
        params: flashCardsSetIdParamsSchema,
      },
      preHandler: validateParams(flashCardsSetIdParamsSchema),
    },
    async (request, reply) => {
      const flashCardsController =
        request.diScope.resolve<FlashCardsController>("flashCardsController");
      return flashCardsController.deleteFlashCardsSet(request, reply);
    },
  );

  fastify.get(
    `${opts.prefix}/`,
    {
      config: {
        rateLimit: { cost: RateLimitingDegrees.LOW },
      },
      schema: {},
    },
    async (request, reply) => {
      const flashCardsController =
        request.diScope.resolve<FlashCardsController>("flashCardsController");
      return flashCardsController.getAllFlashCardsSets(request, reply);
    },
  );
};

export const flashcardRoutes = fp(flashcardsHandler, {
  name: "flashcards-routes",
  fastify: "5.x",
});
