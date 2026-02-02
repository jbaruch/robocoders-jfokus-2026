/**
 * WebcamStatusIndicator Component Tests - TDD (Constitution Principle 2)
 * Test Specs: TS-010, TS-051
 *
 * Tests for the webcam status indicator component.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WebcamStatusIndicator } from '@/components/WebcamStatusIndicator';

describe('WebcamStatusIndicator Component', () => {
  // TS-010: Status display
  describe('Status display (TS-010)', () => {
    it('should display initial state', () => {
      render(<WebcamStatusIndicator status="initial" />);

      expect(screen.getByText(/camera|click|enable/i)).toBeInTheDocument();
    });

    it('should display requesting state', () => {
      render(<WebcamStatusIndicator status="requesting" />);

      expect(screen.getByText(/requesting|waiting/i)).toBeInTheDocument();
    });

    it('should display streaming state', () => {
      render(<WebcamStatusIndicator status="streaming" />);

      expect(screen.getByText(/connected|streaming/i)).toBeInTheDocument();
    });

    it('should display denied state', () => {
      render(<WebcamStatusIndicator status="denied" />);

      expect(screen.getByText(/denied/i)).toBeInTheDocument();
    });

    it('should display not_available state', () => {
      render(<WebcamStatusIndicator status="not_available" />);

      expect(screen.getByText(/not found|unavailable/i)).toBeInTheDocument();
    });

    it('should display disconnected state', () => {
      render(<WebcamStatusIndicator status="disconnected" />);

      expect(screen.getByText(/disconnected/i)).toBeInTheDocument();
    });
  });

  // Pulsing animation for requesting state
  describe('Animation', () => {
    it('should show pulsing animation for requesting state', () => {
      render(<WebcamStatusIndicator status="requesting" />);

      const indicator = screen.getByTestId('webcam-status-icon');
      expect(indicator.className).toContain('animate-pulse');
    });

    it('should not pulse for streaming state', () => {
      render(<WebcamStatusIndicator status="streaming" />);

      const indicator = screen.getByTestId('webcam-status-icon');
      expect(indicator.className).not.toContain('animate-pulse');
    });
  });

  // TS-051: Accessibility
  describe('Accessibility (TS-051)', () => {
    it('should have ARIA live region', () => {
      render(<WebcamStatusIndicator status="streaming" />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should announce status changes', () => {
      const { rerender } = render(<WebcamStatusIndicator status="requesting" />);

      rerender(<WebcamStatusIndicator status="streaming" />);

      const status = screen.getByRole('status');
      expect(status.textContent?.toLowerCase()).toContain('connected');
    });
  });

  // Error message
  describe('Error message', () => {
    it('should display error message when provided', () => {
      render(
        <WebcamStatusIndicator
          status="denied"
          error="Camera access was denied by the user"
        />
      );

      expect(screen.getByText(/denied by the user/i)).toBeInTheDocument();
    });
  });
});
