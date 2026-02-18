import { FastifyRequest, FastifyReply } from "fastify";
import { GetAllHighlightsUseCase } from "../../application/use-cases/highlights/GetAllHighlightsUseCase";
import { CreateHighlightUseCase } from "../../application/use-cases/highlights/CreateHighlightUseCase";
import { GetHighlightByIdUseCase } from "../../application/use-cases/highlights/GetHighlightByIdUseCase";
import { UpdateHighlightUseCase } from "../../application/use-cases/highlights/UpdateHighlightUseCase";
import { DeleteHighlightUseCase } from "../../application/use-cases/highlights/DeleteHighlightUseCase";
import {
  CreateHighlightDTO,
  UpdateHighlightDTO,
  HighlightIdParams,
  GetHighlightsQuery,
  HighlightDocumentIdParams,
} from "../../shared/validation/highlightSchemas";

import { FastifyBaseLogger } from "fastify";
import { GetHighlightsByDocumentIdUseCase } from "../../application/use-cases/highlights/GetHighlightsByDocumentIdUseCase";
import { ResponseFormatter } from "../../shared/utils/ResponseFormatter";

import { CountHighlightsByTagUseCase } from "../../application/use-cases/highlights/CountHighlightsByTagUseCase";
import { DeleteHighlightsByTagUseCase } from "../../application/use-cases/highlights/DeleteHighlightsByTagUseCase";
import { HighlightsMapper } from "../../shared/mappers/HighlightsMapper";

export class HighlightController {
  constructor(
    private createHighlightUseCase: CreateHighlightUseCase,
    private getHighlightByIdUseCase: GetHighlightByIdUseCase,
    private updateHighlightUseCase: UpdateHighlightUseCase,
    private deleteHighlightUseCase: DeleteHighlightUseCase,
    private logger: FastifyBaseLogger,
    private getHighlightsByDocumentIdUseCase: GetHighlightsByDocumentIdUseCase,
    private countHighlightsByTagUseCase: CountHighlightsByTagUseCase,
    private deleteHighlightsByTagUseCase: DeleteHighlightsByTagUseCase,
  ) {}

  /**
   * GET /api/v1/highlights/:documentId - List user's highlights by document ID
   */
  async getHighlightsByDocumentId(
    request: FastifyRequest<{ Querystring: HighlightDocumentIdParams }>,
    reply: FastifyReply,
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      this.logger.warn("Unauthorized access attempt to fetch highlights");
      reply.status(401).send({
        success: false,
        message: "Unauthorized",
        data: null,
        error: "User must be authenticated",
      });
      return;
    }
    const documentId = request.query.documentId;
    const highlights =
      await this.getHighlightsByDocumentIdUseCase.execute(documentId);

    ResponseFormatter.success(
      reply,
      highlights,
      "Highlights retrieved successfully",
      200,
    );
  }

  /**
   * POST /api/v1/highlights - Create a new highlight
   */
  async createHighlight(
    request: FastifyRequest<{ Body: CreateHighlightDTO }>,
    reply: FastifyReply,
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      this.logger.warn("Unauthorized access attempt to create highlight");
      reply.status(401).send({
        success: false,
        message: "Unauthorized",
        data: null,
        error: "User must be authenticated",
      });
      return;
    }

    const highlight = await this.createHighlightUseCase.execute({
      id: request.body.id,
      userId,
      documentId: request.body.documentId,
      type: request.body.type,
      content: request.body.content,
      position: request.body.position,
      color: request.body.color,
      hasNote: request.body.hasNote,
      noteId: request.body.noteId,
      noteContent: request.body.noteContent,
      tags: request.body.tags,
      style: request.body.style as any,
    });

    return ResponseFormatter.success(
      reply,
      HighlightsMapper.fromDomainToInterface(highlight),
      "Highlight created successfully",
      201,
    );
  }

  /**
   * GET /api/v1/highlights/:id - Get a specific highlight by ID
   */
  async getHighlightById(
    request: FastifyRequest<{ Params: HighlightIdParams }>,
    reply: FastifyReply,
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      this.logger.warn("Unauthorized access attempt to fetch highlight");
      reply.status(401).send({
        success: false,
        message: "Unauthorized",
        data: null,
        error: "User must be authenticated",
      });
      return;
    }

    const highlight = await this.getHighlightByIdUseCase.execute({
      userId,
      highlightId: request.params.id,
    });

    return ResponseFormatter.success(
      reply,
      HighlightsMapper.fromDomainToInterface(highlight as any), // Cast if needed, or update UseCase
      "Highlight retrieved successfully",
      200,
    );
  }

  /**
   * PATCH /api/v1/highlights/:id - Update a highlight
   */
  async updateHighlight(
    request: FastifyRequest<{
      Params: HighlightIdParams;
      Body: UpdateHighlightDTO;
    }>,
    reply: FastifyReply,
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      this.logger.warn("Unauthorized access attempt to update highlight");
      reply.status(401).send({
        success: false,
        message: "Unauthorized",
        data: null,
        error: "User must be authenticated",
      });
      return;
    }

    const highlight = await this.updateHighlightUseCase.execute({
      userId,
      highlightId: request.params.id,
      color: request.body.color,
      content: request.body.content,
      hasNote: request.body.hasNote,
      noteId: request.body.noteId,
      noteContent: request.body.noteContent,
      position: request.body.position,
      type: request.body.type,
      documentId: request.body.documentId,
      tags: request.body.tags,
      style: request.body.style as any,
    });

    return ResponseFormatter.success(
      reply,
      HighlightsMapper.fromDomainToInterface(highlight),
      "Highlight updated successfully",
      200,
    );
  }

  /**
   * DELETE /api/v1/highlights/:id - Delete a highlight
   */
  async deleteHighlight(
    request: FastifyRequest<{ Params: HighlightIdParams }>,
    reply: FastifyReply,
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      this.logger.warn("Unauthorized access attempt to delete highlight");
      reply.status(401).send({
        success: false,
        message: "Unauthorized",
        data: null,
        error: "User must be authenticated",
      });
      return;
    }

    await this.deleteHighlightUseCase.execute({
      userId,
      highlightId: request.params.id,
    });

    return ResponseFormatter.success(
      reply,
      null,
      "Highlight deleted successfully",
      200,
    );
  }

  /**
   * GET /api/v1/highlights/tags/:tagName/count - Count highlights by tag
   */
  async countHighlightsByTag(
    request: FastifyRequest<{ Params: { tagName: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      reply.status(401).send({ success: false, message: "Unauthorized" });
      return;
    }

    const { tagName } = request.params;
    const count = await this.countHighlightsByTagUseCase.execute(
      userId,
      tagName,
    );

    ResponseFormatter.success(reply, { count }, "Usage count retrieved", 200);
  }

  /**
   * DELETE /api/v1/highlights/tags/:tagName - Delete highlights by tag
   */
  async deleteHighlightsByTag(
    request: FastifyRequest<{ Params: { tagName: string } }>,
    reply: FastifyReply,
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      reply.status(401).send({ success: false, message: "Unauthorized" });
      return;
    }

    const { tagName } = request.params;
    await this.deleteHighlightsByTagUseCase.execute(userId, tagName);

    ResponseFormatter.success(reply, null, "Highlights with tag deleted", 200);
  }
}
