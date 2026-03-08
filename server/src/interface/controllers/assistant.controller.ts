import { FastifyReply, FastifyRequest } from "fastify";
import { AssistantChatUseCase } from "../../application/use-cases/ai/AssistantChatUseCase";
import { AssistantDTO, AssistantResponse } from "../../shared";
import { ResponseFormatter } from "../../shared/utils/ResponseFormatter";

export class AssistantController {
  constructor(private assistantChatUseCase: AssistantChatUseCase) {}

  async assistantChat(
    request: FastifyRequest<{ Body: AssistantDTO }>,
    reply: FastifyReply,
  ): Promise<void> {
    const data = request.body;
    const result = await this.assistantChatUseCase.execute(
      data,
      request.user!.id,
    );

    ResponseFormatter.success<AssistantResponse["data"]>(
      reply,
      result,
      "Assistant response generated successfully",
    );
  }
}
