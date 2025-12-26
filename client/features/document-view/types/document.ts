export type DocumentDetails = {
  id: string;
  name: string;
  documentUrl: string;
  size: number;
  mimeType: string;
  uploadedAt: string;
  folderId: string | null;
  isGoogleDriveDocument: boolean;
}