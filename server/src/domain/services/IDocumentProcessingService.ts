import { ExtractedContent } from "../../shared/utils/chunking";

export interface IDocumentProcessingService {
    getText(document: Uint8Array): Promise<ExtractedContent>;
    validateDocument(document: Buffer, mimeType: string): Promise<boolean>;
}