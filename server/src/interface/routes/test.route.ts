import fn from "fastify-plugin";
import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions } from "fastify";
const testRoute: FastifyPluginAsync = async (fastify: FastifyInstance, opts: FastifyPluginOptions) => {
    fastify.get<{ Params: { id: string } }>(`${opts.prefix}/:id`, async (request, reply) => {
        const testController = request.diScope.resolve("testController");
        // return testController.chunkFile(request, reply);
        return testController.chunkFile(request, reply);
    });
};

export const testRoutes = fn(testRoute, {
    name: "testRoutes",
    fastify: "5.x",
});