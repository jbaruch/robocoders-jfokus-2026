/**
 * useBulbConnection Hook - Bulb connection lifecycle management
 * Implements: US-006
 * Test Specs: TS-016, TS-017, TS-019, TS-027
 *
 * Constitution Compliance:
 * - P1: Uses proven HTTP API patterns
 * - P4: Graceful degradation on connection errors
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import type { BulbStatus, BulbDeviceInfo } from '@/types/bulb';
import { ShellyApi } from '@/services/shellyApi';

const STORAGE_KEY = 'shelly-bulb-ip';

export interface UseBulbConnectionOptions {
  /** Auto-connect on mount if saved IP exists */
  autoConnect?: boolean;
}

export interface UseBulbConnectionResult {
  /** Current connection status */
  status: BulbStatus;
  /** Device info after successful connection */
  deviceInfo: BulbDeviceInfo | null;
  /** Current IP address */
  ip: string;
  /** Error message if any */
  error: string | null;
  /** Set IP address */
  setIp: (ip: string) => void;
  /** Connect to bulb */
  connect: (ip?: string) => Promise<void>;
  /** Disconnect from bulb */
  disconnect: () => void;
  /** Send color to bulb */
  setColor: (r: number, g: number, b: number) => Promise<void>;
}

/**
 * Safely read from localStorage
 */
function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

/**
 * Safely write to localStorage
 */
function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // Ignore storage errors (quota exceeded, private browsing, etc.)
  }
}

/**
 * Hook for managing bulb connection lifecycle.
 *
 * @param options - Configuration options
 * @returns Bulb connection state and controls
 *
 * Per TS-019: Saves IP to localStorage, pre-fills on subsequent visits
 * Per FR-010: Handles localStorage unavailable gracefully
 */
export function useBulbConnection(
  options: UseBulbConnectionOptions = {}
): UseBulbConnectionResult {
  const { autoConnect = false } = options;

  // Load saved IP on mount
  const savedIp = safeGetItem(STORAGE_KEY) || '';

  const [status, setStatus] = useState<BulbStatus>('not_configured');
  const [deviceInfo, setDeviceInfo] = useState<BulbDeviceInfo | null>(null);
  const [ip, setIp] = useState(savedIp);
  const [error, setError] = useState<string | null>(null);

  // Ref for the API instance
  const apiRef = useRef<ShellyApi | null>(null);

  /**
   * Connect to bulb at given IP
   */
  const connect = useCallback(async (targetIp?: string) => {
    const ipToUse = targetIp || ip;

    if (!ipToUse) {
      setError('No IP address provided');
      return;
    }

    // Clear previous error
    setError(null);
    setStatus('discovering');

    try {
      const api = new ShellyApi(ipToUse);
      // Use simple discovery that only checks /light/0
      const result = await api.discoverSimple();

      if (result.success && result.deviceInfo) {
        // Success!
        apiRef.current = api;
        setDeviceInfo(result.deviceInfo);
        setStatus('connected');
        setIp(ipToUse);

        // Save to localStorage
        safeSetItem(STORAGE_KEY, ipToUse);
      } else {
        // Discovery failed
        setStatus('failed');
        setError(result.error || 'Failed to connect to bulb');
      }
    } catch (err) {
      setStatus('failed');
      setError(err instanceof Error ? err.message : 'Connection failed');
    }
  }, [ip]);

  /**
   * Disconnect from bulb
   */
  const disconnect = useCallback(() => {
    apiRef.current = null;
    setDeviceInfo(null);
    setStatus('not_configured');
    setError(null);
  }, []);

  /**
   * Send color to connected bulb
   */
  const setColor = useCallback(
    async (r: number, g: number, b: number) => {
      if (status !== 'connected' || !apiRef.current) {
        return;
      }

      try {
        await apiRef.current.setColor(r, g, b);
      } catch {
        // Silently fail color updates (bulb might be temporarily unreachable)
        // Could implement reconnection logic here
      }
    },
    [status]
  );

  // Auto-connect on mount if enabled and saved IP exists
  useEffect(() => {
    if (autoConnect && savedIp) {
      connect(savedIp);
    }
  }, [autoConnect, savedIp, connect]);

  return {
    status,
    deviceInfo,
    ip,
    error,
    setIp,
    connect,
    disconnect,
    setColor,
  };
}
