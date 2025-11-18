import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getGoogleClassroomClient } from "@/lib/googleClient";
import { withErrorHandling } from "@/lib/utils/error-handling";

/**
 * GET /api/school-lms/google/students
 * Get students from a specific Google Classroom course
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

    // Fetch students
    const studentsResponse = await classroom.courses.students.list({
      courseId: courseId,
      pageSize: 100,
    });

    const students = studentsResponse.data.students || [];

    // Fetch teachers for context
    const teachersResponse = await classroom.courses.teachers.list({
      courseId: courseId,
      pageSize: 50,
    });

    const teachers = teachersResponse.data.teachers || [];

    // Format students for frontend
    const formattedStudents = students.map((student) => ({
      userId: student.userId,
      courseId: student.courseId,
      profile: {
        id: student.profile?.id,
        name: student.profile?.name?.fullName,
        givenName: student.profile?.name?.givenName,
        familyName: student.profile?.name?.familyName,
        emailAddress: student.profile?.emailAddress,
        photoUrl: student.profile?.photoUrl,
      },
    }));

    // Format teachers for frontend
    const formattedTeachers = teachers.map((teacher) => ({
      userId: teacher.userId,
      courseId: teacher.courseId,
      profile: {
        id: teacher.profile?.id,
        name: teacher.profile?.name?.fullName,
        givenName: teacher.profile?.name?.givenName,
        familyName: teacher.profile?.name?.familyName,
        emailAddress: teacher.profile?.emailAddress,
        photoUrl: teacher.profile?.photoUrl,
      },
    }));

    return NextResponse.json({
      success: true,
      data: {
        students: formattedStudents,
        teachers: formattedTeachers,
        totalStudents: formattedStudents.length,
        totalTeachers: formattedTeachers.length,
        courseId: courseId,
      },
    });

  } catch (error) {
    console.error("Error fetching Google Classroom students:", error);
    
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
      if (error.message.includes('PERMISSION_DENIED')) {
        return NextResponse.json(
          { 
            success: false, 
            error: "Permission denied. You may not have access to view students in this course." 
          },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch students from Google Classroom" 
      },
      { status: 500 }
    );
  }
});