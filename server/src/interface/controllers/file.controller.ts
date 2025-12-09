import { FastifyReply, FastifyRequest } from "fastify";
import { AddFileFromGoogleDriveUseCase } from "../../application/use-cases/files/AddFileFromGoogleDriveUseCase";
import { GetFileFromGoogleDriveUseCase } from "../../application/use-cases/files/GetFileFromGoogleDriveUseCase";
export class FileController {
  constructor(
    private addFileFromGoogleDriveUseCase: AddFileFromGoogleDriveUseCase,
    private getFileFromGoogleDriveUseCase: GetFileFromGoogleDriveUseCase
  ) { }
  async addFileFromGoogleDrive(
    request: FastifyRequest<{
      Body: { fileGoogleDriveId: string };
    }>,
    reply: FastifyReply
  ): Promise<void> {
    const userId = request.user?.id;
    if (!userId) {
      reply.status(401).send({
        success: false,
        message: "User not authenticated",
        data: null,
        error: "Unauthorized",
      });
      return;
    }

    const { fileGoogleDriveId } = request.body;

    await this.addFileFromGoogleDriveUseCase.execute(fileGoogleDriveId);
    reply.status(200).send({
      success: true,
      message: "File added successfully",
      data: null,
      error: null,
    });
  }
  async getFileFromGoogleDrive(
    req: FastifyRequest<{ Params: { fileId: string } }>,
    res: FastifyReply
  ): Promise<void> {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).send({
        success: false,
        message: "User not authenticated",
        data: null,
        error: "Unauthorized",
      });
      return;
    }
    const { fileId } = req.params;
    const { file, content } = await this.getFileFromGoogleDriveUseCase.execute(
      fileId
    );

    res.header("Content-Type", file.getMimeType());
    res.header(
      "Content-Disposition",
      `inline; filename="${file.getFileName()}"`
    );
    res.send(content);
  }
  
}
