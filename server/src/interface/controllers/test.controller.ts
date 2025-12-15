import { FastifyReply, FastifyRequest } from "fastify";
import { testChunks } from "../../application/use-cases/testChanks";
import { error } from "console";
import { EmbeddFileBYIdUseCase } from "../../application/use-cases/embedding/EmbeddFileByIdUseCase";

export class testController {

    constructor(private embeddFileBYIdUseCase: EmbeddFileBYIdUseCase) { }

    async embeddFile(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
        const { id } = request.params;
        const embeddingResult = await this.embeddFileBYIdUseCase.execute(id);
        reply.send({ success: true, message: "File embedded successfully", data: embeddingResult, error: null });
    }
}