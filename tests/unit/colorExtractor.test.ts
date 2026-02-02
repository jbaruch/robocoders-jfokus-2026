/**
 * Color Extraction Tests - TDD (Constitution Principle 2)
 * Test Specs: TS-004, TS-005, TS-006, TS-045, TS-047
 */
import { describe, it, expect } from 'vitest';
import { extractDominantColor, samplePixels } from '@/services/colorExtractor';

describe('Color Extraction (K-Means)', () => {
  // TS-045: K-Means returns largest cluster centroid
  describe('K-Means clustering (TS-045)', () => {
    it('should return the centroid of the largest cluster', () => {
      // Create image data with predominantly red pixels
      const redPixels = Array(100).fill([255, 0, 0, 255]).flat();
      const bluePixels = Array(20).fill([0, 0, 255, 255]).flat();
      const pixels = new Uint8ClampedArray([...redPixels, ...bluePixels]);

      const imageData: ImageData = {
        data: pixels,
        width: 12,
        height: 10,
        colorSpace: 'srgb',
      };

      const result = extractDominantColor(imageData);

      // Should be predominantly red (allowing some tolerance from clustering)
      expect(result.r).toBeGreaterThan(200);
      expect(result.g).toBeLessThan(50);
      expect(result.b).toBeLessThan(50);
    });

    it('should handle uniform color image', () => {
      const greenPixels = new Uint8ClampedArray(
        Array(100).fill([0, 255, 0, 255]).flat()
      );

      const imageData: ImageData = {
        data: greenPixels,
        width: 10,
        height: 10,
        colorSpace: 'srgb',
      };

      const result = extractDominantColor(imageData);

      expect(result.g).toBeGreaterThan(200);
      expect(result.r).toBeLessThan(50);
      expect(result.b).toBeLessThan(50);
    });

    it('should use k=5 clusters by default', () => {
      const mixedPixels = new Uint8ClampedArray([
        255, 0, 0, 255,     // Red
        0, 255, 0, 255,     // Green
        0, 0, 255, 255,     // Blue
        255, 255, 0, 255,   // Yellow
        255, 0, 255, 255,   // Magenta
      ]);

      const imageData: ImageData = {
        data: mixedPixels,
        width: 5,
        height: 1,
        colorSpace: 'srgb',
      };

      // Should not throw with small number of pixels
      expect(() => extractDominantColor(imageData)).not.toThrow();
    });
  });

  // TS-047: Color extraction completes within 100ms
  describe('Performance (TS-047)', () => {
    it('should extract color within 100ms for typical frame', () => {
      // 640x480 typical webcam resolution
      const pixels = new Uint8ClampedArray(640 * 480 * 4);
      // Fill with random colors
      for (let i = 0; i < pixels.length; i += 4) {
        pixels[i] = Math.floor(Math.random() * 256);
        pixels[i + 1] = Math.floor(Math.random() * 256);
        pixels[i + 2] = Math.floor(Math.random() * 256);
        pixels[i + 3] = 255;
      }

      const imageData: ImageData = {
        data: pixels,
        width: 640,
        height: 480,
        colorSpace: 'srgb',
      };

      const start = performance.now();
      extractDominantColor(imageData);
      const elapsed = performance.now() - start;

      expect(elapsed).toBeLessThan(100);
    });
  });

  // TS-004, TS-005: Red/blue objects produce correct colors
  describe('Color accuracy (TS-004, TS-005)', () => {
    it('should identify red as dominant from red image (TS-004)', () => {
      const redPixels = new Uint8ClampedArray(
        Array(400).fill([220, 30, 40, 255]).flat()
      );

      const imageData: ImageData = {
        data: redPixels,
        width: 20,
        height: 20,
        colorSpace: 'srgb',
      };

      const result = extractDominantColor(imageData);

      // Red hue is approximately 0 degrees (or near 360 due to wrapping)
      const isRedHue = result.h < 30 || result.h > 330;
      expect(isRedHue).toBe(true);
      expect(result.r).toBeGreaterThan(result.g);
      expect(result.r).toBeGreaterThan(result.b);
    });

    it('should identify blue as dominant from blue image (TS-005)', () => {
      const bluePixels = new Uint8ClampedArray(
        Array(400).fill([30, 50, 230, 255]).flat()
      );

      const imageData: ImageData = {
        data: bluePixels,
        width: 20,
        height: 20,
        colorSpace: 'srgb',
      };

      const result = extractDominantColor(imageData);

      // Blue hue is approximately 240 degrees
      expect(result.h).toBeGreaterThan(200);
      expect(result.h).toBeLessThan(280);
      expect(result.b).toBeGreaterThan(result.r);
      expect(result.b).toBeGreaterThan(result.g);
    });
  });

  // Edge cases per FR-011
  describe('Edge cases', () => {
    it('should return black for all-black frame (FR-011)', () => {
      const blackPixels = new Uint8ClampedArray(
        Array(100).fill([0, 0, 0, 255]).flat()
      );

      const imageData: ImageData = {
        data: blackPixels,
        width: 10,
        height: 10,
        colorSpace: 'srgb',
      };

      const result = extractDominantColor(imageData);

      expect(result.r).toBe(0);
      expect(result.g).toBe(0);
      expect(result.b).toBe(0);
      expect(result.hex).toBe('#000000');
    });

    it('should handle very small images', () => {
      const pixels = new Uint8ClampedArray([128, 64, 32, 255]);

      const imageData: ImageData = {
        data: pixels,
        width: 1,
        height: 1,
        colorSpace: 'srgb',
      };

      const result = extractDominantColor(imageData);

      expect(result.r).toBe(128);
      expect(result.g).toBe(64);
      expect(result.b).toBe(32);
    });

    it('should handle empty/corrupt images gracefully', () => {
      const emptyPixels = new Uint8ClampedArray(0);

      const imageData: ImageData = {
        data: emptyPixels,
        width: 0,
        height: 0,
        colorSpace: 'srgb',
      };

      // Should return black (FR-011: corrupt frames return #000000)
      const result = extractDominantColor(imageData);
      expect(result.hex).toBe('#000000');
    });
  });

  describe('Pixel sampling', () => {
    it('should sample every Nth pixel for performance', () => {
      const pixels = new Uint8ClampedArray(400 * 4); // 400 pixels
      const samples = samplePixels(pixels, 10); // Sample every 10th

      // Should have approximately 40 samples
      expect(samples.length).toBeLessThanOrEqual(40);
      expect(samples.length).toBeGreaterThan(30);
    });
  });
});
