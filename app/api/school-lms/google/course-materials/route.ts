import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getGoogleClassroomClient, getGoogleDriveClient } from "@/lib/googleClient";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const url = new URL(request.url);
    const courseId = url.searchParams.get('courseId');

    if (!courseId) {
      return NextResponse.json(
        { error: "Course ID is required" },
        { status: 400 }
      );
    }

    // Get authenticated clients
    const classroom = await getGoogleClassroomClient(userId);
    const drive = await getGoogleDriveClient(userId);

    // Fetch course work (assignments)
    const courseWorkResponse = await classroom.courses.courseWork.list({
      courseId: courseId,
      pageSize: 50,
    });

    const courseWork = courseWorkResponse.data.courseWork || [];
    const materials: any[] = [];

    // Extract materials from course work
    for (const work of courseWork) {
      if (work.materials) {
        for (const material of work.materials) {
          // Handle Drive files
          if (material.driveFile?.driveFile) {
            const driveFile = material.driveFile.driveFile;
            
            // Get file details from Drive API
            try {
              const fileDetails = await drive.files.get({
                fileId: driveFile.id!,
                fields: 'id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink',
              });

              // Only include PDF files
              if (fileDetails.data.mimeType === 'application/pdf') {
                materials.push({
                  id: driveFile.id,
                  name: fileDetails.data.name,
                  mimeType: fileDetails.data.mimeType,
                  size: fileDetails.data.size,
                  createdTime: fileDetails.data.createdTime,
                  modifiedTime: fileDetails.data.modifiedTime,
                  webViewLink: fileDetails.data.webViewLink,
                  webContentLink: fileDetails.data.webContentLink,
                  thumbnailLink: fileDetails.data.thumbnailLink,
                  source: 'drive',
                  courseWorkTitle: work.title,
                  courseWorkId: work.id,
                });
              }
            } catch (fileError) {
              console.warn(`Failed to get details for file ${driveFile.id}:`, fileError);
            }
          }

          // Handle YouTube videos (for reference, but we won't import these)
          if (material.youtubeVideo) {
            // Skip YouTube videos as they're not PDFs
            continue;
          }

          // Handle links (for reference, but we won't import these)
          if (material.link) {
            // Skip links as they're not PDFs
            continue;
          }
        }
      }
    }

    // Also check course materials (not just assignments)
    try {
      const materialsResponse = await classroom.courses.materials.list({
        courseId: courseId,
        pageSize: 50,
      });

      const courseMaterials = materialsResponse.data.material || [];

      for (const material of courseMaterials) {
        if (material.driveFile?.driveFile) {
          const driveFile = material.driveFile.driveFile;
          
          try {
            const fileDetails = await drive.files.get({
              fileId: driveFile.id!,
              fields: 'id,name,mimeType,size,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink',
            });

            // Only include PDF files
            if (fileDetails.data.mimeType === 'application/pdf') {
              materials.push({
                id: driveFile.id,
                name: fileDetails.data.name,
                mimeType: fileDetails.data.mimeType,
                size: fileDetails.data.size,
                createdTime: fileDetails.data.createdTime,
                modifiedTime: fileDetails.data.modifiedTime,
                webViewLink: fileDetails.data.webViewLink,
                webContentLink: fileDetails.data.webContentLink,
                thumbnailLink: fileDetails.data.thumbnailLink,
                source: 'drive',
                courseWorkTitle: 'Course Material',
                courseWorkId: null,
              });
            }
          } catch (fileError) {
            console.warn(`Failed to get details for course material file ${driveFile.id}:`, fileError);
          }
        }
      }
    } catch (materialsError) {
      console.warn('Failed to fetch course materials:', materialsError);
    }

    // Remove duplicates based on file ID
    const uniqueMaterials = materials.filter((material, index, self) =>
      index === self.findIndex((m) => m.id === material.id)
    );

    return NextResponse.json({
      materials: uniqueMaterials,
      totalCount: uniqueMaterials.length,
      courseId: courseId,
    });

  } catch (error) {
    console.error("Error fetching Google Classroom course materials:", error);
    
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
      { error: "Failed to fetch course materials from Google Classroom" },
      { status: 500 }
    );
  }
}