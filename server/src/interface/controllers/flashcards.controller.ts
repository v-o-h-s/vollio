import { FastifyReply, FastifyRequest } from "fastify";
import {
  CreateFlashCardsDTO,
  FlashCardsSetIdParams,
} from "../../shared/validation/flashcardSchemas";
import { CreateFlashCardsSetResponse } from "../../shared/types/responses/flashcardsRoutes";
import { ResponseFormatter } from "../../shared/utils/ResponseFormatter";
import { GenerateGeneralFlashCardsUseCase } from "../../application/use-cases/flashcards/GenerateGeneralFlashCardsUseCase";
import { GetAllFlashCardsSetsUseCase } from "../../application/use-cases/flashcards/GetAllFlashCardsSetsUseCase";
import { GetFlashCardsSetByIdUseCase } from "../../application/use-cases/flashcards/GetFlashCardsSetByIdUseCase";
import { DeleteFlashCardsSetUseCase } from "../../application/use-cases/flashcards/DeleteFlashCardsSetUseCase";
import { GetFlashCardsSetsByDocumentIdUseCase } from "../../application/use-cases/flashcards/GetFlashCardsSetsByDocumentIdUseCase";
import { UnauthorizedErrorObject } from "../../shared/types/error";

export class FlashCardsController {
  constructor(
    private generateGeneralFlashCardsUseCase: GenerateGeneralFlashCardsUseCase,
    private getAllFlashCardsSetsUseCase: GetAllFlashCardsSetsUseCase,
    private getFlashCardsSetByIdUseCase: GetFlashCardsSetByIdUseCase,
    private deleteFlashCardsSetUseCase: DeleteFlashCardsSetUseCase,
    private getFlashCardsSetsByDocumentIdUseCase: GetFlashCardsSetsByDocumentIdUseCase
  ) {}

  async generateFlashCardsSet(
    request: FastifyRequest<{ Body: CreateFlashCardsDTO }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      return ResponseFormatter.error(
        reply,
        UnauthorizedErrorObject,
        401,
        "Unauthorized"
      );
    }

    const response = await this.generateGeneralFlashCardsUseCase.execute(
      request.body
    );
    return ResponseFormatter.success(
      reply,
      response,
      "Flashcard set generated successfully"
    );
  }

  async getAllFlashCardsSets(
    request: FastifyRequest,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      return ResponseFormatter.error(
        reply,
        UnauthorizedErrorObject,
        401,
        "Unauthorized"
      );
    }

    const sets = await this.getAllFlashCardsSetsUseCase.execute();
    return ResponseFormatter.success(
      reply,
      sets.map((s) => s.toJSON()),
      "Flashcard sets retrieved successfully"
    );
  }

  async getFlashCardsSetById(
    request: FastifyRequest<{ Params: FlashCardsSetIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      return ResponseFormatter.error(
        reply,
        UnauthorizedErrorObject,
        401,
        "Unauthorized"
      );
    }

    const set = await this.getFlashCardsSetByIdUseCase.execute(
      request.params.id
    );
    return ResponseFormatter.success(
      reply,
      set.toJSON(),
      "Flashcard set retrieved successfully"
    );
  }

  async getFlashCardsSetsByDocumentId(
    request: FastifyRequest<{ Params: { documentId: string } }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      return ResponseFormatter.error(
        reply,
        UnauthorizedErrorObject,
        401,
        "Unauthorized"
      );
    }

    const sets = await this.getFlashCardsSetsByDocumentIdUseCase.execute(
      request.params.documentId
    );
    return ResponseFormatter.success(
      reply,
      sets.map((s) => s.toJSON()),
      "Flashcard sets retrieved successfully"
    );
  }

  async deleteFlashCardsSet(
    request: FastifyRequest<{ Params: FlashCardsSetIdParams }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      return ResponseFormatter.error(
        reply,
        UnauthorizedErrorObject,
        401,
        "Unauthorized"
      );
    }

    await this.deleteFlashCardsSetUseCase.execute(request.params.id);
    return ResponseFormatter.success(
      reply,
      null,
      "Flashcard set deleted successfully"
    );
  }
}
