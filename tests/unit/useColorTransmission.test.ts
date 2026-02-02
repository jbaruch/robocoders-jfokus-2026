/**
 * useColorTransmission Hook Tests - TDD (Constitution Principle 2)
 * Test Specs: TS-020, TS-021, TS-022
 *
 * Tests for the color transmission hook.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useColorTransmission } from '@/hooks/useColorTransmission';
import { createColor } from '@/types/color';

describe('useColorTransmission Hook', () => {
  let mockSetColor: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    mockSetColor = vi.fn().mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // TS-020: Color flows to bulb automatically
  describe('Automatic transmission (TS-020)', () => {
    it('should start transmission when enabled', () => {
      const { result } = renderHook(() =>
        useColorTransmission({
          setColor: mockSetColor,
          enabled: true,
        })
      );

      act(() => {
        result.current.transmit(createColor(255, 0, 0));
      });

      expect(mockSetColor).toHaveBeenCalledWith(255, 0, 0);
    });

    it('should not transmit when disabled', () => {
      const { result } = renderHook(() =>
        useColorTransmission({
          setColor: mockSetColor,
          enabled: false,
        })
      );

      act(() => {
        result.current.transmit(createColor(255, 0, 0));
      });

      expect(mockSetColor).not.toHaveBeenCalled();
    });
  });

  // TS-021: Transmission pauses when disconnected
  describe('Connection-aware transmission (TS-021)', () => {
    it('should pause transmission when disabled', () => {
      const { result, rerender } = renderHook(
        ({ enabled }) =>
          useColorTransmission({
            setColor: mockSetColor,
            enabled,
          }),
        { initialProps: { enabled: true } }
      );

      act(() => {
        result.current.transmit(createColor(255, 0, 0));
      });
      expect(mockSetColor).toHaveBeenCalledTimes(1);

      // Disable
      rerender({ enabled: false });

      act(() => {
        result.current.transmit(createColor(0, 255, 0));
      });

      // Should not have transmitted the second color
      expect(mockSetColor).toHaveBeenCalledTimes(1);
    });

    it('should resume transmission when re-enabled', () => {
      const { result, rerender } = renderHook(
        ({ enabled }) =>
          useColorTransmission({
            setColor: mockSetColor,
            enabled,
          }),
        { initialProps: { enabled: false } }
      );

      act(() => {
        result.current.transmit(createColor(255, 0, 0));
      });
      expect(mockSetColor).not.toHaveBeenCalled();

      // Enable
      rerender({ enabled: true });

      act(() => {
        result.current.transmit(createColor(0, 255, 0));
      });

      expect(mockSetColor).toHaveBeenCalledWith(0, 255, 0);
    });
  });

  // TS-022: Throttling and smoothing
  describe('Throttling (TS-022)', () => {
    it('should throttle rapid color updates', () => {
      const { result } = renderHook(() =>
        useColorTransmission({
          setColor: mockSetColor,
          enabled: true,
        })
      );

      // Send multiple colors rapidly
      act(() => {
        result.current.transmit(createColor(255, 0, 0));
        result.current.transmit(createColor(0, 255, 0));
        result.current.transmit(createColor(0, 0, 255));
      });

      // Only first should be sent immediately
      expect(mockSetColor).toHaveBeenCalledTimes(1);

      // Advance time
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Second transmission should happen with latest color
      expect(mockSetColor).toHaveBeenCalledTimes(2);
      expect(mockSetColor).toHaveBeenLastCalledWith(0, 0, 255);
    });
  });

  // Cleanup
  describe('Cleanup', () => {
    it('should stop transmission on unmount', () => {
      const { result, unmount } = renderHook(() =>
        useColorTransmission({
          setColor: mockSetColor,
          enabled: true,
        })
      );

      act(() => {
        result.current.transmit(createColor(255, 0, 0));
      });

      unmount();

      // Try to advance time after unmount
      act(() => {
        vi.advanceTimersByTime(200);
      });

      // Should only have one call (no pending transmissions after unmount)
      expect(mockSetColor).toHaveBeenCalledTimes(1);
    });
  });
});
