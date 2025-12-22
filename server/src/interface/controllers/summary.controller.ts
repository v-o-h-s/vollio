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

export class SummaryController {
  constructor(
    private createSummaryUseCase: CreateSummaryUseCase,
    private updateSummaryUseCase: UpdateSummaryUseCase,
    private deleteSummaryUseCase: DeleteSummaryUseCase,
    private getSummariesByDocumentIdUseCase: GetSummariesByDocumentIdUseCase,
    private getSummaryByIdUseCase: GetSummaryByIdUseCase
  ) {}
  async createSummary(
    request: FastifyRequest<{ Body: CreateSummaryDTO }>,
    reply: FastifyReply
  ): Promise<void> {
    const data = request.body;
    const createdSummary = await this.createSummaryUseCase.execute({
      ...data,
    });
    ResponseFormatter.success(
      reply,
      createdSummary,
      "Summary created successfully"
    );
  }
  async updateSummary(
    request: FastifyRequest<{ Body: UpdateSummaryDTO }>,
    reply: FastifyReply
  ): Promise<void> {
    const data = request.body;
    const updatedSummary = await this.updateSummaryUseCase.execute({
      ...data,
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
    const data = request.body;
    await this.deleteSummaryUseCase.execute({
      ...data,
    });
    ResponseFormatter.success(reply, null, "Summary deleted successfully");
  }
  async getSummariesByDocumentId(
    request: FastifyRequest<{ Querystring: GetSummaryByDocumentIdDTO }>,
    reply: FastifyReply
  ): Promise<void> {
    const data = request.query;
    const summaries = await this.getSummariesByDocumentIdUseCase.execute(
      data.documentId
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
    const data = request.params;
    const summary = await this.getSummaryByIdUseCase.execute(data.id);
    ResponseFormatter.success(reply, summary, "Summary retrieved successfully");
  }
}
