import { FastifyAwilixOptions } from "@fastify/awilix";
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
};

export const googleClassroomRoutes = fp(googleClassroomRoutesHandler, {
  name: "googleClassroomRoutes",
  fastify: "5.x",
});
