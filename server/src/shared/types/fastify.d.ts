import "@fastify/cookie";
import "@fastify/session";
import { AwilixContainer } from "awilix";
import { SupabaseClient } from "@supabase/supabase-js";
import { NoteController } from "../../interface/controllers/note.controller";
import { NoteRepository } from "../../infrastructure/repositories/NoteRepository";
import { CreateNoteUseCase } from "../../application/use-cases/CreateNoteUseCase";
import { UpdateNoteUseCase } from "../../application/use-cases/notes/UpdateNoteUseCase";
import { DeleteNoteUseCase } from "../../application/use-cases/DeleteNoteUseCase";
import { GetNoteUseCase } from "../../application/use-cases/GetNoteByIdUseCase";
import { GetAllUserNotesUseCase } from "../../application/use-cases/GetAllUserNotesUseCase";

export interface User {
  id: string;
  email?: string;
  phone?: string;
  user_metadata?: Record<string, unknown>;
  role: string;
}

// Extend session to include OAuth state
declare module "@fastify/session" {
  interface FastifySessionObject {
    oauthState?: string;
  }
}

// Define the shape of our DI container
export interface DIContainer {
  supabaseClient: SupabaseClient;
  noteRepository: NoteRepository;
  createNoteUseCase: CreateNoteUseCase;
  updateNoteUseCase: UpdateNoteUseCase;
  deleteNoteUseCase: DeleteNoteUseCase;
  getNoteUseCase: GetNoteUseCase;
  getAllUserNotesUseCase: GetAllUserNotesUseCase;
  noteController: NoteController;
  userGoogleClassroomRepository: UserGoogleClassroomRepository;
  googleClassroomService: GoogleClassroomService;
  googleClassroomController: GoogleClassroomController;
  fromCodeToDatabaseUseCase: FromCodeToDatabaseUseCase;
}

declare module "fastify" {
  interface FastifyRequest {
    user: User | null;
    cookies: {
      [cookieName: string]: string;
    };
    // Awilix container provided by @fastify/awilix
    diScope: AwilixContainer<DIContainer>;
  }

  interface FastifyInstance {
    // Global DI container
    diContainer: AwilixContainer;
  }
}
