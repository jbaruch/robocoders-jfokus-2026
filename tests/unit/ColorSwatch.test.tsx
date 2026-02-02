/**
 * ColorSwatch Component Tests - TDD (Constitution Principle 2)
 * Test Specs: TS-007, TS-008, TS-009
 *
 * Tests for the color swatch display component.
 */
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ColorSwatch } from '@/components/ColorSwatch';
import { createColor, NO_COLOR } from '@/types/color';

describe('ColorSwatch Component', () => {
  // TS-007: Large, prominent swatch display
  describe('Visual display (TS-007)', () => {
    it('should render swatch element', () => {
      const color = createColor(255, 128, 64);

      render(<ColorSwatch color={color} />);

      expect(screen.getByTestId('color-swatch')).toBeInTheDocument();
    });

    it('should apply color as background', () => {
      const color = createColor(255, 128, 64);

      render(<ColorSwatch color={color} />);

      const swatch = screen.getByTestId('color-swatch-display');
      expect(swatch).toHaveStyle({ backgroundColor: 'rgb(255, 128, 64)' });
    });

    it('should have large, prominent size', () => {
      const color = createColor(255, 128, 64);

      render(<ColorSwatch color={color} />);

      const swatch = screen.getByTestId('color-swatch');
      // Check that it has aspect-video class for prominence
      expect(swatch.className).toContain('aspect-video');
    });
  });

  // TS-008: Smooth color transitions
  describe('Color transitions (TS-008)', () => {
    it('should have transition style for smooth changes', () => {
      const color = createColor(255, 128, 64);

      render(<ColorSwatch color={color} />);

      const display = screen.getByTestId('color-swatch-display');
      // Check for transition class
      expect(display.className).toContain('transition');
    });
  });

  // TS-009: Hex code display
  describe('Hex code display (TS-009)', () => {
    it('should display hex code', () => {
      const color = createColor(255, 128, 64);

      render(<ColorSwatch color={color} />);

      expect(screen.getByText(/#FF8040/i)).toBeInTheDocument();
    });

    it('should update hex code when color changes', () => {
      const { rerender } = render(<ColorSwatch color={createColor(255, 0, 0)} />);

      expect(screen.getByText(/#FF0000/i)).toBeInTheDocument();

      rerender(<ColorSwatch color={createColor(0, 255, 0)} />);

      expect(screen.getByText(/#00FF00/i)).toBeInTheDocument();
    });

    it('should show "No color" for NO_COLOR', () => {
      render(<ColorSwatch color={NO_COLOR} showNoColor />);

      expect(screen.getByText(/no color/i)).toBeInTheDocument();
    });
  });

  // RGB values display
  describe('RGB values', () => {
    it('should optionally display RGB values', () => {
      const color = createColor(255, 128, 64);

      render(<ColorSwatch color={color} showRgb />);

      expect(screen.getByText(/255/)).toBeInTheDocument();
      expect(screen.getByText(/128/)).toBeInTheDocument();
      expect(screen.getByText(/64/)).toBeInTheDocument();
    });
  });

  // Accessibility
  describe('Accessibility', () => {
    it('should have accessible label', () => {
      const color = createColor(255, 128, 64);

      render(<ColorSwatch color={color} />);

      const swatch = screen.getByTestId('color-swatch');
      expect(swatch).toHaveAttribute('aria-label');
    });

    it('should announce color changes via aria-live', () => {
      const color = createColor(255, 128, 64);

      render(<ColorSwatch color={color} />);

      // Find an element with aria-live
      const liveRegion = screen.getByRole('status');
      expect(liveRegion).toBeInTheDocument();
    });
  });

  // Label
  describe('Label', () => {
    it('should optionally display label', () => {
      const color = createColor(255, 128, 64);

      render(<ColorSwatch color={color} label="Dominant Color" />);

      expect(screen.getByText('Dominant Color')).toBeInTheDocument();
    });
  });
});
