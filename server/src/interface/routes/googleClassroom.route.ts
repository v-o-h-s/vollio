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
  fastify.get(`${opts.prefix}/connect`, async (request, reply) => {
    const googleClassroomController = request.diScope.resolve(
      "googleClassroomController"
    );
    return googleClassroomController.connect(request, reply);
  });

  fastify.get<{ Querystring: GoogleCallbackQuery }>(
    `${opts.prefix}/callback`,
    {
      preHandler: validateQuery(GoogleCallbackQuerySchema),
    },
    async (request, reply) => {
      const googleClassroomController = request.diScope.resolve(
        "googleClassroomController"
      );
      return googleClassroomController.callback(request, reply);
    }
  );

  fastify.get(`${opts.prefix}/refresh`, async (request, reply) => {
    const googleClassroomController = request.diScope.resolve(
      "googleClassroomController"
    );
    return googleClassroomController.refreshAccessToken(request, reply);
  });

  fastify.get(`${opts.prefix}/check`, async (request, reply) => {
    const googleClassroomController = request.diScope.resolve(
      "googleClassroomController"
    );
    return googleClassroomController.checkTokenStatus(request, reply);
  });

  fastify.delete(`${opts.prefix}/disconnect`, async (request, reply) => {
    const googleClassroomController = request.diScope.resolve(
      "googleClassroomController"
    );
    return googleClassroomController.disconnect(request, reply);
  });

  fastify.get(`${opts.prefix}/status`, async (request, reply) => {
    const googleClassroomController = request.diScope.resolve(
      "googleClassroomController"
    );
    return googleClassroomController.getConnectionStatus(request, reply);
  });

  fastify.get(
    `${opts.prefix}/courses/list`,
    {
      schema: {
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
  // will not be used in production lol , bro using promise.all lol
  fastify.get(`${opts.prefix}/courses`, async (request, reply) => {
    const googleClassroomController = request.diScope.resolve(
      "googleClassroomController"
    );
    return googleClassroomController.getCoursesWithContent(request, reply);
  });

  fastify.get<{ Params: { courseId: string } }>(
    `${opts.prefix}/courses/:courseId/content`,
    {
      schema: {
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
