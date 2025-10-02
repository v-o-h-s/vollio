import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuthenticatedSupabaseClient } from "@/lib/supabaseClient";
import { withErrorHandling } from "@/lib/utils/server-error-handling";

export const PATCH = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  const { userId } = auth();
  
  if (!userId) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 }
    );
  }

  const { id } = params;
  const { folderId } = await request.json();

  const supabase = getAuthenticatedSupabaseClient();

  // Update the PDF's folder assignment
  const { data, error } = await supabase
    .from("pdfs")
    .update({ folder_id: folderId })
    .eq("id", id)
    .eq("user_id", userId) // Ensure user can only move their own PDFs
    .select()
    .single();

  if (error) {
    console.error("Error moving PDF:", error);
    return NextResponse.json(
      { error: "Failed to move PDF" },
      { status: 500 }
    );
  }

  return NextResponse.json({ 
    success: true, 
    pdf: data 
  });
});