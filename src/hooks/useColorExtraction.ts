/**
 * useColorExtraction Hook - Continuous color extraction from video
 * Implements: US-002
 * Test Specs: TS-006, TS-044
 *
 * Constitution Compliance:
 * - P1: Uses proven K-Means algorithm
 * - P2: Tests written first
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import type { Color } from '@/types/color';
import { createColor, NO_COLOR } from '@/types/color';
import { extractDominantColor } from '@/services/colorExtractor';

export interface UseColorExtractionOptions {
  /** Whether extraction is enabled (default: true) */
  enabled?: boolean;
  /** Extraction interval in milliseconds (default: 100ms for 10fps) */
  intervalMs?: number;
  /** EMA smoothing alpha (0-1, default: 0.3) */
  smoothingAlpha?: number;
}

export interface UseColorExtractionResult {
  /** Current extracted color (smoothed) */
  color: Color;
  /** Raw color before smoothing */
  rawColor: Color;
  /** Whether extraction is active */
  isExtracting: boolean;
}

/**
 * Canvas dimensions for extraction (smaller = faster)
 */
const EXTRACT_WIDTH = 160;
const EXTRACT_HEIGHT = 120;

/**
 * Hook for continuously extracting dominant color from video frames.
 *
 * @param videoElement - Video element to extract from (or null)
 * @param options - Configuration options
 * @returns Color extraction state
 *
 * Per FR-003: Identifies dominant color via K-Means
 * Per FR-005: Updates within 500ms of scene change
 * Per NFR-002: Extraction < 100ms per frame
 */
export function useColorExtraction(
  videoElement: HTMLVideoElement | null,
  options: UseColorExtractionOptions = {}
): UseColorExtractionResult {
  const {
    enabled = true,
    intervalMs = 100,
    smoothingAlpha = 0.3,
  } = options;

  const [color, setColor] = useState<Color>(NO_COLOR);
  const [rawColor, setRawColor] = useState<Color>(NO_COLOR);
  const [isExtracting, setIsExtracting] = useState(false);

  // Refs for mutable values
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const smoothedColorRef = useRef<Color>(NO_COLOR);
  const intervalRef = useRef<number | null>(null);

  /**
   * Apply EMA smoothing to color transition
   */
  const smoothColor = useCallback(
    (newColor: Color, currentColor: Color): Color => {
      const alpha = smoothingAlpha;
      const oneMinusAlpha = 1 - alpha;

      const r = Math.round(alpha * newColor.r + oneMinusAlpha * currentColor.r);
      const g = Math.round(alpha * newColor.g + oneMinusAlpha * currentColor.g);
      const b = Math.round(alpha * newColor.b + oneMinusAlpha * currentColor.b);

      return createColor(r, g, b);
    },
    [smoothingAlpha]
  );

  /**
   * Extract color from current video frame
   */
  const extractFrame = useCallback(() => {
    if (!videoElement || !enabled) {
      return;
    }

    // Check if video is ready
    if (videoElement.readyState < 2) {
      // HAVE_CURRENT_DATA
      return;
    }

    // Initialize canvas if needed
    if (!canvasRef.current) {
      canvasRef.current = document.createElement('canvas');
      canvasRef.current.width = EXTRACT_WIDTH;
      canvasRef.current.height = EXTRACT_HEIGHT;
      contextRef.current = canvasRef.current.getContext('2d', {
        willReadFrequently: true,
      });
    }

    const ctx = contextRef.current;
    if (!ctx) {
      return;
    }

    try {
      // Draw video frame to canvas (scaled down for performance)
      ctx.drawImage(
        videoElement,
        0,
        0,
        videoElement.videoWidth,
        videoElement.videoHeight,
        0,
        0,
        EXTRACT_WIDTH,
        EXTRACT_HEIGHT
      );

      // Get pixel data
      const imageData = ctx.getImageData(0, 0, EXTRACT_WIDTH, EXTRACT_HEIGHT);

      // Extract dominant color
      const extracted = extractDominantColor(imageData);
      setRawColor(extracted);

      // Apply EMA smoothing
      const smoothed = smoothColor(extracted, smoothedColorRef.current);
      smoothedColorRef.current = smoothed;
      setColor(smoothed);
    } catch {
      // Silently handle extraction errors (e.g., tainted canvas)
    }
  }, [videoElement, enabled, smoothColor]);

  // Set up extraction interval
  useEffect(() => {
    if (!enabled || !videoElement) {
      setIsExtracting(false);
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    setIsExtracting(true);

    // Start extraction loop
    intervalRef.current = window.setInterval(extractFrame, intervalMs);

    return () => {
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [enabled, videoElement, intervalMs, extractFrame]);

  return {
    color,
    rawColor,
    isExtracting,
  };
}
