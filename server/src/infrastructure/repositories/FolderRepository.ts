import { SupabaseClient } from "@supabase/supabase-js";
import { IFolderRepository } from "../../domain/repositories/IFolderRepository";
import { DatabaseError } from "../../shared/errors/DatabaseError";

export class FolderRepository implements IFolderRepository {
    private supabaseClient: SupabaseClient;

    constructor(supabaseClient: SupabaseClient) {
        this.supabaseClient = supabaseClient;
    }

    async getFolderById(id: string, userId: string): Promise<{ id: string; name: string; parentId: string | null } | null> {
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
    async createFolder(name: string, userId: string, parentId?: string): Promise<void> {
        const { error } = await this.supabaseClient.from("folders").insert({
            name,
            user_id: userId,
            parent_id: parentId || null,
        });

        if (error) {
            throw new DatabaseError(error);
        }
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
}
