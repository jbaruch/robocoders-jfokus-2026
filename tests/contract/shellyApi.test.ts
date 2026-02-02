/**
 * Shelly Gen1 API Contract Tests - TDD (Constitution Principle 2)
 * Test Specs: TS-029, TS-030, TS-031, TS-032, TS-033, TS-034, TS-035
 *
 * These tests verify the API contract with mocked responses
 * per the contract specification in contracts/shelly-bulb-api.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  ShellyApi,
  type ShellyDeviceInfo,
  type ShellyStatus,
  type ShellySettings,
  type ShellyLightResponse,
} from '@/services/shellyApi';

describe('Shelly Gen1 API Contract', () => {
  let api: ShellyApi;
  const testIp = '192.168.1.100';

  beforeEach(() => {
    api = new ShellyApi(testIp);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  // TS-029: /shelly endpoint returns device info
  describe('GET /shelly (TS-029)', () => {
    it('should return device info with type, mac, fw, auth fields', async () => {
      const mockResponse: ShellyDeviceInfo = {
        type: 'SHRGBW2',
        mac: 'AABBCCDDEEFF',
        fw: '20230913-114432/v1.14.0',
        auth: false,
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await api.getDeviceInfo();

      expect(result).toHaveProperty('type');
      expect(result).toHaveProperty('mac');
      expect(result).toHaveProperty('fw');
      expect(result).toHaveProperty('auth');
      expect(result.type).toBe('SHRGBW2');
      expect(result.auth).toBe(false);
    });

    it('should call correct endpoint', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ type: 'SHRGBW2', mac: 'AA', fw: '1.0', auth: false }),
      } as Response);

      await api.getDeviceInfo();

      expect(fetchSpy).toHaveBeenCalledWith(
        `http://${testIp}/shelly`,
        expect.objectContaining({ signal: expect.any(AbortSignal) })
      );
    });
  });

  // TS-030: /status endpoint returns lights array
  describe('GET /status (TS-030)', () => {
    it('should return status with lights array', async () => {
      const mockResponse: ShellyStatus = {
        lights: [
          {
            ison: true,
            mode: 'color',
            red: 255,
            green: 128,
            blue: 64,
            white: 0,
            gain: 100,
            brightness: 100,
          },
        ],
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await api.getStatus();

      expect(result).toHaveProperty('lights');
      expect(Array.isArray(result.lights)).toBe(true);
      expect(result.lights[0]).toHaveProperty('ison');
      expect(result.lights[0]).toHaveProperty('mode');
      expect(result.lights[0]).toHaveProperty('red');
      expect(result.lights[0]).toHaveProperty('green');
      expect(result.lights[0]).toHaveProperty('blue');
    });
  });

  // TS-031: /settings endpoint returns device settings
  describe('GET /settings (TS-031)', () => {
    it('should return settings with device.type, name, mode', async () => {
      const mockResponse: ShellySettings = {
        device: {
          type: 'SHRGBW2',
          mac: 'AABBCCDDEEFF',
          hostname: 'shellyrgbw2-AABBCCDDEEFF',
        },
        name: 'Living Room Bulb',
        mode: 'color',
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await api.getSettings();

      expect(result).toHaveProperty('device');
      expect(result.device).toHaveProperty('type');
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('mode');
    });
  });

  // TS-032: /light/0 endpoint accepts color params
  describe('GET /light/0 (TS-032)', () => {
    it('should accept color parameters and return light status', async () => {
      const mockResponse: ShellyLightResponse = {
        ison: true,
        mode: 'color',
        red: 255,
        green: 128,
        blue: 64,
        white: 0,
        gain: 100,
      };

      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      } as Response);

      const result = await api.setColor(255, 128, 64);

      expect(result.red).toBe(255);
      expect(result.green).toBe(128);
      expect(result.blue).toBe(64);
    });

    it('should construct correct URL with color parameters', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ison: true, mode: 'color', red: 255, green: 128, blue: 64 }),
      } as Response);

      await api.setColor(255, 128, 64);

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('/light/0?'),
        expect.any(Object)
      );
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('red=255'),
        expect.any(Object)
      );
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('green=128'),
        expect.any(Object)
      );
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('blue=64'),
        expect.any(Object)
      );
    });

    it('should include turn=on parameter', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ison: true, mode: 'color', red: 0, green: 0, blue: 0 }),
      } as Response);

      await api.setColor(0, 0, 0);

      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining('turn=on'),
        expect.any(Object)
      );
    });
  });

  // TS-033: API timeout after 3 seconds
  describe('Timeout (TS-033)', () => {
    it('should timeout after 3 seconds', async () => {
      // Use real timers for this test since AbortController doesn't work well with fake timers
      vi.useRealTimers();

      vi.spyOn(globalThis, 'fetch').mockImplementation((_url, options) => {
        return new Promise((_resolve, reject) => {
          // Listen to the abort signal
          const signal = options?.signal as AbortSignal | undefined;
          if (signal) {
            signal.addEventListener('abort', () => {
              reject(new DOMException('Aborted', 'AbortError'));
            });
          }
        });
      });

      // The API has a 3 second timeout, so this should reject
      await expect(api.getDeviceInfo()).rejects.toThrow();
    }, 5000); // Allow 5 seconds for this test
  });

  // TS-034: Non-light device returns error
  describe('Device validation (TS-034)', () => {
    it('should detect non-light device from /status without lights[]', async () => {
      const statusWithoutLights: ShellyStatus = {
        lights: [],
      };

      const result = api.hasLightsCapability(statusWithoutLights);

      expect(result).toBe(false);
    });

    it('should detect light device from /status with lights[]', async () => {
      const statusWithLights: ShellyStatus = {
        lights: [{ ison: true, mode: 'color', red: 0, green: 0, blue: 0, white: 0, gain: 100, brightness: 100 }],
      };

      const result = api.hasLightsCapability(statusWithLights);

      expect(result).toBe(true);
    });
  });

  // TS-035: Auth-enabled device returns error
  describe('Auth detection (TS-035)', () => {
    it('should detect auth-enabled device', () => {
      const deviceWithAuth: ShellyDeviceInfo = {
        type: 'SHRGBW2',
        mac: 'AA',
        fw: '1.0',
        auth: true,
      };

      const result = api.requiresAuth(deviceWithAuth);

      expect(result).toBe(true);
    });

    it('should detect no-auth device', () => {
      const deviceNoAuth: ShellyDeviceInfo = {
        type: 'SHRGBW2',
        mac: 'AA',
        fw: '1.0',
        auth: false,
      };

      const result = api.requiresAuth(deviceNoAuth);

      expect(result).toBe(false);
    });
  });

  describe('Discovery flow', () => {
    it('should perform complete discovery flow: /shelly -> /status -> /settings', async () => {
      const fetchSpy = vi.spyOn(globalThis, 'fetch');

      fetchSpy
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ type: 'SHRGBW2', mac: 'AA', fw: '1.0', auth: false }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            lights: [{ ison: true, mode: 'color', red: 0, green: 0, blue: 0, white: 0, gain: 100, brightness: 100 }],
          }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            device: { type: 'SHRGBW2', mac: 'AA', hostname: 'test' },
            name: 'Test Bulb',
            mode: 'color',
          }),
        } as Response);

      const result = await api.discover();

      expect(fetchSpy).toHaveBeenCalledTimes(3);
      expect(result.success).toBe(true);
      expect(result.deviceInfo).toBeDefined();
    });

    it('should fail discovery if device has no lights capability', async () => {
      vi.spyOn(globalThis, 'fetch')
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ type: 'SHSW-1', mac: 'AA', fw: '1.0', auth: false }),
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ lights: [] }), // No lights
        } as Response);

      const result = await api.discover();

      expect(result.success).toBe(false);
      expect(result.error).toContain('compatible');
    });

    it('should fail discovery if device requires auth', async () => {
      vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ type: 'SHRGBW2', mac: 'AA', fw: '1.0', auth: true }),
      } as Response);

      const result = await api.discover();

      expect(result.success).toBe(false);
      expect(result.error).toContain('auth');
    });
  });
});
