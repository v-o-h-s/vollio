import "@fastify/cookie";
import "@fastify/session";
import { AwilixContainer } from "awilix";
import { SupabaseClient } from "@supabase/supabase-js";
import { NoteController } from "../../interface/controllers/note.controller";
import { DocumentController } from "../../interface/controllers/document.controller";
import { testController } from "../../interface/controllers/test.controller";
import { QuizController } from "../../interface/controllers/quiz.controller";
import { SummaryController } from "../../interface/controllers/summary.controller";
import { SettingsController } from "../../interface/controllers/settings.controller";
import { RateLimitingService } from "../../infrastructure/services/RateLimitingService";

import { AssistantController } from "../../interface/controllers/assistant.controller";
import { FolderController } from "../../interface/controllers/folder.controller";
import { HighlightController } from "../../interface/controllers/highlight.controller";
import { FlashCardsController } from "../../interface/controllers/flashcards.controller";
import { GoogleClassroomController } from "../../interface/controllers/googleClassroom.controller";
import { AiQuotaService } from "../../infrastructure/services/AiQuotaService";
import { FastifyBaseLogger } from "fastify";
import Redis from "ioredis";

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
  documentController: DocumentController;
  supabaseClient: SupabaseClient;
  noteController: NoteController;
  googleClassroomController: GoogleClassroomController;
  settingsController: SettingsController;
  testController: testController;
  quizController: QuizController;
  summaryController: SummaryController;
  assistantController: AssistantController;
  folderController: FolderController;
  highlightController: HighlightController;
  flashCardsController: FlashCardsController;
  rateLimitingService: RateLimitingService;
  aiQuotaService: AiQuotaService;
  logger: FastifyBaseLogger;

  redis: Redis;
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

  export interface RateLimitConfig {
    cost?: number;
  }

  interface FastifyContextConfig {
    rateLimit?: {
      request?: RateLimitConfig;
      ai?: RateLimitConfig;
      upload?: RateLimitConfig;
    };
  }
}
