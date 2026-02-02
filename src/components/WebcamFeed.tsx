/**
 * WebcamFeed Component - Live video feed display
 * Implements: US-001
 * Test Specs: TS-003
 *
 * Constitution Compliance:
 * - P1: Standard video element, no experimental APIs
 * - P4: Shows placeholder with status on degraded states
 * - P5: Intentional design with proper styling
 */

import { useEffect, useRef } from 'react';
import type { WebcamStatus } from '@/types/webcam';
import { getWebcamStatusMessage } from '@/types/webcam';

export interface WebcamFeedProps {
  /** Current webcam status */
  status: WebcamStatus;
  /** Active media stream */
  stream: MediaStream | null;
  /** Error message if any */
  error: string | null;
  /** Optional CSS class */
  className?: string;
}

/**
 * Displays the live webcam feed or a status placeholder.
 *
 * Per FR-004: Prominent display alongside color swatch
 * Per NFR-001: Large enough for conference viewing
 */
export function WebcamFeed({
  status,
  stream,
  error,
  className = '',
}: WebcamFeedProps) {
  const videoRef = useRef<HTMLVideoElement>(null);

  // Attach stream to video element when available
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const isStreaming = status === 'streaming';

  // Status icon based on current state
  const getStatusIcon = () => {
    switch (status) {
      case 'requesting':
        return (
          <svg
            className="w-16 h-16 animate-pulse text-brand-primary"
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
      case 'denied':
        return (
          <svg
            className="w-16 h-16 text-status-error"
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
      case 'not_available':
      case 'disconnected':
        return (
          <svg
            className="w-16 h-16 text-status-warning"
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
      default:
        return (
          <svg
            className="w-16 h-16 text-surface-muted"
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
  };

  // Get status message
  const getMessage = () => {
    if (error) {
      return error;
    }
    return getWebcamStatusMessage(status);
  };

  return (
    <div
      className={`relative aspect-video bg-surface-elevated rounded-lg overflow-hidden ${className}`}
    >
      {isStreaming ? (
        <video
          ref={videoRef}
          data-testid="webcam-video"
          autoPlay
          muted
          playsInline
          aria-label="Live webcam feed"
          className="w-full h-full object-cover"
        />
      ) : (
        <div
          data-testid="webcam-placeholder"
          className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-6"
        >
          {getStatusIcon()}
          <p className="text-center text-surface-muted text-lg">
            {getMessage()}
          </p>
        </div>
      )}
    </div>
  );
}
