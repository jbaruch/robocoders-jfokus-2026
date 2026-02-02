/**
 * Color Extraction Service - K-Means clustering for dominant color
 * Implements: plan.md Color Extraction, FR-003
 * Test Specs: TS-004, TS-005, TS-006, TS-045, TS-047
 *
 * Constitution Compliance:
 * - P1: Proven K-Means algorithm, no experimental patterns
 * - P2: Tests written first per TDD
 */

import { createColor, BLACK, type Color } from '@/types/color';

/**
 * RGB pixel as [r, g, b]
 */
type Pixel = [number, number, number];

/**
 * Cluster with centroid and member pixels
 */
interface Cluster {
  centroid: Pixel;
  pixels: Pixel[];
}

/**
 * Sample pixels from ImageData for performance
 * Samples every Nth pixel to reduce computation while maintaining color distribution
 *
 * @param data - Raw pixel data (RGBA format)
 * @param step - Sample every Nth pixel (default: 10 for performance)
 * @returns Array of RGB pixels
 */
export function samplePixels(data: Uint8ClampedArray, step = 10): Pixel[] {
  const pixels: Pixel[] = [];

  for (let i = 0; i < data.length; i += step * 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];

    // Skip undefined values (corrupt data)
    if (r === undefined || g === undefined || b === undefined) {
      continue;
    }

    pixels.push([r, g, b]);
  }

  return pixels;
}

/**
 * Calculate Euclidean distance between two pixels in RGB space
 */
function distance(p1: Pixel, p2: Pixel): number {
  const dr = p1[0] - p2[0];
  const dg = p1[1] - p2[1];
  const db = p1[2] - p2[2];
  return Math.sqrt(dr * dr + dg * dg + db * db);
}

/**
 * Calculate centroid (average) of a set of pixels
 */
function calculateCentroid(pixels: Pixel[]): Pixel {
  if (pixels.length === 0) {
    return [0, 0, 0];
  }

  let rSum = 0;
  let gSum = 0;
  let bSum = 0;

  for (const pixel of pixels) {
    rSum += pixel[0];
    gSum += pixel[1];
    bSum += pixel[2];
  }

  return [
    Math.round(rSum / pixels.length),
    Math.round(gSum / pixels.length),
    Math.round(bSum / pixels.length),
  ];
}

/**
 * Initialize cluster centroids by randomly selecting k pixels
 */
function initializeCentroids(pixels: Pixel[], k: number): Pixel[] {
  if (pixels.length <= k) {
    return [...pixels];
  }

  const centroids: Pixel[] = [];
  const usedIndices = new Set<number>();

  while (centroids.length < k) {
    const index = Math.floor(Math.random() * pixels.length);
    if (!usedIndices.has(index)) {
      usedIndices.add(index);
      const pixel = pixels[index];
      if (pixel) {
        centroids.push([...pixel]);
      }
    }
  }

  return centroids;
}

/**
 * K-Means clustering algorithm
 *
 * @param pixels - Array of RGB pixels to cluster
 * @param k - Number of clusters (default: 5)
 * @param maxIterations - Maximum iterations before stopping (default: 10)
 * @returns Array of clusters sorted by size (largest first)
 */
export function kMeansClustering(
  pixels: Pixel[],
  k = 5,
  maxIterations = 10
): Cluster[] {
  if (pixels.length === 0) {
    return [];
  }

  if (pixels.length <= k) {
    // Not enough pixels for k clusters
    return pixels.map((pixel) => ({
      centroid: pixel,
      pixels: [pixel],
    }));
  }

  // Initialize centroids
  let centroids = initializeCentroids(pixels, k);
  let clusters: Cluster[] = [];

  for (let iteration = 0; iteration < maxIterations; iteration++) {
    // Assign pixels to nearest centroid
    clusters = centroids.map((centroid) => ({
      centroid,
      pixels: [],
    }));

    for (const pixel of pixels) {
      let minDist = Infinity;
      let nearestIndex = 0;

      for (let i = 0; i < centroids.length; i++) {
        const centroid = centroids[i];
        if (centroid) {
          const dist = distance(pixel, centroid);
          if (dist < minDist) {
            minDist = dist;
            nearestIndex = i;
          }
        }
      }

      const cluster = clusters[nearestIndex];
      if (cluster) {
        cluster.pixels.push(pixel);
      }
    }

    // Recalculate centroids
    const newCentroids: Pixel[] = [];
    let converged = true;

    for (let i = 0; i < clusters.length; i++) {
      const cluster = clusters[i];
      if (cluster && cluster.pixels.length > 0) {
        const newCentroid = calculateCentroid(cluster.pixels);
        const oldCentroid = centroids[i];

        if (oldCentroid && distance(newCentroid, oldCentroid) > 1) {
          converged = false;
        }

        newCentroids.push(newCentroid);
      } else {
        // Keep old centroid if cluster is empty
        const oldCentroid = centroids[i];
        if (oldCentroid) {
          newCentroids.push(oldCentroid);
        }
      }
    }

    centroids = newCentroids;

    if (converged) {
      break;
    }
  }

  // Update final centroids
  for (const cluster of clusters) {
    if (cluster && cluster.pixels.length > 0) {
      cluster.centroid = calculateCentroid(cluster.pixels);
    }
  }

  // Sort by cluster size (largest first)
  return clusters.sort((a, b) => b.pixels.length - a.pixels.length);
}

/**
 * Extract dominant color from ImageData using K-Means clustering
 *
 * @param imageData - Canvas ImageData object
 * @returns Dominant Color (largest cluster centroid)
 *
 * Performance: Targets < 100ms for 640x480 frame (NFR-002)
 * Algorithm: K-Means with k=5, max 10 iterations, pixel sampling
 */
export function extractDominantColor(imageData: ImageData): Color {
  // Handle empty/corrupt images (FR-011)
  if (!imageData.data || imageData.data.length === 0) {
    return BLACK;
  }

  // Sample pixels for performance
  const pixels = samplePixels(imageData.data, 10);

  if (pixels.length === 0) {
    return BLACK;
  }

  // Handle single pixel
  if (pixels.length === 1) {
    const pixel = pixels[0];
    if (pixel) {
      return createColor(pixel[0], pixel[1], pixel[2]);
    }
    return BLACK;
  }

  // Run K-Means clustering
  const clusters = kMeansClustering(pixels, 5, 10);

  // Return centroid of largest cluster
  const largest = clusters[0];
  if (largest) {
    const [r, g, b] = largest.centroid;
    return createColor(r, g, b);
  }

  return BLACK;
}
