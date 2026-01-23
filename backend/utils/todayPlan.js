/**
 * Today's Plan System - Prioritization Logic
 * 
 * Pulls questions where nextRevisionAt <= today
 * Prioritizes:
 * 1. LOW confidence
 * 2. WATCHED_SOLUTION / USED_AI (needs more practice)
 * 3. Longest overdue (nextRevisionAt furthest in past)
 */

/**
 * Calculate priority score for a question
 * Lower score = higher priority
 */
function calculatePriority(question, today) {
  let priority = 0;

  // Confidence level priority (LOW = highest priority)
  const confidencePriority = {
    LOW: 0,
    MEDIUM: 10,
    HIGH: 20,
  };
  priority += confidencePriority[question.confidenceLevel] || 20;

  // Way of solving priority (WATCHED_SOLUTION and USED_AI need more practice)
  const wayOfSolvingPriority = {
    WATCHED_SOLUTION: 0,
    USED_AI: 2,
    TOOK_HINTS: 5,
    SOLVED_SELF: 10,
  };
  priority += wayOfSolvingPriority[question.wayOfSolving] || 10;

  // Overdue priority (longer overdue = higher priority)
  if (question.nextRevisionAt) {
    const revisionDate = new Date(question.nextRevisionAt);
    const daysOverdue = Math.floor((today - revisionDate) / (1000 * 60 * 60 * 24));
    
    // Cap at 30 days to prevent extreme values
    const overdueScore = Math.min(daysOverdue, 30);
    priority -= overdueScore; // Negative because overdue = higher priority
  }

  // Low revision count = needs more practice
  priority -= question.revisionCount || 0;

  return priority;
}

/**
 * Get today's revision plan for a user
 * @param {String} userId - User ID
 * @param {Date} today - Today's date (default: now)
 * @returns {Object} { questions: Array, stats: Object }
 */
async function getTodayPlan(userId, today = new Date()) {
  const Question = require("../models/Question");

  // Set today to start of day for comparison
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);

  // Find all questions due for revision (nextRevisionAt <= today)
  // Also include questions with null nextRevisionAt (for backward compatibility)
  const dueQuestions = await Question.find({
    userId: userId,
    $or: [
      { nextRevisionAt: { $lte: todayStart } },
      { nextRevisionAt: null },
    ],
  }).sort({ nextRevisionAt: 1 }); // Sort by nextRevisionAt ascending (oldest first)

  // Calculate priority for each question
  const questionsWithPriority = dueQuestions.map((question) => ({
    ...question.toObject(),
    priority: calculatePriority(question, todayStart),
    daysOverdue: question.nextRevisionAt
      ? Math.floor((todayStart - new Date(question.nextRevisionAt)) / (1000 * 60 * 60 * 24))
      : 0,
  }));

  // Sort by priority (lower = higher priority)
  questionsWithPriority.sort((a, b) => a.priority - b.priority);

  // Calculate stats
  const stats = {
    total: questionsWithPriority.length,
    lowConfidence: questionsWithPriority.filter((q) => q.confidenceLevel === "LOW").length,
    mediumConfidence: questionsWithPriority.filter((q) => q.confidenceLevel === "MEDIUM").length,
    highConfidence: questionsWithPriority.filter((q) => q.confidenceLevel === "HIGH").length,
    overdue: questionsWithPriority.filter((q) => q.daysOverdue > 0).length,
    watchedOrAI: questionsWithPriority.filter(
      (q) => q.wayOfSolving === "WATCHED_SOLUTION" || q.wayOfSolving === "USED_AI"
    ).length,
  };

  return {
    questions: questionsWithPriority,
    stats: stats,
    generatedAt: todayStart,
  };
}

/**
 * Generate and save today's plan (optional - can be used for caching)
 */
async function generateTodayPlan(userId, today = new Date()) {
  const plan = await getTodayPlan(userId, today);
  // Could save to a TodayPlan collection if needed for caching
  // For now, we'll just return the plan
  return plan;
}

module.exports = {
  getTodayPlan,
  generateTodayPlan,
  calculatePriority,
};
