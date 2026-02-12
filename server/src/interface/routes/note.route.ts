import {
  FastifyInstance,
  FastifyPluginOptions,
  FastifyPlugin,
  FastifyPluginAsync,
} from "fastify";
import fp from "fastify-plugin";
import {
  validateBody,
  validateParams,
  validateQuery,
} from "../../shared/validation/validator";
import { CreateNoteDTO, UpdateNoteDTO, NoteIdParams } from "@vollio/shared";
import {
  createNoteSchema,
  updateNoteSchema,
  noteIdParamsSchema,
  generateSummarySchema,
} from "../../shared/validation/noteSchemas";
import { NoteController } from "../controllers/note.controller";
import { RateLimitingDegrees } from "../../shared/utils/rate-limiting";

const noteRoutesHandler: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  options: FastifyPluginOptions,
): Promise<void> => {
  // Create a new note
  fastify.post<{ Body: CreateNoteDTO }>(
    `${options.prefix}/`,
    {
      config: {
        rateLimit: { cost: RateLimitingDegrees.LOW },
      },
      schema: {
        body: createNoteSchema,
      },
      preHandler: validateBody(createNoteSchema),
    },
    async (request, reply) => {
      const noteController =
        request.diScope.resolve<NoteController>("noteController");
      return noteController.createNote(request, reply);
    },
  );

  // Get all notes for the authenticated user
  fastify.get(
    `${options.prefix}/`,
    {
      config: {
        rateLimit: { cost: RateLimitingDegrees.LOW },
      },
      schema: {},
    },
    async (request, reply) => {
      const noteController =
        request.diScope.resolve<NoteController>("noteController");
      return noteController.getAllNotes(request, reply);
    },
  );

  // Get a specific note by ID
  fastify.get<{ Params: NoteIdParams }>(
    `${options.prefix}/:id`,
    {
      config: {
        rateLimit: { cost: RateLimitingDegrees.LOW },
      },
      schema: {
        params: noteIdParamsSchema,
      },
      preHandler: validateParams(noteIdParamsSchema),
    },
    async (request, reply) => {
      const noteController =
        request.diScope.resolve<NoteController>("noteController");
      return noteController.getNoteById(request, reply);
    },
  );

  // Update a note
  fastify.put<{ Params: NoteIdParams; Body: UpdateNoteDTO }>(
    `${options.prefix}/:id`,
    {
      config: {
        rateLimit: { cost: RateLimitingDegrees.LOW },
      },
      schema: {
        params: noteIdParamsSchema,
        body: updateNoteSchema,
      },
      preHandler: [
        validateParams(noteIdParamsSchema),
        validateBody(updateNoteSchema),
      ],
    },
    async (request, reply) => {
      const noteController =
        request.diScope.resolve<NoteController>("noteController");
      return noteController.updateNote(request, reply);
    },
  );

  // Delete a note
  fastify.delete<{ Params: NoteIdParams }>(
    `${options.prefix}/:id`,
    {
      config: {
        rateLimit: { cost: RateLimitingDegrees.LOW },
      },
      schema: {
        params: noteIdParamsSchema,
      },
      preHandler: validateParams(noteIdParamsSchema),
    },
    async (request, reply) => {
      const noteController =
        request.diScope.resolve<NoteController>("noteController");
      return noteController.deleteNote(request, reply);
    },
  );
};

export const noteRoutes = fp(noteRoutesHandler, {
  name: "note-routes",
  fastify: "5.x",
});
