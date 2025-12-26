import { IDocumentProcessingService } from "../../domain/services/IDocumentProcessingService";
import { CHUNKING_CONFIG, ExtractedContent } from "../../shared/utils/chunking";
import * as pdfjsLib from "pdfjs-dist";

export class DocumentProcessingService implements IDocumentProcessingService {
  async getText(buffer: Uint8Array): Promise<ExtractedContent> {
    const loadingTask = pdfjsLib.getDocument({ data: buffer });
    const document = await loadingTask.promise;

    const paragraphs: Array<{ text: string; pageNum: number }> = [];
    const pages: Array<{ pageNum: number; text: string }> = [];

    for (let i = 1; i <= document.numPages; i++) {
      const page = await document.getPage(i);
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
      const pageParagraphs = pageText
        .split(CHUNKING_CONFIG.PARAGRAPH_SEPARATOR)
        .filter((p) => p.trim().length > 0)
        .map((text) => ({ text, pageNum: i }));
      paragraphs.push(...pageParagraphs);
    }

    return { paragraphs };
  }
  async validateDocument(document: Buffer, mimeType: string): Promise<boolean> {
    throw new Error("not found");
  }
}
