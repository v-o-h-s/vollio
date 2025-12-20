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

const flashcardsHandler: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
): Promise<void> => {
  // Manual creation
  fastify.post<{ Body: CreateManualFlashCardsDTO }>(
    `${opts.prefix}/`,
    {
      preHandler: validateBody(createManualFlashCardsSchema),
    },
    async (request, reply) => {
      const flashCardsController = request.diScope.resolve(
        "flashCardsController"
      ) as FlashCardsController;
      return flashCardsController.createFlashCardsSet(request, reply);
    }
  );

  // AI Generation
  fastify.post<{ Body: CreateFlashCardsDTO }>(
    `${opts.prefix}/generate-from-document`,
    {
      preHandler: validateBody(createFlashCardsSchema),
    },
    async (request, reply) => {
      const flashCardsController = request.diScope.resolve(
        "flashCardsController"
      ) as FlashCardsController;
      return flashCardsController.generateFlashCardsSet(request, reply);
    }
  );

  fastify.get<{ Params: FlashCardsSetIdParams }>(
    `${opts.prefix}/:id`,
    {
      preHandler: validateParams(flashCardsSetIdParamsSchema),
    },
    async (request, reply) => {
      const flashCardsController = request.diScope.resolve(
        "flashCardsController"
      ) as FlashCardsController;
      return flashCardsController.getFlashCardsSetById(request, reply);
    }
  );

  fastify.get<{ Params: { documentId: string } }>(
    `${opts.prefix}/document/:documentId`,
    async (request, reply) => {
      const flashCardsController = request.diScope.resolve(
        "flashCardsController"
      ) as FlashCardsController;
      return flashCardsController.getFlashCardsSetsByDocumentId(request, reply);
    }
  );

  fastify.delete<{ Params: FlashCardsSetIdParams }>(
    `${opts.prefix}/:id`,
    {
      preHandler: validateParams(flashCardsSetIdParamsSchema),
    },
    async (request, reply) => {
      const flashCardsController = request.diScope.resolve(
        "flashCardsController"
      ) as FlashCardsController;
      return flashCardsController.deleteFlashCardsSet(request, reply);
    }
  );

  fastify.get(`${opts.prefix}/`, async (request, reply) => {
    const flashCardsController = request.diScope.resolve(
      "flashCardsController"
    ) as FlashCardsController;
    return flashCardsController.getAllFlashCardsSets(request, reply);
  });
};

export const flashcardRoutes = fp(flashcardsHandler, {
  name: "flashcards-routes",
  fastify: "5.x",
});
