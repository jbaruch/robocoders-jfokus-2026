/**
 * BulbStatus State Machine and BulbDeviceInfo Type
 * Implements: data-model.md BulbStatus and BulbDeviceInfo entities
 * Test Specs: TS-042, TS-043
 */

/**
 * BulbDeviceInfo - Information from Shelly Gen1 discovery
 * Populated from /shelly, /status, and /settings endpoints
 */
export interface BulbDeviceInfo {
  // From GET /shelly
  type: string; // e.g., "SHRGBW2"
  mac: string; // e.g., "AABBCCDDEEFF"
  firmware: string; // e.g., "20230913-114432/v1.14.0"
  authRequired: boolean;

  // From GET /settings
  name: string; // User-configured device name
  mode: string; // "color" or "white"

  // From GET /status (discovery)
  hasLights: boolean; // lights[] array present
  lightChannels: number; // length of lights[]
}

/**
 * BulbStatus - Simple string literal for bulb connection states
 * Per spec: 'not_configured' | 'discovering' | 'connected' | 'disconnected' | 'failed'
 */
export type BulbStatus =
  | 'not_configured'
  | 'discovering'
  | 'connected'
  | 'disconnected'
  | 'failed';

/**
 * Valid state transitions per data-model.md state machine (Gen1 discovery-first)
 */
const VALID_TRANSITIONS: Record<BulbStatus, BulbStatus[]> = {
  not_configured: ['discovering'],
  discovering: ['connected', 'failed'],
  connected: ['disconnected', 'not_configured'],
  disconnected: ['discovering', 'not_configured'],
  failed: ['discovering', 'not_configured'],
};

/**
 * Validate if a state transition is allowed
 */
export function isValidBulbTransition(
  from: BulbStatus,
  to: BulbStatus
): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Get user-friendly status message
 * FR-016: Error messages must be user-friendly and actionable
 */
export function getBulbStatusMessage(status: BulbStatus): string {
  switch (status) {
    case 'not_configured':
      return 'No bulb configured';
    case 'discovering':
      return 'Discovering bulb...';
    case 'connected':
      return 'Bulb connected';
    case 'disconnected':
      return 'Bulb disconnected - reconnecting...';
    case 'failed':
      return 'Connection failed';
    default:
      return 'Unknown bulb status';
  }
}

/**
 * Type guard for connected state
 */
export function isBulbConnected(status: BulbStatus): boolean {
  return status === 'connected';
}

/**
 * Type guard for error states
 */
export function isBulbError(status: BulbStatus): boolean {
  return status === 'failed';
}

/**
 * Type guard for loading states (discovering)
 */
export function isBulbLoading(status: BulbStatus): boolean {
  return status === 'discovering';
}
