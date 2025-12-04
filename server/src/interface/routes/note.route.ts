import { FastifyInstance, FastifyPluginOptions } from "fastify";
import { TOKENS } from "../../infrastructure/di/container";
import { NoteController } from "../controllers/note.controller";
import {
  validateBody,
  validateParams,
} from "../../shared/validation/validator";
import {
  createNoteSchema,
  updateNoteSchema,
  noteIdParamsSchema,
  CreateNoteDTO,
  UpdateNoteDTO,
  NoteIdParams,
} from "../../shared/validation/noteSchemas";

export async function noteRoutes(
  fastify: FastifyInstance,
  options: FastifyPluginOptions
): Promise<void> {
  // Create a new note
  fastify.post<{ Body: CreateNoteDTO }>(
    "/",
    {
      preHandler: validateBody(createNoteSchema),
    },
    async (request, reply) => {
      // Get controller from request-scoped container
      const noteController = (request as any).container.resolve(TOKENS.NoteController) as NoteController;
      return noteController.createNote(request, reply);
    }
  );

  // Get all notes for the authenticated user
  fastify.get("/", async (request, reply) => {
    const noteController = (request as any).container.resolve(TOKENS.NoteController) as NoteController;
    return noteController.getAllNotes(request, reply);
  });

  // Get a specific note by ID
  fastify.get<{ Params: NoteIdParams }>(
    "/:id",
    {
      preHandler: validateParams(noteIdParamsSchema),
    },
    async (request, reply) => {
      const noteController = (request as any).container.resolve(TOKENS.NoteController) as NoteController;
      return noteController.getNoteById(request, reply);
    }
  );

  // Update a note
  fastify.put<{ Params: NoteIdParams; Body: UpdateNoteDTO }>(
    "/:id",
    {
      preHandler: [
        validateParams(noteIdParamsSchema),
        validateBody(updateNoteSchema),
      ],
    },
    async (request, reply) => {
      const noteController = (request as any).container.resolve(TOKENS.NoteController) as NoteController;
      return noteController.updateNote(request, reply);
    }
  );

  // Delete a note
  fastify.delete<{ Params: NoteIdParams }>(
    "/:id",
    {
      preHandler: validateParams(noteIdParamsSchema),
    },
    async (request, reply) => {
      const noteController = (request as any).container.resolve(TOKENS.NoteController) as NoteController;
      return noteController.deleteNote(request, reply);
    }
  );
}
