import { SupabaseClient } from "@supabase/supabase-js";
import { IStorageService } from "../../domain/services/IStorageService";
import { ServerError } from "../../shared/errors/ServerError";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";

const STORAGE_BUCKET = "pdfs";
const MAX_FILE_SIZE = 0 * 1024 * 1024; // 50MB

export class StorageService implements IStorageService {
  constructor(private supabaseClient: SupabaseClient) {}

  async uploadFile(file: Buffer, filename: string, userId: string): Promise<string> {
    // Validate file size
    if (file.length > MAX_FILE_SIZE) {
      throw new ServerError("File size exceeds 50MB limit");
    }

    // Generate secure storage path
    const timestamp = Date.now();
    const sanitizedFilename = this.sanitizeFilename(filename);
    const storagePath = `${userId}/${timestamp}_${sanitizedFilename}`;

    // Upload to Supabase Storage
    const { error } = await this.supabaseClient.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (error) {
      throw new ServerError(`Failed to upload file: ${error.message}`);
    }

    return storagePath;
  }

  async deleteFile(storagePath: string): Promise<void> {
    const { error } = await this.supabaseClient.storage
      .from(STORAGE_BUCKET)
      .remove([storagePath]);

    if (error) {
      throw new ServerError(`Failed to delete file from storage: ${error.message}`);
    }
  }

  async getSignedUrl(storagePath: string, expiresIn: number = 3600): Promise<string> {
    const { data, error } = await this.supabaseClient.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(storagePath, expiresIn);

    if (error || !data) {
      throw new ServerError(`Failed to generate signed URL: ${error?.message || "Unknown error"}`);
    }

    return data.signedUrl;
  }


  async downloadFile(storagePath: string): Promise<Buffer> {
    const { data, error } = await this.supabaseClient.storage
      .from(STORAGE_BUCKET)
      .download(storagePath);

    if (error || !data) {
      throw new ServerError("Failed to download file for thumbnail generation");
    }

    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  private sanitizeFilename(filename: string): string {
    // Remove invalid characters and limit length
    return filename
      .replace(/[<>:"/\\|?*]/g, "")
      .trim()
      .slice(0, 255);
  }


}
