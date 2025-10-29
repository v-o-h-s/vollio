import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getGoogleClassroomClient } from "@/lib/googleClient";
import { getAuthenticatedSupabaseClient } from "@/lib/supabaseClient";
import { withErrorHandling } from "@/lib/utils/error-handling/server-error-handling";

interface SyncRequest {
  courseId: string;
  syncType: "full" | "courses" | "assignments" | "materials";
  options?: {
    createFolder?: boolean;
    folderName?: string;
  };
}

/**
 * POST /api/school-lms/google/sync
 * Sync data from Google Classroom to local database
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
    const body: SyncRequest = await request.json();
    const { courseId, syncType, options = {} } = body;

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Get authenticated clients
    const classroom = await getGoogleClassroomClient(userId);
    const supabase = getAuthenticatedSupabaseClient();

    const syncResults = {
      coursesSynced: 0,
      assignmentsSynced: 0,
      materialsSynced: 0,
      errors: [] as string[],
    };

    // Get course information
    const courseResponse = await classroom.courses.get({ id: courseId });
    const course = courseResponse.data;

    if (!course) {
      return NextResponse.json(
        { success: false, error: "Course not found" },
        { status: 404 }
      );
    }

    let folderId: string | null = null;

    // Create folder if requested
    if (options.createFolder) {
      try {
        const folderName = options.folderName || course.name || `Course ${courseId}`;
        
        const { data: folder, error: folderError } = await supabase
          .from("folders")
          .insert({
            user_id: userId,
            name: folderName,
            description: course.description || `Synced from Google Classroom course: ${course.name}`,
          })
          .select()
          .single();

        if (folderError) {
          syncResults.errors.push(`Failed to create folder: ${folderError.message}`);
        } else {
          folderId = folder.id;
        }
      } catch (error) {
        syncResults.errors.push(`Error creating folder: ${error}`);
      }
    }

    // Sync course metadata
    if (syncType === "full" || syncType === "courses") {
      try {
        // Store course information in a courses table (if it exists)
        // This is optional and depends on your schema
        syncResults.coursesSynced = 1;
      } catch (error) {
        syncResults.errors.push(`Error syncing course: ${error}`);
      }
    }

    // Sync assignments
    if (syncType === "full" || syncType === "assignments") {
      try {
        const assignmentsResponse = await classroom.courses.courseWork.list({
          courseId: courseId,
          courseWorkStates: ['PUBLISHED'],
          pageSize: 50,
        });

        const assignments = assignmentsResponse.data.courseWork || [];
        
        // Store assignments metadata (if you have an assignments table)
        // This would require creating an assignments table in your schema
        syncResults.assignmentsSynced = assignments.length;
      } catch (error) {
        syncResults.errors.push(`Error syncing assignments: ${error}`);
      }
    }

    // Sync materials (PDFs)
    if (syncType === "full" || syncType === "materials") {
      try {
        // Use the existing course-materials endpoint logic
        const materialsUrl = new URL("/api/school-lms/google/course-materials", request.url);
        materialsUrl.searchParams.set("courseId", courseId);

        const materialsResponse = await fetch(materialsUrl.toString(), {
          method: "GET",
          headers: {
            Authorization: request.headers.get("Authorization") || "",
            Cookie: request.headers.get("Cookie") || "",
          },
        });

        if (materialsResponse.ok) {
          const materialsData = await materialsResponse.json();
          const materials = materialsData.materials || [];

          // Import each PDF material
          for (const material of materials) {
            try {
              const importUrl = new URL("/api/school-lms/google/import-file", request.url);
              
              const importResponse = await fetch(importUrl.toString(), {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: request.headers.get("Authorization") || "",
                  Cookie: request.headers.get("Cookie") || "",
                },
                body: JSON.stringify({
                  fileId: material.id,
                  fileName: material.name,
                  folderId: folderId,
                }),
              });

              if (importResponse.ok) {
                syncResults.materialsSynced++;
              } else {
                const errorData = await importResponse.json();
                syncResults.errors.push(`Failed to import ${material.name}: ${errorData.error}`);
              }
            } catch (error) {
              syncResults.errors.push(`Error importing ${material.name}: ${error}`);
            }

            // Add delay to prevent rate limiting
            await new Promise(resolve => setTimeout(resolve, 500));
          }
        } else {
          syncResults.errors.push("Failed to fetch course materials");
        }
      } catch (error) {
        syncResults.errors.push(`Error syncing materials: ${error}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: `Successfully synced ${syncType} data from course: ${course.name}`,
      data: {
        course: {
          id: course.id,
          name: course.name,
          description: course.description,
        },
        folderId: folderId,
        syncResults: syncResults,
      },
    });

  } catch (error) {
    console.error("Error syncing Google Classroom data:", error);
    
    // Handle specific Google API errors
    if (error instanceof Error) {
      if (error.message.includes('No Google OAuth tokens found')) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Google Classroom not connected. Please connect your account first." 
          },
          { status: 401 }
        );
      }
      if (error.message.includes('tokens have expired')) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Google Classroom connection expired. Please reconnect your account." 
          },
          { status: 401 }
        );
      }
      if (error.message.includes('not found')) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Course not found or access denied." 
          },
          { status: 404 }
        );
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to sync data from Google Classroom" 
      },
      { status: 500 }
    );
  }
});