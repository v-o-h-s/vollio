import {
  FastifyInstance,
  FastifyPluginAsync,
  FastifyPluginOptions,
} from "fastify";
import fp from "fastify-plugin";
const fileRoutesHandler: FastifyPluginAsync = async (
  fastify: FastifyInstance,
  opts: FastifyPluginOptions
): Promise<void> => {
  fastify.get<{ Params: { fileId: string } }>(
    `${opts.prefix}/classroom/:fileId`,
    async (request, reply) => {
      const FileController = request.diScope.resolve("fileController");
      return FileController.getFileFromGoogleDrive(request, reply);
    }
  );
  fastify.post<{
    Body: { fileGoogleDriveId: string };
  }>(`${opts.prefix}/classroom`, async (request, reply) => {
    const fileController = request.diScope.resolve("fileController");
    return fileController.addFileFromGoogleDrive(request, reply);
  });
};
export const fileRoutes = fp(fileRoutesHandler, {
  name: "fileRoutes",
  fastify: "5.x",
});
