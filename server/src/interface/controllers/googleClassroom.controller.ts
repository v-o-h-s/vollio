import { FastifyReply, FastifyRequest } from "fastify";
import { GoogleCallbackQuery } from "../../shared/validation/googleClassroomSchemas";

import { FromCodeToDatabaseUseCase } from "../../application/use-cases/google-Classroom/FromCodeToDatabaseUseCase";
import { CheckTokenStatusUseCase } from "../../application/use-cases/google-Classroom/CheckTokenStatusUseCase";
import { RefreshTokenAndUpdateTheDatabaseUseCase } from "../../application/use-cases/google-Classroom/RefreshTokenAndUpdateTheDatabaseUseCase";
import { DisconnectGoogleClassroomUseCase } from "../../application/use-cases/google-Classroom/DisconnectGoogleClassroomUseCase";
import { GetCoursesUseCase } from "../../application/use-cases/google-Classroom/GetCoursesUseCase";
import { IsConnectedToGoogleClassroomUseCase } from "../../application/use-cases/google-Classroom/IsConnectedToGoogleClassroomUseCase";
import { GetCourseContentUseCase } from "../../application/use-cases/google-Classroom/GetCourseContentUseCase";
import { AddDocumentFromGoogleDriveUseCase } from "../../application/use-cases/documents/AddDocumentFromGoogleDriveUseCase";
import {
  ConnectCallbackResponse,
  RefreshAccessTokenResponse,
  CheckTokenStatusResponse,
  DisconnectResponse,
  GetConnectionStatusResponse,
  GetCoursesResponse,
  GetCoursesWithContentResponse,
  GetCourseContentResponse,
} from "@vollio/shared";
import "dotenv/config";
import { IGoogleClassroomService } from "../../domain/services/IGoogleClassroomService";
import { ResponseFormatter } from "../../shared/utils/ResponseFormatter";
import { UnauthorizedErrorObject } from "../../shared/types/error";
export class GoogleClassroomController {
  private googleClassroomService: IGoogleClassroomService;
  private fromCodeToDatabaseUseCase: FromCodeToDatabaseUseCase;
  private checkTokenStatusUseCase: CheckTokenStatusUseCase;
  private refreshTokenUseCase: RefreshTokenAndUpdateTheDatabaseUseCase;
  private disconnectUseCase: DisconnectGoogleClassroomUseCase;
  private getCoursesUseCase: GetCoursesUseCase;
  private isConnectedUseCase: IsConnectedToGoogleClassroomUseCase;
  private getCourseContentUseCase: GetCourseContentUseCase;
  private addDocumentFromGoogleDriveUseCase: AddDocumentFromGoogleDriveUseCase;

  constructor(
    googleClassroomService: IGoogleClassroomService,
    fromCodeToDatabaseUseCase: FromCodeToDatabaseUseCase,
    checkTokenStatusUseCase: CheckTokenStatusUseCase,
    refreshTokenUseCase: RefreshTokenAndUpdateTheDatabaseUseCase,
    disconnectUseCase: DisconnectGoogleClassroomUseCase,
    getCoursesUseCase: GetCoursesUseCase,
    isConnectedUseCase: IsConnectedToGoogleClassroomUseCase,
    getCourseContentUseCase: GetCourseContentUseCase,
    addDocumentFromGoogleDriveUseCase: AddDocumentFromGoogleDriveUseCase,
  ) {
    this.googleClassroomService = googleClassroomService;
    this.fromCodeToDatabaseUseCase = fromCodeToDatabaseUseCase;
    this.checkTokenStatusUseCase = checkTokenStatusUseCase;
    this.refreshTokenUseCase = refreshTokenUseCase;
    this.disconnectUseCase = disconnectUseCase;
    this.getCoursesUseCase = getCoursesUseCase;
    this.isConnectedUseCase = isConnectedUseCase;
    this.getCourseContentUseCase = getCourseContentUseCase;
    this.addDocumentFromGoogleDriveUseCase = addDocumentFromGoogleDriveUseCase;
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
    reply: FastifyReply,
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
    // we use state to check that this code is really sent by same url we set up earlier

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

    // Redirect back to client after successful connect
    reply.redirect(
      `${process.env.NODE_ENV === "development" ? "http://localhost:3001" : process.env.CLIENT_BASE_URL}`,
    );
  }

  async refreshAccessToken(
    request: FastifyRequest,
    reply: FastifyReply,
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      return ResponseFormatter.error(reply, UnauthorizedErrorObject, 401);
    }
    await this.refreshTokenUseCase.execute();

    ResponseFormatter.success<RefreshAccessTokenResponse["data"]>(
      reply,
      null,
      "Access token refreshed successfully",
    );
  }

  async checkTokenStatus(
    request: FastifyRequest,
    reply: FastifyReply,
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

    const isValid = await this.checkTokenStatusUseCase.execute();

    ResponseFormatter.success<CheckTokenStatusResponse["data"]>(
      reply,
      { isValid: isValid },
      "Token status retrieved successfully",
    );
  }

  async disconnect(
    request: FastifyRequest,
    reply: FastifyReply,
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

    await this.disconnectUseCase.execute();

    ResponseFormatter.success<DisconnectResponse["data"]>(
      reply,
      null,
      "Disconnected from Google Classroom successfully",
    );
  }

  async getConnectionStatus(
    request: FastifyRequest,
    reply: FastifyReply,
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

    const isConnected = await this.isConnectedUseCase.execute();
    ResponseFormatter.success<GetConnectionStatusResponse["data"]>(
      reply,
      { isConnected },
      "Connection status retrieved successfully",
    );
  }

  async getCourses(request: FastifyRequest, reply: FastifyReply): Promise<any> {
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

    const courses = await this.getCoursesUseCase.execute();
    ResponseFormatter.success<GetCoursesResponse["data"]>(
      reply,
      courses,
      "Courses retrieved successfully",
    );
  }
  async getCourseContent(
    request: FastifyRequest<{ Params: { courseId: string } }>,
    reply: FastifyReply,
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

    const { courseId } = request.params;

    const content = await this.getCourseContentUseCase.execute(courseId);
    ResponseFormatter.success<GetCourseContentResponse["data"]>(
      reply,
      content,
      "Course content retrieved successfully",
    );
  }
}
