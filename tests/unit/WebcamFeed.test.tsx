/**
 * WebcamFeed Component Tests - TDD (Constitution Principle 2)
 * Test Specs: TS-003
 *
 * Tests for the webcam feed display component.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WebcamFeed } from '@/components/WebcamFeed';

describe('WebcamFeed Component', () => {
  let mockStream: MediaStream;
  let mockTrack: MediaStreamTrack;

  beforeEach(() => {
    mockTrack = {
      kind: 'video',
      enabled: true,
      readyState: 'live',
      stop: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    } as unknown as MediaStreamTrack;

    mockStream = {
      getTracks: vi.fn(() => [mockTrack]),
      getVideoTracks: vi.fn(() => [mockTrack]),
      active: true,
    } as unknown as MediaStream;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // TS-003: Feed displays live video
  describe('Video display (TS-003)', () => {
    it('should render video element when streaming', () => {
      render(
        <WebcamFeed
          status="streaming"
          stream={mockStream}
          error={null}
        />
      );

      const video = screen.getByTestId('webcam-video');
      expect(video).toBeInTheDocument();
      expect(video.tagName).toBe('VIDEO');
    });

    it('should have autoplay attribute', () => {
      render(
        <WebcamFeed
          status="streaming"
          stream={mockStream}
          error={null}
        />
      );

      const video = screen.getByTestId('webcam-video');
      expect(video).toHaveAttribute('autoplay');
    });

    it('should have muted property', () => {
      render(
        <WebcamFeed
          status="streaming"
          stream={mockStream}
          error={null}
        />
      );

      const video = screen.getByTestId('webcam-video') as HTMLVideoElement;
      expect(video.muted).toBe(true);
    });

    it('should have playsInline attribute for mobile', () => {
      render(
        <WebcamFeed
          status="streaming"
          stream={mockStream}
          error={null}
        />
      );

      const video = screen.getByTestId('webcam-video');
      expect(video).toHaveAttribute('playsinline');
    });
  });

  // Status states
  describe('Status states', () => {
    it('should show requesting message when status is requesting', () => {
      render(
        <WebcamFeed
          status="requesting"
          stream={null}
          error={null}
        />
      );

      expect(screen.getByText(/requesting/i)).toBeInTheDocument();
    });

    it('should show denied message when status is denied', () => {
      render(
        <WebcamFeed
          status="denied"
          stream={null}
          error="Camera access denied"
        />
      );

      expect(screen.getByText(/denied/i)).toBeInTheDocument();
    });

    it('should show not available message when status is not_available', () => {
      render(
        <WebcamFeed
          status="not_available"
          stream={null}
          error="Camera not found"
        />
      );

      expect(screen.getByText(/not found|not available/i)).toBeInTheDocument();
    });

    it('should show disconnected message when status is disconnected', () => {
      render(
        <WebcamFeed
          status="disconnected"
          stream={null}
          error="Camera disconnected"
        />
      );

      expect(screen.getByText(/disconnected/i)).toBeInTheDocument();
    });

    it('should show initial state with prompt to start', () => {
      render(
        <WebcamFeed
          status="initial"
          stream={null}
          error={null}
        />
      );

      expect(screen.getByText(/start|enable|camera/i)).toBeInTheDocument();
    });
  });

  // Placeholder display
  describe('Placeholder', () => {
    it('should show placeholder when not streaming', () => {
      render(
        <WebcamFeed
          status="not_available"
          stream={null}
          error={null}
        />
      );

      expect(screen.getByTestId('webcam-placeholder')).toBeInTheDocument();
    });

    it('should hide video when not streaming', () => {
      render(
        <WebcamFeed
          status="not_available"
          stream={null}
          error={null}
        />
      );

      expect(screen.queryByTestId('webcam-video')).not.toBeInTheDocument();
    });
  });

  // Accessibility
  describe('Accessibility', () => {
    it('should have accessible label', () => {
      render(
        <WebcamFeed
          status="streaming"
          stream={mockStream}
          error={null}
        />
      );

      const video = screen.getByTestId('webcam-video');
      expect(video).toHaveAttribute('aria-label');
    });
  });
});
