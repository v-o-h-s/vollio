import { SupabaseClient } from "@supabase/supabase-js";
import { IFolderRepository } from "../../domain/repositories/IFolderRepository";
import { Folder } from "../../domain/entities/Folder";
import { DatabaseError } from "../../shared/errors/DatabaseError";
import type { FastifyBaseLogger } from "fastify";
export class FolderRepository implements IFolderRepository {
  constructor(
    private supabaseClient: SupabaseClient,
    private logger: FastifyBaseLogger
  ) {}

  async getFolderById(
    id: string,
    userId: string
  ): Promise<{ id: string; name: string; parentId: string | null } | null> {
    this.logger.info({ folderId: id, userId }, "Getting folder by ID");
    const { data, error } = await this.supabaseClient
      .from("folders")
      .select("id, name, parent_id")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        this.logger.info({ folderId: id, userId }, "Folder not found");
        return null;
      }
      this.logger.error(
        { error, folderId: id, userId },
        "Error getting folder by ID"
      );
      throw new DatabaseError(error);
    }

    this.logger.info({ folderId: id }, "Folder found");
    return {
      id: data.id,
      name: data.name,
      parentId: data.parent_id,
    };
  }

  async getFolderEntity(id: string, userId: string): Promise<Folder | null> {
    this.logger.info({ folderId: id, userId }, "Getting folder entity");
    const { data, error } = await this.supabaseClient
      .from("folders")
      .select("*")
      .eq("id", id)
      .eq("user_id", userId)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        this.logger.info({ folderId: id, userId }, "Folder entity not found");
        return null;
      }
      this.logger.error(
        { error, folderId: id, userId },
        "Error getting folder entity"
      );
      throw new DatabaseError(error);
    }

    this.logger.info({ folderId: id }, "Folder entity found");
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
  ): Promise<Array<Folder & { documentCount: number }>> {
    this.logger.info({ userId }, "Getting all user folders");
    const { data: folders, error } = await this.supabaseClient
      .from("folders")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      this.logger.error({ error, userId }, "Error getting all user folders");
      throw new DatabaseError(error);
    }

    if (!folders || folders.length === 0) {
      this.logger.info({ userId }, "No folders found for user");
      return [];
    }

    // Get Document counts for each folder
    const foldersWithCounts: Array<Folder & { documentCount: number }> =
      await Promise.all(
        folders.map(async (folder: any) => {
          const { count } = await this.supabaseClient
            .from("documents")
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
            documentCount: count || 0,
          }) as Folder & { documentCount: number };
        })
      );

    this.logger.info(
      { userId, count: foldersWithCounts.length },
      "Retrieved all user folders"
    );
    return foldersWithCounts;
  }

  async createFolder(folder: Folder): Promise<Folder> {
    this.logger.info(
      { folderName: folder.getName(), userId: folder.getUserId() },
      "Creating folder"
    );
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
      this.logger.error(
        { error, folderName: folder.getName() },
        "Error creating folder"
      );
      throw new DatabaseError(error);
    }

    this.logger.info({ folderId: data.id }, "Folder created successfully");
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
    this.logger.info({ folderId: folder.getId() }, "Updating folder");
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
      this.logger.error(
        { error, folderId: folder.getId() },
        "Error updating folder"
      );
      throw new DatabaseError(error);
    }

    this.logger.info(
      { folderId: folder.getId() },
      "Folder updated successfully"
    );
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
    this.logger.info({ folderId: id, userId }, "Deleting folder");
    const { error } = await this.supabaseClient
      .from("folders")
      .delete()
      .eq("id", id)
      .eq("user_id", userId);

    if (error) {
      this.logger.error(
        { error, folderId: id, userId },
        "Error deleting folder"
      );
      throw new DatabaseError(error);
    }
    this.logger.info({ folderId: id }, "Folder deleted successfully");
  }

  async folderNameExists(
    name: string,
    parentId: string | null,
    userId: string,
    excludeFolderId?: string
  ): Promise<boolean> {
    this.logger.info(
      { name, parentId, userId },
      "Checking if folder name exists"
    );
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
      this.logger.error(
        { error, name, userId },
        "Error checking folder name existence"
      );
      throw new DatabaseError(error);
    }

    return !!data;
  }

  async getFolderDescendants(folderId: string): Promise<Array<{ id: string }>> {
    this.logger.info({ folderId }, "Getting folder descendants");
    const { data, error } = await this.supabaseClient.rpc(
      "get_folder_descendants",
      {
        folder_uuid: folderId,
      }
    );

    if (error) {
      this.logger.error(
        { error, folderId },
        "Error getting folder descendants"
      );
      throw new DatabaseError(error);
    }

    return data || [];
  }

  async movePdfsBetweenFolders(
    sourceFolderId: string,
    targetFolderId: string | null,
    userId: string
  ): Promise<void> {
    this.logger.info(
      { sourceFolderId, targetFolderId, userId },
      "Moving Documents between folders"
    );
    const { error } = await this.supabaseClient
      .from("documents")
      .update({ folder_id: targetFolderId || null })
      .eq("folder_id", sourceFolderId)
      .eq("user_id", userId);

    if (error) {
      this.logger.error(
        { error, sourceFolderId, targetFolderId },
        "Error moving Documents between folders"
      );
      throw new DatabaseError(error);
    }
  }

  async moveSubfoldersBetweenFolders(
    sourceFolderId: string,
    targetFolderId: string | null,
    userId: string
  ): Promise<void> {
    this.logger.info(
      { sourceFolderId, targetFolderId, userId },
      "Moving subfolders between folders"
    );
    const { error } = await this.supabaseClient
      .from("folders")
      .update({ parent_id: targetFolderId || null })
      .eq("parent_id", sourceFolderId)
      .eq("user_id", userId);

    if (error) {
      this.logger.error(
        { error, sourceFolderId, targetFolderId },
        "Error moving subfolders between folders"
      );
      throw new DatabaseError(error);
    }
  }
}
