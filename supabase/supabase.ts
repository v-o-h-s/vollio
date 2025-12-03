// Storage configuration constants
export const STORAGE_CONFIG = {
  BUCKET_NAME: "pdfs" as const,
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_MIME_TYPES: ["application/pdf"] as string[],
  SIGNED_URL_EXPIRY: 3600, // 1 hour
};

// Table names for type safety
export const TABLES = {
  PDFS: "pdfs",
  USER_ACTIVITY: "user_activity",
  ANNOTATIONS: "annotations",
};

// API configuration constants
export const API_CONFIG = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
  CACHE_TTL: 300000, // 5 minutes
};
