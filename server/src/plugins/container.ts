import { FastifyPluginAsync } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { asClass, asFunction, Lifetime, InjectionMode, asValue } from "awilix";
import { createUserClient } from "../infrastructure/database/supabase/supabase";
import { NoteRepository } from "../infrastructure/repositories/NoteRepository";
import { CreateNoteUseCase } from "../application/use-cases/CreateNoteUseCase";
import { UpdateNoteUseCase } from "../application/use-cases/UpdateNoteUseCase";
import { DeleteNoteUseCase } from "../application/use-cases/DeleteNoteUseCase";
import { GetNoteUseCase } from "../application/use-cases/GetNoteByIdUseCase";
import { GetAllUserNotesUseCase } from "../application/use-cases/GetAllUserNotesUseCase";

import { NoteController } from "../interface/controllers/note.controller";

const diPlugin: FastifyPluginAsync = async (fastify) => {
  fastify.addHook("onRequest", async (request, reply) => {
    const { supabase } = await createUserClient(request);
    request.diScope.register({
      supabaseClient: asValue(supabase),
    });
  });

  fastify.diContainer.register({
    noteRepository: asClass(NoteRepository, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
  });

  fastify.diContainer.register({
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
