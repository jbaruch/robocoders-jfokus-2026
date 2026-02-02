/**
 * WebcamStatus State Machine
 * Implements: data-model.md WebcamStatus entity
 * Test Specs: TS-041
 */

/**
 * WebcamStatus - Simple string literal for webcam connection states
 * Per spec: 'initial' | 'requesting' | 'streaming' | 'denied' | 'not_available' | 'disconnected'
 */
export type WebcamStatus =
  | 'initial'
  | 'requesting'
  | 'streaming'
  | 'denied'
  | 'not_available'
  | 'disconnected';

/**
 * Valid state transitions per data-model.md state machine
 */
const VALID_TRANSITIONS: Record<WebcamStatus, WebcamStatus[]> = {
  initial: ['requesting'],
  requesting: ['streaming', 'denied', 'not_available'],
  streaming: ['disconnected'],
  denied: ['requesting'], // Allow retry after denial
  not_available: ['requesting'], // Allow retry
  disconnected: ['streaming', 'requesting'], // Auto-reconnect or manual retry
};

/**
 * Validate if a state transition is allowed
 */
export function isValidWebcamTransition(
  from: WebcamStatus,
  to: WebcamStatus
): boolean {
  return VALID_TRANSITIONS[from]?.includes(to) ?? false;
}

/**
 * Get user-friendly status message
 * FR-016: Error messages must be user-friendly and actionable
 */
export function getWebcamStatusMessage(status: WebcamStatus): string {
  switch (status) {
    case 'initial':
      return 'Click to enable camera';
    case 'requesting':
      return 'Requesting camera access...';
    case 'streaming':
      return 'Camera connected';
    case 'denied':
      return 'Camera access denied';
    case 'not_available':
      return 'Camera not found';
    case 'disconnected':
      return 'Camera disconnected';
    default:
      return 'Unknown camera status';
  }
}

/**
 * Type guard for streaming state
 */
export function isStreaming(status: WebcamStatus): boolean {
  return status === 'streaming';
}

/**
 * Type guard for error states
 */
export function isWebcamError(status: WebcamStatus): boolean {
  return status === 'denied' || status === 'not_available';
}
