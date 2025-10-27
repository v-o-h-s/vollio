import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { getAuthenticatedSupabaseClient } from "@/lib/supabaseClient";
import { withErrorHandling } from "@/lib/utils/server-error-handling";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";

export const GET = withErrorHandling(
  async (request: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const resolvedParams = await params;
    const pdfId = resolvedParams.id;

    if (!pdfId) {
      return NextResponse.json(
        { error: "PDF ID is required" },
        { status: 400 }
      );
    }

    try {
      const supabase = await getAuthenticatedSupabaseClient();

      // Get PDF metadata
      const { data: pdfData, error: pdfError } = await supabase
        .from("pdfs")
        .select("*")
        .eq("id", pdfId)
        .eq("user_id", userId)
        .single();

      if (pdfError || !pdfData) {
        return NextResponse.json({ error: "PDF not found" }, { status: 404 });
      }

      // Get signed URL for the PDF file
      const { data: signedUrlData, error: urlError } = await supabase.storage
        .from("pdfs")
        .createSignedUrl(pdfData.storage_path, 3600); // 1 hour expiry

      if (urlError || !signedUrlData?.signedUrl) {
        return NextResponse.json(
          { error: "Failed to access PDF file" },
          { status: 500 }
        );
      }

      // Fetch the PDF file
      const pdfResponse = await fetch(signedUrlData.signedUrl);
      if (!pdfResponse.ok) {
        return NextResponse.json(
          { error: "Failed to fetch PDF file" },
          { status: 500 }
        );
      }

      const pdfBuffer = await pdfResponse.arrayBuffer();

      // Generate thumbnail using pdf-lib and sharp
      const thumbnail = await generatePDFThumbnail(new Uint8Array(pdfBuffer));

      return new NextResponse(thumbnail, {
        status: 200,
        headers: {
          "Content-Type": "image/jpeg",
          "Cache-Control": "public, max-age=86400", // Cache for 24 hours
          "Content-Disposition": `inline; filename="thumbnail-${pdfId}.jpg"`,
        },
      });
    } catch (error) {
      console.error("Error generating PDF thumbnail:", error);
      return NextResponse.json(
        { error: "Failed to generate thumbnail" },
        { status: 500 }
      );
    }
  }
);

async function generatePDFThumbnail(pdfBuffer: Uint8Array): Promise<Buffer> {
  try {
    // Load PDF document
    const pdfDoc = await PDFDocument.load(pdfBuffer);
    const pages = pdfDoc.getPages();

    if (pages.length === 0) {
      throw new Error("PDF has no pages");
    }

    // Get first page
    const firstPage = pages[0];
    const { width, height } = firstPage.getSize();

    // Create a new PDF with just the first page for rendering
    const singlePageDoc = await PDFDocument.create();
    const [copiedPage] = await singlePageDoc.copyPages(pdfDoc, [0]);
    singlePageDoc.addPage(copiedPage);

    // Convert to bytes
    const singlePageBytes = await singlePageDoc.save();

    // For now, we'll create a simple placeholder thumbnail
    // In a production environment, you'd want to use a proper PDF-to-image library
    // like pdf2pic, pdf-poppler, or similar
    const thumbnailBuffer = await createPlaceholderThumbnail(width, height);

    return thumbnailBuffer;
  } catch (error) {
    console.error("Error in generatePDFThumbnail:", error);
    // Return a default placeholder thumbnail
    return createDefaultThumbnail();
  }
}

async function createPlaceholderThumbnail(
  width: number,
  height: number
): Promise<Buffer> {
  // Create a simple placeholder thumbnail using Sharp
  const aspectRatio = width / height;
  const thumbnailWidth = 200;
  const thumbnailHeight = Math.round(thumbnailWidth / aspectRatio);

  const svg = `
    <svg width="${thumbnailWidth}" height="${thumbnailHeight}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f8f9fa"/>
      <rect x="10%" y="15%" width="80%" height="8%" fill="#e9ecef" rx="2"/>
      <rect x="10%" y="28%" width="60%" height="6%" fill="#e9ecef" rx="2"/>
      <rect x="10%" y="38%" width="70%" height="6%" fill="#e9ecef" rx="2"/>
      <rect x="10%" y="48%" width="50%" height="6%" fill="#e9ecef" rx="2"/>
      <rect x="10%" y="58%" width="65%" height="6%" fill="#e9ecef" rx="2"/>
      <rect x="10%" y="68%" width="45%" height="6%" fill="#e9ecef" rx="2"/>
      <text x="50%" y="85%" text-anchor="middle" font-family="Arial, sans-serif" font-size="12" fill="#6c757d">PDF</text>
    </svg>
  `;

  return sharp(Buffer.from(svg)).jpeg({ quality: 80 }).toBuffer();
}

async function createDefaultThumbnail(): Promise<Buffer> {
  const svg = `
    <svg width="200" height="260" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f8f9fa" stroke="#dee2e6" stroke-width="2"/>
      <rect x="20" y="30" width="160" height="8" fill="#e9ecef" rx="2"/>
      <rect x="20" y="50" width="120" fill="#e9ecef" rx="2"/>
      <rect x="20" y="70" width="140" height="6" fill="#e9ecef" rx="2"/>
      <rect x="20" y="90" width="100" height="6" fill="#e9ecef" rx="2"/>
      <text x="100" y="180" text-anchor="middle" font-family="Arial, sans-serif" font-size="16" fill="#6c757d">PDF</text>
    </svg>
  `;

  return sharp(Buffer.from(svg)).jpeg({ quality: 80 }).toBuffer();
}
