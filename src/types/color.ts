/**
 * Color Entity - Core type for dominant color representation
 * Implements: data-model.md Color entity
 * Test Specs: TS-036, TS-037, TS-038, TS-039, TS-040
 */

/**
 * Color value with RGB, HSL, and Hex representations
 * Invariant: All three representations must be mathematically equivalent
 */
export interface Color {
  // RGB components (0-255)
  readonly r: number;
  readonly g: number;
  readonly b: number;

  // HSL components (derived)
  readonly h: number; // 0-360 degrees
  readonly s: number; // 0-100 percent
  readonly l: number; // 0-100 percent

  // Hex representation (derived)
  readonly hex: string; // "#RRGGBB" format
}

/**
 * Clamp RGB value to valid range [0, 255]
 * TS-036: RGB values must be 0-255
 */
export function clampRgb(value: number): number {
  return Math.max(0, Math.min(255, Math.round(value)));
}

/**
 * Clamp percentage value to valid range [0, 100]
 * TS-038: HSL saturation and lightness must be 0-100
 */
export function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

/**
 * Normalize hue to valid range [0, 360)
 * TS-037: HSL hue must be 0-360
 */
export function normalizeHue(value: number): number {
  const normalized = value % 360;
  return normalized < 0 ? normalized + 360 : normalized;
}

/**
 * Convert RGB to HSL
 * Returns { h, s, l } where h is [0, 360), s and l are [0, 100]
 */
export function rgbToHsl(
  r: number,
  g: number,
  b: number
): { h: number; s: number; l: number } {
  // Normalize to 0-1
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  // Lightness
  const l = (max + min) / 2;

  // Saturation
  let s = 0;
  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
  }

  // Hue
  let h = 0;
  if (delta !== 0) {
    if (max === rNorm) {
      h = ((gNorm - bNorm) / delta) % 6;
    } else if (max === gNorm) {
      h = (bNorm - rNorm) / delta + 2;
    } else {
      h = (rNorm - gNorm) / delta + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
  };
}

/**
 * Convert HSL to RGB
 * Returns { r, g, b } where all values are [0, 255]
 */
export function hslToRgb(
  h: number,
  s: number,
  l: number
): { r: number; g: number; b: number } {
  // Normalize inputs
  const hNorm = h / 360;
  const sNorm = s / 100;
  const lNorm = l / 100;

  let r: number, g: number, b: number;

  if (sNorm === 0) {
    // Achromatic (gray)
    r = g = b = lNorm;
  } else {
    const hue2rgb = (p: number, q: number, t: number): number => {
      let tNorm = t;
      if (tNorm < 0) tNorm += 1;
      if (tNorm > 1) tNorm -= 1;
      if (tNorm < 1 / 6) return p + (q - p) * 6 * tNorm;
      if (tNorm < 1 / 2) return q;
      if (tNorm < 2 / 3) return p + (q - p) * (2 / 3 - tNorm) * 6;
      return p;
    };

    const q = lNorm < 0.5 ? lNorm * (1 + sNorm) : lNorm + sNorm - lNorm * sNorm;
    const p = 2 * lNorm - q;

    r = hue2rgb(p, q, hNorm + 1 / 3);
    g = hue2rgb(p, q, hNorm);
    b = hue2rgb(p, q, hNorm - 1 / 3);
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Convert Color to hex string
 * TS-039: Returns #RRGGBB format
 */
export function colorToHex(color: Pick<Color, 'r' | 'g' | 'b'>): string {
  const toHex = (n: number): string => n.toString(16).padStart(2, '0').toUpperCase();
  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`;
}

/**
 * Create Color from RGB values
 * Factory function that computes all derived values
 */
export function createColor(r: number, g: number, b: number): Color {
  const clampedR = clampRgb(r);
  const clampedG = clampRgb(g);
  const clampedB = clampRgb(b);

  const hsl = rgbToHsl(clampedR, clampedG, clampedB);

  return {
    r: clampedR,
    g: clampedG,
    b: clampedB,
    h: hsl.h,
    s: hsl.s,
    l: hsl.l,
    hex: colorToHex({ r: clampedR, g: clampedG, b: clampedB }),
  };
}

/**
 * Create Color from hex string
 * TS-039: Validates hex format before parsing
 */
export function colorFromHex(hex: string): Color {
  const pattern = /^#[0-9A-Fa-f]{6}$/;
  if (!pattern.test(hex)) {
    throw new Error(`Invalid hex color format: ${hex}. Expected #RRGGBB`);
  }

  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);

  return createColor(r, g, b);
}

/**
 * Create Color from HSL values
 * TS-037, TS-038: Validates and normalizes HSL values
 */
export function colorFromHSL(h: number, s: number, l: number): Color {
  const normalizedH = normalizeHue(h);
  const clampedS = clampPercent(s);
  const clampedL = clampPercent(l);

  const rgb = hslToRgb(normalizedH, clampedS, clampedL);

  return {
    r: rgb.r,
    g: rgb.g,
    b: rgb.b,
    h: normalizedH,
    s: clampedS,
    l: clampedL,
    hex: colorToHex(rgb),
  };
}

/**
 * Default "no color" value - neutral gray
 * Used when webcam is unavailable (FR-007)
 */
export const NO_COLOR: Color = createColor(128, 128, 128);

/**
 * Black color - used for black/corrupt frames (FR-011)
 */
export const BLACK: Color = createColor(0, 0, 0);
