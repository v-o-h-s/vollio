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

const googleClassroomRoutesHandler: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
): Promise<void> => {
  fastify.get(
    `${opts.prefix}/connect`,
    {
      schema: {},
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
        querystring: GoogleCallbackQuerySchema,
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
      schema: {},
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
      schema: {},
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
      schema: {},
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
      schema: {},
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
      schema: {},
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
      schema: {},
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
