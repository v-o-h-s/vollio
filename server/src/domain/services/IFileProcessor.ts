
export interface IFileProcessor {
    PdfToChunks(link:string): Promise<string[]>
}
