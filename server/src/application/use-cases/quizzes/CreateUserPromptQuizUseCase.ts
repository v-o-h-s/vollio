import { CreateQuizDTO } from "../../../shared/validation/quizSchemas";
import { CreateQuizResponse } from "../../../shared/types/responses/quizRoutes";
import { ServerError } from "../../../shared/errors/ServerError";

export class CreateUserPromptQuizUseCase {
  constructor() {}

  async execute(data: CreateQuizDTO): Promise<CreateQuizResponse> {
    throw new ServerError("Method not implemented");
  }
}
