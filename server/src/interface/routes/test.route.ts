import fn from "fastify-plugin";
import { FastifyInstance, FastifyPluginAsync, FastifyPluginOptions } from "fastify";
import { testController } from "../controllers/test.controller";

const testRoute: FastifyPluginAsync = async (fastify: FastifyInstance, opts: FastifyPluginOptions) => {
    fastify.get<{ Params: { id: string } }>(
        `${opts.prefix}/:id`,
        {
            config: {
                rateLimit: { cost: 20, category: "ai" },
            },
        },
        async (request, reply) => {
            const testController = request.diScope.resolve<testController>("testController");
            // return testController.chunkDocument(request, reply);
            return testController.embeddDocument(request, reply);
        }
    );
};

export const testRoutes = fn(testRoute, {
    name: "testRoutes",
    fastify: "5.x",
});