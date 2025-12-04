import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSupabaseClient } from "@/supabase";
import {
  withErrorHandling,
  extractRequestContext,
  createServerError,
  ServerErrorType,
} from "@/lib/error-handling";
import { requireAuthentication } from "@/lib/utils/auth-validation";
import { checkEnhancedRateLimit } from "@/lib/utils/security-validation";

interface UpdateFolderRequest {
  name?: string;
  parent_id?: string | null;
}

interface FolderResponse {
  success: boolean;
  data?: any;
  message?: string;
}

/**
 * Updates a folder's name or parent
 */
async function updateFolder(
  supabaseClient: any,
  userId: string,
  folderId: string,
  updates: UpdateFolderRequest
): Promise<any> {
  // Validate folder exists and belongs to user
  const { data: existingFolder, error: fetchError } = await supabaseClient
    .from("folders")
    .select("*")
    .eq("id", folderId)
    .eq("user_id", userId)
    .single();

  if (fetchError || !existingFolder) {
    throw createServerError(
      ServerErrorType.AUTHORIZATION_ERROR,
      "Folder not found or access denied",
      { operation: "validate_folder", userId }
    );
  }

  // Validate parent folder if provided
  if (updates.parent_id && updates.parent_id !== existingFolder.parent_id) {
    // Check parent exists and belongs to user
    const { data: parentFolder, error: parentError } = await supabaseClient
      .from("folders")
      .select("id")
      .eq("id", updates.parent_id)
      .eq("user_id", userId)
      .single();

    if (parentError || !parentFolder) {
      throw createServerError(
        ServerErrorType.VALIDATION_ERROR,
        "Parent folder not found or access denied",
        { operation: "validate_parent_folder", userId }
      );
    }

    // Prevent circular references
    if (updates.parent_id === folderId) {
      throw createServerError(
        ServerErrorType.VALIDATION_ERROR,
        "A folder cannot be its own parent",
        { operation: "validate_circular_reference", userId }
      );
    }

    // Check if moving to a descendant (would create circular reference)
    const { data: descendants } = await supabaseClient.rpc(
      "get_folder_descendants",
      { folder_uuid: folderId }
    );

    if (
      descendants &&
      descendants.some((d: any) => d.id === updates.parent_id)
    ) {
      throw createServerError(
        ServerErrorType.VALIDATION_ERROR,
        "Cannot move folder to one of its descendants",
        { operation: "validate_circular_reference", userId }
      );
    }
  }

  // Check for duplicate names if name is being updated
  if (updates.name && updates.name !== existingFolder.name) {
    const { data: duplicateFolder } = await supabaseClient
      .from("folders")
      .select("id")
      .eq("name", updates.name.trim())
      .eq(
        "parent_id",
        updates.parent_id !== undefined
          ? updates.parent_id
          : existingFolder.parent_id
      )
      .eq("user_id", userId)
      .neq("id", folderId)
      .single();

    if (duplicateFolder) {
      throw createServerError(
        ServerErrorType.VALIDATION_ERROR,
        "A folder with this name already exists in the same location",
        { operation: "validate_duplicate_name", userId }
      );
    }
  }

  // Prepare update data
  const updateData: any = {};
  if (updates.name !== undefined) {
    updateData.name = updates.name.trim();
  }
  if (updates.parent_id !== undefined) {
    updateData.parent_id = updates.parent_id;
  }

  // Update the folder
  const { data, error } = await supabaseClient
    .from("folders")
    .update(updateData)
    .eq("id", folderId)
    .eq("user_id", userId)
    .select("*")
    .single();

  if (error) {
    throw createServerError(
      ServerErrorType.DATABASE_ERROR,
      `Failed to update folder: ${error.message}`,
      {
        operation: "update_folder",
        userId,
      },
      error
    );
  }

  return data;
}

/**
 * Deletes a folder and optionally moves its contents
 */
async function deleteFolder(
  supabaseClient: any,
  userId: string,
  folderId: string,
  moveContentsTo?: string | null
): Promise<void> {
  // Validate folder exists and belongs to user
  const { data: existingFolder, error: fetchError } = await supabaseClient
    .from("folders")
    .select("*")
    .eq("id", folderId)
    .eq("user_id", userId)
    .single();

  if (fetchError || !existingFolder) {
    throw createServerError(
      ServerErrorType.AUTHORIZATION_ERROR,
      "Folder not found or access denied",
      { operation: "validate_folder", userId }
    );
  }

  // If moveContentsTo is specified, validate the target folder
  if (moveContentsTo) {
    const { data: targetFolder, error: targetError } = await supabaseClient
      .from("folders")
      .select("id")
      .eq("id", moveContentsTo)
      .eq("user_id", userId)
      .single();

    if (targetError || !targetFolder) {
      throw createServerError(
        ServerErrorType.VALIDATION_ERROR,
        "Target folder not found or access denied",
        { operation: "validate_target_folder", userId }
      );
    }
  }

  // Move PDFs to target folder or root
  const { error: movePDFsError } = await supabaseClient
    .from("pdfs")
    .update({ folder_id: moveContentsTo || null })
    .eq("folder_id", folderId)
    .eq("user_id", userId);

  if (movePDFsError) {
    throw createServerError(
      ServerErrorType.DATABASE_ERROR,
      `Failed to move PDFs: ${movePDFsError.message}`,
      { operation: "move_pdfs", userId },
      movePDFsError
    );
  }

  // Move subfolders to target folder or root
  const { error: moveSubfoldersError } = await supabaseClient
    .from("folders")
    .update({ parent_id: moveContentsTo || null })
    .eq("parent_id", folderId)
    .eq("user_id", userId);

  if (moveSubfoldersError) {
    throw createServerError(
      ServerErrorType.DATABASE_ERROR,
      `Failed to move subfolders: ${moveSubfoldersError.message}`,
      { operation: "move_subfolders", userId },
      moveSubfoldersError
    );
  }

  // Delete the folder
  const { error: deleteError } = await supabaseClient
    .from("folders")
    .delete()
    .eq("id", folderId)
    .eq("user_id", userId);

  if (deleteError) {
    throw createServerError(
      ServerErrorType.DATABASE_ERROR,
      `Failed to delete folder: ${deleteError.message}`,
      { operation: "delete_folder", userId },
      deleteError
    );
  }
}

// PUT handler - Update folder
async function handlePUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<FolderResponse>> {
  const resolvedParams = await params;
  const folderId = resolvedParams.id;
  const context = extractRequestContext(request, `/api/folders/${folderId}`);

  // Enhanced authentication validation
  const authContext = await requireAuthentication(request, ["write"]);
  const userId = authContext.userId;

  // Validate folder ID
  if (!folderId || folderId === "undefined" || folderId === "null") {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      "Invalid folder ID provided",
      { ...context, userId, folderId }
    );
  }

  // Enhanced rate limiting for API calls
  checkEnhancedRateLimit(userId, "API_CALLS", { ...context, userId });

  // Parse request body
  const body: UpdateFolderRequest = await request.json();

  // Validate at least one field is provided
  if (!body.name && body.parent_id === undefined) {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      "At least one field (name or parent_id) must be provided",
      { ...context, userId }
    );
  }

  // Validate folder name if provided
  if (body.name !== undefined) {
    const folderName = body.name.trim();
    if (folderName.length === 0) {
      throw createServerError(
        ServerErrorType.VALIDATION_ERROR,
        "Folder name cannot be empty",
        { ...context, userId }
      );
    }

    if (folderName.length > 255) {
      throw createServerError(
        ServerErrorType.VALIDATION_ERROR,
        "Folder name is too long (max 255 characters)",
        { ...context, userId }
      );
    }
  }

  // Get authenticated Supabase client
  const supabaseClient = await getAuthenticatedSupabaseClient();

  // Update the folder
  const updatedFolder = await updateFolder(
    supabaseClient,
    userId,
    folderId,
    body
  );

  // Log successful update
  console.log(`✅ Folder updated successfully: ${folderId} for user ${userId}`);

  // Return success response
  const response: FolderResponse = {
    success: true,
    data: updatedFolder,
  };

  return NextResponse.json(response, { status: 200 });
}

// DELETE handler - Delete folder
async function handleDELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<FolderResponse>> {
  const resolvedParams = await params;
  const folderId = resolvedParams.id;
  const context = extractRequestContext(request, `/api/folders/${folderId}`);

  // Enhanced authentication validation
  const authContext = await requireAuthentication(request, ["delete"]);
  const userId = authContext.userId;

  // Validate folder ID
  if (!folderId || folderId === "undefined" || folderId === "null") {
    throw createServerError(
      ServerErrorType.VALIDATION_ERROR,
      "Invalid folder ID provided",
      { ...context, userId, folderId }
    );
  }

  // Log the deletion attempt
  console.log(
    `🗑️ Attempting to delete folder: ${folderId} for user: ${userId}`
  );

  // Enhanced rate limiting for API calls
  checkEnhancedRateLimit(userId, "API_CALLS", { ...context, userId });

  // Parse query parameters
  const url = new URL(request.url);
  const moveContentsTo = url.searchParams.get("moveContentsTo");

  // Get authenticated Supabase client
  const supabaseClient = await getAuthenticatedSupabaseClient();

  // Delete the folder
  await deleteFolder(supabaseClient, userId, folderId, moveContentsTo);

  // Log successful deletion
  console.log(`✅ Folder deleted successfully: ${folderId} for user ${userId}`);

  // Return success response
  const response: FolderResponse = {
    success: true,
    message: "Folder deleted successfully",
  };

  return NextResponse.json(response, { status: 200 });
}

// Export the wrapped handlers
export const PUT = withErrorHandling(handlePUT, {
  endpoint: "/api/folders/[id]",
  method: "PUT",
});

export const DELETE = withErrorHandling(handleDELETE, {
  endpoint: "/api/folders/[id]",
  method: "DELETE",
});
