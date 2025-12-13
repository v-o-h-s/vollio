export type FileDetails = {
  id: string;
  filename: string;
  fileUrl: string;
  fileSize: number;
  mimeType: string;
  uploadedAt: string;
  folderId: string | null;
  isGoogleDriveFile: boolean;
}