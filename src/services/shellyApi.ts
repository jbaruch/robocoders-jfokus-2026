/**
 * Shelly Gen1 API Service
 * Implements: contracts/shelly-bulb-api.md
 * Test Specs: TS-029, TS-030, TS-031, TS-032, TS-033, TS-034, TS-035
 *
 * Constitution Compliance:
 * - P1: Well-tested HTTP API, no experimental patterns
 * - P4: Graceful degradation on network errors
 */

import type { BulbDeviceInfo } from '@/types/bulb';

/**
 * Shelly device info from GET /shelly
 */
export interface ShellyDeviceInfo {
  type: string;
  mac: string;
  fw: string;
  auth: boolean;
}

/**
 * Light status from GET /status
 */
export interface ShellyLightStatus {
  ison: boolean;
  mode: 'color' | 'white';
  red: number;
  green: number;
  blue: number;
  white: number;
  gain: number;
  brightness: number;
}

/**
 * Device status from GET /status
 */
export interface ShellyStatus {
  lights: ShellyLightStatus[];
  meters?: { power: number }[];
}

/**
 * Device settings from GET /settings
 */
export interface ShellySettings {
  device: {
    type: string;
    mac: string;
    hostname: string;
  };
  name: string;
  mode: string;
}

/**
 * Light response from GET /light/0
 */
export interface ShellyLightResponse {
  ison: boolean;
  mode: 'color' | 'white';
  red: number;
  green: number;
  blue: number;
  white?: number;
  gain?: number;
}

/**
 * Discovery result
 */
export interface DiscoveryResult {
  success: boolean;
  deviceInfo?: BulbDeviceInfo;
  error?: string;
}

/**
 * API timeout in milliseconds (FR-012: 3 seconds)
 */
const API_TIMEOUT = 3000;

/**
 * Shelly Gen1 API Client
 *
 * Per contracts/shelly-bulb-api.md:
 * - Discovery flow: /shelly -> /status -> /settings
 * - Color control: /light/0?red=X&green=Y&blue=Z
 * - 3 second timeout on all requests
 */
export class ShellyApi {
  private readonly baseUrl: string;

  constructor(ip: string) {
    this.baseUrl = `http://${ip}`;
  }

  /**
   * Make a fetch request with timeout
   */
  private async fetchWithTimeout(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        ...options,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      return response;
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * GET /shelly - Device identification
   * TS-029
   */
  async getDeviceInfo(): Promise<ShellyDeviceInfo> {
    const response = await this.fetchWithTimeout('/shelly');
    return response.json();
  }

  /**
   * GET /status - Device status and capabilities
   * TS-030
   */
  async getStatus(): Promise<ShellyStatus> {
    const response = await this.fetchWithTimeout('/status');
    return response.json();
  }

  /**
   * GET /settings - Device configuration
   * TS-031
   */
  async getSettings(): Promise<ShellySettings> {
    const response = await this.fetchWithTimeout('/settings');
    return response.json();
  }

  /**
   * GET /light/0?... - Set light color
   * TS-032
   */
  async setColor(
    red: number,
    green: number,
    blue: number,
    options: { transition?: number; gain?: number } = {}
  ): Promise<ShellyLightResponse> {
    const params = new URLSearchParams({
      turn: 'on',
      red: String(Math.round(red)),
      green: String(Math.round(green)),
      blue: String(Math.round(blue)),
    });

    if (options.transition !== undefined) {
      params.set('transition', String(options.transition));
    }

    if (options.gain !== undefined) {
      params.set('gain', String(options.gain));
    }

    const response = await this.fetchWithTimeout(`/light/0?${params.toString()}`);
    return response.json();
  }

  /**
   * GET /light/0 - Get current light status
   */
  async getLightStatus(): Promise<ShellyLightResponse> {
    const response = await this.fetchWithTimeout('/light/0');
    return response.json();
  }

  /**
   * Check if device has lights capability
   * TS-034
   */
  hasLightsCapability(status: ShellyStatus): boolean {
    return Array.isArray(status.lights) && status.lights.length > 0;
  }

  /**
   * Check if device requires authentication
   * TS-035
   */
  requiresAuth(deviceInfo: ShellyDeviceInfo): boolean {
    return deviceInfo.auth === true;
  }

  /**
   * Perform complete discovery flow
   * Per contracts/shelly-bulb-api.md: /shelly -> /status -> /settings
   */
  async discover(): Promise<DiscoveryResult> {
    try {
      // Step 1: Get device info
      const deviceInfo = await this.getDeviceInfo();

      // Check auth requirement (TS-035)
      if (this.requiresAuth(deviceInfo)) {
        return {
          success: false,
          error: 'Bulb requires authentication - please disable auth in bulb settings',
        };
      }

      // Step 2: Get status to verify lights capability
      const status = await this.getStatus();

      // Check lights capability (TS-034)
      if (!this.hasLightsCapability(status)) {
        return {
          success: false,
          error: 'Not a compatible device - please enter a Shelly light bulb IP',
        };
      }

      // Step 3: Get settings for device name
      const settings = await this.getSettings();

      // Construct BulbDeviceInfo
      const bulbInfo: BulbDeviceInfo = {
        type: deviceInfo.type,
        mac: deviceInfo.mac,
        firmware: deviceInfo.fw,
        authRequired: deviceInfo.auth,
        name: settings.name || deviceInfo.type,
        mode: settings.mode,
        hasLights: true,
        lightChannels: status.lights.length,
      };

      return {
        success: true,
        deviceInfo: bulbInfo,
      };
    } catch (error) {
      // Handle network errors (TS-033 timeout)
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Bulb not responding - connection timed out',
          };
        }
        return {
          success: false,
          error: `Bulb not found - check IP address and network connection`,
        };
      }
      return {
        success: false,
        error: 'Unknown error connecting to bulb',
      };
    }
  }

  /**
   * Simple discovery - just check if /light/0 responds
   * For use with emulators that don't implement full API
   */
  async discoverSimple(): Promise<DiscoveryResult> {
    try {
      // Just try to get light status directly
      const lightStatus = await this.getLightStatus();

      // If we get here, the device responded
      const bulbInfo: BulbDeviceInfo = {
        type: 'Emulator',
        mac: '000000000000',
        firmware: 'unknown',
        authRequired: false,
        name: 'Light Emulator',
        mode: lightStatus.mode || 'color',
        hasLights: true,
        lightChannels: 1,
      };

      return {
        success: true,
        deviceInfo: bulbInfo,
      };
    } catch (error) {
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          return {
            success: false,
            error: 'Device not responding - connection timed out',
          };
        }
        return {
          success: false,
          error: `Device not found - check IP address and network connection`,
        };
      }
      return {
        success: false,
        error: 'Unknown error connecting to device',
      };
    }
  }
}
