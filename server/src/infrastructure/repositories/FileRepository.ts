import { SupabaseClient } from "@supabase/supabase-js";
import { IFileRepository } from "../../domain/repositories/IFileRepository";
import { File } from "../../domain/entities/File";
import { DatabaseError } from "../../shared/errors/DatabaseError";
import { NotFoundError } from "../../shared/errors/NotFoundError";
import { FastifyBaseLogger } from "fastify";

export class FileRepository implements IFileRepository {
  constructor(
    private supabaseClient: SupabaseClient,
    private logger: FastifyBaseLogger
  ) {}

  async addFile(file: File): Promise<void> {
    this.logger.info(
      { fileId: file.getId(), fileName: file.getFileName() },
      "Adding file to repository"
    );
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
      this.logger.error(
        { error, fileId: file.getId() },
        "Error adding file to repository"
      );
      throw new DatabaseError(error);
    }
    this.logger.info(
      { fileId: file.getId() },
      "File added successfully to repository"
    );
  }

  async getFileById(id: string): Promise<File | null> {
    this.logger.info({ fileId: id }, "Getting file by ID");
    const { data, error } = await this.supabaseClient
      .from("pdfs")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        this.logger.info({ fileId: id }, "File not found");
        return null;
      }
      this.logger.error({ error, fileId: id }, "Error getting file by ID");
      throw new DatabaseError(error);
    }

    if (!data) {
      this.logger.info({ fileId: id }, "File not found (no data)");
      return null;
    }

    this.logger.info({ fileId: id }, "File found");
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
    this.logger.info({ userId }, "Getting all files by user ID");
    const { data, error } = await this.supabaseClient
      .from("pdfs")
      .select(
        `
        *,
        folders(id, name, parent_id)
      `
      )
      .order("uploaded_at", { ascending: false });

    if (error) {
      if (error.code === "PGRST116") {
        this.logger.info({ userId }, "No files found for user");
        return [];
      }
      this.logger.error(
        { error, userId },
        "Error getting all files by user ID"
      );
      throw new DatabaseError(error);
    }

    if (!data) {
      this.logger.info({ userId }, "No files found (no data)");
      return [];
    }

    this.logger.info(
      { userId, count: data.length },
      "Files retrieved successfully for user"
    );
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
    this.logger.info({ fileId: id }, "Deleting file");
    const { error } = await this.supabaseClient
      .from("pdfs")
      .delete()
      .eq("id", id);

    if (error) {
      if (error.code === "PGRST116") {
        this.logger.warn({ fileId: id }, "File not found for deletion");
        throw new NotFoundError("File not found");
      }
      this.logger.error({ error, fileId: id }, "Error deleting file");
      throw new DatabaseError(error);
    }
    this.logger.info({ fileId: id }, "File deleted successfully");
  }

  async updateFileName(id: string, fileName: string): Promise<File> {
    this.logger.info(
      { fileId: id, newFileName: fileName },
      "Updating file name"
    );
    const { data, error } = await this.supabaseClient
      .from("pdfs")
      .update({
        filename: fileName,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        this.logger.warn({ fileId: id }, "File not found for name update");
        throw new NotFoundError("File not found");
      }
      this.logger.error({ error, fileId: id }, "Error updating file name");
      throw new DatabaseError(error);
    }

    this.logger.info({ fileId: id }, "File name updated successfully");
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
    this.logger.info(
      { fileId: id, targetFolderId: folderId },
      "Moving file to folder"
    );
    const { data, error } = await this.supabaseClient
      .from("pdfs")
      .update({
        folder_id: folderId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        this.logger.warn({ fileId: id }, "File not found for move");
        throw new NotFoundError("File not found");
      }
      this.logger.error({ error, fileId: id }, "Error moving file");
      throw new DatabaseError(error);
    }

    this.logger.info({ fileId: id }, "File moved successfully");
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
