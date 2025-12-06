import { SupabaseClient } from "@supabase/supabase-js";
import { IFileRepository } from "../../domain/repositories/IFileRepository";
import { File } from "../../domain/entities/File";
import { DatabaseError } from "../../shared/errors/DatabaseError";
import { ServerError } from "../../shared/errors/ServerError";
export class FileRepository implements IFileRepository {
  private supabaseClient: SupabaseClient;
  constructor(supabaseClient: SupabaseClient) {
    this.supabaseClient = supabaseClient;
  }
  async addFile(file: File): Promise<void> {
    const { error } = await this.supabaseClient.from("pdfs").insert({
      id: file.getId(),
      filename: file.getFileName(),
      file_size: file.getFileSize(),
      storage_path: file.getSource().storagePath,
      google_file_id: file.getSource().googleFileId,
      mime_type: file.getMimeType(),
      folder_id: file.getFolderId(),
    });
    if (error) {
      throw new DatabaseError(error);
    }
  }

  async getFileById(id: string): Promise<File | null> {
    // Implementation for retrieving a file by its ID
    throw new ServerError("not implemented yet");
  }

  async deleteFile(id: string): Promise<void> {
    // Implementation for deleting a file by its ID
    throw new ServerError("not implemented yet");
  }
}
