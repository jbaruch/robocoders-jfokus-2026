/**
 * useWebcam Hook - Webcam permission and stream management
 * Implements: US-001, US-004, US-005
 * Test Specs: TS-001, TS-002, TS-003, TS-013, TS-014, TS-015
 *
 * Constitution Compliance:
 * - P1: Uses standard MediaDevices API, no experimental patterns
 * - P4: Graceful degradation on permission denial or no camera
 */

import { useState, useRef, useEffect, useCallback } from 'react';
import type { WebcamStatus } from '@/types/webcam';

export interface UseWebcamOptions {
  /** Automatically request permission on mount (default: true) */
  autoStart?: boolean;
}

export interface UseWebcamResult {
  /** Current webcam status */
  status: WebcamStatus;
  /** Active media stream (null if not connected) */
  stream: MediaStream | null;
  /** Ref to attach to video element */
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** Error message if any */
  error: string | null;
  /** Start webcam capture */
  startWebcam: () => Promise<void>;
  /** Stop webcam capture */
  stopWebcam: () => void;
}

/**
 * Hook for managing webcam permission and stream lifecycle.
 *
 * @param options - Configuration options
 * @returns Webcam state and controls
 *
 * Per FR-001: Captures webcam feed
 * Per FR-002: Handles missing webcam gracefully
 * Per FR-008: Handles permission denial gracefully
 */
export function useWebcam(options: UseWebcamOptions = {}): UseWebcamResult {
  const { autoStart = true } = options;

  const [status, setStatus] = useState<WebcamStatus>(
    autoStart ? 'requesting' : 'initial'
  );
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  /**
   * Stop all tracks and cleanup stream
   */
  const cleanupStream = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
      setStream(null);
    }
  }, []);

  /**
   * Handle track ended event (disconnection)
   */
  const handleTrackEnded = useCallback(() => {
    setStatus('disconnected');
    setError('Camera disconnected');
    cleanupStream();
  }, [cleanupStream]);

  /**
   * Start webcam capture
   */
  const startWebcam = useCallback(async () => {
    // Check for MediaDevices API support
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatus('not_available');
      setError('Camera not supported in this browser');
      return;
    }

    setStatus('requesting');
    setError(null);

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: false,
      });

      // Store stream reference
      streamRef.current = mediaStream;
      setStream(mediaStream);

      // Listen for track ended events
      mediaStream.getTracks().forEach((track) => {
        track.addEventListener('ended', handleTrackEnded);
      });

      // Attach to video element if available
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }

      setStatus('streaming');
    } catch (err) {
      if (err instanceof DOMException) {
        switch (err.name) {
          case 'NotAllowedError':
          case 'PermissionDeniedError':
            setStatus('denied');
            setError('Camera access denied - please allow camera access in your browser settings');
            break;
          case 'NotFoundError':
          case 'DevicesNotFoundError':
            setStatus('not_available');
            setError('Camera not found - please connect a camera and try again');
            break;
          case 'NotReadableError':
          case 'TrackStartError':
            setStatus('not_available');
            setError('Camera is in use by another application');
            break;
          default:
            setStatus('not_available');
            setError('Unable to access camera');
        }
      } else {
        setStatus('not_available');
        setError('Unable to access camera');
      }
    }
  }, [handleTrackEnded]);

  /**
   * Stop webcam capture
   */
  const stopWebcam = useCallback(() => {
    cleanupStream();
    setStatus('initial');
    setError(null);
  }, [cleanupStream]);

  // Auto-start on mount if enabled
  useEffect(() => {
    if (autoStart) {
      startWebcam();
    }

    // Cleanup on unmount
    return () => {
      cleanupStream();
    };
  }, [autoStart, startWebcam, cleanupStream]);

  return {
    status,
    stream,
    videoRef,
    error,
    startWebcam,
    stopWebcam,
  };
}
