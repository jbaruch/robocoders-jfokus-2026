/**
 * BulbStatus Tests - TDD (Constitution Principle 2)
 * Test Specs: TS-042, TS-043
 */
import { describe, it, expect } from 'vitest';
import {
  type BulbStatus,
  type BulbDeviceInfo,
  isValidBulbTransition,
  getBulbStatusMessage,
  isBulbConnected,
  isBulbError,
  isBulbLoading,
} from '@/types/bulb';

describe('BulbStatus State Machine (TS-042, TS-043)', () => {
  describe('State definitions', () => {
    it('should have not_configured state', () => {
      const status: BulbStatus = 'not_configured';
      expect(status).toBe('not_configured');
    });

    it('should have discovering state', () => {
      const status: BulbStatus = 'discovering';
      expect(status).toBe('discovering');
    });

    it('should have connected state', () => {
      const status: BulbStatus = 'connected';
      expect(status).toBe('connected');
    });

    it('should have disconnected state', () => {
      const status: BulbStatus = 'disconnected';
      expect(status).toBe('disconnected');
    });

    it('should have failed state', () => {
      const status: BulbStatus = 'failed';
      expect(status).toBe('failed');
    });
  });

  describe('BulbDeviceInfo (TS-042)', () => {
    it('should have required fields', () => {
      const deviceInfo: BulbDeviceInfo = {
        type: 'SHRGBW2',
        mac: 'AABBCCDDEEFF',
        firmware: '1.0',
        authRequired: false,
        name: 'Test Bulb',
        mode: 'color',
        hasLights: true,
        lightChannels: 1,
      };

      expect(deviceInfo.type).toBe('SHRGBW2');
      expect(deviceInfo.mac).toBe('AABBCCDDEEFF');
      expect(deviceInfo.authRequired).toBe(false);
      expect(deviceInfo.name).toBe('Test Bulb');
      expect(deviceInfo.hasLights).toBe(true);
    });
  });

  describe('State transitions', () => {
    it('should allow not_configured -> discovering', () => {
      expect(isValidBulbTransition('not_configured', 'discovering')).toBe(true);
    });

    it('should allow discovering -> connected', () => {
      expect(isValidBulbTransition('discovering', 'connected')).toBe(true);
    });

    it('should allow discovering -> failed', () => {
      expect(isValidBulbTransition('discovering', 'failed')).toBe(true);
    });

    it('should allow connected -> disconnected', () => {
      expect(isValidBulbTransition('connected', 'disconnected')).toBe(true);
    });

    it('should allow connected -> not_configured (manual disconnect)', () => {
      expect(isValidBulbTransition('connected', 'not_configured')).toBe(true);
    });

    it('should allow disconnected -> discovering (reconnect)', () => {
      expect(isValidBulbTransition('disconnected', 'discovering')).toBe(true);
    });

    it('should allow failed -> discovering (retry)', () => {
      expect(isValidBulbTransition('failed', 'discovering')).toBe(true);
    });

    it('should not allow invalid transitions', () => {
      expect(isValidBulbTransition('not_configured', 'connected')).toBe(false);
      expect(isValidBulbTransition('discovering', 'not_configured')).toBe(false);
    });
  });

  describe('Status messages (FR-016)', () => {
    it('should return appropriate message for not_configured', () => {
      const message = getBulbStatusMessage('not_configured');
      expect(message.toLowerCase()).toContain('no bulb');
    });

    it('should return appropriate message for discovering', () => {
      const message = getBulbStatusMessage('discovering');
      expect(message.toLowerCase()).toContain('discover');
    });

    it('should return appropriate message for connected', () => {
      const message = getBulbStatusMessage('connected');
      expect(message.toLowerCase()).toContain('connected');
    });

    it('should return appropriate message for disconnected', () => {
      const message = getBulbStatusMessage('disconnected');
      expect(message.toLowerCase()).toContain('disconnected');
    });

    it('should return appropriate message for failed', () => {
      const message = getBulbStatusMessage('failed');
      expect(message.toLowerCase()).toContain('failed');
    });
  });

  describe('Type guards', () => {
    it('isBulbConnected should return true for connected status', () => {
      expect(isBulbConnected('connected')).toBe(true);
    });

    it('isBulbConnected should return false for other statuses', () => {
      expect(isBulbConnected('not_configured')).toBe(false);
      expect(isBulbConnected('discovering')).toBe(false);
      expect(isBulbConnected('failed')).toBe(false);
    });

    it('isBulbError should return true for failed status', () => {
      expect(isBulbError('failed')).toBe(true);
    });

    it('isBulbError should return false for non-error statuses', () => {
      expect(isBulbError('connected')).toBe(false);
      expect(isBulbError('not_configured')).toBe(false);
    });

    it('isBulbLoading should return true for discovering status', () => {
      expect(isBulbLoading('discovering')).toBe(true);
    });

    it('isBulbLoading should return false for non-loading statuses', () => {
      expect(isBulbLoading('connected')).toBe(false);
      expect(isBulbLoading('failed')).toBe(false);
    });
  });
});
