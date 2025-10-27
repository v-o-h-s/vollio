import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuthenticatedSupabaseClient } from "@/lib/supabaseClient"; 
import { withErrorHandling } from "@/lib/utils/server-error-handling";

interface RenameRequest {
  filename: string;
}

export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { userId } =await auth();
  
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const pdfId = params.id;
  
  if (!pdfId) {
    return NextResponse.json({ error: "PDF ID is required" }, { status: 400 });
  }

  try {
    const body: RenameRequest = await request.json();
    const { filename } = body;

    if (!filename || !filename.trim()) {
      return NextResponse.json({ error: "Filename is required" }, { status: 400 });
    }

    // Validate filename
    const trimmedFilename = filename.trim();
    if (trimmedFilename.length > 255) {
      return NextResponse.json({ error: "Filename too long" }, { status: 400 });
    }

    // Check for invalid characters
    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(trimmedFilename)) {
      return NextResponse.json({ 
        error: "Filename contains invalid characters" 
      }, { status: 400 });
    }

    const supabase =await getAuthenticatedSupabaseClient();

    // Check if PDF exists and belongs to user
    const { data: existingPdf, error: fetchError } = await supabase
      .from("pdfs")
      .select("*")
      .eq("id", pdfId)
      .eq("user_id", userId)
      .single();

    if (fetchError || !existingPdf) {
      return NextResponse.json({ error: "PDF not found" }, { status: 404 });
    }

    // Check if filename already exists for this user
    const { data: duplicateCheck, error: duplicateError } = await supabase
      .from("pdfs")
      .select("id")
      .eq("user_id", userId)
      .eq("filename", trimmedFilename)
      .neq("id", pdfId)
      .single();

    if (duplicateCheck) {
      return NextResponse.json({ 
        error: "A PDF with this filename already exists" 
      }, { status: 409 });
    }

    // Update the PDF filename
    const { data: updatedPdf, error: updateError } = await supabase
      .from("pdfs")
      .update({ 
        filename: trimmedFilename,
        updated_at: new Date().toISOString()
      })
      .eq("id", pdfId)
      .eq("user_id", userId)
      .select()
      .single();

    if (updateError) {
      console.error("Error updating PDF filename:", updateError);
      return NextResponse.json({ 
        error: "Failed to rename PDF" 
      }, { status: 500 });
    }

    // Log activity
    try {
      await supabase
        .from("user_activities")
        .insert({
          user_id: userId,
          activity_type: "pdf_renamed",
          resource_type: "pdf",
          resource_id: pdfId,
          metadata: {
            old_filename: existingPdf.filename,
            new_filename: trimmedFilename
          }
        });
    } catch (activityError) {
      // Non-blocking - log but don't fail the request
      console.error("Failed to log rename activity:", activityError);
    }

    return NextResponse.json({
      success: true,
      pdf: {
        id: updatedPdf.id,
        filename: updatedPdf.filename,
        fileSize: updatedPdf.file_size,
        createdAt: updatedPdf.created_at,
        updatedAt: updatedPdf.updated_at
      }
    });

  } catch (error) {
    console.error("Error renaming PDF:", error);
    return NextResponse.json(
      { error: "Failed to rename PDF" },
      { status: 500 }
    );
  }
});