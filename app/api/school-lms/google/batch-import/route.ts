import { NextRequest, NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { BatchImportRequest, BatchImportResponse } from "@/lib/types/lms";

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body: BatchImportRequest = await request.json();
    const { files } = body;

    if (!files || files.length === 0) {
      return NextResponse.json(
        { 
          success: false,
          error: "No files provided for import" 
        },
        { status: 400 }
      );
    }

    const results: BatchImportResponse["results"] = [];
    let totalImported = 0;
    let totalFailed = 0;

    // Process each file sequentially to avoid overwhelming the API
    for (const file of files) {
      try {
        const importResponse = await fetch(
          new URL("/api/school-lms/google/import-file", request.url),
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: request.headers.get("Authorization") || "",
              Cookie: request.headers.get("Cookie") || "",
            },
            body: JSON.stringify({
              fileId: file.fileId,
              fileName: file.fileName,
              folderId: file.folderId,
            }),
          }
        );

        const importData = await importResponse.json();

        if (importResponse.ok && importData.success) {
          results.push({
            fileId: file.fileId,
            fileName: file.fileName,
            status: "success",
            pdf: importData.pdf,
          });
          totalImported++;
        } else {
          results.push({
            fileId: file.fileId,
            fileName: file.fileName,
            status: "error",
            error: importData.error || "Import failed",
          });
          totalFailed++;
        }
      } catch (error) {
        console.error(`Error importing file ${file.fileName}:`, error);
        results.push({
          fileId: file.fileId,
          fileName: file.fileName,
          status: "error",
          error: "Import failed due to server error",
        });
        totalFailed++;
      }

      // Add a small delay between imports to prevent rate limiting
      if (files.indexOf(file) < files.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    const response: BatchImportResponse = {
      success: totalImported > 0,
      results,
      totalImported,
      totalFailed,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error("Error in batch import:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to process batch import",
        results: [],
        totalImported: 0,
        totalFailed: 0,
      },
      { status: 500 }
    );
  }
}