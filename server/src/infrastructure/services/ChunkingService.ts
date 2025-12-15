import { FastifyBaseLogger } from "fastify";
import { Chunk, cleanText, createChunksFromParagraphs, extractFromPdf } from "../../shared/utils/chunking";
import { ExtractedContent } from "../../shared/utils/chunking";




export class ChunkingService {
    constructor(private logger: FastifyBaseLogger) { }

    async chunkText(text: ExtractedContent): Promise<Chunk[]> {
        const cleanedParagraphs = text.paragraphs.map(p => ({
            text: cleanText(p.text),
            pageNum: p.pageNum
        })).filter(p => p.text.length > 0);

        this.logger.info(`Extracted ${cleanedParagraphs.length} paragraphs from `);

        // Create chunks with metadata
        const chunks = await createChunksFromParagraphs(
            cleanedParagraphs,

            {}
        );

        return chunks;
    }



}
