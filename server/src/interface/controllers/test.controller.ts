import { FastifyReply, FastifyRequest } from "fastify";
import { testChunks } from "../../application/use-cases/testChanks";

export class testController {

    constructor(private testChunks: testChunks) { }
    async processTest(request: FastifyRequest<{ Body: { link: string } }>, reply: FastifyReply): Promise<void> {
        const { link } = request.body;
        try {
            const chunks = await this.testChunks.execute(link);
            reply.send(chunks);
        } catch (error) {
            reply.status(500).send({ error });
        }
    }
}