import { IFileProcessingService } from "../../domain/services/IFileProcessingService";
import { CHUNKING_CONFIG, ExtractedContent } from "../../shared/utils/chunking";
import * as pdfjsLib from "pdfjs-dist";


export class FileProcessingService implements IFileProcessingService {

    
    async getText(file: Uint8Array): Promise<ExtractedContent> {
        const loadingTask = pdfjsLib.getDocument({ data: file });
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
    async validateFile(file: Buffer, mimeType: string): Promise<boolean> {
        throw new Error("not found")
    };
}