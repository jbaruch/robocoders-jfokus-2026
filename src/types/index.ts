/**
 * Type exports - centralized type definitions
 */

// Color types
export type { Color } from './color';
export {
  createColor,
  colorFromHex,
  colorFromHSL,
  colorToHex,
  rgbToHsl,
  hslToRgb,
  clampRgb,
  normalizeHue,
  NO_COLOR,
  BLACK,
} from './color';

// Webcam types
export type { WebcamStatus } from './webcam';
export {
  isValidWebcamTransition,
  getWebcamStatusMessage,
  isStreaming,
  isWebcamError,
} from './webcam';

// Bulb types
export type { BulbStatus, BulbDeviceInfo } from './bulb';
export {
  isValidBulbTransition,
  getBulbStatusMessage,
  isBulbConnected,
  isBulbError,
  isBulbLoading,
} from './bulb';
