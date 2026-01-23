const express = require("express");
const Question = require("../models/Question");
const User = require("../models/User");
const { calculateNextRevision, calculateAfterRevision } = require("../utils/revisionEngine");
const { fetchLeetCodeMetadata } = require("../utils/leetcodeFetcher");
const { fetchLeetCodePOTD } = require("../utils/leetcodePOTD");

const router = express.Router();

//  Add new question
router.post("/add", async (req, res) => {
  try {
    const {
      title,
      platform,
      difficulty,
      wayOfSolving,
      confidenceLevel,
      userId,
    } = req.body;

    // Calculate initial revision schedule
    const revisionSchedule = calculateNextRevision(
      confidenceLevel,
      wayOfSolving,
      0, // First revision
      new Date()
    );

    const question = await Question.create({
      title,
      platform,
      difficulty,
      wayOfSolving,
      confidenceLevel,
      userId,
      revisionCount: 0,
      lastConfidence: confidenceLevel,
      nextRevisionAt: revisionSchedule.nextRevisionAt,
    });

    await User.findByIdAndUpdate(userId, {
      $push: { questions: question._id },
      $inc: { totalQuestions: 1 },
    });

    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Smart add question - auto-fetches LeetCode metadata if platform is LeetCode
router.post("/add-smart", async (req, res) => {
  try {
    const {
      title,
      platform,
      difficulty: manualDifficulty,
      wayOfSolving,
      confidenceLevel,
      userId,
      leetcodeInput, // URL, slug, or title for LeetCode questions
      tags: manualTags,
      companies: manualCompanies,
    } = req.body;

    if (!title || !platform || !wayOfSolving || !confidenceLevel || !userId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    let finalDifficulty = manualDifficulty;
    let finalTags = manualTags || [];
    let finalCompanies = manualCompanies || [];
    let leetcodeId = null;
    let slug = null;

    // If platform is LeetCode, try to fetch metadata
    if (platform.toLowerCase() === "leetcode" && leetcodeInput) {
      const leetcodeResult = await fetchLeetCodeMetadata(leetcodeInput);

      if (leetcodeResult.success) {
        // Use fetched metadata
        finalDifficulty = leetcodeResult.data.difficulty;
        finalTags = leetcodeResult.data.tags;
        finalCompanies = leetcodeResult.data.companies;
        leetcodeId = leetcodeResult.data.leetcodeId;
        slug = leetcodeResult.data.slug;

        // Override title with fetched title if available
        if (leetcodeResult.data.title) {
          // Use fetched title or keep manual title
        }
      }
      // If fetch fails, fall back to manual entry (no error, just use manual data)
    }

    // Validate difficulty
    if (!finalDifficulty || !["Easy", "Medium", "Hard"].includes(finalDifficulty)) {
      return res.status(400).json({ error: "Valid difficulty (Easy, Medium, Hard) is required" });
    }

    // Check for duplicate question
    // For LeetCode: check by slug or leetcodeId
    // For others: check by title and platform
    let existingQuestion = null;
    if (platform.toLowerCase() === "leetcode") {
      if (slug) {
        existingQuestion = await Question.findOne({
          userId: userId,
          platform: "LeetCode",
          slug: slug,
        });
      } else if (leetcodeId) {
        existingQuestion = await Question.findOne({
          userId: userId,
          platform: "LeetCode",
          leetcodeId: leetcodeId,
        });
      }
    }
    
    // If no slug/leetcodeId match, check by title and platform
    if (!existingQuestion) {
      existingQuestion = await Question.findOne({
        userId: userId,
        platform: platform,
        title: { $regex: new RegExp(`^${title}$`, "i") }, // Case-insensitive match
      });
    }

    if (existingQuestion) {
      return res.status(409).json({
        error: "This question already exists in your tracker",
        existingQuestion: existingQuestion,
      });
    }

    // Calculate initial revision schedule
    const revisionSchedule = calculateNextRevision(
      confidenceLevel,
      wayOfSolving,
      0, // First revision
      new Date()
    );

    // Create question with all metadata
    const question = await Question.create({
      title,
      platform,
      difficulty: finalDifficulty,
      wayOfSolving,
      confidenceLevel,
      userId,
      revisionCount: 0,
      lastConfidence: confidenceLevel,
      nextRevisionAt: revisionSchedule.nextRevisionAt,
      // LeetCode metadata (will be null/empty for non-LeetCode questions)
      leetcodeId,
      slug,
      tags: finalTags,
      companies: finalCompanies,
    });

    await User.findByIdAndUpdate(userId, {
      $push: { questions: question._id },
      $inc: { totalQuestions: 1 },
    });

    res.status(201).json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get all questions of a user
router.get("/user/:userId", async (req, res) => {
  try {
    const questions = await Question.find({ userId: req.params.userId });
    res.json(questions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Preview LeetCode metadata (for frontend preview before adding)
router.post("/preview-leetcode", async (req, res) => {
  try {
    const { input } = req.body; // URL, slug, or title

    if (!input) {
      return res.status(400).json({ error: "Input is required" });
    }

    const result = await fetchLeetCodeMetadata(input);

    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    res.json(result.data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update confidence level (simple update, doesn't reschedule)
router.patch("/:id/confidence", async (req, res) => {
  try {
    const { confidenceLevel } = req.body;

    const question = await Question.findByIdAndUpdate(
      req.params.id,
      { confidenceLevel, lastConfidence: confidenceLevel },
      { new: true }
    );

    res.json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Mark question as revised - updates confidence, way of solving, and reschedules
router.post("/:id/revise", async (req, res) => {
  try {
    const { confidenceLevel, wayOfSolving } = req.body;

    if (!confidenceLevel || !wayOfSolving) {
      return res.status(400).json({ error: "confidenceLevel and wayOfSolving are required" });
    }

    const question = await Question.findById(req.params.id);
    if (!question) {
      return res.status(404).json({ error: "Question not found" });
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

    res.json(question);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get LeetCode POTD
router.get("/potd", async (req, res) => {
  try {
    const result = await fetchLeetCodePOTD();

    if (!result.success) {
      // Return 200 with error message instead of 404, so frontend can handle gracefully
      return res.status(200).json({ 
        error: result.error,
        success: false 
      });
    }

    res.json(result.data);
  } catch (err) {
    console.error("POTD fetch error:", err);
    res.status(200).json({ 
      error: err.message || "Failed to fetch POTD",
      success: false 
    });
  }
});

module.exports = router;
