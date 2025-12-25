import { FastifyReply, FastifyRequest } from "fastify";
import { GoogleCallbackQuery } from "../../shared/validation/googleClassroomSchemas";
import { GoogleClassroomService } from "../../infrastructure/services/GoogleClassroomService";
import { FromCodeToDatabaseUseCase } from "../../application/use-cases/google-Classroom/FromCodeToDatabaseUseCase";
import { CheckTokenStatusUseCase } from "../../application/use-cases/google-Classroom/CheckTokenStatusUseCase";
import { RefreshTokenAndUpdateTheDatabaseUseCase } from "../../application/use-cases/google-Classroom/RefreshTokenAndUpdateTheDatabaseUseCase";
import { DisconnectGoogleClassroomUseCase } from "../../application/use-cases/google-Classroom/DisconnectGoogleClassroomUseCase";
import { GetCoursesUseCase } from "../../application/use-cases/google-Classroom/GetCoursesUseCase";
import { IsConnectedToGoogleClassroomUseCase } from "../../application/use-cases/google-Classroom/IsConnectedToGoogleClassroomUseCase";
import { GetCourseContentUseCase } from "../../application/use-cases/google-Classroom/GetCourseContentUseCase";
import { GetCoursesWithContentUseCase } from "../../application/use-cases/google-Classroom/GetCoursesWithContentUseCase";
import { ClassroomAnnouncementResponse } from "../../shared/types/lms/classroom";
import { AddFileFromGoogleDriveUseCase } from "../../application/use-cases/files/AddFileFromGoogleDriveUseCase";
import {
  ConnectCallbackResponse,
  RefreshAccessTokenResponse,
  CheckTokenStatusResponse,
  DisconnectResponse,
  GetConnectionStatusResponse,
  GetCoursesResponse,
  GetCoursesWithContentResponse,
  GetCourseContentResponse,
} from '@vollio/shared';
import "dotenv/config"
export class GoogleClassroomController {
  private googleClassroomService: GoogleClassroomService;
  private fromCodeToDatabaseUseCase: FromCodeToDatabaseUseCase;
  private checkTokenStatusUseCase: CheckTokenStatusUseCase;
  private refreshTokenUseCase: RefreshTokenAndUpdateTheDatabaseUseCase;
  private disconnectUseCase: DisconnectGoogleClassroomUseCase;
  private getCoursesUseCase: GetCoursesUseCase;
  private isConnectedUseCase: IsConnectedToGoogleClassroomUseCase;
  private getCourseContentUseCase: GetCourseContentUseCase;
  private addFileFromGoogleDriveUseCase: AddFileFromGoogleDriveUseCase;

  constructor(
    googleClassroomService: GoogleClassroomService,
    fromCodeToDatabaseUseCase: FromCodeToDatabaseUseCase,
    checkTokenStatusUseCase: CheckTokenStatusUseCase,
    refreshTokenUseCase: RefreshTokenAndUpdateTheDatabaseUseCase,
    disconnectUseCase: DisconnectGoogleClassroomUseCase,
    getCoursesUseCase: GetCoursesUseCase,
    isConnectedUseCase: IsConnectedToGoogleClassroomUseCase,
    getCourseContentUseCase: GetCourseContentUseCase,
    addFileFromGoogleDriveUseCase: AddFileFromGoogleDriveUseCase
  ) {
    this.googleClassroomService = googleClassroomService;
    this.fromCodeToDatabaseUseCase = fromCodeToDatabaseUseCase;
    this.checkTokenStatusUseCase = checkTokenStatusUseCase;
    this.refreshTokenUseCase = refreshTokenUseCase;
    this.disconnectUseCase = disconnectUseCase;
    this.getCoursesUseCase = getCoursesUseCase;
    this.isConnectedUseCase = isConnectedUseCase;
    this.getCourseContentUseCase = getCourseContentUseCase;
    this.addFileFromGoogleDriveUseCase = addFileFromGoogleDriveUseCase;
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

    // Redirect back to client after successful connect
    reply.redirect(`${process.env.FRONTEND_URL}/dashboard/pdfs`);
  }

  async refreshAccessToken(
    request: FastifyRequest,
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
    await this.refreshTokenUseCase.execute();

    reply.status(200).send({
      success: true,
      message: "Access token refreshed successfully",
      data: null,
      error: null,
    } satisfies RefreshAccessTokenResponse);
  }

  async checkTokenStatus(
    request: FastifyRequest,
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

    const isValid = await this.checkTokenStatusUseCase.execute();

    reply.status(200).send({
      success: true,
      message: "Token status retrieved successfully",
      data: { isValid: isValid },
      error: null,
    } satisfies CheckTokenStatusResponse);
  }

  async disconnect(
    request: FastifyRequest,
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

    await this.disconnectUseCase.execute();

    reply.status(200).send({
      success: true,
      message: "Disconnected from Google Classroom successfully",
      data: null,
      error: null,
    } satisfies DisconnectResponse);
  }

  async getConnectionStatus(
    request: FastifyRequest,
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

    const isConnected = await this.isConnectedUseCase.execute();
    reply.status(200).send({
      success: true,
      message: "Connection status retrieved successfully",
      data: { isConnected },
      error: null,
    } satisfies GetConnectionStatusResponse);
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
    reply.status(200).send({
      success: true,
      message: "Courses retrieved successfully",
      data: courses,
      error: null,
    } satisfies GetCoursesResponse);
  }
  async getCourseContent(
    request: FastifyRequest<{ Params: { courseId: string } }>,
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

    const { courseId } = request.params;

    const content = await this.getCourseContentUseCase.execute(courseId);
    reply.status(200).send({
      success: true,
      message: "Course content retrieved successfully",
      data: content,
      error: null,
    } satisfies GetCourseContentResponse);
  }
  
}
