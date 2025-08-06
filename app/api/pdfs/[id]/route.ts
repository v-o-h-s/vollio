import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { PDFDocument } from "@/lib/types";
import { mockDB } from "@/lib/mock-db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "PDF ID is required" },
        { status: 400 }
      );
    }

    const pdf = mockDB.getPDF(id, userId);

    if (!pdf) {
      return NextResponse.json({ error: "PDF not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: pdf,
    });
  } catch (error) {
    console.error("Error fetching PDF:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: "PDF ID is required" },
        { status: 400 }
      );
    }

    const deletedPDF = mockDB.deletePDF(id, userId);

    if (!deletedPDF) {
      return NextResponse.json({ error: "PDF not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: deletedPDF,
    });
  } catch (error) {
    console.error("Error deleting PDF:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
