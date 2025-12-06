/**
 * Utility for handling file blob URLs for PDF viewers
 */

/**
 * Create a blob URL from a file blob
 * @param blob - The file blob
 * @returns URL string that can be used in PDF viewers
 */
export const createBlobUrl = (blob: Blob): string => {
  return URL.createObjectURL(blob);
};

/**
 * Revoke a blob URL to free up memory
 * @param url - The blob URL to revoke
 */
export const revokeBlobUrl = (url: string): void => {
  URL.revokeObjectURL(url);
};

/**
 * Create a blob URL with automatic cleanup
 * Useful for component lifecycle
 * @param blob - The file blob
 * @returns Object with URL and cleanup function
 */
export const useBlobUrl = (blob: Blob | null) => {
  if (!blob) {
    return { url: null, cleanup: () => {} };
  }

  const url = createBlobUrl(blob);
  const cleanup = () => revokeBlobUrl(url);

  return { url, cleanup };
};

/**
 * Download a blob as a file
 * @param blob - The file blob
 * @param filename - The name to save as
 */
export const downloadBlob = (blob: Blob, filename: string): void => {
  const url = createBlobUrl(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  revokeBlobUrl(url);
};
