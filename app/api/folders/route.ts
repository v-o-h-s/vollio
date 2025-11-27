import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuthenticatedSupabaseClient } from "@/lib/supabaseClient";
import {
  AuthError,
  DatabaseError,
  GeneralError,
} from "@/lib/utils/error-handling";
import { Logger } from "@/lib/utils/logger";
import { withValidation } from "@/lib/wrappers/withValidation";
import { createFolderSchema } from "@/lib/dto/folder";
import { withErrorHandling } from "@/lib/wrappers/withErrorHandling";
interface Folder {
  id: string;
  user_id: string;
  name: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  pdf_count?: number;
}

interface CreateFolderRequest {
  name: string;
  parent_id?: string | null;
}

interface FoldersResponse {
  success: boolean;
  data: {
    folders: Folder[];
    totalCount: number;
  };
}

interface CreateFolderResponse {
  success: boolean;
  data: Folder;
}

/**
 * GET /api/folders - List user's folders with PDF counts
 */
async function handleGET(request: NextRequest) {
  const context = { operation: "fetch_user_folders" };

  Logger.info("📂 Fetching folders", {
    method: "GET",
    endpoint: "/api/folders",
  });

  const { userId } = await auth();
  if (!userId) {
    Logger.warn("🔐 Unauthorized access attempt to fetch folders");
    throw AuthError.authenticationRequired(
      "User must be authenticated to fetch folders",
      context
    );
  }

  Logger.info(`👤 Authenticated user: ${userId}`);

  const supabase = await getAuthenticatedSupabaseClient();

  const {
    data: folders,
    error,
    count,
  } = await supabase
    .from("folders")
    .select("*", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) {
    Logger.error(`Database error fetching folders for user ${userId}`, error);
    throw DatabaseError.mapSupabaseErrorCodeToDatabaseError(
      error.code,
      `Failed to fetch user folders: ${error.message}`,
      { ...context, userId }
    );
  }

  Logger.info(`✅ Fetched ${folders?.length || 0} folders for user ${userId}`);

  // Get PDF counts for each folder
  const foldersWithCounts = await Promise.all(
    (folders || []).map(async (folder: Folder) => {
      const { count: pdfCount } = await supabase
        .from("pdfs")
        .select("*", { count: "exact", head: true })
        .eq("folder_id", folder.id);

      return {
        ...folder,
        pdf_count: pdfCount || 0,
      };
    })
  );

  Logger.success(
    `📂 Successfully returned ${foldersWithCounts.length} folders with PDF counts`
  );
  const response: FoldersResponse = {
    success: true,
    data: {
      folders: foldersWithCounts,
      totalCount: count || 0,
    },
  };

  return NextResponse.json(response);
}

/**
 * POST /api/folders - Create a new folder
 */
async function handlePOST(request: NextRequest, body: CreateFolderRequest) {
  const context = { operation: "create_folder" };

  Logger.info("📂 Creating new folder", {
    method: "POST",
    endpoint: "/api/folders",
  });

  const { userId } = await auth();
  if (!userId) {
    Logger.warn("🔐 Unauthorized access attempt to create folder");
    throw AuthError.authenticationRequired(
      "User must be authenticated to create folders",
      context
    );
  }

  Logger.info(`👤 Authenticated user: ${userId}`);

  Logger.info(`📋 Request body received (already validated by Zod)`, {
    name: body.name,
    parent_id: body.parent_id,
  });

  const folderName = body.name.trim();
  const supabase = await getAuthenticatedSupabaseClient();

  // If parent_id provided, validate it exists and belongs to user
  if (body.parent_id) {
    Logger.info(`🔍 Validating parent folder`, { parent_id: body.parent_id });

    const { data: parentFolder, error: parentError } = await supabase
      .from("folders")
      .select("id")
      .eq("id", body.parent_id)
      .eq("user_id", userId)
      .single();

    if (parentError || !parentFolder) {
      Logger.warn(`❌ Parent folder validation failed`, {
        parent_id: body.parent_id,
        userId,
      });
      throw GeneralError.unknown(`Parent folder not found or access denied`, {
        ...context,
        userId,
        parent_id: body.parent_id,
      });
    }

    Logger.info(`✅ Parent folder validated`);
  }

  // Check for duplicate folder names in the same parent
  Logger.info(`🔍 Checking for duplicate folder names`, {
    folderName,
    parent_id: body.parent_id,
  });

  const { data: existingFolder, error: checkError } = await supabase
    .from("folders")
    .select("id")
    .eq("name", folderName)
    .eq("parent_id", body.parent_id || null)
    .eq("user_id", userId)
    .single();

  if (!checkError && existingFolder) {
    Logger.warn(`❌ Duplicate folder detected`, {
      folderName,
      parent_id: body.parent_id,
      userId,
    });
    throw GeneralError.unknown(
      `A folder with the name "${folderName}" already exists in this location`,
      { ...context, userId, folderName }
    );
  }

  Logger.info(`✅ No duplicates found, proceeding with folder creation`);

  // Create the folder
  Logger.info(`💾 Inserting folder into database`, { folderName, userId });

  const { data: folder, error } = await supabase
    .from("folders")
    .insert({
      user_id: userId,
      name: folderName,
      parent_id: body.parent_id || null,
    })
    .select("*")
    .single();

  if (error) {
    Logger.error(`Database error creating folder for user ${userId}`, error);
    throw DatabaseError.mapSupabaseErrorCodeToDatabaseError(
      error.code,
      `Failed to create folder: ${error.message}`,
      { ...context, userId, folderName }
    );
  }

  Logger.success(`📂 Folder created successfully`, {
    folderId: folder.id,
    folderName,
    userId,
  });
  const response: CreateFolderResponse = {
    success: true,
    data: folder,
  };

  return NextResponse.json(response);
}
export const GET = withErrorHandling(handleGET);
export const POST = withErrorHandling(
  withValidation(createFolderSchema, handlePOST)
);
