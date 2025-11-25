import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getGoogleClassroomClient } from "@/lib/googleClient";
import { withErrorHandling } from "@/lib/utils/error-handling";

/**
 * GET /api/school-lms/google/submissions
 * Get student submissions for a specific assignment
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
    const courseWorkId = url.searchParams.get('courseWorkId');
    const studentId = url.searchParams.get('studentId'); // Optional: filter by specific student

    if (!courseId || !courseWorkId) {
      return NextResponse.json(
        { success: false, error: "Course ID and Course Work ID are required" },
        { status: 400 }
      );
    }

    // Get authenticated Google Classroom client
    const classroom = await getGoogleClassroomClient(userId);

    // Build request parameters
    const requestParams: any = {
      courseId: courseId,
      courseWorkId: courseWorkId,
      pageSize: 100,
    };

    // If specific student requested, add to params
    if (studentId) {
      requestParams.userId = studentId;
    }

    // Fetch student submissions
    const response = await classroom.courses.courseWork.studentSubmissions.list(requestParams);

    const submissions = response.data.studentSubmissions || [];

    // Format submissions for frontend
    const formattedSubmissions = submissions.map((submission) => ({
      id: submission.id,
      userId: submission.userId,
      courseId: submission.courseId,
      courseWorkId: submission.courseWorkId,
      courseWorkType: submission.courseWorkType,
      creationTime: submission.creationTime,
      updateTime: submission.updateTime,
      state: submission.state,
      late: submission.late,
      draftGrade: submission.draftGrade,
      assignedGrade: submission.assignedGrade,
      alternateLink: submission.alternateLink,
      submissionHistory: submission.submissionHistory?.map((history) => ({
        stateHistory: history.stateHistory,
        gradeHistory: history.gradeHistory,
      })) || [],
      assignmentSubmission: submission.assignmentSubmission ? {
        attachments: submission.assignmentSubmission.attachments?.map((attachment) => ({
          driveFile: attachment.driveFile ? {
            id: attachment.driveFile.id,
            title: attachment.driveFile.title,
            alternateLink: attachment.driveFile.alternateLink,
            thumbnailUrl: attachment.driveFile.thumbnailUrl,
          } : null,
          youTubeVideo: attachment.youTubeVideo ? {
            id: attachment.youTubeVideo.id,
            title: attachment.youTubeVideo.title,
            alternateLink: attachment.youTubeVideo.alternateLink,
            thumbnailUrl: attachment.youTubeVideo.thumbnailUrl,
          } : null,
          link: attachment.link ? {
            url: attachment.link.url,
            title: attachment.link.title,
            thumbnailUrl: attachment.link.thumbnailUrl,
          } : null,
          form: attachment.form ? {
            formUrl: attachment.form.formUrl,
            responseUrl: attachment.form.responseUrl,
            title: attachment.form.title,
            thumbnailUrl: attachment.form.thumbnailUrl,
          } : null,
        })) || [],
      } : null,
      shortAnswerSubmission: submission.shortAnswerSubmission ? {
        answer: submission.shortAnswerSubmission.answer,
      } : null,
      multipleChoiceSubmission: submission.multipleChoiceSubmission ? {
        answer: submission.multipleChoiceSubmission.answer,
      } : null,
    }));

    return NextResponse.json({
      success: true,
      data: {
        submissions: formattedSubmissions,
        totalCount: formattedSubmissions.length,
        courseId: courseId,
        courseWorkId: courseWorkId,
        studentId: studentId || null,
      },
    });

  } catch (error) {
    console.error("Error fetching Google Classroom submissions:", error);
    
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
            error: "Course or assignment not found." 
          },
          { status: 404 }
        );
      }
      if (error.message.includes('PERMISSION_DENIED')) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Permission denied. You may not have access to view submissions for this assignment." 
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch submissions from Google Classroom" 
      },
      { status: 500 }
    );
  }
});