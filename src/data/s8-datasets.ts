/**
 * Small SYNTHETIC datasets for lessons 8.2–8.5 (stage-8 author A). Typed by hand as teaching inputs; every statistic computed
 * from them comes from src/lib/calc/stats.ts. None of it is real: not a client, not a bank, not the market
 * ("נתונים סינתטיים; להדגמה בלבד").
 */

/** Eleven payment-to-income ratios (percent) of eleven invented past files. Lesson 8.3's hand example. */
export const RATIOS_11 = [34, 28, 40, 31, 47, 35, 30, 38, 33, 42, 36];

/** Thirty invented ratios (percent, one decimal) for the histogram of lesson 8.3. Right-skewed on purpose: a few files sit high. */
export const RATIOS_30 = [
  33.5, 28.4, 40.2, 31.2, 29.0, 36.5, 24.1, 35.2, 44.6, 32.4, 30.5, 37.8, 27.8, 34.0, 41.9, 29.9, 31.8, 38.6, 26.3, 35.9,
  32.9, 43.1, 33.1, 29.6, 34.6, 39.4, 46.2, 37.1, 41.0, 48.0,
];

/** Ten invented offers of one invented bank: financing ratio (percent) and the margin over the anchor (percentage points). Lesson 8.5. */
export const MARGIN_POINTS = [
  { x: 40, y: 1.0 },
  { x: 45, y: 1.05 },
  { x: 50, y: 1.12 },
  { x: 55, y: 1.14 },
  { x: 60, y: 1.22 },
  { x: 65, y: 1.25 },
  { x: 68, y: 1.33 },
  { x: 70, y: 1.3 },
  { x: 72, y: 1.41 },
  { x: 75, y: 1.46 },
];

/** Six faces of a toy die and the rate change (percentage points) each face stands for at a variable track's next reset. Lesson 8.4: a toy, not a forecast. */
export const DIE_RATE_CHANGES = ["-1", "-0.5", "0", "0.5", "1", "1.5"];

/** Three dice: a fair one and two loaded ones, as counts per face (lesson 8.4's component). */
export const DICE = {
  fair: [1, 1, 1, 1, 1, 1],
  loadedLow: [3, 2, 1, 1, 1, 1],
  loadedHigh: [1, 1, 1, 1, 2, 3],
} as const;
