/**
 * BulbStatusIndicator Component Tests - TDD (Constitution Principle 2)
 * Test Specs: TS-017, TS-051
 *
 * Tests for the bulb status indicator component.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BulbStatusIndicator } from '@/components/BulbStatusIndicator';

describe('BulbStatusIndicator Component', () => {
  // TS-017: Status display
  describe('Status display (TS-017)', () => {
    it('should display not_configured state', () => {
      render(<BulbStatusIndicator status="not_configured" />);

      expect(screen.getByText(/not configured|no bulb/i)).toBeInTheDocument();
    });

    it('should display discovering state', () => {
      render(<BulbStatusIndicator status="discovering" />);

      expect(screen.getByText(/discovering|searching/i)).toBeInTheDocument();
    });

    it('should display connected state', () => {
      render(<BulbStatusIndicator status="connected" />);

      expect(screen.getByText(/connected/i)).toBeInTheDocument();
    });

    it('should display disconnected state', () => {
      render(<BulbStatusIndicator status="disconnected" />);

      expect(screen.getByText(/disconnected/i)).toBeInTheDocument();
    });

    it('should display failed state', () => {
      render(<BulbStatusIndicator status="failed" />);

      expect(screen.getByText(/failed|error/i)).toBeInTheDocument();
    });
  });

  // Pulsing animation for connecting states
  describe('Animation (FR-013)', () => {
    it('should show pulsing animation for discovering state', () => {
      render(<BulbStatusIndicator status="discovering" />);

      const indicator = screen.getByTestId('bulb-status-icon');
      expect(indicator.className).toContain('animate-pulse');
    });

    it('should not pulse for connected state', () => {
      render(<BulbStatusIndicator status="connected" />);

      const indicator = screen.getByTestId('bulb-status-icon');
      expect(indicator.className).not.toContain('animate-pulse');
    });
  });

  // TS-051: Accessibility
  describe('Accessibility (TS-051)', () => {
    it('should have ARIA live region', () => {
      render(<BulbStatusIndicator status="connected" />);

      expect(screen.getByRole('status')).toBeInTheDocument();
    });

    it('should announce status changes', () => {
      const { rerender } = render(<BulbStatusIndicator status="not_configured" />);

      rerender(<BulbStatusIndicator status="connected" />);

      const status = screen.getByRole('status');
      expect(status.textContent).toContain('connected');
    });
  });

  // Device name display
  describe('Device name', () => {
    it('should display device name when provided', () => {
      render(
        <BulbStatusIndicator
          status="connected"
          deviceName="Living Room Bulb"
        />
      );

      expect(screen.getByText(/Living Room Bulb/)).toBeInTheDocument();
    });
  });

  // Error message
  describe('Error message', () => {
    it('should display error message when provided', () => {
      render(
        <BulbStatusIndicator
          status="failed"
          error="Connection timed out"
        />
      );

      expect(screen.getByText(/timed out/i)).toBeInTheDocument();
    });
  });
});
