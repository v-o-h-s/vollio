import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Annotation } from "@/lib/types";
import { mockDB } from "@/lib/mock-db";

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const pdfId = searchParams.get("pdfId");
    const page = searchParams.get("page");

    const pageNumber = page ? parseInt(page, 10) : undefined;
    const filteredAnnotations = mockDB.getAnnotations(
      userId,
      pdfId || undefined,
      pageNumber
    );

    return NextResponse.json({
      success: true,
      data: filteredAnnotations,
    });
  } catch (error) {
    console.error("Error fetching annotations:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { pdfId, pageNumber, selectedText, noteContent, coordinates } = body;

    // Validate required fields
    if (
      !pdfId ||
      !pageNumber ||
      !selectedText ||
      !noteContent ||
      !coordinates
    ) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate coordinates structure
    if (
      typeof coordinates.x !== "number" ||
      typeof coordinates.y !== "number" ||
      typeof coordinates.width !== "number" ||
      typeof coordinates.height !== "number"
    ) {
      return NextResponse.json(
        { error: "Invalid coordinates format" },
        { status: 400 }
      );
    }

    const newAnnotation: Annotation = {
      id: `annotation_${Date.now()}_${Math.random()
        .toString(36)
        .substring(2, 11)}`,
      userId,
      pdfId,
      pageNumber: parseInt(pageNumber, 10),
      selectedText,
      noteContent,
      coordinates,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const createdAnnotation = mockDB.createAnnotation(newAnnotation);

    return NextResponse.json(
      {
        success: true,
        data: createdAnnotation,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating annotation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { id, noteContent } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Annotation ID is required" },
        { status: 400 }
      );
    }

    const updatedAnnotation = mockDB.updateAnnotation(id, userId, {
      noteContent,
    });

    if (!updatedAnnotation) {
      return NextResponse.json(
        { error: "Annotation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: updatedAnnotation,
    });
  } catch (error) {
    console.error("Error updating annotation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Annotation ID is required" },
        { status: 400 }
      );
    }

    const deletedAnnotation = mockDB.deleteAnnotation(id, userId);

    if (!deletedAnnotation) {
      return NextResponse.json(
        { error: "Annotation not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: deletedAnnotation,
    });
  } catch (error) {
    console.error("Error deleting annotation:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
