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
  fastify.get("/connect", async (request, reply) => {
    const googleClassroomController = request.diScope.resolve(
      "googleClassroomController"
    );
    return googleClassroomController.connect(request, reply);
  });

  fastify.get<{ Querystring: GoogleCallbackQuery }>(
    "/callback",
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

  fastify.get("/refresh", async (request, reply) => {
    const googleClassroomController = request.diScope.resolve(
      "googleClassroomController"
    );
    return googleClassroomController.refreshAccessToken(request, reply);
  });

  fastify.get("/check", async (request, reply) => {
    const googleClassroomController = request.diScope.resolve(
      "googleClassroomController"
    );
    return googleClassroomController.checkTokenStatus(request, reply);
  });

  fastify.delete("/disconnect", async (request, reply) => {
    const googleClassroomController = request.diScope.resolve(
      "googleClassroomController"
    );
    return googleClassroomController.disconnect(request, reply);
  });
};

export const googleClassroomRoutes = fp(googleClassroomRoutesHandler, {
  name: "googleClassroomRoutes",
  fastify: "5.x",
});
