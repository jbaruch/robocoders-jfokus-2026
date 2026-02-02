/**
 * WebcamStatus Tests - TDD (Constitution Principle 2)
 * Test Specs: TS-041
 */
import { describe, it, expect } from 'vitest';
import {
  type WebcamStatus,
  isValidWebcamTransition,
  getWebcamStatusMessage,
  isStreaming,
  isWebcamError,
} from '@/types/webcam';

describe('WebcamStatus State Machine (TS-041)', () => {
  describe('State definitions', () => {
    it('should have initial state', () => {
      const status: WebcamStatus = 'initial';
      expect(status).toBe('initial');
    });

    it('should have requesting state', () => {
      const status: WebcamStatus = 'requesting';
      expect(status).toBe('requesting');
    });

    it('should have streaming state', () => {
      const status: WebcamStatus = 'streaming';
      expect(status).toBe('streaming');
    });

    it('should have denied state', () => {
      const status: WebcamStatus = 'denied';
      expect(status).toBe('denied');
    });

    it('should have not_available state', () => {
      const status: WebcamStatus = 'not_available';
      expect(status).toBe('not_available');
    });

    it('should have disconnected state', () => {
      const status: WebcamStatus = 'disconnected';
      expect(status).toBe('disconnected');
    });
  });

  describe('State transitions', () => {
    it('should allow initial -> requesting', () => {
      expect(isValidWebcamTransition('initial', 'requesting')).toBe(true);
    });

    it('should allow requesting -> streaming', () => {
      expect(isValidWebcamTransition('requesting', 'streaming')).toBe(true);
    });

    it('should allow requesting -> denied', () => {
      expect(isValidWebcamTransition('requesting', 'denied')).toBe(true);
    });

    it('should allow requesting -> not_available', () => {
      expect(isValidWebcamTransition('requesting', 'not_available')).toBe(true);
    });

    it('should allow streaming -> disconnected', () => {
      expect(isValidWebcamTransition('streaming', 'disconnected')).toBe(true);
    });

    it('should allow disconnected -> streaming (reconnect)', () => {
      expect(isValidWebcamTransition('disconnected', 'streaming')).toBe(true);
    });

    it('should allow disconnected -> requesting (retry)', () => {
      expect(isValidWebcamTransition('disconnected', 'requesting')).toBe(true);
    });

    it('should not allow invalid transitions', () => {
      expect(isValidWebcamTransition('initial', 'streaming')).toBe(false);
      expect(isValidWebcamTransition('denied', 'streaming')).toBe(false);
      expect(isValidWebcamTransition('streaming', 'initial')).toBe(false);
    });
  });

  describe('Status messages (FR-016)', () => {
    it('should return appropriate message for initial state', () => {
      const message = getWebcamStatusMessage('initial');
      expect(message.toLowerCase()).toContain('camera');
    });

    it('should return appropriate message for requesting state', () => {
      const message = getWebcamStatusMessage('requesting');
      expect(message.toLowerCase()).toContain('request');
    });

    it('should return appropriate message for denied state', () => {
      const message = getWebcamStatusMessage('denied');
      expect(message.toLowerCase()).toContain('denied');
    });

    it('should return appropriate message for not_available state', () => {
      const message = getWebcamStatusMessage('not_available');
      expect(message.toLowerCase()).toContain('not found');
    });

    it('should return appropriate message for disconnected state', () => {
      const message = getWebcamStatusMessage('disconnected');
      expect(message.toLowerCase()).toContain('disconnected');
    });
  });

  describe('Type guards', () => {
    it('isStreaming should return true for streaming status', () => {
      expect(isStreaming('streaming')).toBe(true);
    });

    it('isStreaming should return false for other statuses', () => {
      expect(isStreaming('initial')).toBe(false);
      expect(isStreaming('requesting')).toBe(false);
      expect(isStreaming('denied')).toBe(false);
    });

    it('isWebcamError should return true for error statuses', () => {
      expect(isWebcamError('denied')).toBe(true);
      expect(isWebcamError('not_available')).toBe(true);
    });

    it('isWebcamError should return false for non-error statuses', () => {
      expect(isWebcamError('initial')).toBe(false);
      expect(isWebcamError('streaming')).toBe(false);
    });
  });
});
