import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PDFDocument } from "@/lib/types";
import { mockDB } from "@/lib/mock-db";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    // Validate file type
    if (file.type !== "application/pdf") {
      return NextResponse.json(
        { error: "Only PDF files are allowed" },
        { status: 400 }
      );
    }

    // Validate file size (50MB limit)
    const maxSize = 50 * 1024 * 1024; // 50MB in bytes
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 50MB limit" },
        { status: 400 }
      );
    }

    // For prototype, we'll store file metadata and create a mock file URL
    // In a real implementation, you would upload to cloud storage
    const pdfId = `pdf_${Date.now()}_${Math.random()
      .toString(36)
      .substring(2, 11)}`;

    const newPDF: PDFDocument = {
      id: pdfId,
      userId,
      filename: file.name,
      uploadedAt: new Date(),
      fileUrl: `blob:${pdfId}`, // Mock URL for prototype
    };

    const createdPDF = mockDB.createPDF(newPDF);

    return NextResponse.json(
      {
        success: true,
        data: createdPDF,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error uploading PDF:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userPDFs = mockDB.getPDFs(userId);

    return NextResponse.json({
      success: true,
      data: userPDFs,
    });
  } catch (error) {
    console.error("Error fetching PDFs:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
