import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import {
  useKeyboardShortcuts,
  useAnnotationKeyboardShortcuts,
} from "@/hooks/use-keyboard-shortcuts";

describe("useKeyboardShortcuts", () => {
  let mockAction: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockAction = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should trigger action when correct key combination is pressed", () => {
    const shortcuts = [
      {
        key: "n",
        ctrlKey: true,
        action: mockAction,
        description: "Create new note",
      },
    ];

    renderHook(() => useKeyboardShortcuts({ shortcuts }));

    // Simulate Ctrl+N keypress
    act(() => {
      const event = new KeyboardEvent("keydown", {
        key: "n",
        ctrlKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);
    });

    expect(mockAction).toHaveBeenCalledTimes(1);
  });

  it("should not trigger action when disabled", () => {
    const shortcuts = [
      {
        key: "n",
        ctrlKey: true,
        action: mockAction,
        description: "Create new note",
      },
    ];

    renderHook(() => useKeyboardShortcuts({ shortcuts, enabled: false }));

    // Simulate Ctrl+N keypress
    act(() => {
      const event = new KeyboardEvent("keydown", {
        key: "n",
        ctrlKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);
    });

    expect(mockAction).not.toHaveBeenCalled();
  });

  it("should not trigger action when typing in input field", () => {
    const shortcuts = [
      {
        key: "n",
        ctrlKey: true,
        action: mockAction,
        description: "Create new note",
      },
    ];

    renderHook(() => useKeyboardShortcuts({ shortcuts }));

    // Create a mock input element
    const input = document.createElement("input");
    document.body.appendChild(input);
    input.focus();

    // Simulate Ctrl+N keypress while focused on input
    act(() => {
      const event = new KeyboardEvent("keydown", {
        key: "n",
        ctrlKey: true,
        bubbles: true,
      });
      Object.defineProperty(event, "target", { value: input });
      document.dispatchEvent(event);
    });

    expect(mockAction).not.toHaveBeenCalled();

    document.body.removeChild(input);
  });
});

describe("useAnnotationKeyboardShortcuts", () => {
  let mockCreateNote: ReturnType<typeof vi.fn>;
  let mockSaveNote: ReturnType<typeof vi.fn>;
  let mockCancelNote: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockCreateNote = vi.fn();
    mockSaveNote = vi.fn();
    mockCancelNote = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it("should provide annotation-specific shortcuts", () => {
    const { result } = renderHook(() =>
      useAnnotationKeyboardShortcuts({
        onCreateNote: mockCreateNote,
        onSaveNote: mockSaveNote,
        onCancelNote: mockCancelNote,
      })
    );

    expect(result.current.shortcuts).toBeDefined();
    expect(result.current.shortcuts.length).toBeGreaterThan(0);

    // Check that shortcuts include expected actions
    const shortcutKeys = result.current.shortcuts.map((s) => s.key);
    expect(shortcutKeys).toContain("n"); // Create note
    expect(shortcutKeys).toContain("s"); // Save note
    expect(shortcutKeys).toContain("Escape"); // Cancel
  });

  it("should trigger create note action with Ctrl+N", () => {
    renderHook(() =>
      useAnnotationKeyboardShortcuts({
        onCreateNote: mockCreateNote,
        onSaveNote: mockSaveNote,
        onCancelNote: mockCancelNote,
      })
    );

    // Simulate Ctrl+N keypress
    act(() => {
      const event = new KeyboardEvent("keydown", {
        key: "n",
        ctrlKey: true,
        bubbles: true,
      });
      document.dispatchEvent(event);
    });

    expect(mockCreateNote).toHaveBeenCalledTimes(1);
  });

  it("should trigger cancel action with Escape", () => {
    renderHook(() =>
      useAnnotationKeyboardShortcuts({
        onCreateNote: mockCreateNote,
        onSaveNote: mockSaveNote,
        onCancelNote: mockCancelNote,
      })
    );

    // Simulate Escape keypress
    act(() => {
      const event = new KeyboardEvent("keydown", {
        key: "Escape",
        bubbles: true,
      });
      document.dispatchEvent(event);
    });

    expect(mockCancelNote).toHaveBeenCalledTimes(1);
  });
});
