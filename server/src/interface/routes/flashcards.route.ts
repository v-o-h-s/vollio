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
      schema: {
        tags: ["Flashcards"],
        summary: "Create flashcards set manually",
        body: createManualFlashCardsSchema,
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
      schema: {
        tags: ["Flashcards"],
        summary: "Generate flashcards set using AI",
        body: createFlashCardsSchema,
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
      schema: {
        tags: ["Flashcards"],
        summary: "Get flashcards set by ID",
        params: flashCardsSetIdParamsSchema,
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
    {
      schema: {
        tags: ["Flashcards"],
        summary: "Get flashcards sets by Document ID",
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
      const flashCardsController = request.diScope.resolve(
        "flashCardsController"
      ) as FlashCardsController;
      return flashCardsController.getFlashCardsSetsByDocumentId(request, reply);
    }
  );

  fastify.delete<{ Params: FlashCardsSetIdParams }>(
    `${opts.prefix}/:id`,
    {
      schema: {
        tags: ["Flashcards"],
        summary: "Delete flashcards set",
        params: flashCardsSetIdParamsSchema,
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
      preHandler: validateParams(flashCardsSetIdParamsSchema),
    },
    async (request, reply) => {
      const flashCardsController = request.diScope.resolve(
        "flashCardsController"
      ) as FlashCardsController;
      return flashCardsController.deleteFlashCardsSet(request, reply);
    }
  );

  fastify.get(
    `${opts.prefix}/`,
    {
      schema: {
        tags: ["Flashcards"],
        summary: "Get all user flashcards sets",
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
      const flashCardsController = request.diScope.resolve(
        "flashCardsController"
      ) as FlashCardsController;
      return flashCardsController.getAllFlashCardsSets(request, reply);
    }
  );
};

export const flashcardRoutes = fp(flashcardsHandler, {
  name: "flashcards-routes",
  fastify: "5.x",
});
