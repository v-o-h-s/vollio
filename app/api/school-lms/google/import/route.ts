import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuthenticatedSupabaseClient } from "@/lib/supabaseClient";
import { getGoogleClassroomClient, getGoogleDriveClient } from "@/lib/googleClient";
import { withErrorHandling } from "@/lib/utils/server-error-handling";
import { generateStoragePath } from "@/lib/utils/supabase-helpers";

interface ImportRequest {
  courseId: string;
  contentType: "course" | "assignment" | "material";
  contentId: string;
}

/**
 * POST /api/school-lms/google/import
 * Import content from Google Classroom
 */
export const POST = withErrorHandling(async (request: NextRequest) => {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const body: ImportRequest = await request.json();
    const { courseId, contentType, contentId } = body;

    if (!courseId || !contentType || !contentId) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Get authenticated Google clients
    const classroomClient = await getGoogleClassroomClient(userId);
    const driveClient = await getGoogleDriveClient(userId);
    const supabase = await getAuthenticatedSupabaseClient();

    let importedItems: any[] = [];

    if (contentType === "course") {
      // Import entire course structure
      const course = await classroomClient.courses.get({ id: courseId });
      
      // Create a folder for the course
      const { data: folder, error: folderError } = await supabase
        .from("folders")
        .insert({
          user_id: userId,
          name: course.data.name || `Course ${courseId}`,
          description: course.data.description || null,
        })
        .select()
        .single();

      if (folderError) {
        throw new Error(`Failed to create course folder: ${folderError.message}`);
      }

      // Get course assignments
      const assignments = await classroomClient.courses.courseWork.list({
        courseId: courseId,
      });

      // Import materials from assignments
      if (assignments.data.courseWork) {
        for (const assignment of assignments.data.courseWork) {
          if (assignment.materials) {
            for (const material of assignment.materials) {
              if (material.driveFile?.driveFile?.id) {
                try {
                  const importedFile = await importDriveFile(
                    driveClient,
                    supabase,
                    userId,
                    material.driveFile.driveFile.id,
                    material.driveFile.driveFile.title || "Untitled",
                    folder.id
                  );
                  if (importedFile) {
                    importedItems.push(importedFile);
                  }
                } catch (error) {
                  console.error(`Failed to import file ${material.driveFile.driveFile.id}:`, error);
                  // Continue with other files
                }
              }
            }
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: `Course "${course.data.name}" imported successfully`,
        importedItems,
        folderId: folder.id,
      });

    } else if (contentType === "assignment") {
      // Import specific assignment materials
      const assignment = await classroomClient.courses.courseWork.get({
        courseId: courseId,
        id: contentId,
      });

      if (assignment.data.materials) {
        for (const material of assignment.data.materials) {
          if (material.driveFile?.driveFile?.id) {
            try {
              const importedFile = await importDriveFile(
                driveClient,
                supabase,
                userId,
                material.driveFile.driveFile.id,
                material.driveFile.driveFile.title || "Untitled",
                null // No specific folder for individual assignment import
              );
              if (importedFile) {
                importedItems.push(importedFile);
              }
            } catch (error) {
              console.error(`Failed to import file ${material.driveFile.driveFile.id}:`, error);
              // Continue with other files
            }
          }
        }
      }

      return NextResponse.json({
        success: true,
        message: `Assignment "${assignment.data.title}" materials imported successfully`,
        importedItems,
      });

    } else if (contentType === "material") {
      // Import specific material/file
      const importedFile = await importDriveFile(
        driveClient,
        supabase,
        userId,
        contentId,
        "Imported File",
        null
      );

      if (importedFile) {
        importedItems.push(importedFile);
      }

      return NextResponse.json({
        success: true,
        message: "Material imported successfully",
        importedItems,
      });
    }

    return NextResponse.json(
      { success: false, error: "Invalid content type" },
      { status: 400 }
    );

  } catch (error) {
    console.error("Error importing Google Classroom content:", error);
    
    if (error instanceof Error) {
      if (error.message.includes("OAuth")) {
        return NextResponse.json(
          { success: false, error: "Google Classroom connection expired. Please reconnect." },
          { status: 401 }
        );
      }
      
      if (error.message.includes("not found")) {
        return NextResponse.json(
          { success: false, error: "Content not found in Google Classroom" },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { success: false, error: "Failed to import content from Google Classroom" },
      { status: 500 }
    );
  }
});

/**
 * Helper function to import a file from Google Drive
 */
async function importDriveFile(
  driveClient: any,
  supabase: any,
  userId: string,
  fileId: string,
  fileName: string,
  folderId: string | null
): Promise<any | null> {
  try {
    // Get file metadata
    const fileMetadata = await driveClient.files.get({
      fileId: fileId,
      fields: "id,name,mimeType,size,createdTime,modifiedTime",
    });

    const file = fileMetadata.data;

    // Only import PDF files for now
    if (file.mimeType !== "application/pdf") {
      console.log(`Skipping non-PDF file: ${file.name} (${file.mimeType})`);
      return null;
    }

    // Download the file
    const fileContent = await driveClient.files.get({
      fileId: fileId,
      alt: "media",
    }, { responseType: "arraybuffer" });

    // Generate storage path
    const storagePath = generateStoragePath(userId, file.name || fileName);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("pdfs")
      .upload(storagePath, fileContent.data, {
        contentType: "application/pdf",
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Failed to upload file: ${uploadError.message}`);
    }

    // Save PDF record to database
    const { data: pdfRecord, error: dbError } = await supabase
      .from("pdfs")
      .insert({
        user_id: userId,
        filename: file.name || fileName,
        file_path: uploadData.path,
        file_size: parseInt(file.size) || 0,
        folder_id: folderId,
        source: "google_classroom",
        source_id: fileId,
      })
      .select()
      .single();

    if (dbError) {
      // Clean up uploaded file if database insert fails
      await supabase.storage.from("pdfs").remove([uploadData.path]);
      throw new Error(`Failed to save PDF record: ${dbError.message}`);
    }

    return {
      id: pdfRecord.id,
      filename: pdfRecord.filename,
      source: "google_classroom",
      sourceId: fileId,
    };

  } catch (error) {
    console.error(`Error importing file ${fileId}:`, error);
    throw error;
  }
}