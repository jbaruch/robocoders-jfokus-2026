/**
 * BulbStatusIndicator Component - Visual bulb connection status
 * Implements: US-006
 * Test Specs: TS-017, TS-051
 *
 * Constitution Compliance:
 * - P1: Standard CSS animations
 * - P5: Intentional design with consistent styling
 */

import type { BulbStatus } from '@/types/bulb';
import { getBulbStatusMessage } from '@/types/bulb';

export interface BulbStatusIndicatorProps {
  /** Current bulb status */
  status: BulbStatus;
  /** Device name (when connected) */
  deviceName?: string;
  /** Error message (when failed) */
  error?: string;
  /** Optional CSS class */
  className?: string;
}

/**
 * Visual indicator for bulb connection status.
 *
 * Per FR-013: Pulsing animation for connecting/discovering states
 * Per TS-051: ARIA live region for screen readers
 */
export function BulbStatusIndicator({
  status,
  deviceName,
  error,
  className = '',
}: BulbStatusIndicatorProps) {
  const isPulsing = status === 'discovering';
  const isConnected = status === 'connected';
  const isFailed = status === 'failed' || status === 'disconnected';

  // Status color
  const getStatusColor = () => {
    if (isConnected) return 'text-status-success';
    if (isFailed) return 'text-status-error';
    if (status === 'discovering') return 'text-brand-primary';
    return 'text-surface-muted';
  };

  // Status icon
  const getIcon = () => {
    if (isConnected) {
      return (
        <svg
          className="w-5 h-5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
        </svg>
      );
    }
    if (isFailed) {
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
    if (status === 'discovering') {
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
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
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
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
        />
      </svg>
    );
  };

  // Status text
  const getStatusText = () => {
    if (isConnected && deviceName) {
      return `Connected: ${deviceName}`;
    }
    if (isFailed && error) {
      return error;
    }
    return getBulbStatusMessage(status);
  };

  return (
    <div
      className={`flex items-center gap-3 ${className}`}
    >
      {/* Status icon */}
      <div
        data-testid="bulb-status-icon"
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
