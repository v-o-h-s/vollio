import { FastifyReply, FastifyRequest } from "fastify";
import { CreateSummaryUseCase } from "../../application/use-cases/summaries/CreateSummaryUseCase";
import { DeleteSummaryUseCase } from "../../application/use-cases/summaries/DeleteSummaryUseCase";
import { GetSummariesByDocumentIdUseCase } from "../../application/use-cases/summaries/GetSummariesByDocumentIdUseCase";
import { UpdateSummaryUseCase } from "../../application/use-cases/summaries/UpdateSummaryUseCase";
import {
  CreateSummaryDTO,
  DeleteSummaryDTO,
  GetSummaryByDocumentIdDTO,
  GetSummaryByIdDTO,
  UpdateSummaryDTO,
} from "../../shared/validation/summarySchema";
import { ResponseFormatter } from "../../shared/utils/ResponseFormatter";
import { GetSummaryByIdUseCase } from "../../application/use-cases/summaries/GetSummaryByIdUseCase";
import { SummarizeDocumentUseCase } from "../../application/use-cases/summaries/SummarizeDocumentUseCase";
import { GenerateSummaryDTO, CreateQuizDTO } from "@vollio/shared";
import { QuizController } from "../controllers/quiz.controller";

export class SummaryController {
  constructor(
    private createSummaryUseCase: CreateSummaryUseCase,
    private updateSummaryUseCase: UpdateSummaryUseCase,
    private deleteSummaryUseCase: DeleteSummaryUseCase,
    private getSummariesByDocumentIdUseCase: GetSummariesByDocumentIdUseCase,
    private getSummaryByIdUseCase: GetSummaryByIdUseCase,
    private summarizeDocumentUseCase: SummarizeDocumentUseCase,
    private quizController: QuizController
  ) {}

  async createQuiz(
    request: FastifyRequest<{ Body: CreateQuizDTO }>,
    reply: FastifyReply
  ): Promise<void> {
    return this.quizController.createQuiz(request, reply);
  }

  async createSummary(
    request: FastifyRequest<{ Body: CreateSummaryDTO }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      reply.status(401).send({ error: "Unauthorized" });
      return;
    }
    const createdSummary = await this.createSummaryUseCase.execute({
      ...request.body,
    });
    ResponseFormatter.success(
      reply,
      createdSummary,
      "Summary created successfully",
      201
    );
  }

  async generateSummary(
    request: FastifyRequest<{ Body: GenerateSummaryDTO }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      reply.status(401).send({ error: "Unauthorized" });
      return;
    }
    const result = await this.summarizeDocumentUseCase.execute({
      ...request.body,
    });

    ResponseFormatter.success(reply, result, "Summary generated successfully");
  }

  async updateSummary(
    request: FastifyRequest<{ Body: UpdateSummaryDTO }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      reply.status(401).send({ error: "Unauthorized" });
      return;
    }
    const updatedSummary = await this.updateSummaryUseCase.execute({
      ...request.body,
    });
    ResponseFormatter.success(
      reply,
      updatedSummary,
      "Summary updated successfully"
    );
  }

  async deleteSummary(
    request: FastifyRequest<{ Body: DeleteSummaryDTO }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      reply.status(401).send({ error: "Unauthorized" });
      return;
    }
    await this.deleteSummaryUseCase.execute({
      ...request.body,
    });
    ResponseFormatter.success(reply, null, "Summary deleted successfully");
  }

  async getSummariesByDocumentId(
    request: FastifyRequest<{ Querystring: GetSummaryByDocumentIdDTO }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      reply.status(401).send({ error: "Unauthorized" });
      return;
    }
    const summaries = await this.getSummariesByDocumentIdUseCase.execute(
      request.query.documentId
    );
    ResponseFormatter.success(
      reply,
      summaries,
      "Summaries retrieved successfully"
    );
  }

  async getSummaryById(
    request: FastifyRequest<{ Params: GetSummaryByIdDTO }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      reply.status(401).send({ error: "Unauthorized" });
      return;
    }
    const summary = await this.getSummaryByIdUseCase.execute(request.params.id);
    ResponseFormatter.success(reply, summary, "Summary retrieved successfully");
  }
}
