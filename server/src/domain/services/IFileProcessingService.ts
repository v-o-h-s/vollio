import { ExtractedContent } from "../../shared/utils/chunking";

export interface IFileProcessingService {
    getText(file: Uint8Array): Promise<ExtractedContent>;
    validateFile(file: Buffer, mimeType: string): Promise<boolean>;
}