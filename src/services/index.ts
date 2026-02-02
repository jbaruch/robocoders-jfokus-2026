/**
 * Services module exports
 */

export { ShellyApi } from './shellyApi';
export type {
  ShellyDeviceInfo,
  ShellyStatus,
  ShellySettings,
  ShellyLightStatus,
  ShellyLightResponse,
  DiscoveryResult,
} from './shellyApi';

export { extractDominantColor, samplePixels, kMeansClustering } from './colorExtractor';

export { ColorTransmissionService } from './colorTransmission';
