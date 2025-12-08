import * as pdfjsLib from 'pdfjs-dist';
import fetch from 'node-fetch';
import { IFileProcessor } from "../../domain/services/IFileProcessor";

const WORDS_PER_TOKEN = 0.75;
const TOKENS_PER_CHUNK = 1000;
const WORDS_PER_CHUNK = Math.floor(TOKENS_PER_CHUNK / WORDS_PER_TOKEN);
export class FileProcessor implements IFileProcessor {
    async PdfToChunks(link: string): Promise<string[]> {
        const response = await fetch(link)

        if (!response.ok) throw new Error('Failed to fetch PDF');

        const arrayBuffer = await response.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        const chunks: string[] = [];
        let buffer = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items.map((item: any) => item.str).join(' ');

            buffer += ' ' + pageText;

            // 5️⃣ Create chunks of ~1000 tokens
            let words = buffer.split(/\s+/);
            while (words.length >= WORDS_PER_CHUNK) {
                const chunkWords = words.slice(0, WORDS_PER_CHUNK);
                chunks.push(chunkWords.join(' '));
                words = words.slice(WORDS_PER_CHUNK);
            }

            buffer = words.join(' ');
        }

        // 6️⃣ Add remaining text as last chunk
        if (buffer.trim().length > 0) chunks.push(buffer);

        return chunks; 0
    }

}