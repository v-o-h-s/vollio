
import { withErrorHandling } from "@/lib/wrappers/withErrorHandling";
import { handleGet } from "./handlers/getPdf";
import { handleDelete } from "./handlers/deletePdf";

export const GET = withErrorHandling(handleGet);
export const DELETE = withErrorHandling(handleDelete);
