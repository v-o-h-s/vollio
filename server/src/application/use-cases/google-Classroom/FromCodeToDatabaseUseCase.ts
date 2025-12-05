import { IGoogleClassroomService } from "../../../domain/services/IGoogleClassroomService";
import { IUserGoogleClassroomRepository } from "../../../domain/repositories/IUserGoogleClassroomRepository";
import { ServerError } from "../../../shared/errors/ServerError";

export class FromCodeToDatabaseUseCase {
  constructor(
    private googleClassroomService: IGoogleClassroomService,
    private userGoogleClassroomRepository: IUserGoogleClassroomRepository
  ) {}

  async execute(code: string) {
    const tokens = await this.googleClassroomService.exchangeCodeForTokens(
      code
    );
    if (!tokens) throw new ServerError("Failed to exchange code for tokens");
    await this.userGoogleClassroomRepository.saveTokens(tokens);
  }
}
