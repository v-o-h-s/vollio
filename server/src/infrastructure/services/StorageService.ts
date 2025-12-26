import { SupabaseClient } from "@supabase/supabase-js";
import { IStorageService } from "../../domain/services/IStorageService";
import { ServerError } from "../../shared/errors/ServerError";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";

const STORAGE_BUCKET = "documents";
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export class StorageService implements IStorageService {
  constructor(private supabaseClient: SupabaseClient) {}

  async uploadDocument(
    buffer: Buffer,
    name: string,
    userId: string
  ): Promise<string> {
    // Validate buffer size
    if (buffer.length > MAX_FILE_SIZE) {
      throw new ServerError("File size exceeds 50MB limit");
    }

    // Generate secure storage path
    const timestamp = Date.now();
    const sanitizedName = this.sanitizeName(name);
    const storagePath = `${userId}/${timestamp}_${sanitizedName}`;
    // Upload to Supabase Storage
    const { error } = await this.supabaseClient.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, buffer, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (error) {
      throw new ServerError(`Failed to upload document: ${error.message}`);
    }

    return storagePath;
  }

  async deleteDocument(storagePath: string): Promise<void> {
    const { error } = await this.supabaseClient.storage
      .from(STORAGE_BUCKET)
      .remove([storagePath]);

    if (error) {
      throw new ServerError(
        `Failed to delete document from storage: ${error.message}`
      );
    }
  }

  async getSignedUrl(
    storagePath: string,
    expiresIn: number = 3600
  ): Promise<string> {
    const { data, error } = await this.supabaseClient.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(storagePath, expiresIn);

    if (error || !data) {
      throw new ServerError(
        `Failed to generate signed URL: ${error?.message || "Unknown error"}`
      );
    }

    return data.signedUrl;
  }

  async downloadDocument(storagePath: string): Promise<Buffer> {
    const { data, error } = await this.supabaseClient.storage
      .from(STORAGE_BUCKET)
      .download(storagePath);

    if (error || !data) {
      throw new ServerError(
        "Failed to download document for thumbnail generation"
      );
    }

    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  private sanitizeName(name: string): string {
    // Remove invalid characters and limit length
    return name
      .replace(/[<>:"/\\|?*]/g, "")
      .trim()
      .slice(0, 255);
  }
}
