import { FastifyReply, FastifyRequest } from "fastify";
import { GoogleCallbackQuery } from "../../shared/validation/googleClassroomSchemas";
import { GoogleClassroomService } from "../../infrastructure/services/GoogleClassroomService";
import { FromCodeToDatabaseUseCase } from "../../application/use-cases/google-Classroom/FromCodeToDatabaseUseCase";

export class GoogleClassroomController {
  private googleClassroomService: GoogleClassroomService;
  private fromCodeToDatabaseUseCase: FromCodeToDatabaseUseCase;
  constructor(
    googleClassroomService: GoogleClassroomService,
    fromCodeToDatabaseUseCase: FromCodeToDatabaseUseCase
  ) {
    this.googleClassroomService = googleClassroomService;
    this.fromCodeToDatabaseUseCase = fromCodeToDatabaseUseCase;
  }

  async connect(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      reply.status(401).send({
        success: false,
        message: "User not authenticated",
        data: null,
        error: "Unauthorized",
      });
      return;
    }

    // Generate OAuth URL with state parameter
    const { url, state } = this.googleClassroomService.getOAuthUrl();

    // Store state in session for CSRF verification
    request.session.oauthState = state;

    reply.redirect(url);
  }

  async callback(
    request: FastifyRequest<{ Querystring: GoogleCallbackQuery }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      reply.status(401).send({
        success: false,
        message: "User not authenticated",
        data: null,
        error: "Unauthorized",
      });
      return;
    }

    const { code, state } = request.query;

    // Verify state parameter to prevent CSRF attacks
    const storedState = request.session.oauthState;

    if (!state || !storedState || state !== storedState) {
      reply.status(400).send({
        success: false,
        message: "Invalid state parameter - possible CSRF attack detected",
        data: null,
        error: "CSRF validation failed",
      });
      return;
    }

    // Clear the state after successful verification
    delete request.session.oauthState;

    // Exchange code for tokens and save to database
    await this.fromCodeToDatabaseUseCase.execute(code);

    reply.status(200).send({
      success: true,
      message: "Connected to Google Classroom successfully",
      data: null,
      error: null,
    });
  }
}
