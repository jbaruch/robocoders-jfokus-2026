/**
 * useBulbConnection Hook Tests - TDD (Constitution Principle 2)
 * Test Specs: TS-016, TS-017, TS-019, TS-027
 *
 * Tests for bulb connection lifecycle management.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBulbConnection } from '@/hooks/useBulbConnection';

describe('useBulbConnection Hook', () => {

  beforeEach(() => {
    // Reset localStorage mock
    const store: Record<string, string> = {};
    vi.stubGlobal('localStorage', {
      getItem: vi.fn((key: string) => store[key] || null),
      setItem: vi.fn((key: string, value: string) => {
        store[key] = value;
      }),
      removeItem: vi.fn((key: string) => {
        delete store[key];
      }),
      clear: vi.fn(() => {
        Object.keys(store).forEach((key) => delete store[key]);
      }),
    });

    // Mock fetch for API calls
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // Initial state
  describe('Initial state', () => {
    it('should start with not_configured status', () => {
      const { result } = renderHook(() => useBulbConnection());

      expect(result.current.status).toBe('not_configured');
    });

    it('should have null deviceInfo initially', () => {
      const { result } = renderHook(() => useBulbConnection());

      expect(result.current.deviceInfo).toBeNull();
    });

    it('should have empty IP initially', () => {
      const { result } = renderHook(() => useBulbConnection());

      expect(result.current.ip).toBe('');
    });
  });

  // TS-019: IP persistence
  describe('IP persistence (TS-019)', () => {
    it('should load saved IP from localStorage on mount', () => {
      localStorage.setItem('shelly-bulb-ip', '192.168.1.50');

      const { result } = renderHook(() => useBulbConnection());

      expect(result.current.ip).toBe('192.168.1.50');
    });

    it('should save IP to localStorage on successful connection', async () => {
      (globalThis.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ type: 'SHRGBW2', mac: 'AA', fw: '1.0', auth: false }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              lights: [{ ison: true, mode: 'color', red: 0, green: 0, blue: 0, white: 0, gain: 100, brightness: 100 }],
            }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              device: { type: 'SHRGBW2', mac: 'AA', hostname: 'test' },
              name: 'Test',
              mode: 'color',
            }),
        });

      const { result } = renderHook(() => useBulbConnection());

      await act(async () => {
        await result.current.connect('192.168.1.100');
      });

      expect(localStorage.getItem('shelly-bulb-ip')).toBe('192.168.1.100');
    });

    it('should handle localStorage unavailable gracefully', () => {
      // Simulate localStorage throwing
      const mockStorage = {
        getItem: vi.fn(() => {
          throw new Error('Storage unavailable');
        }),
        setItem: vi.fn(() => {
          throw new Error('Storage unavailable');
        }),
      };
      vi.stubGlobal('localStorage', mockStorage);

      // Should not throw
      expect(() => renderHook(() => useBulbConnection())).not.toThrow();
    });
  });

  // TS-017: Connection status
  describe('Connection status (TS-017)', () => {
    it('should transition to discovering when connecting', async () => {
      // Create a promise we can control
      let resolveShelly: (value: unknown) => void;
      const shellyPromise = new Promise((resolve) => {
        resolveShelly = resolve;
      });

      (globalThis.fetch as ReturnType<typeof vi.fn>).mockReturnValue(shellyPromise);

      const { result } = renderHook(() => useBulbConnection());

      act(() => {
        result.current.connect('192.168.1.100');
      });

      expect(result.current.status).toBe('discovering');

      // Cleanup
      resolveShelly!({ ok: false });
    });

    it('should transition to connected on successful discovery', async () => {
      (globalThis.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ type: 'SHRGBW2', mac: 'AA', fw: '1.0', auth: false }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              lights: [{ ison: true, mode: 'color', red: 0, green: 0, blue: 0, white: 0, gain: 100, brightness: 100 }],
            }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              device: { type: 'SHRGBW2', mac: 'AA', hostname: 'test' },
              name: 'Test',
              mode: 'color',
            }),
        });

      const { result } = renderHook(() => useBulbConnection());

      await act(async () => {
        await result.current.connect('192.168.1.100');
      });

      expect(result.current.status).toBe('connected');
    });

    it('should transition to failed on connection error', async () => {
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useBulbConnection());

      await act(async () => {
        await result.current.connect('192.168.1.100');
      });

      expect(result.current.status).toBe('failed');
    });

    it('should have device info after successful connection', async () => {
      (globalThis.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ type: 'SHRGBW2', mac: 'AABBCCDDEEFF', fw: '1.0', auth: false }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              lights: [{ ison: true, mode: 'color', red: 0, green: 0, blue: 0, white: 0, gain: 100, brightness: 100 }],
            }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              device: { type: 'SHRGBW2', mac: 'AABBCCDDEEFF', hostname: 'test' },
              name: 'Living Room Bulb',
              mode: 'color',
            }),
        });

      const { result } = renderHook(() => useBulbConnection());

      await act(async () => {
        await result.current.connect('192.168.1.100');
      });

      expect(result.current.deviceInfo).not.toBeNull();
      expect(result.current.deviceInfo?.name).toBe('Living Room Bulb');
    });
  });

  // Disconnect
  describe('Disconnect', () => {
    it('should transition to not_configured on disconnect', async () => {
      (globalThis.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ type: 'SHRGBW2', mac: 'AA', fw: '1.0', auth: false }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              lights: [{ ison: true, mode: 'color', red: 0, green: 0, blue: 0, white: 0, gain: 100, brightness: 100 }],
            }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              device: { type: 'SHRGBW2', mac: 'AA', hostname: 'test' },
              name: 'Test',
              mode: 'color',
            }),
        });

      const { result } = renderHook(() => useBulbConnection());

      await act(async () => {
        await result.current.connect('192.168.1.100');
      });

      expect(result.current.status).toBe('connected');

      act(() => {
        result.current.disconnect();
      });

      expect(result.current.status).toBe('not_configured');
      expect(result.current.deviceInfo).toBeNull();
    });
  });

  // Error handling
  describe('Error handling', () => {
    it('should provide error message on failure', async () => {
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Connection refused'));

      const { result } = renderHook(() => useBulbConnection());

      await act(async () => {
        await result.current.connect('192.168.1.100');
      });

      expect(result.current.error).toBeDefined();
    });

    it('should clear error on new connection attempt', async () => {
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockRejectedValue(new Error('Error'));

      const { result } = renderHook(() => useBulbConnection());

      await act(async () => {
        await result.current.connect('192.168.1.100');
      });

      expect(result.current.error).toBeDefined();

      // Start new connection
      (globalThis.fetch as ReturnType<typeof vi.fn>).mockReturnValue(new Promise(() => {}));

      act(() => {
        result.current.connect('192.168.1.101');
      });

      expect(result.current.error).toBeNull();
    });
  });

  // Set color
  describe('setColor', () => {
    it('should send color to connected bulb', async () => {
      (globalThis.fetch as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ type: 'SHRGBW2', mac: 'AA', fw: '1.0', auth: false }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              lights: [{ ison: true, mode: 'color', red: 0, green: 0, blue: 0, white: 0, gain: 100, brightness: 100 }],
            }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () =>
            Promise.resolve({
              device: { type: 'SHRGBW2', mac: 'AA', hostname: 'test' },
              name: 'Test',
              mode: 'color',
            }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({ ison: true, mode: 'color', red: 255, green: 0, blue: 0 }),
        });

      const { result } = renderHook(() => useBulbConnection());

      await act(async () => {
        await result.current.connect('192.168.1.100');
      });

      await act(async () => {
        await result.current.setColor(255, 0, 0);
      });

      // Check that fetch was called with color params
      const calls = (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls;
      const colorCall = calls.find((call) => call[0].includes('/light/0'));
      expect(colorCall).toBeDefined();
      expect(colorCall![0]).toContain('red=255');
    });

    it('should not send color when not connected', async () => {
      const { result } = renderHook(() => useBulbConnection());

      await act(async () => {
        await result.current.setColor(255, 0, 0);
      });

      // Should not have made any fetch calls
      expect(globalThis.fetch).not.toHaveBeenCalled();
    });
  });
});
