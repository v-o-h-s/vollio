import { CreateQuizDTO } from "../../../shared/validation/quizSchemas";
import { CreateQuizResponse } from "../../../shared/types/responses/quizRoutes";
import { ServerError } from "../../../shared/errors/ServerError";
import { FastifyBaseLogger } from "fastify";

export class CreateUserPromptQuizUseCase {
  constructor(private logger: FastifyBaseLogger) {}

  async execute(data: CreateQuizDTO): Promise<CreateQuizResponse> {
    this.logger.info(
      { documentId: data.documentId },
      "Executing CreateUserPromptQuizUseCase"
    );
    throw new ServerError("Method not implemented");
  }
}
