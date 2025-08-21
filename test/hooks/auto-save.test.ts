import { renderHook, act } from '@testing-library/react';
import { useAutoSave } from '@/hooks/use-auto-save';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// Mock timers
vi.useFakeTimers();

describe('useAutoSave', () => {
  let mockOnSave: ReturnType<typeof vi.fn>;
  let mockOnError: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockOnSave = vi.fn().mockResolvedValue(undefined);
    mockOnError = vi.fn();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.clearAllMocks();
  });

  it('should initialize with correct default state', () => {
    const { result } = renderHook(() =>
      useAutoSave('initial data', {
        onSave: mockOnSave,
      })
    );

    expect(result.current.isSaving).toBe(false);
    expect(result.current.lastSaved).toBe(null);
    expect(result.current.error).toBe(null);
    expect(result.current.hasUnsavedChanges).toBe(false);
  });

  it('should debounce auto-save calls', async () => {
    const { result, rerender } = renderHook(
      ({ data }) =>
        useAutoSave(data, {
          delay: 1000,
          onSave: mockOnSave,
        }),
      { initialProps: { data: 'initial' } }
    );

    // Change data multiple times quickly
    rerender({ data: 'change1' });
    rerender({ data: 'change2' });
    rerender({ data: 'change3' });

    // Fast-forward time but not enough to trigger save
    act(() => {
      vi.advanceTimersByTime(500);
    });

    expect(mockOnSave).not.toHaveBeenCalled();

    // Fast-forward to trigger save
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });

    // Should only save once with the latest data
    expect(mockOnSave).toHaveBeenCalledTimes(1);
    expect(mockOnSave).toHaveBeenCalledWith('change3');
  });

  it('should handle save errors', async () => {
    const saveError = new Error('Save failed');
    mockOnSave.mockRejectedValue(saveError);

    const { result, rerender } = renderHook(
      ({ data }) =>
        useAutoSave(data, {
          delay: 100,
          onSave: mockOnSave,
          onError: mockOnError,
        }),
      { initialProps: { data: 'initial' } }
    );

    rerender({ data: 'changed' });

    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    expect(result.current.error).toBe(saveError);
    expect(result.current.isSaving).toBe(false);
    expect(mockOnError).toHaveBeenCalledWith(saveError);
  });

  it('should allow manual save', async () => {
    const { result } = renderHook(() =>
      useAutoSave('test data', {
        onSave: mockOnSave,
        enabled: false, // Disable auto-save
      })
    );

    await act(async () => {
      await result.current.saveNow();
    });

    expect(mockOnSave).toHaveBeenCalledWith('test data');
    expect(result.current.lastSaved).toBeInstanceOf(Date);
  });

  it('should not save when disabled', async () => {
    const { result, rerender } = renderHook(
      ({ data }) =>
        useAutoSave(data, {
          delay: 100,
          onSave: mockOnSave,
          enabled: false,
        }),
      { initialProps: { data: 'initial' } }
    );

    rerender({ data: 'changed' });

    await act(async () => {
      vi.advanceTimersByTime(200);
    });

    expect(mockOnSave).not.toHaveBeenCalled();
  });

  it('should reset error state', () => {
    const { result } = renderHook(() =>
      useAutoSave('test data', {
        onSave: mockOnSave,
      })
    );

    // Manually set error state for testing
    act(() => {
      (result.current as any).error = new Error('Test error');
    });

    act(() => {
      result.current.resetError();
    });

    expect(result.current.error).toBe(null);
  });
});