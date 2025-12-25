import { FastifyReply, FastifyRequest } from "fastify";
import { ExplainTextUseCase } from "../../application/use-cases/ai/ExplainTextUseCase";
import { ExplainTextDTO, ExplainTextResponse } from "@vollio/shared";
import { ResponseFormatter } from "../../shared/utils/ResponseFormatter";

export class AiController {
  constructor(private explainTextUseCase: ExplainTextUseCase) {}

  async explainText(
    request: FastifyRequest<{ Body: ExplainTextDTO }>,
    reply: FastifyReply
  ): Promise<void> {
    const data = request.body;
    const result = await this.explainTextUseCase.execute(data);

    ResponseFormatter.success<ExplainTextResponse["data"]>(
      reply,
      result,
      "Explanation generated successfully"
    );
  }
}
