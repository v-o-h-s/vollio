export function generateUploadPath(userId: string, documentName: string) {
  const timestamp = Date.now();
  const sanitizedName = sanitizeName(documentName);
  const storagePath = `${userId}/${timestamp}_${sanitizedName}`;
  return storagePath;
}

function sanitizeName(name: string): string {
  // Remove invalid characters and limit length
  return name
    .replace(/[<>:"/\\|?*]/g, "")
    .trim()
    .slice(0, 255);
}
