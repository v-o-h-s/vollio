import { SupabaseClient } from "@supabase/supabase-js";
import { IFileRepository } from "../../domain/repositories/IFileRepository";
import { File } from "../../domain/entities/File";
import { DatabaseError } from "../../shared/errors/DatabaseError";
import { NotFoundError } from "../../shared/errors/NotFoundError";

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

  async getAllFilesByUserId(userId: string): Promise<File[]> {
    const { data, error } = await this.supabaseClient
      .from("pdfs")
      .select(`
        *,
        folders(id, name, parent_id)
      `)
      .order("uploaded_at", { ascending: false });

    if (error) {
      if(error.code === "PGRST116") {
        return [];
      }
      throw new DatabaseError(error);
    }

    if (!data) {
      return [];
    }

    return data.map(
      (row) =>
        new File(
          row.id,
          row.filename,
          row.file_size,
          row.storage_path,
          row.google_file_id,
          row.mime_type,
          row.folder_id
        )
    );
  }

  async deleteFile(id: string): Promise<void> {
    const { error } = await this.supabaseClient
      .from("pdfs")
      .delete()
      .eq("id", id);

    if (error) {
      if (error.code === "PGRST116") {
        throw new NotFoundError("File not found");
      }
      throw new DatabaseError(error);
    }
  }

  async updateFileName(id: string, fileName: string): Promise<File> {
    const { data, error } = await this.supabaseClient
      .from("pdfs")
      .update({ 
        filename: fileName,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new NotFoundError("File not found");
      }
      throw new DatabaseError(error);
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

  async moveFile(id: string, folderId: string | null): Promise<File> {
    const { data, error } = await this.supabaseClient
      .from("pdfs")
      .update({ 
        folder_id: folderId,
        updated_at: new Date().toISOString()
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        throw new NotFoundError("File not found");
      }
      throw new DatabaseError(error);
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
}
