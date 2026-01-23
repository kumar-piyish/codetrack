const express = require("express");
const User = require("../models/User");
const { getTodayPlan, generateTodayPlan } = require("../utils/todayPlan");
const { calculateAfterRevision } = require("../utils/revisionEngine");
const Question = require("../models/Question");

const router = express.Router();

/**
 * @route   GET /api/today/:userId
 * @desc    Get today's revision plan for a user
 */
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.query; // Optional date parameter (for testing)

    const today = date ? new Date(date) : new Date();
    const plan = await getTodayPlan(userId, today);

    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   POST /api/today/generate/:userId
 * @desc    Generate today's plan (same as GET but explicit generation)
 */
router.post("/generate/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { date } = req.body; // Optional date parameter

    const today = date ? new Date(date) : new Date();
    const plan = await generateTodayPlan(userId, today);

    res.json(plan);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   POST /api/today/:userId/mark-revised
 * @desc    Mark a question as revised and reschedule
 */
router.post("/:userId/mark-revised", async (req, res) => {
  try {
    const { questionId, confidenceLevel, wayOfSolving } = req.body;

    if (!questionId || !confidenceLevel || !wayOfSolving) {
      return res.status(400).json({
        error: "questionId, confidenceLevel, and wayOfSolving are required",
      });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
    }

    // Verify question belongs to user
    const user = await User.findById(req.params.userId);
    if (!user || question.userId.toString() !== req.params.userId) {
      return res.status(403).json({ error: "Unauthorized" });
    }

    // Calculate next revision based on new attempt
    const revisionResult = calculateAfterRevision(
      confidenceLevel,
      wayOfSolving,
      question.revisionCount,
      new Date()
    );

    // Add to revision history
    const historyEntry = {
      revisedAt: new Date(),
      confidenceLevel,
      wayOfSolving,
      intervalUsed: revisionResult.intervalUsed,
    };

    // Update question
    question.confidenceLevel = confidenceLevel;
    question.lastConfidence = confidenceLevel;
    question.wayOfSolving = wayOfSolving;
    question.lastSolvedAt = new Date();
    question.nextRevisionAt = revisionResult.nextRevisionAt;
    question.revisionCount = revisionResult.effectiveRevisionCount;
    question.revisionHistory.push(historyEntry);

    await question.save();

    res.json({
      question,
      message: "Question marked as revised and rescheduled",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
