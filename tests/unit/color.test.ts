/**
 * Color Entity Tests - TDD: Write tests first (Constitution Principle 2)
 * Test Specs: TS-036, TS-037, TS-038, TS-039, TS-040
 */
import { describe, it, expect } from 'vitest';
import {
  createColor,
  colorFromHex,
  colorFromHSL,
  colorToHex,
  rgbToHsl,
  hslToRgb,
  clampRgb,
  normalizeHue,
} from '@/types/color';

describe('Color Entity', () => {
  // TS-036: RGB values must be 0-255
  describe('RGB validation (TS-036)', () => {
    it('should accept valid RGB values (0-255)', () => {
      const color = createColor(128, 64, 255);
      expect(color.r).toBe(128);
      expect(color.g).toBe(64);
      expect(color.b).toBe(255);
    });

    it('should clamp RGB values below 0', () => {
      expect(clampRgb(-10)).toBe(0);
    });

    it('should clamp RGB values above 255', () => {
      expect(clampRgb(300)).toBe(255);
    });

    it('should clamp all components in createColor', () => {
      const color = createColor(-10, 300, 128);
      expect(color.r).toBe(0);
      expect(color.g).toBe(255);
      expect(color.b).toBe(128);
    });
  });

  // TS-037: HSL hue must be 0-360
  describe('HSL hue validation (TS-037)', () => {
    it('should normalize hue values >= 360', () => {
      expect(normalizeHue(360)).toBe(0);
      expect(normalizeHue(400)).toBe(40);
      expect(normalizeHue(720)).toBe(0);
    });

    it('should normalize negative hue values', () => {
      expect(normalizeHue(-30)).toBe(330);
      // -360 % 360 = 0 (or -0 in some JS engines, both are valid)
      expect(Math.abs(normalizeHue(-360))).toBe(0);
    });

    it('should accept valid hue values', () => {
      expect(normalizeHue(180)).toBe(180);
      expect(normalizeHue(0)).toBe(0);
      expect(normalizeHue(359)).toBe(359);
    });
  });

  // TS-038: HSL saturation and lightness must be 0-100
  describe('HSL saturation/lightness validation (TS-038)', () => {
    it('should create color from valid HSL', () => {
      const color = colorFromHSL(180, 50, 50);
      expect(color.h).toBe(180);
      expect(color.s).toBe(50);
      expect(color.l).toBe(50);
    });

    it('should clamp saturation values', () => {
      const color = colorFromHSL(180, 150, 50);
      expect(color.s).toBe(100);

      const color2 = colorFromHSL(180, -20, 50);
      expect(color2.s).toBe(0);
    });

    it('should clamp lightness values', () => {
      const color = colorFromHSL(180, 50, 120);
      expect(color.l).toBe(100);

      const color2 = colorFromHSL(180, 50, -10);
      expect(color2.l).toBe(0);
    });
  });

  // TS-039: Hex must match #RRGGBB pattern
  describe('Hex validation (TS-039)', () => {
    it('should parse valid hex codes', () => {
      const color = colorFromHex('#FF8040');
      expect(color.r).toBe(255);
      expect(color.g).toBe(128);
      expect(color.b).toBe(64);
    });

    it('should handle lowercase hex', () => {
      const color = colorFromHex('#ff8040');
      expect(color.r).toBe(255);
    });

    it('should throw on invalid hex format', () => {
      expect(() => colorFromHex('FF8040')).toThrow(); // Missing #
      expect(() => colorFromHex('#FFF')).toThrow(); // Too short
      expect(() => colorFromHex('#GGGGGG')).toThrow(); // Invalid chars
      expect(() => colorFromHex('#FF80401')).toThrow(); // Too long
    });

    it('should generate valid hex output', () => {
      const color = createColor(255, 128, 64);
      const hex = colorToHex(color);
      expect(hex).toMatch(/^#[0-9A-F]{6}$/i);
      expect(hex.toUpperCase()).toBe('#FF8040');
    });
  });

  // TS-040: RGB-HSL-Hex consistency invariant
  describe('RGB-HSL-Hex consistency (TS-040)', () => {
    it('should maintain consistency: RGB -> HSL -> RGB', () => {
      const original = createColor(255, 128, 64);
      const hsl = rgbToHsl(original.r, original.g, original.b);
      const rgb = hslToRgb(hsl.h, hsl.s, hsl.l);

      // Allow rounding tolerance of 2 (HSL conversion has inherent precision loss)
      expect(Math.abs(rgb.r - original.r)).toBeLessThanOrEqual(2);
      expect(Math.abs(rgb.g - original.g)).toBeLessThanOrEqual(2);
      expect(Math.abs(rgb.b - original.b)).toBeLessThanOrEqual(2);
    });

    it('should maintain consistency: HSL -> RGB -> HSL', () => {
      const original = { h: 200, s: 75, l: 60 };
      const rgb = hslToRgb(original.h, original.s, original.l);
      const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

      // Allow rounding tolerance
      expect(Math.abs(hsl.h - original.h)).toBeLessThanOrEqual(1);
      expect(Math.abs(hsl.s - original.s)).toBeLessThanOrEqual(1);
      expect(Math.abs(hsl.l - original.l)).toBeLessThanOrEqual(1);
    });

    it('should maintain consistency: Hex -> RGB -> Hex', () => {
      const original = '#FF8040';
      const color = colorFromHex(original);
      const hex = colorToHex(color);
      expect(hex.toUpperCase()).toBe(original);
    });

    it('should have consistent hex property on Color object', () => {
      const color = createColor(255, 128, 64);
      expect(color.hex).toBe(colorToHex(color));
    });
  });

  // Edge cases
  describe('Edge cases', () => {
    it('should handle pure black', () => {
      const color = createColor(0, 0, 0);
      expect(color.hex).toBe('#000000');
      expect(color.l).toBe(0);
    });

    it('should handle pure white', () => {
      const color = createColor(255, 255, 255);
      expect(color.hex).toBe('#FFFFFF');
      expect(color.l).toBe(100);
    });

    it('should handle grayscale (no saturation)', () => {
      const color = createColor(128, 128, 128);
      expect(color.s).toBe(0);
    });

    it('should handle primary colors', () => {
      const red = createColor(255, 0, 0);
      expect(red.h).toBeCloseTo(0, 0);

      const green = createColor(0, 255, 0);
      expect(green.h).toBeCloseTo(120, 0);

      const blue = createColor(0, 0, 255);
      expect(blue.h).toBeCloseTo(240, 0);
    });
  });
});
