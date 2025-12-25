import { FastifyReply, FastifyRequest } from "fastify";
import { ExplainTextUseCase } from "../../application/use-cases/ai/ExplainTextUseCase";
import { AssistantChatUseCase } from "../../application/use-cases/ai/AssistantChatUseCase";
import {
  ExplainTextDTO,
  ExplainTextResponse,
  AssistantDTO,
  AssistantResponse,
} from "@vollio/shared";
import { ResponseFormatter } from "../../shared/utils/ResponseFormatter";

export class AiController {
  constructor(
    private explainTextUseCase: ExplainTextUseCase,
    private assistantChatUseCase: AssistantChatUseCase
  ) {}

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

  async assistantChat(
    request: FastifyRequest<{ Body: AssistantDTO }>,
    reply: FastifyReply
  ): Promise<void> {
    const data = request.body;
    const result = await this.assistantChatUseCase.execute(data);

    ResponseFormatter.success<AssistantResponse["data"]>(
      reply,
      result,
      "Assistant response generated successfully"
    );
  }
}
