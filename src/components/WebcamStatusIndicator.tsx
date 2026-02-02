/**
 * WebcamStatusIndicator Component - Visual webcam connection status
 * Implements: US-001
 * Test Specs: TS-010, TS-051
 *
 * Constitution Compliance:
 * - P1: Standard CSS animations
 * - P5: Intentional design with consistent styling (matches BulbStatusIndicator)
 */

import type { WebcamStatus } from '@/types/webcam';
import { getWebcamStatusMessage } from '@/types/webcam';

export interface WebcamStatusIndicatorProps {
  /** Current webcam status */
  status: WebcamStatus;
  /** Error message (when denied/unavailable) */
  error?: string;
  /** Optional CSS class */
  className?: string;
}

/**
 * Visual indicator for webcam connection status.
 *
 * Per TS-051: ARIA live region for screen readers
 */
export function WebcamStatusIndicator({
  status,
  error,
  className = '',
}: WebcamStatusIndicatorProps) {
  const isPulsing = status === 'requesting';
  const isStreaming = status === 'streaming';
  const isError = status === 'denied' || status === 'not_available';

  // Status color
  const getStatusColor = () => {
    if (isStreaming) return 'text-status-success';
    if (isError) return 'text-status-error';
    if (status === 'requesting') return 'text-brand-primary';
    if (status === 'disconnected') return 'text-status-warning';
    return 'text-surface-muted';
  };

  // Status icon
  const getIcon = () => {
    if (isStreaming) {
      return (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" />
        </svg>
      );
    }
    if (status === 'denied') {
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636"
          />
        </svg>
      );
    }
    if (status === 'not_available' || status === 'disconnected') {
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      );
    }
    if (status === 'requesting') {
      return (
        <svg
          className="w-5 h-5"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
          />
        </svg>
      );
    }
    return (
      <svg
        className="w-5 h-5"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
        />
      </svg>
    );
  };

  // Status text
  const getStatusText = () => {
    if (isError && error) {
      return error;
    }
    return getWebcamStatusMessage(status);
  };

  return (
    <div
      className={`flex items-center gap-3 ${className}`}
    >
      {/* Status icon */}
      <div
        data-testid="webcam-status-icon"
        className={`${getStatusColor()} ${isPulsing ? 'animate-pulse' : ''}`}
      >
        {getIcon()}
      </div>

      {/* Status text with ARIA live */}
      <div role="status" aria-live="polite" className="flex flex-col">
        <span className={`text-sm font-medium ${getStatusColor()}`}>
          {getStatusText()}
        </span>
      </div>
    </div>
  );
}
