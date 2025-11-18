import { NextRequest, NextResponse } from "next/server";
import { getAuthenticatedSupabaseClient } from "@/lib/supabaseClient";
import {
  withErrorHandling,
  extractRequestContext,
  createServerError,
  validateRequired,
} from "@/lib/utils/error-handling/errorHandling";
import { ErrorType } from "@/lib/utils/error-handling/errors";
import {
  requireAuthentication,
  validateAuthentication,
} from "@/lib/utils/auth-validation";
import { checkEnhancedRateLimit } from "@/lib/utils/security-validation";

interface Folder {
  id: string;
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
 * Fetches all user's folders with PDF counts
 */
async function fetchUserFolders(supabaseClient: any, userId: string) {
  const { data, error, count } = await supabaseClient
    .from("folders")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });

  if (error) {
    throw createServerError(
      ErrorType.DATABASE_ERROR,
      `Failed to fetch user folders: ${error.message}`,
      {
        operation: "fetch_user_folders",
        userId,
      },
      error
    );
  }

  // Get PDF counts for each folder
  const foldersWithCounts = await Promise.all(
    (data || []).map(async (folder: any) => {
      const { count: pdfCount } = await supabaseClient
        .from("pdfs")
        .select("*", { count: "exact", head: true })
        .eq("folder_id", folder.id);

      return {
        ...folder,
        pdf_count: pdfCount || 0,
      };
    })
  );

  return {
    folders: foldersWithCounts,
    totalCount: count || 0,
  };
}

/**
 * Creates a new folder
 */
async function createFolder(
  supabaseClient: any,
  userId: string,
  name: string,
  parent_id?: string | null
): Promise<Folder> {
  // Validate parent folder exists and belongs to user if provided
  if (parent_id) {
    const { data: parentFolder, error: parentError } = await supabaseClient
      .from("folders")
      .select("id")
      .eq("id", parent_id)
      .eq("user_id", userId)
      .single();

    if (parentError || !parentFolder) {
      throw createServerError(
        ErrorType.VALIDATION_ERROR,
        "Parent folder not found or access denied",
        { operation: "validate_parent_folder", userId }
      );
    }
  }

  const { data, error } = await supabaseClient
    .from("folders")
    .insert({
      user_id: userId,
      name: name.trim(),
      parent_id: parent_id || null,
    })
    .select("*")
    .single();

  if (error) {
    throw createServerError(
      ErrorType.DATABASE_ERROR,
      `Failed to create folder: ${error.message}`,
      {
        operation: "create_folder",
        userId,
        fileName: name,
      },
      error
    );
  }

  return {
    ...data,
    pdf_count: 0,
  };
}

// GET handler - Fetch all folders
async function handleGET(
  request: NextRequest
): Promise<NextResponse<FoldersResponse>> {
  const context = extractRequestContext(request, "/api/folders");

  // Enhanced authentication validation
  const authContext = await requireAuthentication(request, ["read"]);
  const userId = authContext.userId;

  // Additional validation check
  const authValidation = await validateAuthentication(request);
  if (authValidation.shouldRefresh) {
    console.warn(`⚠️ User ${userId} should refresh their authentication token`);
  }

  // Enhanced rate limiting for API calls
  checkEnhancedRateLimit(userId, "API_CALLS", { ...context, userId });

  // Get authenticated Supabase client with proper RLS
  const supabaseClient = await getAuthenticatedSupabaseClient();

  // Fetch user's folders
  const { folders, totalCount } = await fetchUserFolders(
    supabaseClient,
    userId
  );

  // Log successful request
  console.log(
    `✅ Folders fetched successfully for user ${userId}: ${folders.length} folders`
  );

  // Return success response
  const response: FoldersResponse = {
    success: true,
    data: {
      folders,
      totalCount,
    },
  };

  return NextResponse.json(response, { status: 200 });
}

// POST handler - Create new folder
async function handlePOST(
  request: NextRequest
): Promise<NextResponse<CreateFolderResponse>> {
  const context = extractRequestContext(request, "/api/folders");

  // Enhanced authentication validation
  const authContext = await requireAuthentication(request, ["write"]);
  const userId = authContext.userId;

  // Enhanced rate limiting for API calls
  checkEnhancedRateLimit(userId, "API_CALLS", { ...context, userId });

  // Parse request body
  const body: CreateFolderRequest = await request.json();

  // Validate required fields
  validateRequired(body.name, "name", { ...context, userId });

  // Validate folder name
  const folderName = body.name.trim();
  if (folderName.length === 0) {
    throw createServerError(
      ErrorType.VALIDATION_ERROR,
      "Folder name cannot be empty",
      { ...context, userId }
    );
  }

  if (folderName.length > 255) {
    throw createServerError(
      ErrorType.VALIDATION_ERROR,
      "Folder name is too long (max 255 characters)",
      { ...context, userId }
    );
  }

  // Get authenticated Supabase client
  const supabaseClient = await getAuthenticatedSupabaseClient();

  // Check for duplicate folder names in the same parent
  const { data: existingFolder } = await supabaseClient
    .from("folders")
    .select("id")
    .eq("name", folderName)
    .eq("parent_id", body.parent_id || null)
    .eq("user_id", userId)
    .single();

  if (existingFolder) {
    throw createServerError(
      ErrorType.VALIDATION_ERROR,
      "A folder with this name already exists in the same location",
      { ...context, userId, fileName: folderName }
    );
  }

  // Create the folder
  const folder = await createFolder(
    supabaseClient,
    userId,
    folderName,
    body.parent_id
  );

  // Log successful creation
  console.log(
    `✅ Folder created successfully: ${folderName} for user ${userId}`
  );

  // Return success response
  const response: CreateFolderResponse = {
    success: true,
    data: folder,
  };

  return NextResponse.json(response, { status: 201 });
}

// Export the wrapped handlers
export const GET = withErrorHandling(handleGET, {
  endpoint: "/api/folders",
  method: "GET",
});

export const POST = withErrorHandling(handlePOST, {
  endpoint: "/api/folders",
  method: "POST",
});
