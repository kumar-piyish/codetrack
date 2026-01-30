const express = require("express");
const User = require("../models/User");

const router = express.Router();

/**
 * @route   GET /api/patterns/progress
 * @desc    Get completed pattern questions for a user
 */
router.get("/progress", async (req, res) => {
  try {
    const { clerkUserId, category, patternId } = req.query;
    if (!clerkUserId) {
      return res.status(400).json({ error: "clerkUserId is required" });
    }

    const user = await User.findOne({ clerkUserId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    let progress = user.patternQuestionProgress || [];
    if (category) {
      progress = progress.filter((item) => item.categoryTitle === category);
    }
    if (patternId) {
      progress = progress.filter(
        (item) => String(item.patternId) === String(patternId)
      );
    }

    const completed = progress
      .filter((item) => item.completed)
      .map((item) => ({
        categoryTitle: item.categoryTitle,
        patternId: item.patternId,
        questionTitle: item.questionTitle,
      }));

    res.json({ completed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   PUT /api/patterns/progress
 * @desc    Update pattern question completion for a user
 */
router.put("/progress", async (req, res) => {
  try {
    const { clerkUserId, categoryTitle, patternId, questionTitle, completed } = req.body;
    if (!clerkUserId || !categoryTitle || !patternId || !questionTitle) {
      return res.status(400).json({
        error: "clerkUserId, categoryTitle, patternId, and questionTitle are required",
      });
    }

    const user = await User.findOne({ clerkUserId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const progress = user.patternQuestionProgress || [];
    const existingIndex = progress.findIndex(
      (item) =>
        item.categoryTitle === categoryTitle &&
        String(item.patternId) === String(patternId) &&
        item.questionTitle === questionTitle
    );

    if (existingIndex >= 0) {
      progress[existingIndex].completed = Boolean(completed);
    } else {
      progress.push({
        categoryTitle,
        patternId: String(patternId),
        questionTitle,
        completed: Boolean(completed),
      });
    }

    user.patternQuestionProgress = progress;
    await user.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
