/**
 * useWebcam Hook Tests - TDD (Constitution Principle 2)
 * Test Specs: TS-001, TS-002, TS-003
 *
 * Tests for webcam permission handling and stream management.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useWebcam } from '@/hooks/useWebcam';

describe('useWebcam Hook', () => {
  let mockStream: MediaStream;
  let mockTrack: MediaStreamTrack;

  beforeEach(() => {
    // Create mock track
    mockTrack = {
      kind: 'video',
      enabled: true,
      readyState: 'live',
      stop: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaStreamTrack;

    // Create mock stream
    mockStream = {
      getTracks: vi.fn(() => [mockTrack]),
      getVideoTracks: vi.fn(() => [mockTrack]),
      active: true,
    } as unknown as MediaStream;

    // Reset navigator.mediaDevices mock
    vi.stubGlobal('navigator', {
      mediaDevices: {
        getUserMedia: vi.fn(),
        enumerateDevices: vi.fn(() => Promise.resolve([])),
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // TS-001: Webcam permission dialog appears on app start
  describe('Permission request (TS-001)', () => {
    it('should request webcam permission when enabled', async () => {
      const getUserMediaMock = vi.fn(() => Promise.resolve(mockStream));
      vi.stubGlobal('navigator', {
        mediaDevices: {
          getUserMedia: getUserMediaMock,
          enumerateDevices: vi.fn(() => Promise.resolve([])),
        },
      });

      renderHook(() => useWebcam({ autoStart: true }));

      await waitFor(() => {
        expect(getUserMediaMock).toHaveBeenCalledWith({
          video: true,
          audio: false,
        });
      });
    });

    it('should start with requesting status when autoStart is true', async () => {
      const getUserMediaMock = vi.fn(() => new Promise(() => {})); // Never resolves
      vi.stubGlobal('navigator', {
        mediaDevices: {
          getUserMedia: getUserMediaMock,
          enumerateDevices: vi.fn(() => Promise.resolve([])),
        },
      });

      const { result } = renderHook(() => useWebcam({ autoStart: true }));

      expect(result.current.status).toBe('requesting');
    });

    it('should start with initial status when autoStart is false', () => {
      const { result } = renderHook(() => useWebcam({ autoStart: false }));

      expect(result.current.status).toBe('initial');
    });
  });

  // TS-002: Feed visible within 2 seconds of permission grant
  describe('Stream connection (TS-002)', () => {
    it('should transition to streaming status after permission grant', async () => {
      const getUserMediaMock = vi.fn(() => Promise.resolve(mockStream));
      vi.stubGlobal('navigator', {
        mediaDevices: {
          getUserMedia: getUserMediaMock,
          enumerateDevices: vi.fn(() => Promise.resolve([])),
        },
      });

      const { result } = renderHook(() => useWebcam({ autoStart: true }));

      await waitFor(() => {
        expect(result.current.status).toBe('streaming');
      });
    });

    it('should provide stream reference after connection', async () => {
      const getUserMediaMock = vi.fn(() => Promise.resolve(mockStream));
      vi.stubGlobal('navigator', {
        mediaDevices: {
          getUserMedia: getUserMediaMock,
          enumerateDevices: vi.fn(() => Promise.resolve([])),
        },
      });

      const { result } = renderHook(() => useWebcam({ autoStart: true }));

      await waitFor(() => {
        expect(result.current.stream).toBe(mockStream);
      });
    });

    it('should provide video ref for attaching to video element', () => {
      const { result } = renderHook(() => useWebcam({ autoStart: false }));

      expect(result.current.videoRef).toBeDefined();
      expect(result.current.videoRef.current).toBe(null);
    });
  });

  // TS-003: Permission denial handling
  describe('Permission denial (TS-003)', () => {
    it('should transition to denied status when permission refused', async () => {
      const error = new DOMException('Permission denied', 'NotAllowedError');
      const getUserMediaMock = vi.fn(() => Promise.reject(error));
      vi.stubGlobal('navigator', {
        mediaDevices: {
          getUserMedia: getUserMediaMock,
          enumerateDevices: vi.fn(() => Promise.resolve([])),
        },
      });

      const { result } = renderHook(() => useWebcam({ autoStart: true }));

      await waitFor(() => {
        expect(result.current.status).toBe('denied');
      });
    });

    it('should provide error message when permission denied', async () => {
      const error = new DOMException('Permission denied', 'NotAllowedError');
      const getUserMediaMock = vi.fn(() => Promise.reject(error));
      vi.stubGlobal('navigator', {
        mediaDevices: {
          getUserMedia: getUserMediaMock,
          enumerateDevices: vi.fn(() => Promise.resolve([])),
        },
      });

      const { result } = renderHook(() => useWebcam({ autoStart: true }));

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
        expect(result.current.error).toContain('denied');
      });
    });

    it('should transition to not_available when no camera found', async () => {
      const error = new DOMException('No camera', 'NotFoundError');
      const getUserMediaMock = vi.fn(() => Promise.reject(error));
      vi.stubGlobal('navigator', {
        mediaDevices: {
          getUserMedia: getUserMediaMock,
          enumerateDevices: vi.fn(() => Promise.resolve([])),
        },
      });

      const { result } = renderHook(() => useWebcam({ autoStart: true }));

      await waitFor(() => {
        expect(result.current.status).toBe('not_available');
      });
    });
  });

  // Manual start functionality
  describe('Manual start', () => {
    it('should allow manual start via startWebcam()', async () => {
      const getUserMediaMock = vi.fn(() => Promise.resolve(mockStream));
      vi.stubGlobal('navigator', {
        mediaDevices: {
          getUserMedia: getUserMediaMock,
          enumerateDevices: vi.fn(() => Promise.resolve([])),
        },
      });

      const { result } = renderHook(() => useWebcam({ autoStart: false }));

      expect(result.current.status).toBe('initial');

      await act(async () => {
        await result.current.startWebcam();
      });

      expect(result.current.status).toBe('streaming');
    });
  });

  // Stream cleanup
  describe('Cleanup', () => {
    it('should stop tracks on unmount', async () => {
      const getUserMediaMock = vi.fn(() => Promise.resolve(mockStream));
      vi.stubGlobal('navigator', {
        mediaDevices: {
          getUserMedia: getUserMediaMock,
          enumerateDevices: vi.fn(() => Promise.resolve([])),
        },
      });

      const { result, unmount } = renderHook(() => useWebcam({ autoStart: true }));

      await waitFor(() => {
        expect(result.current.status).toBe('streaming');
      });

      unmount();

      expect(mockTrack.stop).toHaveBeenCalled();
    });

    it('should allow manual stop via stopWebcam()', async () => {
      const getUserMediaMock = vi.fn(() => Promise.resolve(mockStream));
      vi.stubGlobal('navigator', {
        mediaDevices: {
          getUserMedia: getUserMediaMock,
          enumerateDevices: vi.fn(() => Promise.resolve([])),
        },
      });

      const { result } = renderHook(() => useWebcam({ autoStart: true }));

      await waitFor(() => {
        expect(result.current.status).toBe('streaming');
      });

      act(() => {
        result.current.stopWebcam();
      });

      expect(mockTrack.stop).toHaveBeenCalled();
    });
  });

  // TS-013: Disconnection detection
  describe('Disconnection detection (TS-013)', () => {
    it('should detect track ended event', async () => {
      let trackEndedHandler: () => void;
      const mockTrackWithEvents = {
        ...mockTrack,
        addEventListener: vi.fn((event: string, handler: () => void) => {
          if (event === 'ended') {
            trackEndedHandler = handler;
          }
        }),
      } as unknown as MediaStreamTrack;

      const mockStreamWithEvents = {
        ...mockStream,
        getTracks: vi.fn(() => [mockTrackWithEvents]),
        getVideoTracks: vi.fn(() => [mockTrackWithEvents]),
      } as unknown as MediaStream;

      const getUserMediaMock = vi.fn(() => Promise.resolve(mockStreamWithEvents));
      vi.stubGlobal('navigator', {
        mediaDevices: {
          getUserMedia: getUserMediaMock,
          enumerateDevices: vi.fn(() => Promise.resolve([])),
        },
      });

      const { result } = renderHook(() => useWebcam({ autoStart: true }));

      await waitFor(() => {
        expect(result.current.status).toBe('streaming');
      });

      // Simulate track ended
      act(() => {
        trackEndedHandler!();
      });

      expect(result.current.status).toBe('disconnected');
    });
  });
});
