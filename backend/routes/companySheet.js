const express = require("express");
const CompanySheet = require("../models/CompanySheet");

const router = express.Router();

/**
 * @route   GET /api/company-sheets
 * @desc    Get list of companies with question counts
 */
router.get("/", async (req, res) => {
  try {
    const sheets = await CompanySheet.find({});
    const companies = sheets.map((sheet) => {
      const questions = sheet.questions || {};
      return {
        _id: sheet._id,
        companyName: sheet.companyName,
        questionCount: Object.keys(questions).length,
      };
    });
    res.json(companies);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   GET /api/company-sheets/:id
 * @desc    Get company questions (title + tags)
 */
router.get("/:id", async (req, res) => {
  try {
    const sheet = await CompanySheet.findById(req.params.id);
    if (!sheet) {
      return res.status(404).json({ error: "Company sheet not found" });
    }

    const questionsObject = sheet.questions || {};
    const questions = Object.entries(questionsObject).map(([title, tags]) => ({
      title,
      tags: Array.isArray(tags) ? tags : [],
    }));

    res.json({
      companyName: sheet.companyName,
      questions,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   GET /api/company-sheets/:id/progress
 * @desc    Get completed question titles for a user
 */
router.get("/:id/progress", async (req, res) => {
  try {
    const { clerkUserId } = req.query;
    if (!clerkUserId) {
      return res.status(400).json({ error: "clerkUserId is required" });
    }

    const user = await require("../models/User").findOne({ clerkUserId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const completed = (user.companyQuestionProgress || [])
      .filter(
        (item) =>
          item.companySheetId?.toString() === req.params.id && item.completed
      )
      .map((item) => item.questionTitle);

    res.json({ completed });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   PUT /api/company-sheets/:id/progress
 * @desc    Update question completion for a user
 */
router.put("/:id/progress", async (req, res) => {
  try {
    const { clerkUserId, questionTitle, completed } = req.body;
    if (!clerkUserId || !questionTitle) {
      return res.status(400).json({ error: "clerkUserId and questionTitle are required" });
    }

    const user = await require("../models/User").findOne({ clerkUserId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const progress = user.companyQuestionProgress || [];
    const existingIndex = progress.findIndex(
      (item) =>
        item.companySheetId?.toString() === req.params.id &&
        item.questionTitle === questionTitle
    );

    if (existingIndex >= 0) {
      progress[existingIndex].completed = Boolean(completed);
    } else {
      progress.push({
        companySheetId: req.params.id,
        questionTitle,
        completed: Boolean(completed),
      });
    }

    user.companyQuestionProgress = progress;
    await user.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
