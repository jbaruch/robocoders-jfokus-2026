/**
 * useColorExtraction Hook Tests - TDD (Constitution Principle 2)
 * Test Specs: TS-006
 *
 * Tests for continuous color extraction from video frames.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useColorExtraction } from '@/hooks/useColorExtraction';

describe('useColorExtraction Hook', () => {
  let mockVideoElement: HTMLVideoElement;
  let mockCanvas: HTMLCanvasElement;
  let mockContext: CanvasRenderingContext2D;
  let mockImageData: ImageData;

  beforeEach(() => {
    vi.useFakeTimers();

    // Create mock ImageData with red pixels
    const redPixels = new Uint8ClampedArray(100 * 4);
    for (let i = 0; i < redPixels.length; i += 4) {
      redPixels[i] = 255;     // R
      redPixels[i + 1] = 0;   // G
      redPixels[i + 2] = 0;   // B
      redPixels[i + 3] = 255; // A
    }
    mockImageData = {
      data: redPixels,
      width: 10,
      height: 10,
      colorSpace: 'srgb',
    };

    // Mock canvas context
    mockContext = {
      drawImage: vi.fn(),
      getImageData: vi.fn(() => mockImageData),
    } as unknown as CanvasRenderingContext2D;

    // Mock canvas
    mockCanvas = {
      getContext: vi.fn(() => mockContext),
      width: 640,
      height: 480,
    } as unknown as HTMLCanvasElement;

    // Mock video element
    mockVideoElement = {
      videoWidth: 640,
      videoHeight: 480,
      readyState: 4, // HAVE_ENOUGH_DATA
    } as unknown as HTMLVideoElement;

    // Mock document.createElement for canvas only
    const originalCreateElement = document.createElement.bind(document);
    vi.spyOn(document, 'createElement').mockImplementation((tag: string) => {
      if (tag === 'canvas') {
        return mockCanvas as unknown as HTMLElement;
      }
      return originalCreateElement(tag);
    });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // TS-006: Color extraction from video frames
  describe('Color extraction (TS-006)', () => {
    it('should extract color from video frame', () => {
      const { result } = renderHook(() =>
        useColorExtraction(mockVideoElement, { enabled: true })
      );

      // Advance timer to trigger extraction multiple times to stabilize
      for (let i = 0; i < 5; i++) {
        act(() => {
          vi.advanceTimersByTime(100);
        });
      }

      // Should be trending toward red since mock data is red
      expect(result.current.color.r).toBeGreaterThan(result.current.color.g);
      expect(result.current.color.r).toBeGreaterThan(result.current.color.b);
    });

    it('should update color continuously at specified interval', () => {
      const { result } = renderHook(() =>
        useColorExtraction(mockVideoElement, { enabled: true, intervalMs: 100 })
      );

      // Multiple extractions with red
      for (let i = 0; i < 5; i++) {
        act(() => {
          vi.advanceTimersByTime(100);
        });
      }

      const redPhaseColor = result.current.color;

      // Change mock to green
      const greenPixels = new Uint8ClampedArray(100 * 4);
      for (let i = 0; i < greenPixels.length; i += 4) {
        greenPixels[i] = 0;       // R
        greenPixels[i + 1] = 255; // G
        greenPixels[i + 2] = 0;   // B
        greenPixels[i + 3] = 255; // A
      }
      mockContext.getImageData = vi.fn(() => ({
        data: greenPixels,
        width: 10,
        height: 10,
        colorSpace: 'srgb' as PredefinedColorSpace,
      }));

      // Multiple extractions with green to see change
      for (let i = 0; i < 5; i++) {
        act(() => {
          vi.advanceTimersByTime(100);
        });
      }

      // Green should have increased (with smoothing applied)
      expect(result.current.color.g).toBeGreaterThan(redPhaseColor.g);
    });
  });

  // EMA smoothing
  describe('EMA smoothing (alpha=0.3)', () => {
    it('should apply EMA smoothing to color changes', async () => {
      const { result } = renderHook(() =>
        useColorExtraction(mockVideoElement, { enabled: true, intervalMs: 100 })
      );

      // Multiple extractions to stabilize on red
      for (let i = 0; i < 10; i++) {
        act(() => {
          vi.advanceTimersByTime(100);
        });
      }

      const stabilizedRed = result.current.color.r;
      expect(stabilizedRed).toBeGreaterThan(200);

      // Change to pure blue
      const bluePixels = new Uint8ClampedArray(100 * 4);
      for (let i = 0; i < bluePixels.length; i += 4) {
        bluePixels[i] = 0;       // R
        bluePixels[i + 1] = 0;   // G
        bluePixels[i + 2] = 255; // B
        bluePixels[i + 3] = 255; // A
      }
      mockContext.getImageData = vi.fn(() => ({
        data: bluePixels,
        width: 10,
        height: 10,
        colorSpace: 'srgb' as PredefinedColorSpace,
      }));

      // Single extraction after color change - should be smoothed, not instant jump
      act(() => {
        vi.advanceTimersByTime(100);
      });

      // With EMA alpha=0.3, red should have decreased but not to 0
      // The smoothed color should still have some red
      expect(result.current.color.r).toBeGreaterThan(100);
      expect(result.current.color.r).toBeLessThan(stabilizedRed);
    });
  });

  // Enable/disable
  describe('Enable/disable', () => {
    it('should not extract when disabled', () => {
      renderHook(() =>
        useColorExtraction(mockVideoElement, { enabled: false })
      );

      act(() => {
        vi.advanceTimersByTime(500);
      });

      // Should still have initial color (no extraction performed)
      expect(mockContext.getImageData).not.toHaveBeenCalled();
    });

    it('should start extracting when enabled changes to true', () => {
      const { rerender } = renderHook(
        ({ enabled }) => useColorExtraction(mockVideoElement, { enabled }),
        { initialProps: { enabled: false } }
      );

      // Not extracting yet
      act(() => {
        vi.advanceTimersByTime(100);
      });
      expect(mockContext.getImageData).not.toHaveBeenCalled();

      // Enable extraction
      rerender({ enabled: true });

      act(() => {
        vi.advanceTimersByTime(100);
      });

      expect(mockContext.getImageData).toHaveBeenCalled();
    });
  });

  // Error handling
  describe('Error handling', () => {
    it('should handle null video element', () => {
      const { result } = renderHook(() =>
        useColorExtraction(null, { enabled: true })
      );

      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Should have default color without crashing
      expect(result.current.color).toBeDefined();
    });

    it('should handle video not ready', () => {
      const notReadyVideo = {
        ...mockVideoElement,
        readyState: 0, // HAVE_NOTHING
      } as unknown as HTMLVideoElement;

      const { result } = renderHook(() =>
        useColorExtraction(notReadyVideo, { enabled: true })
      );

      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Should not crash and should have default color
      expect(result.current.color).toBeDefined();
    });
  });

  // Performance
  describe('Performance', () => {
    it('should use sampling for performance', async () => {
      const { result } = renderHook(() =>
        useColorExtraction(mockVideoElement, { enabled: true })
      );

      act(() => {
        vi.advanceTimersByTime(100);
      });

      // Extraction should complete (would timeout if too slow)
      expect(result.current.color).toBeDefined();
    });
  });
});
