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
  createApiResponseSchema,
} from "../../shared/validation/validator";
import { CreateNoteDTO, UpdateNoteDTO, NoteIdParams } from "@vollio/shared";
import {
  createNoteSchema,
  updateNoteSchema,
  noteIdParamsSchema,
} from "../../shared/validation/noteSchemas";

const noteRoutesHandler: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  options: FastifyPluginOptions
): Promise<void> => {
  // Create a new note
  fastify.post<{ Body: CreateNoteDTO }>(
    `${options.prefix}/`,
    {
      schema: {
        tags: ["Notes"],
        summary: "Create a new note",
        body: createNoteSchema,
        response: {
          200: createApiResponseSchema({
            type: "object",
            additionalProperties: true,
          }),
        },
      },
      preHandler: validateBody(createNoteSchema),
    },
    async (request, reply) => {
      const noteController = request.diScope.resolve("noteController");
      return noteController.createNote(request, reply);
    }
  );

  // Get all notes for the authenticated user
  fastify.get(
    `${options.prefix}/`,
    {
      schema: {
        tags: ["Notes"],
        summary: "Get all user notes",
        response: {
          200: createApiResponseSchema({
            type: "array",
            items: { type: "object", additionalProperties: true },
          }),
        },
      },
    },
    async (request, reply) => {
      const noteController = request.diScope.resolve("noteController");
      return noteController.getAllNotes(request, reply);
    }
  );

  // Get a specific note by ID
  fastify.get<{ Params: NoteIdParams }>(
    `${options.prefix}/:id`,
    {
      schema: {
        tags: ["Notes"],
        summary: "Get note by ID",
        params: noteIdParamsSchema,
        response: {
          200: createApiResponseSchema({
            type: "object",
            additionalProperties: true,
          }),
        },
      },
      preHandler: validateParams(noteIdParamsSchema),
    },
    async (request, reply) => {
      const noteController = request.diScope.resolve("noteController");
      return noteController.getNoteById(request, reply);
    }
  );

  // Update a note
  fastify.put<{ Params: NoteIdParams; Body: UpdateNoteDTO }>(
    `${options.prefix}/:id`,
    {
      schema: {
        tags: ["Notes"],
        summary: "Update note",
        params: noteIdParamsSchema,
        body: updateNoteSchema,
        response: {
          200: createApiResponseSchema({
            type: "object",
            additionalProperties: true,
          }),
        },
      },
      preHandler: [
        validateParams(noteIdParamsSchema),
        validateBody(updateNoteSchema),
      ],
    },
    async (request, reply) => {
      const noteController = request.diScope.resolve("noteController");
      return noteController.updateNote(request, reply);
    }
  );

  // Delete a note
  fastify.delete<{ Params: NoteIdParams }>(
    `${options.prefix}/:id`,
    {
      schema: {
        tags: ["Notes"],
        summary: "Delete note",
        params: noteIdParamsSchema,
        response: {
          200: createApiResponseSchema({ type: "null" }),
        },
      },
      preHandler: validateParams(noteIdParamsSchema),
    },
    async (request, reply) => {
      const noteController = request.diScope.resolve("noteController");
      return noteController.deleteNote(request, reply);
    }
  );
};

export const noteRoutes = fp(noteRoutesHandler, {
  name: "note-routes",
  fastify: "5.x",
});
