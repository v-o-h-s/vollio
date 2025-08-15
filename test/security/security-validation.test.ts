/**
 * Security validation tests
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  validateFileUploadSecurity,
  validateFileName,
  validatePDFContent,
  checkUserQuota,
  checkEnhancedRateLimit,
  sanitizeFilename,
  generateSecureStoragePath,
  QUOTA_LIMITS,
} from '@/lib/utils/security-validation';

// Mock File constructor for testing
class MockFile {
  name: string;
  size: number;
  type: string;
  content: Uint8Array;

  constructor(content: Uint8Array, name: string, options: { type: string }) {
    this.content = content;
    this.name = name;
    this.size = content.length;
    this.type = options.type;
  }

  slice(start: number, end?: number): MockFile {
    const slicedContent = this.content.slice(start, end);
    return new MockFile(slicedContent, this.name, { type: this.type });
  }

  async arrayBuffer(): Promise<ArrayBuffer> {
    return this.content.buffer;
  }
}

// Mock Supabase client
const mockSupabaseClient = {
  from: vi.fn(() => ({
    select: vi.fn(() => ({
      eq: vi.fn(() => ({
        data: [],
        error: null,
      })),
    })),
  })),
};

describe('Security Validation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('validateFileName', () => {
    it('should accept valid PDF filenames', () => {
      const result = validateFileName('document.pdf');
      expect(result.valid).toBe(true);
    });

    it('should reject empty filenames', () => {
      const result = validateFileName('');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('required');
    });

    it('should reject filenames that are too long', () => {
      const longName = 'a'.repeat(256) + '.pdf';
      const result = validateFileName(longName);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('too long');
    });

    it('should reject non-PDF extensions', () => {
      const result = validateFileName('document.exe');
      expect(result.valid).toBe(false);
      expect(result.error).toContain('Only PDF files');
    });

    it('should reject dangerous filename patterns', () => {
      const dangerousNames = [
        '../../../etc/passwd.pdf',
        'CON.pdf',
        'document<script>.pdf',
        'file|pipe.pdf',
      ];

      dangerousNames.forEach(name => {
        const result = validateFileName(name);
        expect(result.valid).toBe(false);
        expect(result.severity).toBe('high');
      });
    });
  });

  describe('validatePDFContent', () => {
    it('should accept valid PDF files', async () => {
      // Create a mock PDF with proper header
      const pdfHeader = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34]); // %PDF-1.4
      const mockFile = new MockFile(pdfHeader, 'test.pdf', { type: 'application/pdf' }) as unknown as File;

      const result = await validatePDFContent(mockFile);
      expect(result.valid).toBe(true);
    });

    it('should reject files without PDF signature', async () => {
      const invalidHeader = new Uint8Array([0x89, 0x50, 0x4E, 0x47]); // PNG header
      const mockFile = new MockFile(invalidHeader, 'test.pdf', { type: 'application/pdf' }) as unknown as File;

      const result = await validatePDFContent(mockFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('valid PDF');
      expect(result.severity).toBe('high');
    });

    it('should detect malicious JavaScript content', async () => {
      const pdfHeader = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34]);
      const maliciousContent = new TextEncoder().encode('/JavaScript (alert("xss"))');
      const combinedContent = new Uint8Array(pdfHeader.length + maliciousContent.length);
      combinedContent.set(pdfHeader);
      combinedContent.set(maliciousContent, pdfHeader.length);

      const mockFile = new MockFile(combinedContent, 'malicious.pdf', { type: 'application/pdf' }) as unknown as File;

      const result = await validatePDFContent(mockFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('malicious content');
      expect(result.severity).toBe('critical');
    });
  });

  describe('validateFileUploadSecurity', () => {
    it('should perform comprehensive validation', async () => {
      const pdfHeader = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x34]);
      const mockFile = new MockFile(pdfHeader, 'valid-document.pdf', { type: 'application/pdf' }) as unknown as File;

      const result = await validateFileUploadSecurity(mockFile);
      expect(result.valid).toBe(true);
    });

    it('should reject empty files', async () => {
      const emptyFile = new MockFile(new Uint8Array(0), 'empty.pdf', { type: 'application/pdf' }) as unknown as File;

      const result = await validateFileUploadSecurity(emptyFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('empty');
    });

    it('should reject files that are too large', async () => {
      // Create a file larger than the limit
      const largeContent = new Uint8Array(60 * 1024 * 1024); // 60MB
      largeContent.set([0x25, 0x50, 0x44, 0x46]); // PDF header
      const largeFile = new MockFile(largeContent, 'large.pdf', { type: 'application/pdf' }) as unknown as File;

      const result = await validateFileUploadSecurity(largeFile);
      expect(result.valid).toBe(false);
      expect(result.error).toContain('exceeds');
    });
  });

  describe('checkUserQuota', () => {
    it('should allow upload when under quota', async () => {
      const mockClient = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              data: [
                { file_size: 1000000, uploaded_at: new Date().toISOString() }
              ],
              error: null,
            })),
          })),
        })),
      };

      const result = await checkUserQuota(mockClient, 'test-user');
      expect(result.canUpload).toBe(true);
      expect(result.currentFiles).toBe(1);
      expect(result.quotaExceeded).toHaveLength(0);
    });

    it('should reject upload when file limit exceeded', async () => {
      const files = Array(QUOTA_LIMITS.MAX_FILES_PER_USER + 1).fill({
        file_size: 1000000,
        uploaded_at: new Date().toISOString(),
      });

      const mockClient = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              data: files,
              error: null,
            })),
          })),
        })),
      };

      const result = await checkUserQuota(mockClient, 'test-user');
      expect(result.canUpload).toBe(false);
      expect(result.quotaExceeded).toContain(`Maximum ${QUOTA_LIMITS.MAX_FILES_PER_USER} files per user`);
    });

    it('should reject upload when storage limit exceeded', async () => {
      const mockClient = {
        from: vi.fn(() => ({
          select: vi.fn(() => ({
            eq: vi.fn(() => ({
              data: [
                { file_size: QUOTA_LIMITS.MAX_STORAGE_PER_USER + 1000, uploaded_at: new Date().toISOString() }
              ],
              error: null,
            })),
          })),
        })),
      };

      const result = await checkUserQuota(mockClient, 'test-user');
      expect(result.canUpload).toBe(false);
      expect(result.quotaExceeded.some(msg => msg.includes('storage'))).toBe(true);
    });
  });

  describe('sanitizeFilename', () => {
    it('should sanitize dangerous characters', () => {
      const result = sanitizeFilename('file<>:|"?*.pdf');
      expect(result).toBe('file_______.pdf');
    });

    it('should remove leading and trailing dots', () => {
      const result = sanitizeFilename('...file.pdf...');
      expect(result).toBe('file.pdf');
    });

    it('should replace spaces with underscores', () => {
      const result = sanitizeFilename('my document file.pdf');
      expect(result).toBe('my_document_file.pdf');
    });

    it('should limit filename length', () => {
      const longName = 'a'.repeat(250) + '.pdf';
      const result = sanitizeFilename(longName);
      expect(result.length).toBeLessThanOrEqual(200);
    });
  });

  describe('generateSecureStoragePath', () => {
    it('should generate secure storage paths', () => {
      const path = generateSecureStoragePath('user123', 'document.pdf');
      
      expect(path).toMatch(/^user123\/\d+_[a-z0-9]{6}_document\.pdf$/);
    });

    it('should sanitize filenames in paths', () => {
      const path = generateSecureStoragePath('user123', 'my<dangerous>file.pdf');
      
      expect(path).toMatch(/^user123\/\d+_[a-z0-9]{6}_my_dangerous_file\.pdf$/);
    });
  });

  describe('checkEnhancedRateLimit', () => {
    beforeEach(() => {
      // Clear rate limit store between tests
      vi.clearAllTimers();
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should allow requests under the limit', () => {
      expect(() => {
        checkEnhancedRateLimit('user123', 'UPLOAD');
      }).not.toThrow();
    });

    it('should block requests over the limit', () => {
      // Make requests up to the limit
      for (let i = 0; i < 10; i++) {
        checkEnhancedRateLimit('user123', 'UPLOAD');
      }

      // The next request should be blocked
      expect(() => {
        checkEnhancedRateLimit('user123', 'UPLOAD');
      }).toThrow();
    });

    it('should reset limits after time window', () => {
      // Make requests up to the limit
      for (let i = 0; i < 10; i++) {
        checkEnhancedRateLimit('user123', 'UPLOAD');
      }

      // Advance time past the window
      vi.advanceTimersByTime(61000); // 61 seconds

      // Should allow requests again
      expect(() => {
        checkEnhancedRateLimit('user123', 'UPLOAD');
      }).not.toThrow();
    });
  });
});