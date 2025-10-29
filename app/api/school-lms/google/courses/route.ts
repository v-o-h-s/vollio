import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getGoogleClassroomClient } from "@/lib/googleClient";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Get authenticated Google Classroom client
    const classroom = await getGoogleClassroomClient(userId);

    // Fetch courses
    const response = await classroom.courses.list({
      courseStates: ['ACTIVE'],
      pageSize: 50,
    });

    const courses = response.data.courses || [];

    // Format courses for frontend
    const formattedCourses = courses.map((course) => ({
      id: course.id,
      name: course.name,
      section: course.section,
      description: course.description,
      room: course.room,
      ownerId: course.ownerId,
      creationTime: course.creationTime,
      updateTime: course.updateTime,
      enrollmentCode: course.enrollmentCode,
      courseState: course.courseState,
      alternateLink: course.alternateLink,
    }));

    return NextResponse.json({
      courses: formattedCourses,
      totalCount: formattedCourses.length,
    });

  } catch (error) {
    console.error("Error fetching Google Classroom courses:", error);
    
    // Handle specific Google API errors
    if (error instanceof Error) {
      if (error.message.includes('No Google OAuth tokens found')) {
        return NextResponse.json(
          { error: "Google Classroom not connected. Please connect your account first." },
          { status: 401 }
        );
      }
      if (error.message.includes('tokens have expired')) {
        return NextResponse.json(
          { error: "Google Classroom connection expired. Please reconnect your account." },
          { status: 401 }
        );
      }
    }

    return NextResponse.json(
      { error: "Failed to fetch courses from Google Classroom" },
      { status: 500 }
    );
  }
}