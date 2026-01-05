import { FastifyPluginAsync } from "fastify";
import fastifyPlugin from "fastify-plugin";
import { asClass, asFunction, Lifetime, InjectionMode, asValue } from "awilix";
import { createUserClient } from "../infrastructure/database/supabase/supabase";
import { NoteRepository } from "../infrastructure/repositories/NoteRepository";
import { EmbeddingRepository } from "../infrastructure/repositories/EmbeddingRepository";
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
import { AddDocumentFromGoogleDriveUseCase } from "../application/use-cases/documents/AddDocumentFromGoogleDriveUseCase";
import { GoogleDriveService } from "../infrastructure/services/GoogleDriveService";
import { DocumentRepository } from "../infrastructure/repositories/DocumentRepository";
import { DocumentController } from "../interface/controllers/document.controller";
import { GetDocumentFromGoogleDriveUseCase } from "../application/use-cases/documents/GetDocumentFromGoogleDriveUseCase";
import { GetAllDocumentsUseCase } from "../application/use-cases/documents/GetAllDocumentsUseCase";
import { GetDocumentByIdUseCase } from "../application/use-cases/documents/GetDocumentByIdUseCase";
import { DeleteDocumentUseCase } from "../application/use-cases/documents/DeleteDocumentUseCase";
import { MoveDocumentUseCase } from "../application/use-cases/documents/MoveDocumentUseCase";
import { RenameDocumentUseCase } from "../application/use-cases/documents/RenameDocumentUseCase";
import { StorageService } from "../infrastructure/services/StorageService";
import { FolderRepository } from "../infrastructure/repositories/FolderRepository";
import { GetAllUserFoldersUseCase } from "../application/use-cases/folders/GetAllUserFoldersUseCase";
import { CreateFolderUseCase } from "../application/use-cases/folders/CreateFolderUseCase";
import { GetFolderByIdUseCase } from "../application/use-cases/folders/GetFolderByIdUseCase";
import { UpdateFolderUseCase } from "../application/use-cases/folders/UpdateFolderUseCase";
import { DeleteFolderUseCase } from "../application/use-cases/folders/DeleteFolderUseCase";
import { FolderController } from "../interface/controllers/folder.controller";
import { GetAllHighlightsUseCase } from "../application/use-cases/highlights/GetAllHighlightsUseCase";
import { CreateHighlightUseCase } from "../application/use-cases/highlights/CreateHighlightUseCase";
import { GetHighlightByIdUseCase } from "../application/use-cases/highlights/GetHighlightByIdUseCase";
import { UpdateHighlightUseCase } from "../application/use-cases/highlights/UpdateHighlightUseCase";
import { DeleteHighlightUseCase } from "../application/use-cases/highlights/DeleteHighlightUseCase";
import { HighlightRepository } from "../infrastructure/repositories/HighlightRepository";
import { HighlightController } from "../interface/controllers/highlight.controller";
import { GetHighlightsByDocumentIdUseCase } from "../application/use-cases/highlights/GetHighlightsByDocumentIdUseCase";
import { StreamDocumentUseCase } from "../application/use-cases/documents/StreamDocumentUseCase";
import { GetDocumentContentUseCase } from "../application/use-cases/documents/GetDocumentContentUseCase";
import { ChunkingService } from "../infrastructure/services/ChunkingService";
import { EmbeddingService } from "../infrastructure/services/EmbeddingService";
import { SemanticSearchService } from "../application/services/SemanticSearchService";
import { DocumentProcessingService } from "../infrastructure/services/DocumentProcessingService";
import { GenerativeAiService } from "../infrastructure/services/GenerativeAiService";
import { QuizController } from "../interface/controllers/quiz.controller";
import { CreateGeneralQuizUseCase } from "../application/use-cases/quizzes/CreateGeneralQuizUseCase";
import { EnsureExistingOfDocumentEmbeddingUseCase } from "../application/use-cases/embedding/EnsureExistingOfDocumentEmbeddingUseCase";
import { EmbedDocumentByIdUseCase } from "../application/use-cases/embedding/EmbedDocumentByIdUseCase";
import { QuizRepository } from "../infrastructure/repositories/QuizRepository";
import { CreateUserPromptQuizUseCase } from "../application/use-cases/quizzes/CreateUserPromptQuizUseCase";
import { FlashCardsSetRepository } from "../infrastructure/repositories/FlashCardsSetRepository";
import { GenerateGeneralFlashCardsUseCase } from "../application/use-cases/flashcards/GenerateGeneralFlashCardsUseCase";
import { GetAllFlashCardsSetsUseCase } from "../application/use-cases/flashcards/GetAllFlashCardsSetsUseCase";
import { GetFlashCardsSetByIdUseCase } from "../application/use-cases/flashcards/GetFlashCardsSetByIdUseCase";
import { DeleteFlashCardsSetUseCase } from "../application/use-cases/flashcards/DeleteFlashCardsSetUseCase";
import { GetFlashCardsSetsByDocumentIdUseCase } from "../application/use-cases/flashcards/GetFlashCardsSetsByDocumentIdUseCase";
import { CreateFlashCardsSetUseCase } from "../application/use-cases/flashcards/CreateFlashCardsSetUseCase";
import { FlashCardsController } from "../interface/controllers/flashcards.controller";
import { GetAllQuizzesUseCase } from "../application/use-cases/quizzes/GetAllquizzesUseCase";
import { GetQuizByIdUseCase } from "../application/use-cases/quizzes/GetQuizByIdUseCase";
import { DeleteQuizByIdUseCase } from "../application/use-cases/quizzes/DeleteQuizByIdUseCase";
import { ExplainTextUseCase } from "../application/use-cases/ai/ExplainTextUseCase";
import { AssistantChatUseCase } from "../application/use-cases/ai/AssistantChatUseCase";
import { AiController } from "../interface/controllers/ai.controller";
import { SettingsRepository } from "../infrastructure/repositories/SettingsRepository";
import { GetUserSettingsUseCase } from "../application/use-cases/settings/GetUserSettingsUseCase";
import { UpdateUserSettingsUseCase } from "../application/use-cases/settings/UpdateUserSettingsUseCase";
import { CountHighlightsByTagUseCase } from "../application/use-cases/highlights/CountHighlightsByTagUseCase";
import { DeleteHighlightsByTagUseCase } from "../application/use-cases/highlights/DeleteHighlightsByTagUseCase";
import { SettingsController } from "../interface/controllers/settings.controller";
import { GenerateSummaryUseCase } from "../application/use-cases/documents/GenerateSummaryUseCase";
import { GetStorageUrlUseCase } from "../application/use-cases/documents/GetStorageUrlUseCase";
import { CreateDocumentUseCase } from "../application/use-cases/documents/CreateDocumentUseCase";
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
    generateSummaryUseCase: asClass(GenerateSummaryUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    streamDocumentUseCase: asClass(StreamDocumentUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
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
    documentRepository: asClass(DocumentRepository, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    googleDriveService: asClass(GoogleDriveService, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    addDocumentFromGoogleDriveUseCase: asClass(
      AddDocumentFromGoogleDriveUseCase,
      {
        lifetime: Lifetime.SCOPED,
        injectionMode: InjectionMode.CLASSIC,
      }
    ),
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
    getDocumentFromGoogleDriveUseCase: asClass(
      GetDocumentFromGoogleDriveUseCase,
      {
        lifetime: Lifetime.SCOPED,
        injectionMode: InjectionMode.CLASSIC,
      }
    ),
    getAllDocumentsUseCase: asClass(GetAllDocumentsUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    getDocumentByIdUseCase: asClass(GetDocumentByIdUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    deleteDocumentUseCase: asClass(DeleteDocumentUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    moveDocumentUseCase: asClass(MoveDocumentUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    renameDocumentUseCase: asClass(RenameDocumentUseCase, {
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
    documentController: asClass(DocumentController, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),

    getDocumentContentUseCase: asClass(GetDocumentContentUseCase, {
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

  // Highlight use cases, repository and controller
  fastify.diContainer.register({
    highlightRepository: asClass(HighlightRepository, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    getAllHighlightsUseCase: asClass(GetAllHighlightsUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    createHighlightUseCase: asClass(CreateHighlightUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    getHighlightByIdUseCase: asClass(GetHighlightByIdUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    updateHighlightUseCase: asClass(UpdateHighlightUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    deleteHighlightUseCase: asClass(DeleteHighlightUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    getHighlightsByDocumentIdUseCase: asClass(
      GetHighlightsByDocumentIdUseCase,
      {
        lifetime: Lifetime.SCOPED,
        injectionMode: InjectionMode.CLASSIC,
      }
    ),
    highlightController: asClass(HighlightController, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    countHighlightsByTagUseCase: asClass(CountHighlightsByTagUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    deleteHighlightsByTagUseCase: asClass(DeleteHighlightsByTagUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
  });

  // document
  fastify.diContainer.register({
    documentProcessingService: asClass(DocumentProcessingService, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    getStorageUrlUseCase: asClass(GetStorageUrlUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    createDocumentUseCase: asClass(CreateDocumentUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
  });

  // chunking
  fastify.diContainer.register({
    chunkingService: asClass(ChunkingService, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
  });

  // embedding
  fastify.diContainer.register({
    semanticSearchService: asClass(SemanticSearchService, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    embedDocumentByIdUseCase: asClass(EmbedDocumentByIdUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    embeddingService: asClass(EmbeddingService, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    ensureExistingOfDocumentEmbeddingUseCase: asClass(
      EnsureExistingOfDocumentEmbeddingUseCase,
      {
        lifetime: Lifetime.SCOPED,
        injectionMode: InjectionMode.CLASSIC,
      }
    ),
    embeddingRepository: asClass(EmbeddingRepository, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
  });
  // generative ai
  fastify.diContainer.register({
    generativeAiService: asClass(GenerativeAiService, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
  });

  // Quiz
  fastify.diContainer.register({
    quizController: asClass(QuizController, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    quizRepository: asClass(QuizRepository, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    flashCardsSetRepository: asClass(FlashCardsSetRepository, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    createQuizUseCase: asClass(CreateGeneralQuizUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    createUserPromptQuizUseCase: asClass(CreateUserPromptQuizUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    generateGeneralFlashCardsUseCase: asClass(
      GenerateGeneralFlashCardsUseCase,
      {
        lifetime: Lifetime.SCOPED,
        injectionMode: InjectionMode.CLASSIC,
      }
    ),
    getAllFlashCardsSetsUseCase: asClass(GetAllFlashCardsSetsUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    getFlashCardsSetByIdUseCase: asClass(GetFlashCardsSetByIdUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    deleteFlashCardsSetUseCase: asClass(DeleteFlashCardsSetUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    getFlashCardsSetsByDocumentIdUseCase: asClass(
      GetFlashCardsSetsByDocumentIdUseCase,
      {
        lifetime: Lifetime.SCOPED,
        injectionMode: InjectionMode.CLASSIC,
      }
    ),
    createFlashCardsSetUseCase: asClass(CreateFlashCardsSetUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    flashCardsController: asClass(FlashCardsController, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    getAllQuizzesUseCase: asClass(GetAllQuizzesUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    getQuizByIdUseCase: asClass(GetQuizByIdUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    deleteQuizByIdUseCase: asClass(DeleteQuizByIdUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
  });

  fastify.diContainer.register({
    explainTextUseCase: asClass(ExplainTextUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    assistantChatUseCase: asClass(AssistantChatUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    aiController: asClass(AiController, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
  });
  //settings
  fastify.diContainer.register({
    settingsController: asClass(SettingsController, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    getUserSettingsUseCase: asClass(GetUserSettingsUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    updateUserSettingsUseCase: asClass(UpdateUserSettingsUseCase, {
      lifetime: Lifetime.SCOPED,
      injectionMode: InjectionMode.CLASSIC,
    }),
    settingsRepository: asClass(SettingsRepository, {
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
