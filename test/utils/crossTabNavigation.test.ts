import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  createNavigationHash,
  parseNavigationHash,
  sendNavigationMessage,
  setupNavigationListener,
  cleanupNavigationListener,
} from "@/lib/utils/crossTabNavigation";

// Mock window.postMessage and addEventListener
const mockPostMessage = vi.fn();
const mockAddEventListener = vi.fn();
const mockRemoveEventListener = vi.fn();

Object.defineProperty(window, "postMessage", {
  value: mockPostMessage,
  writable: true,
});

Object.defineProperty(window, "addEventListener", {
  value: mockAddEventListener,
  writable: true,
});

Object.defineProperty(window, "removeEventListener", {
  value: mockRemoveEventListener,
  writable: true,
});

describe("Cross-Tab Navigation Utilities", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset window.opener
    Object.defineProperty(window, "opener", {
      value: {
        postMessage: mockPostMessage,
        closed: false,
      },
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("createNavigationHash", () => {
    it("should create proper navigation hash with all parameters", () => {
      const params = {
        page: 3,
        x: 120.5,
        y: 450.75,
        width: 200.25,
        height: 18.1,
      };

      const result = createNavigationHash(params);

      expect(result).toBe(
        "#pdf?page=3&x=120.5&y=450.75&width=200.25&height=18.1"
      );
    });

    it("should handle integer coordinates", () => {
      const params = {
        page: 1,
        x: 100,
        y: 200,
        width: 150,
        height: 20,
      };

      const result = createNavigationHash(params);

      expect(result).toBe("#pdf?page=1&x=100&y=200&width=150&height=20");
    });

    it("should handle zero values", () => {
      const params = {
        page: 1,
        x: 0,
        y: 0,
        width: 100,
        height: 20,
      };

      const result = createNavigationHash(params);

      expect(result).toBe("#pdf?page=1&x=0&y=0&width=100&height=20");
    });
  });

  describe("parseNavigationHash", () => {
    it("should parse valid navigation hash correctly", () => {
      const hash = "#pdf?page=3&x=120.5&y=450.75&width=200.25&height=18.1";

      const result = parseNavigationHash(hash);

      expect(result).toEqual({
        page: 3,
        x: 120.5,
        y: 450.75,
        width: 200.25,
        height: 18.1,
      });
    });

    it("should return null for invalid hash format", () => {
      const invalidHashes = [
        "#pdf",
        "#pdf?",
        "#other?page=1&x=100&y=200&width=50&height=10",
        "pdf?page=1&x=100&y=200&width=50&height=10", // Missing #
        "#annotation?page=1&x=100&y=200&width=50&height=10",
      ];

      invalidHashes.forEach((hash) => {
        expect(parseNavigationHash(hash)).toBeNull();
      });
    });

    it("should return null for missing required parameters", () => {
      const invalidHashes = [
        "#pdf?x=100&y=200&width=50&height=10", // Missing page
        "#pdf?page=1&y=200&width=50&height=10", // Missing x
        "#pdf?page=1&x=100&width=50&height=10", // Missing y
        "#pdf?page=1&x=100&y=200&height=10", // Missing width
        "#pdf?page=1&x=100&y=200&width=50", // Missing height
      ];

      invalidHashes.forEach((hash) => {
        expect(parseNavigationHash(hash)).toBeNull();
      });
    });

    it("should return null for invalid parameter values", () => {
      const invalidHashes = [
        "#pdf?page=abc&x=100&y=200&width=50&height=10", // Invalid page
        "#pdf?page=0&x=100&y=200&width=50&height=10", // Page < 1
        "#pdf?page=1&x=-10&y=200&width=50&height=10", // Negative x
        "#pdf?page=1&x=100&y=-5&width=50&height=10", // Negative y
        "#pdf?page=1&x=100&y=200&width=0&height=10", // Zero width
        "#pdf?page=1&x=100&y=200&width=50&height=-5", // Negative height
        "#pdf?page=1&x=99999&y=200&width=50&height=10", // X too large
        "#pdf?page=1&x=100&y=99999&width=50&height=10", // Y too large
        "#pdf?page=1&x=100&y=200&width=99999&height=10", // Width too large
        "#pdf?page=1&x=100&y=200&width=50&height=99999", // Height too large
      ];

      invalidHashes.forEach((hash) => {
        expect(parseNavigationHash(hash)).toBeNull();
      });
    });

    it("should handle edge case valid values", () => {
      const hash = "#pdf?page=1&x=0&y=0&width=1&height=1";

      const result = parseNavigationHash(hash);

      expect(result).toEqual({
        page: 1,
        x: 0,
        y: 0,
        width: 1,
        height: 1,
      });
    });
  });

  describe("sendNavigationMessage", () => {
    it("should send navigation message to opener window", () => {
      const navigationData = {
        page: 2,
        x: 150,
        y: 300,
        width: 100,
        height: 25,
      };

      sendNavigationMessage(navigationData);

      expect(mockPostMessage).toHaveBeenCalledWith(
        {
          type: "PDF_NAVIGATION",
          page: 2,
          coordinates: {
            x: 150,
            y: 300,
            width: 100,
            height: 25,
          },
          hash: "#pdf?page=2&x=150&y=300&width=100&height=25",
        },
        "*"
      );
    });

    it("should not send message when opener is null", () => {
      Object.defineProperty(window, "opener", {
        value: null,
        writable: true,
        configurable: true,
      });

      const navigationData = {
        page: 1,
        x: 100,
        y: 200,
        width: 50,
        height: 20,
      };

      sendNavigationMessage(navigationData);

      expect(mockPostMessage).not.toHaveBeenCalled();
    });

    it("should not send message when opener is closed", () => {
      Object.defineProperty(window, "opener", {
        value: {
          postMessage: mockPostMessage,
          closed: true,
        },
        writable: true,
        configurable: true,
      });

      const navigationData = {
        page: 1,
        x: 100,
        y: 200,
        width: 50,
        height: 20,
      };

      sendNavigationMessage(navigationData);

      expect(mockPostMessage).not.toHaveBeenCalled();
    });

    it("should handle postMessage errors gracefully", () => {
      const mockOpenerPostMessage = vi.fn(() => {
        throw new Error("PostMessage failed");
      });

      Object.defineProperty(window, "opener", {
        value: {
          postMessage: mockOpenerPostMessage,
          closed: false,
        },
        writable: true,
        configurable: true,
      });

      const navigationData = {
        page: 1,
        x: 100,
        y: 200,
        width: 50,
        height: 20,
      };

      // Should not throw error
      expect(() => sendNavigationMessage(navigationData)).not.toThrow();
    });
  });

  describe("setupNavigationListener", () => {
    it("should set up message event listener", () => {
      const mockCallback = vi.fn();

      setupNavigationListener(mockCallback);

      expect(mockAddEventListener).toHaveBeenCalledWith(
        "message",
        expect.any(Function)
      );
    });

    it("should call callback with valid navigation message", () => {
      const mockCallback = vi.fn();
      let messageHandler: (event: MessageEvent) => void;

      mockAddEventListener.mockImplementation((event, handler) => {
        if (event === "message") {
          messageHandler = handler;
        }
      });

      setupNavigationListener(mockCallback);

      const validMessage = {
        data: {
          type: "PDF_NAVIGATION",
          page: 3,
          coordinates: { x: 120, y: 450, width: 200, height: 18 },
          hash: "#pdf?page=3&x=120&y=450&width=200&height=18",
        },
        origin: "https://example.com",
      };

      messageHandler!(validMessage as MessageEvent);

      expect(mockCallback).toHaveBeenCalledWith({
        page: 3,
        coordinates: { x: 120, y: 450, width: 200, height: 18 },
        hash: "#pdf?page=3&x=120&y=450&width=200&height=18",
      });
    });

    it("should ignore invalid navigation messages", () => {
      const mockCallback = vi.fn();
      let messageHandler: (event: MessageEvent) => void;

      mockAddEventListener.mockImplementation((event, handler) => {
        if (event === "message") {
          messageHandler = handler;
        }
      });

      setupNavigationListener(mockCallback);

      const invalidMessages = [
        { data: { type: "OTHER_MESSAGE" } },
        { data: { type: "PDF_NAVIGATION" } }, // Missing required fields
        { data: { type: "PDF_NAVIGATION", page: "invalid" } },
        { data: null },
        {},
      ];

      invalidMessages.forEach((message) => {
        messageHandler!(message as MessageEvent);
      });

      expect(mockCallback).not.toHaveBeenCalled();
    });

    it("should validate message data structure", () => {
      const mockCallback = vi.fn();
      let messageHandler: (event: MessageEvent) => void;

      mockAddEventListener.mockImplementation((event, handler) => {
        if (event === "message") {
          messageHandler = handler;
        }
      });

      setupNavigationListener(mockCallback);

      const invalidStructures = [
        {
          data: {
            type: "PDF_NAVIGATION",
            page: 1,
            // Missing coordinates
            hash: "#pdf?page=1&x=100&y=200&width=50&height=10",
          },
        },
        {
          data: {
            type: "PDF_NAVIGATION",
            page: 1,
            coordinates: { x: 100, y: 200 }, // Missing width/height
            hash: "#pdf?page=1&x=100&y=200&width=50&height=10",
          },
        },
        {
          data: {
            type: "PDF_NAVIGATION",
            page: 1,
            coordinates: { x: 100, y: 200, width: 50, height: 10 },
            // Missing hash
          },
        },
      ];

      invalidStructures.forEach((message) => {
        messageHandler!(message as MessageEvent);
      });

      expect(mockCallback).not.toHaveBeenCalled();
    });
  });

  describe("cleanupNavigationListener", () => {
    it("should remove message event listener", () => {
      const mockCallback = vi.fn();

      cleanupNavigationListener(mockCallback);

      expect(mockRemoveEventListener).toHaveBeenCalledWith(
        "message",
        expect.any(Function)
      );
    });

    it("should handle cleanup when no listener was set", () => {
      const mockCallback = vi.fn();

      // Should not throw error
      expect(() => cleanupNavigationListener(mockCallback)).not.toThrow();
    });
  });

  describe("Integration scenarios", () => {
    it("should handle complete navigation workflow", () => {
      const mockCallback = vi.fn();
      let messageHandler: (event: MessageEvent) => void;

      // Setup listener
      mockAddEventListener.mockImplementation((event, handler) => {
        if (event === "message") {
          messageHandler = handler;
        }
      });

      setupNavigationListener(mockCallback);

      // Send navigation message
      const navigationData = {
        page: 5,
        x: 250,
        y: 500,
        width: 180,
        height: 30,
      };

      sendNavigationMessage(navigationData);

      // Simulate receiving the message
      const receivedMessage = {
        data: {
          type: "PDF_NAVIGATION",
          page: 5,
          coordinates: { x: 250, y: 500, width: 180, height: 30 },
          hash: "#pdf?page=5&x=250&y=500&width=180&height=30",
        },
      };

      messageHandler!(receivedMessage as MessageEvent);

      expect(mockPostMessage).toHaveBeenCalled();
      expect(mockCallback).toHaveBeenCalledWith({
        page: 5,
        coordinates: { x: 250, y: 500, width: 180, height: 30 },
        hash: "#pdf?page=5&x=250&y=500&width=180&height=30",
      });
    });

    it("should handle hash parsing and message creation consistency", () => {
      const originalParams = {
        page: 7,
        x: 123.45,
        y: 678.9,
        width: 234.56,
        height: 45.67,
      };

      // Create hash
      const hash = createNavigationHash(originalParams);

      // Parse hash back
      const parsedParams = parseNavigationHash(hash);

      expect(parsedParams).toEqual(originalParams);
    });
  });

  describe("Error handling and edge cases", () => {
    it("should handle malformed URLs gracefully", () => {
      const malformedHashes = [
        "#pdf?page=1&x=100&y=200&width=50&height=10&extra=value",
        "#pdf?page=1&x=100&y=200&width=50&height=10&",
        "#pdf?page=1&x=100&y=200&width=50&height=10&=",
        "#pdf?=&page=1&x=100&y=200&width=50&height=10",
      ];

      malformedHashes.forEach((hash) => {
        const result = parseNavigationHash(hash);
        // Should either parse correctly or return null, but not throw
        expect(typeof result === "object" || result === null).toBe(true);
      });
    });

    it("should handle extreme coordinate values", () => {
      const extremeParams = {
        page: 9999,
        x: 9999.99,
        y: 9999.99,
        width: 9999.99,
        height: 9999.99,
      };

      const hash = createNavigationHash(extremeParams);
      const parsed = parseNavigationHash(hash);

      expect(parsed).toEqual(extremeParams);
    });

    it("should handle concurrent message listeners", () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      setupNavigationListener(callback1);
      setupNavigationListener(callback2);

      expect(mockAddEventListener).toHaveBeenCalledTimes(2);

      cleanupNavigationListener(callback1);
      cleanupNavigationListener(callback2);

      expect(mockRemoveEventListener).toHaveBeenCalledTimes(2);
    });
  });
});
