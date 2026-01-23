/**
 * Smart Revision Engine - Spaced Repetition Algorithm
 * 
 * Calculates next revision date based on:
 * - Current confidence level
 * - Way of solving (SOLVED_SELF, TOOK_HINTS, USED_AI, WATCHED_SOLUTION)
 * - Revision count (progression through intervals)
 */

// Base intervals in days for each confidence level
const BASE_INTERVALS = {
  LOW: [1, 2, 4, 7, 15],
  MEDIUM: [3, 7, 15, 30],
  HIGH: [7, 15, 30, 60],
};

// Modifiers for wayOfSolving (multipliers)
const WAY_OF_SOLVING_MODIFIERS = {
  SOLVED_SELF: 1.5, // +50% boost - solved independently, increase interval
  TOOK_HINTS: 1.0, // No change
  USED_AI: 0.7, // -30% penalty - needed AI help, reduce interval
  WATCHED_SOLUTION: 0.5, // -50% penalty - watched solution, significantly reduce
};

/**
 * Calculate next revision date based on current state
 * @param {String} confidenceLevel - Current confidence (HIGH, MEDIUM, LOW)
 * @param {String} wayOfSolving - How it was solved
 * @param {Number} revisionCount - Current revision count
 * @param {Date} baseDate - Base date to calculate from (default: now)
 * @returns {Object} { nextRevisionAt: Date, intervalUsed: Number }
 */
function calculateNextRevision(confidenceLevel, wayOfSolving, revisionCount = 0, baseDate = new Date()) {
  // Get base interval array for this confidence level
  const intervals = BASE_INTERVALS[confidenceLevel];
  if (!intervals) {
    throw new Error(`Invalid confidence level: ${confidenceLevel}`);
  }

  // Get modifier for way of solving
  const modifier = WAY_OF_SOLVING_MODIFIERS[wayOfSolving] || 1.0;

  // Get interval index (wrap around if revisionCount exceeds array length)
  const intervalIndex = revisionCount % intervals.length;
  let baseInterval = intervals[intervalIndex];

  // If we've gone through all intervals, use the last one with exponential growth
  if (revisionCount >= intervals.length) {
    const lastInterval = intervals[intervals.length - 1];
    const cycles = Math.floor(revisionCount / intervals.length);
    baseInterval = lastInterval * Math.pow(1.5, cycles); // Exponential growth after full cycle
  }

  // Apply modifier
  const adjustedInterval = Math.max(1, Math.round(baseInterval * modifier));

  // Calculate next revision date
  const nextRevisionAt = new Date(baseDate);
  nextRevisionAt.setDate(nextRevisionAt.getDate() + adjustedInterval);

  return {
    nextRevisionAt,
    intervalUsed: adjustedInterval,
  };
}

/**
 * Calculate next revision after a revision attempt
 * Updates based on new confidence and way of solving
 * @param {String} newConfidenceLevel - Confidence after revision
 * @param {String} newWayOfSolving - How it was solved this time
 * @param {Number} currentRevisionCount - Current revision count
 * @param {Date} revisionDate - Date of this revision (default: now)
 * @returns {Object} { nextRevisionAt: Date, intervalUsed: Number, shouldIncrementCount: Boolean }
 */
function calculateAfterRevision(newConfidenceLevel, newWayOfSolving, currentRevisionCount, revisionDate = new Date()) {
  // If solved independently with high confidence, increment count (progress)
  // If watched solution or used AI, don't increment (or even reset if very low confidence)
  let shouldIncrementCount = true;
  let effectiveRevisionCount = currentRevisionCount;

  if (newWayOfSolving === "WATCHED_SOLUTION" && newConfidenceLevel === "LOW") {
    // Watched solution and still low confidence - reset progress
    effectiveRevisionCount = 0;
    shouldIncrementCount = false;
  } else if (newWayOfSolving === "USED_AI" && newConfidenceLevel === "LOW") {
    // Used AI and still low - don't progress
    shouldIncrementCount = false;
    effectiveRevisionCount = Math.max(0, currentRevisionCount - 1);
  } else if (newWayOfSolving === "SOLVED_SELF") {
    // Solved independently - always progress
    shouldIncrementCount = true;
    effectiveRevisionCount = currentRevisionCount + 1;
  } else {
    // Other cases - increment normally
    shouldIncrementCount = true;
    effectiveRevisionCount = currentRevisionCount + 1;
  }

  const result = calculateNextRevision(
    newConfidenceLevel,
    newWayOfSolving,
    effectiveRevisionCount,
    revisionDate
  );

  return {
    ...result,
    shouldIncrementCount,
    effectiveRevisionCount,
  };
}

module.exports = {
  calculateNextRevision,
  calculateAfterRevision,
  BASE_INTERVALS,
  WAY_OF_SOLVING_MODIFIERS,
};
