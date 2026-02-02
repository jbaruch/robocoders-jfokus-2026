/**
 * Color Transmission Service Tests - TDD (Constitution Principle 2)
 * Test Specs: TS-032, TS-048
 *
 * Tests for throttled color transmission to bulb.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ColorTransmissionService } from '@/services/colorTransmission';
import { createColor } from '@/types/color';

describe('ColorTransmissionService', () => {
  let service: ColorTransmissionService;
  let mockSetColor: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.useFakeTimers();
    mockSetColor = vi.fn().mockResolvedValue(undefined);
    service = new ColorTransmissionService(mockSetColor);
  });

  afterEach(() => {
    service.stop();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // TS-048: Throttled to 10 updates/second
  describe('Throttling (TS-048)', () => {
    it('should throttle updates to 100ms interval', () => {
      service.start();

      // Send multiple colors rapidly
      service.sendColor(createColor(255, 0, 0));
      service.sendColor(createColor(0, 255, 0));
      service.sendColor(createColor(0, 0, 255));

      // Should only send first one immediately
      expect(mockSetColor).toHaveBeenCalledTimes(1);
      expect(mockSetColor).toHaveBeenCalledWith(255, 0, 0);

      // Advance time by 100ms
      vi.advanceTimersByTime(100);

      // Should send the latest color (blue, not green)
      expect(mockSetColor).toHaveBeenCalledTimes(2);
      expect(mockSetColor).toHaveBeenLastCalledWith(0, 0, 255);
    });

    it('should not queue colors - only send latest', () => {
      service.start();

      service.sendColor(createColor(255, 0, 0));
      expect(mockSetColor).toHaveBeenCalledTimes(1);

      // Rapidly send many colors
      for (let i = 0; i < 10; i++) {
        service.sendColor(createColor(i * 25, i * 25, i * 25));
      }

      // Advance time
      vi.advanceTimersByTime(100);

      // Should only have sent 2 total (initial + latest after throttle)
      expect(mockSetColor).toHaveBeenCalledTimes(2);
      // Last call should be the final color
      expect(mockSetColor).toHaveBeenLastCalledWith(225, 225, 225);
    });

    it('should send at 10Hz rate when continuously updating', () => {
      service.start();

      // Simulate 1 second of continuous color updates
      for (let i = 0; i < 100; i++) {
        service.sendColor(createColor(i, i, i));
        vi.advanceTimersByTime(10); // 10ms intervals
      }

      // Should have sent approximately 10-11 times (100ms throttle = 10Hz)
      expect(mockSetColor.mock.calls.length).toBeGreaterThanOrEqual(10);
      expect(mockSetColor.mock.calls.length).toBeLessThanOrEqual(12);
    });
  });

  // Start/stop
  describe('Start/Stop', () => {
    it('should not send when stopped', () => {
      // Don't start the service
      service.sendColor(createColor(255, 0, 0));

      expect(mockSetColor).not.toHaveBeenCalled();
    });

    it('should stop sending when stop() called', () => {
      service.start();
      service.sendColor(createColor(255, 0, 0));
      expect(mockSetColor).toHaveBeenCalledTimes(1);

      service.stop();

      // Queue another color
      service.sendColor(createColor(0, 255, 0));

      // Advance time
      vi.advanceTimersByTime(200);

      // Should not have sent the second color
      expect(mockSetColor).toHaveBeenCalledTimes(1);
    });

    it('should resume sending after restart', () => {
      service.start();
      service.sendColor(createColor(255, 0, 0));
      service.stop();

      service.start();
      service.sendColor(createColor(0, 255, 0));

      expect(mockSetColor).toHaveBeenCalledTimes(2);
      expect(mockSetColor).toHaveBeenLastCalledWith(0, 255, 0);
    });
  });

  // Error handling
  describe('Error handling', () => {
    it('should continue on transmission error', async () => {
      mockSetColor.mockRejectedValueOnce(new Error('Network error'));
      service.start();

      service.sendColor(createColor(255, 0, 0));

      // Should not throw
      vi.advanceTimersByTime(100);

      // Try another color
      service.sendColor(createColor(0, 255, 0));
      vi.advanceTimersByTime(100);

      expect(mockSetColor).toHaveBeenCalledTimes(2);
    });
  });

  // Skip duplicate colors
  describe('Duplicate detection', () => {
    it('should skip sending identical colors', () => {
      service.start();

      const red = createColor(255, 0, 0);
      service.sendColor(red);
      expect(mockSetColor).toHaveBeenCalledTimes(1);

      vi.advanceTimersByTime(100);

      // Send same color again
      service.sendColor(createColor(255, 0, 0));
      vi.advanceTimersByTime(100);

      // Should not have sent again
      expect(mockSetColor).toHaveBeenCalledTimes(1);
    });

    it('should send when color actually changes', () => {
      service.start();

      service.sendColor(createColor(255, 0, 0));
      vi.advanceTimersByTime(100);

      service.sendColor(createColor(255, 1, 0)); // Slightly different
      vi.advanceTimersByTime(100);

      expect(mockSetColor).toHaveBeenCalledTimes(2);
    });
  });
});
