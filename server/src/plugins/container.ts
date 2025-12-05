import { FastifyPluginAsync } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { asClass, asFunction, Lifetime, InjectionMode, asValue } from "awilix";
import { createUserClient } from "../infrastructure/database/supabase/supabase";
import { NoteRepository } from "../infrastructure/repositories/NoteRepository";
import { CreateNoteUseCase } from "../application/use-cases/notes/CreateNoteUseCase";
import { UpdateNoteUseCase } from "../application/use-cases/notes/UpdateNoteUseCase";
import { DeleteNoteUseCase } from "../application/use-cases/notes/DeleteNoteUseCase";
import { GetNoteUseCase } from "../application/use-cases/notes/GetNoteByIdUseCase";
import { GetAllUserNotesUseCase } from "../application/use-cases/notes/GetAllUserNotesUseCase";
import { NoteController } from "../interface/controllers/note.controller";
import { GoogleClassroomService } from "../infrastructure/services/GoogleClassroomService";
import { UserGoogleClassroomRepository } from "../infrastructure/repositories/UserGoogleClassroomRepository";
import { GoogleClassroomController } from "../interface/controllers/googleClassroom.controller";
import { FromCodeToDatabaseUseCase } from "../application/use-cases/google-Classroom/FromCodeToDatabaseUseCase";
import { RefreshTokenAndUpdateTheDatabaseUseCase } from "../application/use-cases/google-Classroom/RefreshTokenAndUpdateTheDatabaseUseCase";
import { CheckTokenStatusUseCase } from "../application/use-cases/google-Classroom/CheckTokenStatusUseCase";
import { DisconnectGoogleClassroomUseCase } from "../application/use-cases/google-Classroom/DisconnectGoogleClassroomUseCase";
const diPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("onRequest", async (request, reply) => {
    const { supabase } = await createUserClient(request);
    request.diScope.register({
      supabaseClient: asValue(supabase),
    });
  });

  fastify.diContainer.register({
    userGoogleClassroomRepository: asClass(UserGoogleClassroomRepository, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    googleClassroomService: asClass(GoogleClassroomService, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    googleClassroomController: asClass(GoogleClassroomController, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    fromCodeToDatabaseUseCase: asClass(FromCodeToDatabaseUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    refreshTokenAndUpdateTheDatabaseUseCase: asClass(RefreshTokenAndUpdateTheDatabaseUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    checkTokenStatusUseCase: asClass(CheckTokenStatusUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    disconnectGoogleClassroomUseCase: asClass(DisconnectGoogleClassroomUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
  });

  fastify.diContainer.register({
    noteRepository: asClass(NoteRepository, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    createNoteUseCase: asClass(CreateNoteUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    updateNoteUseCase: asClass(UpdateNoteUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    deleteNoteUseCase: asClass(DeleteNoteUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    getNoteUseCase: asClass(GetNoteUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    getAllUserNotesUseCase: asClass(GetAllUserNotesUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
  });

  fastify.diContainer.register({
    noteController: asClass(NoteController, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
  });
};

export const containerPlugin = fastifyPlugin(diPlugin, {
  name: "di-container-plugin",
  fastify: "5.x",
  dependencies: ["@fastify/awilix"],
});
