import { FileRepository } from "../../../infrastructure/repositories/FileRepository";

export class UploadFileUseCase{
    constructor(private fileRepository:FileRepository){}
    async execute()
}