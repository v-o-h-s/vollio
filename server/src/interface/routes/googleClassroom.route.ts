import {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyPluginOptions,
} from "fastify";
import fp from "fastify-plugin";
import { validateQuery } from "../../shared/validation/validator";
import {
  GoogleCallbackQuerySchema,
  GoogleCallbackQuery,
  ClassroomContentResponseSchema,
  ClassroomCourseResponseSchema,
  ClassroomCourseWithContentResponseSchema,
  createApiResponseSchema,
} from "../../shared/validation/googleClassroomSchemas";

const googleClassroomRoutesHandler: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
): Promise<void> => {
  fastify.get(
    `${opts.prefix}/connect`,
    {
      schema: {
        tags: ["Google Classroom"],
        summary: "Initiate Google Classroom connection",
        response: {
          200: createApiResponseSchema({
            type: "object",
            properties: {
              authUrl: { type: "string" },
            },
            required: ["authUrl"],
          }),
        },
      },
    },
    async (request, reply) => {
      const googleClassroomController = request.diScope.resolve(
        "googleClassroomController"
      );
      return googleClassroomController.connect(request, reply);
    }
  );

  fastify.get<{ Querystring: GoogleCallbackQuery }>(
    `${opts.prefix}/callback`,
    {
      schema: {
        tags: ["Google Classroom"],
        summary: "Callback for Google OAuth",
        querystring: GoogleCallbackQuerySchema,
        response: {
          200: createApiResponseSchema({ type: "null" }),
        },
      },
      preHandler: validateQuery(GoogleCallbackQuerySchema),
    },
    async (request, reply) => {
      const googleClassroomController = request.diScope.resolve(
        "googleClassroomController"
      );
      return googleClassroomController.callback(request, reply);
    }
  );

  fastify.get(
    `${opts.prefix}/refresh`,
    {
      schema: {
        tags: ["Google Classroom"],
        summary: "Refresh Google OAuth token",
        response: {
          200: createApiResponseSchema({ type: "null" }),
        },
      },
    },
    async (request, reply) => {
      const googleClassroomController = request.diScope.resolve(
        "googleClassroomController"
      );
      return googleClassroomController.refreshAccessToken(request, reply);
    }
  );

  fastify.get(
    `${opts.prefix}/check`,
    {
      schema: {
        tags: ["Google Classroom"],
        summary: "Check Google token status",
        response: {
          200: createApiResponseSchema({
            type: "object",
            properties: {
              isConnected: { type: "boolean" },
              isExpired: { type: "boolean" },
            },
            required: ["isConnected", "isExpired"],
          }),
        },
      },
    },
    async (request, reply) => {
      const googleClassroomController = request.diScope.resolve(
        "googleClassroomController"
      );
      return googleClassroomController.checkTokenStatus(request, reply);
    }
  );

  fastify.delete(
    `${opts.prefix}/disconnect`,
    {
      schema: {
        tags: ["Google Classroom"],
        summary: "Disconnect Google Classroom",
        response: {
          200: createApiResponseSchema({ type: "null" }),
        },
      },
    },
    async (request, reply) => {
      const googleClassroomController = request.diScope.resolve(
        "googleClassroomController"
      );
      return googleClassroomController.disconnect(request, reply);
    }
  );

  fastify.get(
    `${opts.prefix}/status`,
    {
      schema: {
        tags: ["Google Classroom"],
        summary: "Get Google Classroom connection status",
        response: {
          200: createApiResponseSchema({
            type: "object",
            properties: {
              isConnected: { type: "boolean" },
            },
            required: ["isConnected"],
          }),
        },
      },
    },
    async (request, reply) => {
      const googleClassroomController = request.diScope.resolve(
        "googleClassroomController"
      );
      return googleClassroomController.getConnectionStatus(request, reply);
    }
  );

  fastify.get(
    `${opts.prefix}/courses/list`,
    {
      schema: {
        tags: ["Google Classroom"],
        summary: "List Google Classroom courses",
        response: {
          200: createApiResponseSchema({
            type: "array",
            items: ClassroomCourseResponseSchema,
          }),
        },
      },
    },
    async (request, reply) => {
      const googleClassroomController = request.diScope.resolve(
        "googleClassroomController"
      );
      return googleClassroomController.getCourses(request, reply);
    }
  );

  fastify.get(
    `${opts.prefix}/courses`,
    {
      schema: {
        tags: ["Google Classroom"],
        summary: "Get Google Classroom courses with content",
        response: {
          200: createApiResponseSchema({
            type: "array",
            items: ClassroomCourseWithContentResponseSchema,
          }),
        },
      },
    },
    async (request, reply) => {
      const googleClassroomController = request.diScope.resolve(
        "googleClassroomController"
      );
      return googleClassroomController.getCoursesWithContent(request, reply);
    }
  );

  fastify.get<{ Params: { courseId: string } }>(
    `${opts.prefix}/courses/:courseId/content`,
    {
      schema: {
        tags: ["Google Classroom"],
        summary: "Get Google Classroom course content",
        params: {
          type: "object",
          properties: {
            courseId: { type: "string" },
          },
          required: ["courseId"],
        },
        response: {
          200: createApiResponseSchema(ClassroomContentResponseSchema),
        },
      },
    },
    async (request, reply) => {
      const googleClassroomController = request.diScope.resolve(
        "googleClassroomController"
      );
      return googleClassroomController.getCourseContent(request, reply);
    }
  );
};

export const googleClassroomRoutes = fp(googleClassroomRoutesHandler, {
  name: "googleClassroomRoutes",
  fastify: "5.x",
});
