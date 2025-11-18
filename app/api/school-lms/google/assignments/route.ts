import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getGoogleClassroomClient } from "@/lib/googleClient";
import { withErrorHandling } from "@/lib/utils/error-handling/errorHandling";

/**
 * GET /api/school-lms/google/assignments
 * Get assignments from a specific Google Classroom course
 */
export const GET = withErrorHandling(async (request: NextRequest) => {
  const { userId } = await auth();

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "Authentication required" },
      { status: 401 }
    );
  }

  try {
    const url = new URL(request.url);
    const courseId = url.searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json(
        { success: false, error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Get authenticated Google Classroom client
    const classroom = await getGoogleClassroomClient(userId);

    // Fetch course work (assignments)
    const response = await classroom.courses.courseWork.list({
      courseId: courseId,
      courseWorkStates: ['PUBLISHED'],
      pageSize: 50,
    });

    const assignments = response.data.courseWork || [];

    // Format assignments for frontend
    const formattedAssignments = assignments.map((assignment) => ({
      id: assignment.id,
      title: assignment.title,
      description: assignment.description,
      state: assignment.state,
      alternateLink: assignment.alternateLink,
      creationTime: assignment.creationTime,
      updateTime: assignment.updateTime,
      dueDate: assignment.dueDate,
      dueTime: assignment.dueTime,
      maxPoints: assignment.maxPoints,
      workType: assignment.workType,
      submissionModificationMode: assignment.submissionModificationMode,
      materials: assignment.materials?.map((material) => ({
        driveFile: material.driveFile ? {
          id: material.driveFile.driveFile?.id,
          title: material.driveFile.driveFile?.title,
          alternateLink: material.driveFile.driveFile?.alternateLink,
          thumbnailUrl: material.driveFile.driveFile?.thumbnailUrl,
        } : null,
        youtubeVideo: material.youtubeVideo ? {
          id: material.youtubeVideo.id,
          title: material.youtubeVideo.title,
          alternateLink: material.youtubeVideo.alternateLink,
          thumbnailUrl: material.youtubeVideo.thumbnailUrl,
        } : null,
        link: material.link ? {
          url: material.link.url,
          title: material.link.title,
          thumbnailUrl: material.link.thumbnailUrl,
        } : null,
        form: material.form ? {
          formUrl: material.form.formUrl,
          responseUrl: material.form.responseUrl,
          title: material.form.title,
          thumbnailUrl: material.form.thumbnailUrl,
        } : null,
      })) || [],
    }));

    return NextResponse.json({
      success: true,
      data: {
        assignments: formattedAssignments,
        totalCount: formattedAssignments.length,
        courseId: courseId,
      },
    });

  } catch (error) {
    console.error("Error fetching Google Classroom assignments:", error);
    
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
        error: "Failed to fetch assignments from Google Classroom" 
      },
      { status: 500 }
    );
  }
});