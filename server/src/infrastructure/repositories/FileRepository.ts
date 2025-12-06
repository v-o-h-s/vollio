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
    const { data, error } = await this.supabaseClient
      .from("pdfs")
      .select("*")
      .eq("id", id)
      .single();
    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new DatabaseError(error);
    }
    if (!data) {
      return null;
    }
    return new File(
      data.id,
      data.filename,
      data.file_size,
      data.storage_path,
      data.google_file_id,
      data.mime_type,
      data.folder_id
    );
  }

  async deleteFile(id: string): Promise<void> {
    // Implementation for deleting a file by its ID
    throw new ServerError("not implemented yet");
  }
}
