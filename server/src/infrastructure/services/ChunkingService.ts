import { FastifyBaseLogger } from "fastify";
import pdfjsLib from "pdfjs-dist"
import { encodingForModel, TiktokenModel } from "js-tiktoken";

const CHUNKING_CONFIG = {
    BATCH_SIZE: 5,
    OVERLAP_TOKENS: 100,
    CHUNK_SIZE: 1000,//in tokens,
    MIN_CHUNK_TOKENS: 50, // optional : skip very small chunks
};

export type Chunk = {
    text: string;
    tokenCount: number;
}

export class ChunkingService {
    constructor(private logger: FastifyBaseLogger) { }

    async processPdf(data: Uint8Array, model: TiktokenModel = "text-embedding-3-small"): Promise<Chunk[]> {
        const loadingTask = pdfjsLib.getDocument({ data });
        const pdf = await loadingTask.promise;
        this.logger.info(`PDF loaded with ${pdf.numPages} pages.`);

        const chunks: Chunk[] = [];

        for (let i = 0; i < pdf.numPages; i += CHUNKING_CONFIG.BATCH_SIZE) {
            const batchPromises = [];
            for (let j = 0; j < CHUNKING_CONFIG.BATCH_SIZE && i + j < pdf.numPages; j++) {
                batchPromises.push(pdf.getPage(i + j + 1));
                // it is like you are getting pages 1 to 5 in first batch, then 6 to 10 in second batch, and so on.
            }
            const pages = await Promise.all(batchPromises);
            // here, pages is an array of PDFPageProxy objects for the current batch
            let accumaltedText = "";
            for (const page of pages) {
                accumaltedText += (await page.getTextContent())
                    .items
                    .map((i: any) => i.str)
                    .join(" ").replace(/\s+/g, " ").trim();

            }
            const pageChunks = this.chunkText(accumaltedText, model);
            chunks.push(...pageChunks);
        }
        this.logger.info(`Total chunks created: ${chunks.length}`);
        return chunks;
    }

    chunkText(text: string, model: TiktokenModel = "text-embedding-3-small"): Chunk[] {
        const encoding = encodingForModel(model);
        const tokens = encoding.encode(text);
        let start = 0;
        let chunks: Chunk[] = [];
        while (start < tokens.length) {
            // this condition makes sure that we dont pass the size of text in tokens
            // for example if text is 1400 tokens and start=0 then end will be 1000 normally 
            // but if you start at 1000 end will be 1400 (so we ensure all chunks have 1000
            //tokens except of the last one)
            const end = Math.min(start + CHUNKING_CONFIG.CHUNK_SIZE, tokens.length);
            const chunkTokens = tokens.slice(start, end)
            // we like encode the text to get tokens and we slice based on them ,
            //  now that we done slicing we need to decode back to text
            const chunkText = encoding.decode(chunkTokens);
            if (chunkTokens.length >= CHUNKING_CONFIG.MIN_CHUNK_TOKENS) {
                chunks.push({
                    text: chunkText,
                    tokenCount: chunkTokens.length,
                });
            }
            start += CHUNKING_CONFIG.CHUNK_SIZE - CHUNKING_CONFIG.OVERLAP_TOKENS
        }
        return chunks
    }

    countTokens(text: string, model: TiktokenModel = "text-embedding-3-small"): number {
        const encoding = encodingForModel(model);
        const tokens = encoding.encode(text);
        return tokens.length;
    }
}
