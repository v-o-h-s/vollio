
import pdfjsLib from "pdfjs-dist"
import { encodingForModel, TiktokenModel, Tiktoken } from "js-tiktoken";
export const CHUNKING_CONFIG = {
    MODEL: "Qwen3-Embedding-0.6B",
    BATCH_SIZE: 5,
    MAX_TOKENS: 700,         // Maximum tokens per chunk
    MIN_TOKENS: 50,           // Minimum tokens per chunk (skip smaller)
    OVERLAP_PERCENT: 0.25,    // 25% overlap between chunks
    PARAGRAPH_SEPARATOR: /\n\s*\n/,  // Two newlines = paragraph break
    SENTENCE_TERMINATORS: /[.!?]+[\s\n]/g,  // Sentence endings
};

export type ChunkMetadata = {
    pageRange?: { start: number; end: number };
    paragraphIndex?: number;
    chunkIndex: number;
    heading?: string;
    section?: string;
}

export type Chunk = {
    text: string;
    tokenCount: number;
    metadata: ChunkMetadata;
}



export interface ExtractedContent {

    paragraphs: Array<{ text: string; pageNum: number }>;

}

/**
     * Extract text from PDF with page structure (full text, paragraphs, pages(pageNum, text))
     */
export async function extractFromPdf(data: Uint8Array): Promise<ExtractedContent> {
    const loadingTask = pdfjsLib.getDocument({ data });
    const pdf = await loadingTask.promise;

    const paragraphs: Array<{ text: string; pageNum: number }> = [];
    const pages: Array<{ pageNum: number; text: string }> = [];

    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        // Extract text preserving line breaks
        const pageText = textContent.items
            .map((item: any) => {
                // Check if there's a large vertical gap (new paragraph)
                return item.str;
            })
            .join(" ");

        pages.push({ pageNum: i, text: pageText });


        // Split page into paragraphs with page number tracking
        const pageParagraphs = pageText.split(CHUNKING_CONFIG.PARAGRAPH_SEPARATOR)
            .filter(p => p.trim().length > 0)
            .map(text => ({ text, pageNum: i }));
        paragraphs.push(...pageParagraphs);
    }

    return { paragraphs };
}


/**
 * Clean text: remove noise, normalize whitespace, preserve structure
 */
export function cleanText(text: string): string {
    let cleaned = text;

    // Remove repeated copyright/header patterns (e.g., "© 2024 Company" appearing multiple times)
    const copyrightPattern = /©\s*\d{4}[^\n]*(\n|$)/gi;
    const copyrights = cleaned.match(copyrightPattern);
    if (copyrights && copyrights.length > 2) {
        // Remove after first 2 occurrences
        cleaned = cleaned.replace(copyrightPattern, (match, ...args) => {
            const offset = args[args.length - 2];
            const firstTwo = cleaned.slice(0, offset).match(copyrightPattern);
            return firstTwo && firstTwo.length >= 2 ? '' : match;
        });
    }

    // Remove page numbers (standalone numbers on lines)
    cleaned = cleaned.replace(/^\s*\d+\s*$/gm, '');

    // Remove common header/footer patterns
    cleaned = cleaned.replace(/^(Page \d+( of \d+)?|Chapter \d+|\d+\s*$)/gim, '');

    // Normalize whitespace but preserve paragraph breaks
    cleaned = cleaned.replace(/[ \t]+/g, ' ');  // Multiple spaces/tabs to single space
    cleaned = cleaned.replace(/\n{3,}/g, '\n\n');  // Multiple newlines to double newline

    // Trim each line
    cleaned = cleaned.split('\n').map(line => line.trim()).join('\n');

    return cleaned.trim();
}



/**
 * Create chunks from paragraphs with overlap and metadata
 */
export async function createChunksFromParagraphs(
    paragraphs: Array<{ text: string; pageNum: number }>,
    baseMetadata: Partial<ChunkMetadata>
): Promise<Chunk[]> {
    const encoding = encodingForModel("text-embedding-3-small");
    const chunks: Chunk[] = [];
    let chunkIndex = 0;

    let currentChunk: Array<{ text: string; pageNum: number }> = [];
    let currentTokens = 0;
    let overlapBuffer: Array<{ text: string; pageNum: number }> = [];

    for (let i = 0; i < paragraphs.length; i++) {
        const paragraph = paragraphs[i];
        const paragraphTokens = countTokensWithEncoding(paragraph.text, encoding);

        // If single paragraph exceeds max tokens, split it into sentences
        if (paragraphTokens > CHUNKING_CONFIG.MAX_TOKENS) {
            // Save current chunk if exists
            if (currentChunk.length > 0) {
                chunks.push(createChunk(
                    currentChunk.map(p => p.text).join('\n\n'),
                    currentTokens,
                    chunkIndex++,
                    baseMetadata,
                    i - currentChunk.length,
                    getPageRange(currentChunk)
                ));
                currentChunk = [];
                currentTokens = 0;
            }

            // Split large paragraph into sentences
            const sentenceChunks = splitParagraphIntoSentences(paragraph.text, encoding);
            for (const sentenceChunk of sentenceChunks) {
                const sentenceTokens = countTokensWithEncoding(sentenceChunk, encoding);
                if (sentenceTokens >= CHUNKING_CONFIG.MIN_TOKENS) {
                    chunks.push(createChunk(
                        sentenceChunk,
                        sentenceTokens,
                        chunkIndex++,
                        baseMetadata,
                        i,
                        { start: paragraph.pageNum, end: paragraph.pageNum }
                    ));
                }
            }
            continue;
        }

        // Try to add paragraph to current chunk
        if (currentTokens + paragraphTokens <= CHUNKING_CONFIG.MAX_TOKENS) {
            currentChunk.push(paragraph);
            currentTokens += paragraphTokens;
        } else {
            // Current chunk is full, save it
            if (currentChunk.length > 0) {
                const chunkText = currentChunk.map(p => p.text).join('\n\n');
                chunks.push(createChunk(
                    chunkText,
                    currentTokens,
                    chunkIndex++,
                    baseMetadata,
                    i - currentChunk.length,
                    getPageRange(currentChunk)
                ));

                // Create overlap: keep last 25% of tokens
                overlapBuffer = createOverlap(currentChunk, encoding);
            }

            // Start new chunk with overlap + current paragraph
            currentChunk = [...overlapBuffer, paragraph];
            currentTokens = countTokensWithEncoding(currentChunk.map(p => p.text).join('\n\n'), encoding);
            overlapBuffer = [];
        }
    }

    // Save final chunk
    if (currentChunk.length > 0 && currentTokens >= CHUNKING_CONFIG.MIN_TOKENS) {
        chunks.push(createChunk(
            currentChunk.map(p => p.text).join('\n\n'),
            currentTokens,
            chunkIndex++,
            baseMetadata,
            paragraphs.length - currentChunk.length,
            getPageRange(currentChunk)
        ));
    }

    return chunks;
}




/**
 * Split a large paragraph into sentence-based chunks
 */
export function splitParagraphIntoSentences(paragraph: string, encoding: Tiktoken): string[] {
    const sentences = paragraph.split(CHUNKING_CONFIG.SENTENCE_TERMINATORS).filter(s => s.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk: string[] = [];
    let currentTokens = 0;

    for (const sentence of sentences) {
        const sentenceTokens = countTokensWithEncoding(sentence, encoding);

        if (currentTokens + sentenceTokens <= CHUNKING_CONFIG.MAX_TOKENS) {
            currentChunk.push(sentence);
            currentTokens += sentenceTokens;
        } else {
            if (currentChunk.length > 0) {
                chunks.push(currentChunk.join('. ') + '.');
            }
            currentChunk = [sentence];
            currentTokens = sentenceTokens;
        }
    }

    if (currentChunk.length > 0) {
        chunks.push(currentChunk.join('. ') + '.');
    }

    return chunks;
}

/**
 * Create overlap buffer from last paragraphs (25% of tokens)
 */
export function createOverlap(paragraphs: Array<{ text: string; pageNum: number }>, encoding: Tiktoken): Array<{ text: string; pageNum: number }> {
    const targetOverlapTokens = Math.floor(CHUNKING_CONFIG.MAX_TOKENS * CHUNKING_CONFIG.OVERLAP_PERCENT);
    const overlapBuffer: Array<{ text: string; pageNum: number }> = [];
    let overlapTokens = 0;

    // Add paragraphs from end until we reach target overlap
    for (let i = paragraphs.length - 1; i >= 0 && overlapTokens < targetOverlapTokens; i--) {
        const para = paragraphs[i];
        const paraTokens = countTokensWithEncoding(para.text, encoding);

        if (overlapTokens + paraTokens <= targetOverlapTokens) {
            overlapBuffer.unshift(para);
            overlapTokens += paraTokens;
        } else {
            break;
        }
    }

    return overlapBuffer;
}

/**
 * Get page range from a collection of paragraphs
 */
export function getPageRange(paragraphs: Array<{ text: string; pageNum: number }>): { start: number; end: number } | undefined {
    if (paragraphs.length === 0) return undefined;
    const pageNumbers = paragraphs.map(p => p.pageNum);
    return {
        start: Math.min(...pageNumbers),
        end: Math.max(...pageNumbers)
    };
}

/**
 * Create a chunk with metadata
 */
export function createChunk(
    text: string,
    tokenCount: number,
    chunkIndex: number,
    baseMetadata: Partial<ChunkMetadata>,
    paragraphIndex: number,
    pageRange?: { start: number; end: number }
): Chunk {
    // Extract potential heading (first line if it looks like a heading)
    const lines = text.split('\n');
    const firstLine = lines[0];
    const heading = detectHeading(firstLine) ? firstLine : undefined;

    return {
        text: text.trim(),
        tokenCount,
        metadata: {
            ...baseMetadata,
            chunkIndex,
            paragraphIndex,
            heading,
            pageRange,
        }
    };
}

/**
 * Detect if a line is likely a heading
 */
export function detectHeading(line: string): boolean {
    // Check if line is short, capitalized, or ends without punctuation
    return (
        line.length < 100 &&
        (line === line.toUpperCase() ||
            /^[A-Z][^.!?]*$/.test(line) ||
            /^\d+\.?\s+[A-Z]/.test(line))  // Numbered sections
    );
}

/**
 * Count tokens using encoding instance
 */
export function countTokensWithEncoding(text: string, encoding: Tiktoken): number {
    return encoding.encode(text).length;
}

/**
 * Public method to count tokens
 */
export function countTokens(text: string, model: TiktokenModel = "text-embedding-3-small"): number {
    const encoding = encodingForModel(model);
    const tokens = encoding.encode(text);
    return tokens.length;
}

