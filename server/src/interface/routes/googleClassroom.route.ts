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
} from "../../shared/validation/googleClassroomSchemas";
import { GoogleClassroomController } from "../controllers/googleClassroom.controller";

const googleClassroomRoutesHandler: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
): Promise<void> => {
  fastify.get(
    `${opts.prefix}/connect`,
    {
      config: {
        rateLimit: { cost: 1 },
      },
      schema: {},
    },
    async (request, reply) => {
      const googleClassroomController = request.diScope.resolve<GoogleClassroomController>(
        "googleClassroomController"
      );
      return googleClassroomController.connect(request, reply);
    }
  );

  fastify.get<{ Querystring: GoogleCallbackQuery }>(
    `${opts.prefix}/callback`,
    {
      config: {
        rateLimit: { cost: 5 },
      },
      schema: {
        querystring: GoogleCallbackQuerySchema,
      },
      preHandler: validateQuery(GoogleCallbackQuerySchema),
    },
    async (request, reply) => {
      const googleClassroomController = request.diScope.resolve<GoogleClassroomController>(
        "googleClassroomController"
      );
      return googleClassroomController.callback(request, reply);
    }
  );

  fastify.get(
    `${opts.prefix}/refresh`,
    {
      config: {
        rateLimit: { cost: 5 },
      },
      schema: {},
    },
    async (request, reply) => {
      const googleClassroomController = request.diScope.resolve<GoogleClassroomController>(
        "googleClassroomController"
      );
      return googleClassroomController.refreshAccessToken(request, reply);
    }
  );

  fastify.get(
    `${opts.prefix}/check`,
    {
      config: {
        rateLimit: { cost: 1 },
      },
      schema: {},
    },
    async (request, reply) => {
      const googleClassroomController = request.diScope.resolve<GoogleClassroomController>(
        "googleClassroomController"
      );
      return googleClassroomController.checkTokenStatus(request, reply);
    }
  );

  fastify.delete(
    `${opts.prefix}/disconnect`,
    {
      config: {
        rateLimit: { cost: 1 },
      },
      schema: {},
    },
    async (request, reply) => {
      const googleClassroomController = request.diScope.resolve<GoogleClassroomController>(
        "googleClassroomController"
      );
      return googleClassroomController.disconnect(request, reply);
    }
  );

  fastify.get(
    `${opts.prefix}/status`,
    {
      config: {
        rateLimit: { cost: 1 },
      },
      schema: {},
    },
    async (request, reply) => {
      const googleClassroomController = request.diScope.resolve<GoogleClassroomController>(
        "googleClassroomController"
      );
      return googleClassroomController.getConnectionStatus(request, reply);
    }
  );

  fastify.get(
    `${opts.prefix}/courses/list`,
    {
      config: {
        rateLimit: { cost: 5 },
      },
      schema: {},
    },
    async (request, reply) => {
      const googleClassroomController = request.diScope.resolve<GoogleClassroomController>(
        "googleClassroomController"
      );
      return googleClassroomController.getCourses(request, reply);
    }
  );

  fastify.get(
    `${opts.prefix}/courses`,
    {
      config: {
        rateLimit: { cost: 20 },
      },
      schema: {},
    },
    async (request, reply) => {
      const googleClassroomController = request.diScope.resolve<GoogleClassroomController>(
        "googleClassroomController"
      );
      return googleClassroomController.getCoursesWithContent(request, reply);
    }
  );

  fastify.get<{ Params: { courseId: string } }>(
    `${opts.prefix}/courses/:courseId/content`,
    {
      config: {
        rateLimit: { cost: 5 },
      },
      schema: {
        params: {
          type: "object",
          properties: {
            courseId: { type: "string" },
          },
          required: ["courseId"],
        },
      },
    },
    async (request, reply) => {
      const googleClassroomController = request.diScope.resolve<GoogleClassroomController>(
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
