import { createClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";
import { movePdfHandler } from "./handlers/movePdf";

interface MovePDFRequest {
  folderId: string | null;
}

interface MovePDFResponse {
  success: boolean;
  data?: any;
  message?: string;
}

// PATCH handler - Move PDF to folder
async function handlePATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<MovePDFResponse>> {
  const resolvedParams = await params;
  const pdfId = resolvedParams.id;

  // Parse request body
  const body: MovePDFRequest = await request.json();

  const supabase = createClient();

  // Move the PDF
  const updatedPDF = await movePdfHandler(supabase, pdfId, body.folderId);

  // Log successful move
  console.log(
    `✅ PDF moved successfully: ${pdfId} to folder ${
      body.folderId || "root"
    } for user ${userId}`
  );

  // Return success response
  const response: MovePDFResponse = {
    success: true,
    data: updatedPDF,
    message: "PDF moved successfully",
  };

  return NextResponse.json(response, { status: 200 });
}

// Export the wrapped handler
export const PATCH = withErrorHandling(handlePATCH, {
  endpoint: "/api/pdfs/[id]/move",
  method: "PATCH",
});
