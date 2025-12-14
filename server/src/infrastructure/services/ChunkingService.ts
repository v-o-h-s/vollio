import { FastifyBaseLogger } from "fastify";
import { encodingForModel, TiktokenModel, Tiktoken } from "js-tiktoken";
import { Chunk, cleanText, createChunksFromParagraphs, extractFromPdf } from "../../shared/utils/chunking";
import { ExtractedContent } from "../../shared/utils/chunking";




export class ChunkingService {
    constructor(private logger: FastifyBaseLogger) { }


    async chunkFile(
        data: Uint8Array,
        mimeType: string,
        fileName: string,
        fileId?: string,
        model: TiktokenModel = "text-embedding-3-small"
    ): Promise<Chunk[]> {
        this.logger.info(`Processing file: ${fileName} (${mimeType})`);

        let extracted: ExtractedContent;


        extracted = await extractFromPdf(data);

        // Clean the text

        const cleanedParagraphs = extracted.paragraphs.map(p => ({
            text: cleanText(p.text),
            pageNum: p.pageNum
        })).filter(p => p.text.length > 0);

        this.logger.info(`Extracted ${cleanedParagraphs.length} paragraphs from ${fileName}`);

        // Create chunks with metadata
        const chunks = await createChunksFromParagraphs(
            cleanedParagraphs,
            model,
            {}
        );

        this.logger.info(`Created ${chunks.length} chunks from ${fileName}`);
        return chunks;
    }




}
