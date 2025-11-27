import { withErrorHandling } from "@/lib/wrappers/withErrorHandling";
import { uploadPdfHandler } from "../handlers/uploadPdf";

// POST /api/pdfs/upload - Upload a new PDF file
export const POST = withErrorHandling(uploadPdfHandler);
