import { FastifyReply, FastifyRequest } from "fastify";
import { testChunks } from "../../application/use-cases/testChanks";
import { ChunkingFileByIdUseCase } from "../../application/use-cases/chunking/ChunkingFileByIdUseCase";
import { error } from "console";
import { EmbeddFileBYIdUseCase } from "../../application/use-cases/embedding/EmbeddFileByIdUseCase";

export class testController {

    constructor(private chunkingFileByIdUseCase: ChunkingFileByIdUseCase, private embeddFileBYIdUseCase: EmbeddFileBYIdUseCase) { }
    async chunkFile(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
        const { id } = request.params;
        const chunks = await this.chunkingFileByIdUseCase.execute(id);
        reply.send({ success: true, message: "File chunked successfully", data: chunks, error: null });
    }
    async EmbeddFile(request: FastifyRequest<{ Params: { id: string } }>, reply: FastifyReply): Promise<void> {
        const { id } = request.params;
        const embeddingResult = await this.embeddFileBYIdUseCase.execute(id);
        reply.send({ success: true, message: "File embedded successfully", data: embeddingResult, error: null });
    }
}