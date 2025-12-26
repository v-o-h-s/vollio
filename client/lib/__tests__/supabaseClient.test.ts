/**
 * Tests for Supabase client configuration
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  supabase,
  STORAGE_CONFIG,
  TABLES,
  API_CONFIG,
  validateDocumentDocument,
  generateStoragePath,
  handleSupabaseError,
  withRetry,
} from "../../supabase";

describe("Supabase Client Configuration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Configuration Constants", () => {
    it("should have correct storage configuration", () => {
      expect(STORAGE_CONFIG.BUCKET_NAME).toBe("documents");
      expect(STORAGE_CONFIG.MAX_FILE_SIZE).toBe(50 * 1024 * 1024);
      expect(STORAGE_CONFIG.ALLOWED_MIME_TYPES).toEqual(["application/pdf"]);
      expect(STORAGE_CONFIG.SIGNED_URL_EXPIRY).toBe(3600);
    });

    it("should have correct table names", () => {
      expect(TABLES.DocumentS).toBe("documents");
      expect(TABLES.USER_ACTIVITY).toBe("user_activity");
      expect(TABLES.ANNOTATIONS).toBe("annotations");
    });

    it("should have correct API configuration", () => {
      expect(API_CONFIG.DEFAULT_PAGE_SIZE).toBe(20);
      expect(API_CONFIG.MAX_PAGE_SIZE).toBe(100);
      expect(API_CONFIG.CACHE_TTL).toBe(300000);
    });
  });

  describe("Document Validation", () => {
    it("should validate documents correctly", () => {
      const validDocument = new File(["test"], "test.document", {
        type: "application/pdf",
      });
      Object.defineProperty(validDocument, "size", { value: 1024 * 1024 }); // 1MB

      const result = validateDocumentDocument(validDocument);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it("should reject non-documents", () => {
      const invalidDocument = new File(["test"], "test.txt", {
        type: "text/plain",
      });

      const result = validateDocumentDocument(invalidDocument);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Only documents are allowed");
    });

    it("should reject documents that are too large", () => {
      const largeDocument = new File(["test"], "test.document", {
        type: "application/pdf",
      });
      Object.defineProperty(largeDocument, "size", {
        value: 60 * 1024 * 1024,
      }); // 60MB

      const result = validateDocumentDocument(largeDocument);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Document size must be less than 50MB");
    });

    it("should reject empty documents", () => {
      const emptyDocument = new File([""], "test.document", {
        type: "application/pdf",
      });
      Object.defineProperty(emptyDocument, "size", { value: 0 });

      const result = validateDocumentDocument(emptyDocument);
      expect(result.valid).toBe(false);
      expect(result.error).toBe("Document appears to be empty");
    });
  });

  describe("Storage Path Generation", () => {
    it("should generate unique storage paths", () => {
      const userId = "user123";
      const name = "test document.document";

      const path1 = generateStoragePath(userId, name);
      const path2 = generateStoragePath(userId, name);

      expect(path1).toMatch(/^user123\/\d+_test_document\.document$/);
      expect(path2).toMatch(/^user123\/\d+_test_document\.document$/);
      expect(path1).not.toBe(path2); // Should be unique due to timestamp
    });

    it("should sanitize names", () => {
      const userId = "user123";
      const name = "test@#$%^&*()document!.document";

      const path = generateStoragePath(userId, name);
      expect(path).toMatch(/^user123\/\d+_test_______document_\.document$/);
    });
  });

  describe("Error Handling", () => {
    it("should handle authentication errors", () => {
      const error = { message: "JWT token expired" };

      expect(() => handleSupabaseError(error, "test")).toThrow(
        "Authentication token expired. Please sign in again."
      );
    });

    it("should handle access denied errors", () => {
      const error = { code: "PGRST116" };

      expect(() => handleSupabaseError(error, "test")).toThrow(
        "Access denied. Please check your permissions."
      );
    });

    it("should handle not found errors", () => {
      const error = { code: "PGRST301" };

      expect(() => handleSupabaseError(error, "test")).toThrow(
        "Resource not found."
      );
    });

    it("should handle generic errors", () => {
      const error = { message: "Something went wrong" };

      expect(() => handleSupabaseError(error, "upload")).toThrow(
        "upload failed: Something went wrong"
      );
    });
  });

  describe("Retry Mechanism", () => {
    it("should retry failed operations", async () => {
      let attempts = 0;
      const operation = vi.fn().mockImplementation(() => {
        attempts++;
        if (attempts < 3) {
          throw new Error("Network error");
        }
        return Promise.resolve("success");
      });

      const result = await withRetry(operation, 3, 10);
      expect(result).toBe("success");
      expect(operation).toHaveBeenCalledTimes(3);
    });

    it("should not retry authentication errors", async () => {
      const operation = vi
        .fn()
        .mockRejectedValue(new Error("Authentication failed"));

      await expect(withRetry(operation, 3, 10)).rejects.toThrow(
        "Authentication failed"
      );
      expect(operation).toHaveBeenCalledTimes(1);
    });

    it("should throw after max attempts", async () => {
      const operation = vi.fn().mockRejectedValue(new Error("Network error"));

      await expect(withRetry(operation, 2, 10)).rejects.toThrow(
        "Network error"
      );
      expect(operation).toHaveBeenCalledTimes(2);
    });
  });

  describe("Basic Client Initialization", () => {
    it("should initialize Supabase client", () => {
      expect(supabase).toBeDefined();
      expect(typeof supabase.from).toBe("function");
      expect(typeof supabase.storage).toBe("object");
    });
  });
});
