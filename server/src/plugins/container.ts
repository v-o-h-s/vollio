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
import { GetCoursesUseCase } from "../application/use-cases/google-Classroom/GetCoursesUseCase";
import { EnsureValidTokenUseCase } from "../application/use-cases/google-Classroom/EnsureValidTokenUseCase";
import { IsConnectedToGoogleClassroomUseCase } from "../application/use-cases/google-Classroom/IsConnectedToGoogleClassroomUseCase";
import { GetCourseContentUseCase } from "../application/use-cases/google-Classroom/GetCourseContentUseCase";
import { GetCoursesWithContentUseCase } from "../application/use-cases/google-Classroom/GetCoursesWithContentUseCase";
import { AddFileFromGoogleDriveUseCase } from "../application/use-cases/files/AddFileFromGoogleDriveUseCase";
import { GoogleDriveService } from "../infrastructure/services/GoogleDriveService";
import { FileRepository } from "../infrastructure/repositories/FileRepository";
import { FileController } from "../interface/controllers/file.controller";
import { GetFileFromGoogleDriveUseCase } from "../application/use-cases/files/GetFileFromGoogleDriveUseCase";
import { UploadFileUseCase } from "../application/use-cases/files/UploadFileUseCase";
import { GetAllFilesUseCase } from "../application/use-cases/files/GetAllFilesUseCase";
import { GetFileByIdUseCase } from "../application/use-cases/files/GetFileByIdUseCase";
import { DeleteFileUseCase } from "../application/use-cases/files/DeleteFileUseCase";
import { MoveFileUseCase } from "../application/use-cases/files/MoveFileUseCase";
import { RenameFileUseCase } from "../application/use-cases/files/RenameFileUseCase";
import { StorageService } from "../infrastructure/services/StorageService";
import { FolderRepository } from "../infrastructure/repositories/FolderRepository";
import { testChunks } from "../application/use-cases/testChanks";
import { testController } from "../interface/controllers/test.controller";
import { GetAllUserFoldersUseCase } from "../application/use-cases/folders/GetAllUserFoldersUseCase";
import { CreateFolderUseCase } from "../application/use-cases/folders/CreateFolderUseCase";
import { GetFolderByIdUseCase } from "../application/use-cases/folders/GetFolderByIdUseCase";
import { UpdateFolderUseCase } from "../application/use-cases/folders/UpdateFolderUseCase";
import { DeleteFolderUseCase } from "../application/use-cases/folders/DeleteFolderUseCase";
import { FolderController } from "../interface/controllers/folder.controller";
const diPlugin: FastifyPluginAsync = async (fastify) => {
  // Register singleton logger
  fastify.diContainer.register({
    logger: asValue(fastify.log),
  });

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
    refreshTokenAndUpdateTheDatabaseUseCase: asClass(
      RefreshTokenAndUpdateTheDatabaseUseCase,
      {
        lifetime: Lifetime.SCOPED,
        injectionMode: InjectionMode.CLASSIC,
      }
    ),
    checkTokenStatusUseCase: asClass(CheckTokenStatusUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    disconnectGoogleClassroomUseCase: asClass(
      DisconnectGoogleClassroomUseCase,
      {
        lifetime: Lifetime.SCOPED,
        injectionMode: InjectionMode.CLASSIC,
      }
    ),
    getCoursesUseCase: asClass(GetCoursesUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    ensureValidTokenUseCase: asClass(EnsureValidTokenUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    getCourseContentUseCase: asClass(GetCourseContentUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    getCoursesWithContentUseCase: asClass(GetCoursesWithContentUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    // Alias for controller dependency injection
    refreshTokenUseCase: asClass(RefreshTokenAndUpdateTheDatabaseUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    disconnectUseCase: asClass(DisconnectGoogleClassroomUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    isConnectedUseCase: asClass(IsConnectedToGoogleClassroomUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    fileRepository: asClass(FileRepository, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    googleDriveService: asClass(GoogleDriveService, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    addFileFromGoogleDriveUseCase: asClass(AddFileFromGoogleDriveUseCase, {
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
    getFileFromGoogleDriveUseCase: asClass(GetFileFromGoogleDriveUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    getAllFilesUseCase: asClass(GetAllFilesUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    getFileByIdUseCase: asClass(GetFileByIdUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    uploadFileUseCase: asClass(UploadFileUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    deleteFileUseCase: asClass(DeleteFileUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    moveFileUseCase: asClass(MoveFileUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    renameFileUseCase: asClass(RenameFileUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    storageService: asClass(StorageService, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    folderRepository: asClass(FolderRepository, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    fileController: asClass(FileController, {
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

  // Folder use cases and controller
  fastify.diContainer.register({
    getAllUserFoldersUseCase: asClass(GetAllUserFoldersUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    createFolderUseCase: asClass(CreateFolderUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    getFolderByIdUseCase: asClass(GetFolderByIdUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    updateFolderUseCase: asClass(UpdateFolderUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    deleteFolderUseCase: asClass(DeleteFolderUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    folderController: asClass(FolderController, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
  });

  // will be deleted
  fastify.diContainer.register({
    testChunks: asClass(testChunks, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    testController: asClass(testController, {
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
