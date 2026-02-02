/**
 * Color Transmission Service - Throttled color updates to bulb
 * Implements: US-007
 * Test Specs: TS-032, TS-048
 *
 * Constitution Compliance:
 * - P1: Proven throttling pattern
 * - P4: Graceful degradation on transmission errors
 */

import type { Color } from '@/types/color';

/**
 * Callback to send color to bulb
 */
type SetColorFn = (r: number, g: number, b: number) => Promise<void>;

/**
 * Throttle interval in milliseconds (10Hz = 100ms)
 */
const THROTTLE_INTERVAL = 100;

/**
 * Service for throttled color transmission to bulb.
 *
 * Per TS-048: Throttled to 10 updates/second (100ms interval)
 * Per FR-005: Skips timed-out updates (no queuing)
 */
export class ColorTransmissionService {
  private readonly setColor: SetColorFn;
  private isRunning = false;
  private pendingColor: Color | null = null;
  private lastSentColor: Color | null = null;
  private throttleTimeout: number | null = null;
  private canSend = true;

  constructor(setColor: SetColorFn) {
    this.setColor = setColor;
  }

  /**
   * Start the transmission service
   */
  start(): void {
    this.isRunning = true;
    this.canSend = true;
  }

  /**
   * Stop the transmission service
   */
  stop(): void {
    this.isRunning = false;
    this.pendingColor = null;

    if (this.throttleTimeout !== null) {
      clearTimeout(this.throttleTimeout);
      this.throttleTimeout = null;
    }
  }

  /**
   * Send a color to the bulb (throttled)
   *
   * @param color - Color to send
   */
  sendColor(color: Color): void {
    if (!this.isRunning) {
      return;
    }

    // Skip if same as last sent color
    if (this.lastSentColor && this.isSameColor(color, this.lastSentColor)) {
      return;
    }

    if (this.canSend) {
      // Send immediately
      this.transmit(color);
      this.startThrottle();
    } else {
      // Queue for next throttle window (overwrites any pending)
      this.pendingColor = color;
    }
  }

  /**
   * Check if two colors are the same
   */
  private isSameColor(a: Color, b: Color): boolean {
    return a.r === b.r && a.g === b.g && a.b === b.b;
  }

  /**
   * Actually transmit the color
   */
  private transmit(color: Color): void {
    this.lastSentColor = color;

    // Fire and forget - don't await
    this.setColor(color.r, color.g, color.b).catch(() => {
      // Silently ignore transmission errors
      // The bulb might be temporarily unreachable
    });
  }

  /**
   * Start the throttle timer
   */
  private startThrottle(): void {
    this.canSend = false;

    this.throttleTimeout = window.setTimeout(() => {
      this.canSend = true;
      this.throttleTimeout = null;

      // Send pending color if any
      if (this.pendingColor && this.isRunning) {
        const color = this.pendingColor;
        this.pendingColor = null;

        // Check if it's different from last sent
        if (!this.lastSentColor || !this.isSameColor(color, this.lastSentColor)) {
          this.transmit(color);
          this.startThrottle();
        }
      }
    }, THROTTLE_INTERVAL);
  }
}
