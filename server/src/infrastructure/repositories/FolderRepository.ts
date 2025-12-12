import { SupabaseClient } from "@supabase/supabase-js";
import { IFolderRepository } from "../../domain/repositories/IFolderRepository";
import { Folder } from "../../domain/entities/Folder";
import { DatabaseError } from "../../shared/errors/DatabaseError";
import type { FastifyBaseLogger, } from "fastify";
export class FolderRepository implements IFolderRepository {
  private supabaseClient: SupabaseClient;
  private logger: FastifyBaseLogger;

  constructor(supabaseClient: SupabaseClient, logger: FastifyBaseLogger) {
    this.supabaseClient = supabaseClient;
    this.logger = logger;
  }

  async getFolderById(
    id: string,
    userId: string
  ): Promise<{ id: string; name: string; parentId: string | null } | null> {
    const { data, error } = await this.supabaseClient
      .from("folders")
      .select("id, name, parent_id")
      .eq("id", id)
      .eq("user_id", userId)
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

    return {
      id: data.id,
      name: data.name,
      parentId: data.parent_id,
    };
  }

  async getFolderEntity(id: string, userId: string): Promise<Folder | null> {
    const { data, error } = await this.supabaseClient
      .from("folders")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
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

    return new Folder(
      data.id,
      data.user_id,
      data.name,
      data.parent_id,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }

  async getAllUserFolders(
    userId: string
  ): Promise<Array<Folder & { pdfCount: number }>> {
    const { data: folders, error } = await this.supabaseClient
      .from("folders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new DatabaseError(error);
    }

    if (!folders || folders.length === 0) {
      return [];
    }

    // Get PDF counts for each folder
    const foldersWithCounts: Array<Folder & { pdfCount: number }> =
      await Promise.all(
        folders.map(async (folder) => {
          const { count } = await this.supabaseClient
            .from("pdfs")
            .select("*", { count: "exact", head: true })
            .eq("folder_id", folder.id);

          const folderEntity = new Folder(
            folder.id,
            folder.user_id,
            folder.name,
            folder.parent_id,
            new Date(folder.created_at),
            new Date(folder.updated_at)
          );

          return Object.assign(folderEntity, {
            pdfCount: count || 0,
          }) as Folder & { pdfCount: number };
        })
      );

    return foldersWithCounts;
  }

  async createFolder(folder: Folder): Promise<Folder> {
 
    console.log(`Creating folder ${folder}`);
    const { data, error } = await this.supabaseClient
      .from("folders")
      .insert({
        id: folder.getId(),
        name: folder.getName(),
        parent_id: folder.getParentId(),
        user_id: folder.getUserId(),
      })
      .select("*")
      .single();

    if (error) {
      this.logger.error(`Error creating folder: ${error.message}`);
      throw new DatabaseError(error);
    }

    return new Folder(
      data.id,
      data.user_id,
      data.name,
      data.parent_id,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }

  async updateFolder(folder: Folder): Promise<Folder> {
    const { data, error } = await this.supabaseClient
      .from("folders")
      .update({
        name: folder.getName(),
        parent_id: folder.getParentId(),
      })
      .eq("id", folder.getId())
      .eq("user_id", folder.getUserId())
      .select("*")
      .single();

    if (error) {
      throw new DatabaseError(error);
    }

    return new Folder(
      data.id,
      data.user_id,
      data.name,
      data.parent_id,
      new Date(data.created_at),
      new Date(data.updated_at)
    );
  }

  async deleteFolder(id: string, userId: string): Promise<void> {
    const { error } = await this.supabaseClient
      .from("folders")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      throw new DatabaseError(error);
    }
  }

  async folderNameExists(
    name: string,
    parentId: string | null,
    userId: string,
    excludeFolderId?: string
  ): Promise<boolean> {
    let query = this.supabaseClient
      .from("folders")
      .select("id")
      .eq("name", name.trim())
      .eq("user_id", userId);

    // Use isNull() for null comparisons, eq() for actual values
    if (parentId === null) {
      query = query.is("parent_id", null);
    } else {
      query = query.eq("parent_id", parentId);
    }

    if (excludeFolderId) {
      query = query.neq("id", excludeFolderId);
    }

    const { data, error } = await query.single();

    if (error && error.code === "PGRST116") {
      return false;
    }

    if (error) {
      throw new DatabaseError(error);
    }

    return !!data;
  }

  async getFolderDescendants(
    folderId: string
  ): Promise<Array<{ id: string }>> {
    // Use a recursive CTE to get all descendants
    const { data, error } = await this.supabaseClient.rpc(
      "get_folder_descendants",
      {
        folder_uuid: folderId,
      }
    );

    if (error) {
      throw new DatabaseError(error);
    }

    return data || [];
  }

  async movePdfsBetweenFolders(
    sourceFolderId: string,
    targetFolderId: string | null,
    userId: string
  ): Promise<void> {
    const { error } = await this.supabaseClient
      .from("pdfs")
      .update({ folder_id: targetFolderId || null })
      .eq("folder_id", sourceFolderId)
      .eq("user_id", userId);

    if (error) {
      throw new DatabaseError(error);
    }
  }

  async moveSubfoldersBetweenFolders(
    sourceFolderId: string,
    targetFolderId: string | null,
    userId: string
  ): Promise<void> {
    const { error } = await this.supabaseClient
      .from("folders")
      .update({ parent_id: targetFolderId || null })
      .eq("parent_id", sourceFolderId)
      .eq("user_id", userId);

    if (error) {
      throw new DatabaseError(error);
    }
  }
}
