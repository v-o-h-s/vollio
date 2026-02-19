import { SupabaseClient } from "@supabase/supabase-js";
import { IStorageService } from "../../domain/services/IStorageService";
import { ServerError } from "../../shared/errors/ServerError";
import { DatabaseError } from "../../shared/errors/DatabaseError";
import { createServiceClient } from "../database/supabase/supabase";

const STORAGE_BUCKET = "documents";
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export class StorageService implements IStorageService {
  private supabaseAdmin: SupabaseClient = createServiceClient();
  constructor(private supabaseClient: SupabaseClient) {}

  async deleteDocument(storagePath: string): Promise<void> {
    const { error } = await this.supabaseClient.storage
      .from(STORAGE_BUCKET)
      .remove([storagePath]);

    if (error) {
      throw new ServerError(
        `Failed to delete document from storage: ${error.message}`,
      );
    }
  }

  async getSignedUrl(
    storagePath: string,
    expiresIn: number = 3600,
  ): Promise<string> {
    const { data, error } = await this.supabaseClient.storage
      .from(STORAGE_BUCKET)
      .createSignedUrl(storagePath, expiresIn);

    if (error || !data) {
      throw new ServerError(
        `Failed to generate signed URL: ${error?.message || "Unknown error"}`,
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
        "Failed to download document for thumbnail generation",
      );
    }

    const arrayBuffer = await data.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  async createUploadUrl(storagePath: string): Promise<string> {
    const { data, error } = await this.supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .createSignedUploadUrl(storagePath, {
        upsert: false,
      });

    if (error || !data) {
      throw new DatabaseError(error);
    }

    return data.signedUrl;
  }

  async uploadDocument(storagePath: string, file: Buffer): Promise<void> {
    const { error } = await this.supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .upload(storagePath, file);

    if (error) {
      throw new ServerError(
        `Failed to upload document to storage: ${error.message}`,
      );
    }
  }

  async getFileMetadata(
    storagePath: string,
  ): Promise<{ size: number; mimeType: string }> {
    const pathParts = storagePath.split("/");
    const filename = pathParts.pop();
    const folder = pathParts.join("/");

    const { data, error } = await this.supabaseAdmin.storage
      .from(STORAGE_BUCKET)
      .list(folder, {
        limit: 1,
        offset: 0,
        search: filename,
      });

    if (error || !data || data.length === 0) {
      throw new ServerError(
        `Failed to fetch metadata for file: ${storagePath}. Error: ${error?.message || "File not found"}`,
      );
    }

    const file = data[0];
    return {
      size: file.metadata.size,
      mimeType: file.metadata.mimetype,
    };
  }
}
