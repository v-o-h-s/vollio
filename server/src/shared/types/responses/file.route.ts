import { ServerSuccessResponse } from "./general";

export interface PdfDetails {
	id: string;
	filename: string;
	file_size: number;
	mime_type: string;
	folder_id: string | null;
	isGoogleDriveFile: boolean;
}

// GET /api/v1/files
export type GetAllFilesResponse = ServerSuccessResponse<{
	pdfs: PdfDetails[];
	totalCount: number;
}>;

// GET /api/v1/files/:id (this is for stored files)
export type GetFileByIdResponse = ServerSuccessResponse<{
	id: string;
	filename: string;
	fileUrl: string;
	fileSize: number;
	mimeType: string;
	uploadedAt: string;
}>;

// POST /api/v1/files/upload
export type UploadFileResponse = ServerSuccessResponse<{
	id: string;
	filename: string;
	fileSize: number;
	uploadedAt: string;
	fileUrl: string;
	storagePath: string;
}>;

// DELETE /api/v1/files/:id
export type DeleteFileResponse = ServerSuccessResponse<null>;
// PATCH /api/v1/files/:id/move
export type MoveFileResponse = ServerSuccessResponse<null>;

// PUT /api/v1/files/:id/rename
export type RenameFileResponse = ServerSuccessResponse<null>

// GET /api/v1/files/google-drive/:fileId
export type GetFileFromGoogleDriveResponse = ServerSuccessResponse<Buffer>;

// POST /api/v1/files/google-drive
export interface AddFileFromGoogleDriveResponse {
	success: true;
	message: string;
	data: null;
	error: null;
}

// GET /api/v1/files/:id/stream
export type StreamFileResponse = ServerSuccessResponse<NodeJS.ReadableStream>;