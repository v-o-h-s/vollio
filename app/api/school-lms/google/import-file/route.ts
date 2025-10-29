import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getGoogleDriveClient } from "@/lib/googleClient";
import { getAuthenticatedSupabaseClient } from "@/lib/supabaseClient";
import { validateFile } from "@/lib/utils/supabase-helpers";

// Generate storage path for user's PDF
function generateStoragePath(userId: string, filename: string): string {
  const timestamp = Date.now();
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `${userId}/${timestamp}_${sanitizedFilename}`;
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { fileId, fileName, folderId } = body;

    if (!fileId || !fileName) {
      return NextResponse.json(
        { error: "File ID and name are required" },
        { status: 400 }
      );
    }

    // Get authenticated Google Drive client
    const drive = await getGoogleDriveClient(userId);

    // Download the file from Google Drive
    const fileResponse = await drive.files.get({
      fileId: fileId,
      alt: 'media',
    }, {
      responseType: 'arraybuffer',
    });

    const fileBuffer = Buffer.from(fileResponse.data as ArrayBuffer);

    // Create a File object for validation
    const file = new File([fileBuffer], fileName, {
      type: 'application/pdf',
    });

    // Validate the file
    const validation = validateFile(file);
    if (!validation.valid) {
      return NextResponse.json(
        { error: validation.error },
        { status: 400 }
      );
    }

    // Get Supabase client
    const supabase = await getAuthenticatedSupabaseClient();

    // Generate storage path
    const storagePath = generateStoragePath(userId, fileName);

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('pdfs')
      .upload(storagePath, fileBuffer, {
        contentType: 'application/pdf',
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      console.error('Supabase upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file to storage' },
        { status: 500 }
      );
    }

    // Save PDF metadata to database
    const { data: pdfData, error: dbError } = await supabase
      .from('pdfs')
      .insert({
        user_id: userId,
        filename: fileName,
        original_filename: fileName,
        file_size: fileBuffer.length,
        storage_path: storagePath,
        folder_id: folderId || null,
        source: 'google_classroom',
        source_file_id: fileId,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      
      // Clean up uploaded file
      await supabase.storage
        .from('pdfs')
        .remove([storagePath]);

      return NextResponse.json(
        { error: 'Failed to save file metadata' },
        { status: 500 }
      );
    }

    // Generate signed URL for immediate access
    const { data: signedUrlData } = await supabase.storage
      .from('pdfs')
      .createSignedUrl(storagePath, 60 * 30); // 30 minutes

    return NextResponse.json({
      success: true,
      pdf: {
        id: pdfData.id,
        filename: pdfData.filename,
        originalFilename: pdfData.original_filename,
        fileSize: pdfData.file_size,
        storagePath: pdfData.storage_path,
        folderId: pdfData.folder_id,
        source: pdfData.source,
        sourceFileId: pdfData.source_file_id,
        createdAt: pdfData.created_at,
        signedUrl: signedUrlData?.signedUrl,
      },
    });

  } catch (error) {
    console.error("Error importing file from Google Classroom:", error);
    
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
      { error: "Failed to import file from Google Classroom" },
      { status: 500 }
    );
  }
}