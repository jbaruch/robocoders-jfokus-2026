/**
 * useColorTransmission Hook - React wrapper for color transmission service
 * Implements: US-007
 * Test Specs: TS-020, TS-021, TS-022
 *
 * Constitution Compliance:
 * - P1: Uses proven throttling service
 * - P4: Graceful handling of connection state changes
 */

import { useEffect, useRef, useCallback } from 'react';
import type { Color } from '@/types/color';
import { ColorTransmissionService } from '@/services/colorTransmission';

export interface UseColorTransmissionOptions {
  /** Function to send color to bulb */
  setColor: (r: number, g: number, b: number) => Promise<void>;
  /** Whether transmission is enabled (bulb connected) */
  enabled: boolean;
}

export interface UseColorTransmissionResult {
  /** Transmit a color to the bulb (throttled) */
  transmit: (color: Color) => void;
}

/**
 * Hook for managing throttled color transmission to bulb.
 *
 * @param options - Configuration options
 * @returns Transmission controls
 *
 * Per TS-020: Color flows to bulb automatically
 * Per TS-021: Pauses when bulb disconnects
 * Per TS-022: Throttled to 10Hz
 */
export function useColorTransmission(
  options: UseColorTransmissionOptions
): UseColorTransmissionResult {
  const { setColor, enabled } = options;

  // Keep service in ref to persist across renders
  const serviceRef = useRef<ColorTransmissionService | null>(null);

  // Initialize service on mount
  useEffect(() => {
    serviceRef.current = new ColorTransmissionService(setColor);

    return () => {
      serviceRef.current?.stop();
      serviceRef.current = null;
    };
  }, [setColor]);

  // Start/stop based on enabled state
  useEffect(() => {
    if (enabled) {
      serviceRef.current?.start();
    } else {
      serviceRef.current?.stop();
    }
  }, [enabled]);

  // Transmit function
  const transmit = useCallback((color: Color) => {
    serviceRef.current?.sendColor(color);
  }, []);

  return {
    transmit,
  };
}
