/**
 * Pure Animation and Playback State Helpers
 */

/**
 * Determine which stage step (0, 1, 2, or 3) corresponds to the given progress.
 * Thresholds:
 *   [0.0, 0.25)  -> Step 0 (Stage 1: Sphere)
 *   [0.25, 0.55) -> Step 1 (Stage 2: Separation)
 *   [0.55, 0.85) -> Step 2 (Stage 3: Flight)
 *   [0.85, 1.0]  -> Step 3 (Stage 4: Floor disk filling)
 * @param {number} progress - Progress value between 0.0 and 1.0
 * @returns {number} Step index (0, 1, 2, or 3)
 */
export function determineStepIndex(progress) {
  if (progress < 0.25) return 0;
  if (progress < 0.55) return 1;
  if (progress < 0.85) return 2;
  return 3;
}

/**
 * Clamp progress value safely between 0.0 and 1.0.
 * @param {number} p - Raw progress value
 * @returns {number} Clamped value between 0.0 and 1.0
 */
export function clampProgress(p) {
  if (typeof p !== 'number' || Number.isNaN(p)) return 0.0;
  return Math.min(1.0, Math.max(0.0, p));
}

/**
 * Calculate progress increment for playback based on elapsed time and speed.
 * Normal duration is 6.0 seconds at 1x speed.
 * Delta is clamped to a maximum of 0.1s to prevent frame spike skipping.
 * @param {number} currentTime - Current timestamp in milliseconds
 * @param {number} lastTime - Previous timestamp in milliseconds
 * @param {number} speed - Playback speed multiplier (e.g. 0.5, 1.0, 2.0)
 * @returns {number} Progress increment
 */
export function calculatePlaybackDelta(currentTime, lastTime, speed = 1.0) {
  const dtSec = Math.max(0, (currentTime - lastTime) / 1000);
  const clampedDelta = Math.min(dtSec, 0.1);
  return (clampedDelta / 6.0) * speed;
}
