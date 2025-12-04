import "reflect-metadata";
import { container } from "tsyringe";
import { SupabaseClient } from "@supabase/supabase-js";
import { FastifyRequest } from "fastify";
import { INoteRepository } from "../../domain/repositories/INoteRepository";
import { NoteRepository } from "../repositories/NoteRepository";
import { CreateNoteUseCase } from "../../application/use-cases/CreateNoteUseCase";
import { UpdateNoteUseCase } from "../../application/use-cases/UpdateNoteUseCase";
import { DeleteNoteUseCase } from "../../application/use-cases/DeleteNoteUseCase";
import { GetNoteUseCase } from "../../application/use-cases/getNote";
import { GetAllUserNotesUseCase } from "../../application/use-cases/getAllUserNotesUseCase";
import { NoteController } from "../../interface/controllers/note.controller";

// Tokens for dependency injection
export const TOKENS = {
  SupabaseClient: "SupabaseClient",
  INoteRepository: "INoteRepository",
  CreateNoteUseCase: "CreateNoteUseCase",
  UpdateNoteUseCase: "UpdateNoteUseCase",
  DeleteNoteUseCase: "DeleteNoteUseCase",
  GetNoteUseCase: "GetNoteUseCase",
  GetAllUserNotesUseCase: "GetAllUserNotesUseCase",
  NoteController: "NoteController",
};

// Create a per-request DI setup with authenticated Supabase client (respects RLS)
export function setupRequestDependencies(req: FastifyRequest): void {
  const supabase = (req as any).supabase as SupabaseClient;

  // Create a child container for this request
  const requestContainer = container.createChildContainer();

  // Register the authenticated Supabase client (respects RLS)
  requestContainer.registerInstance(TOKENS.SupabaseClient, supabase);

  // Register repositories
  requestContainer.register(TOKENS.INoteRepository, {
    useFactory: (c) => {
      const client = c.resolve<SupabaseClient>(TOKENS.SupabaseClient);
      return new NoteRepository(client);
    },
  });

  // Register use cases
  requestContainer.register(TOKENS.CreateNoteUseCase, {
    useFactory: (c) => {
      const repository = c.resolve<INoteRepository>(TOKENS.INoteRepository);
      return new CreateNoteUseCase(repository);
    },
  });

  requestContainer.register(TOKENS.UpdateNoteUseCase, {
    useFactory: (c) => {
      const repository = c.resolve<INoteRepository>(TOKENS.INoteRepository);
      return new UpdateNoteUseCase(repository);
    },
  });

  requestContainer.register(TOKENS.DeleteNoteUseCase, {
    useFactory: (c) => {
      const repository = c.resolve<INoteRepository>(TOKENS.INoteRepository);
      return new DeleteNoteUseCase(repository);
    },
  });

  requestContainer.register(TOKENS.GetNoteUseCase, {
    useFactory: (c) => {
      const repository = c.resolve<INoteRepository>(TOKENS.INoteRepository);
      return new GetNoteUseCase(repository);
    },
  });

  requestContainer.register(TOKENS.GetAllUserNotesUseCase, {
    useFactory: (c) => {
      const repository = c.resolve<INoteRepository>(TOKENS.INoteRepository);
      return new GetAllUserNotesUseCase(repository);
    },
  });

  // Register controller
  requestContainer.register(TOKENS.NoteController, {
    useFactory: (c) => {
      const createNoteUseCase = c.resolve<CreateNoteUseCase>(TOKENS.CreateNoteUseCase);
      const updateNoteUseCase = c.resolve<UpdateNoteUseCase>(TOKENS.UpdateNoteUseCase);
      const deleteNoteUseCase = c.resolve<DeleteNoteUseCase>(TOKENS.DeleteNoteUseCase);
      const getNoteUseCase = c.resolve<GetNoteUseCase>(TOKENS.GetNoteUseCase);
      const getAllUserNotesUseCase = c.resolve<GetAllUserNotesUseCase>(TOKENS.GetAllUserNotesUseCase);

      return new NoteController(
        createNoteUseCase,
        updateNoteUseCase,
        deleteNoteUseCase,
        getNoteUseCase,
        getAllUserNotesUseCase
      );
    },
  });

  // Store the request container in the request
  (req as any).container = requestContainer;
}

export { container };
