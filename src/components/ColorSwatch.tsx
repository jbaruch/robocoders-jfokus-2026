/**
 * ColorSwatch Component - Large color display with hex code
 * Implements: US-003
 * Test Specs: TS-007, TS-008, TS-009
 *
 * Constitution Compliance:
 * - P1: Standard CSS, no experimental patterns
 * - P5: Intentional design with proper visual hierarchy
 */

import type { Color } from '@/types/color';
import { NO_COLOR } from '@/types/color';

export interface ColorSwatchProps {
  /** Color to display */
  color: Color;
  /** Optional label above the swatch */
  label?: string;
  /** Show RGB values (default: false) */
  showRgb?: boolean;
  /** Show "No color" text for NO_COLOR (default: false) */
  showNoColor?: boolean;
  /** Optional CSS class */
  className?: string;
}

/**
 * Large color swatch display with hex code.
 *
 * Per FR-004: Large, prominent swatch alongside webcam feed
 * Per NFR-001: Readable from 20+ meters
 * Per NFR-004: 150ms ease-out transition
 */
export function ColorSwatch({
  color,
  label,
  showRgb = false,
  showNoColor = false,
  className = '',
}: ColorSwatchProps) {
  const isNoColor =
    showNoColor &&
    color.r === NO_COLOR.r &&
    color.g === NO_COLOR.g &&
    color.b === NO_COLOR.b;

  // Format RGB as string
  const rgbString = `${color.r}, ${color.g}, ${color.b}`;

  return (
    <div
      data-testid="color-swatch"
      className={`relative aspect-video bg-surface-elevated rounded-lg overflow-hidden ${className}`}
      aria-label={`Color swatch displaying ${color.hex}`}
    >
      {/* Color display area */}
      <div
        data-testid="color-swatch-display"
        className="absolute inset-0 transition-colors duration-150 ease-out"
        style={{ backgroundColor: `rgb(${color.r}, ${color.g}, ${color.b})` }}
      />

      {/* Overlay content */}
      <div className="absolute inset-0 flex flex-col justify-end p-4 bg-gradient-to-t from-black/60 to-transparent">
        {/* Label */}
        {label && (
          <span className="text-white/80 text-sm font-medium mb-1">{label}</span>
        )}

        {/* Hex code - large and readable */}
        <div role="status" aria-live="polite" className="flex items-baseline gap-3">
          <span className="text-white text-4xl font-mono font-bold tracking-wider">
            {isNoColor ? 'No color' : color.hex}
          </span>

          {/* RGB values */}
          {showRgb && !isNoColor && (
            <span className="text-white/70 text-lg font-mono">
              RGB({rgbString})
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
