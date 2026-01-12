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
      config: {
        rateLimit: { cost: 1 },
      },
      schema: {
        
        
        body: createManualFlashCardsSchema,
        
      },
      preHandler: validateBody(createManualFlashCardsSchema),
    },
    async (request, reply) => {
      const flashCardsController = request.diScope.resolve<FlashCardsController>(
        "flashCardsController"
      );
      return flashCardsController.createFlashCardsSet(request, reply);
    }
  );

  // AI Generation
  fastify.post<{ Body: CreateFlashCardsDTO }>(
    `${opts.prefix}/generate-from-document`,
    {
      config: {
        rateLimit: { cost: 20, category: "ai" },
      },
      schema: {
        
        
        body: createFlashCardsSchema,
        
      },
      preHandler: validateBody(createFlashCardsSchema),
    },
    async (request, reply) => {
      const flashCardsController = request.diScope.resolve<FlashCardsController>(
        "flashCardsController"
      );
      return flashCardsController.generateFlashCardsSet(request, reply);
    }
  );

  fastify.get<{ Params: FlashCardsSetIdParams }>(
    `${opts.prefix}/:id`,
    {
      config: {
        rateLimit: { cost: 1 },
      },
      schema: {
        
        
        params: flashCardsSetIdParamsSchema,
        
      },
      preHandler: validateParams(flashCardsSetIdParamsSchema),
    },
    async (request, reply) => {
      const flashCardsController = request.diScope.resolve<FlashCardsController>(
        "flashCardsController"
      );
      return flashCardsController.getFlashCardsSetById(request, reply);
    }
  );

  fastify.get<{ Params: { documentId: string } }>(
    `${opts.prefix}/document/:documentId`,
    {
      config: {
        rateLimit: { cost: 1 },
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
      const flashCardsController = request.diScope.resolve<FlashCardsController>(
        "flashCardsController"
      );
      return flashCardsController.getFlashCardsSetsByDocumentId(request, reply);
    }
  );

  fastify.delete<{ Params: FlashCardsSetIdParams }>(
    `${opts.prefix}/:id`,
    {
      config: {
        rateLimit: { cost: 1 },
      },
      schema: {
        
        
        params: flashCardsSetIdParamsSchema,
        
      },
      preHandler: validateParams(flashCardsSetIdParamsSchema),
    },
    async (request, reply) => {
      const flashCardsController = request.diScope.resolve<FlashCardsController>(
        "flashCardsController"
      );
      return flashCardsController.deleteFlashCardsSet(request, reply);
    }
  );

  fastify.get(
    `${opts.prefix}/`,
    {
      config: {
        rateLimit: { cost: 1 },
      },
      schema: {
        
        
        
      },
    },
    async (request, reply) => {
      const flashCardsController = request.diScope.resolve<FlashCardsController>(
        "flashCardsController"
      );
      return flashCardsController.getAllFlashCardsSets(request, reply);
    }
  );
};

export const flashcardRoutes = fp(flashcardsHandler, {
  name: "flashcards-routes",
  fastify: "5.x",
});
