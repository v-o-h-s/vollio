import fn from "fastify-plugin";
import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions } from "fastify";
const testRoute: FastifyPluginAsync = async (fastify: FastifyInstance, opts: FastifyPluginOptions) => {
    fastify.post<{ Body: { link: string } }>(`${opts.prefix}`, async (request, reply) => {
        const testController = request.diScope.resolve("testController");
        return testController.processTest(request, reply);

    });
};

export const testRoutes = fn(testRoute, {
    name: "testRoutes",
    fastify: "5.x",
});