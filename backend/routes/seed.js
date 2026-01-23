/**
 * Seed Route - Add sample LeetCode questions for testing
 * This is a development utility route
 */

const express = require("express");
const Question = require("../models/Question");
const User = require("../models/User");
const { calculateNextRevision } = require("../utils/revisionEngine");
const { fetchLeetCodeMetadata } = require("../utils/leetcodeFetcher");

const router = express.Router();

// Sample LeetCode questions to seed
const SAMPLE_QUESTIONS = [
  {
    title: "Two Sum",
    slug: "two-sum",
    difficulty: "Easy",
    tags: ["Array", "Hash Table"],
    companies: ["Amazon", "Google", "Microsoft"],
  },
  {
    title: "Best Time to Buy and Sell Stock",
    slug: "best-time-to-buy-and-sell-stock",
    difficulty: "Easy",
    tags: ["Array", "Dynamic Programming"],
    companies: ["Amazon", "Facebook", "Microsoft"],
  },
  {
    title: "Valid Parentheses",
    slug: "valid-parentheses",
    difficulty: "Easy",
    tags: ["String", "Stack"],
    companies: ["Amazon", "Google", "Microsoft"],
  },
  {
    title: "Maximum Subarray",
    slug: "maximum-subarray",
    difficulty: "Medium",
    tags: ["Array", "Divide and Conquer", "Dynamic Programming"],
    companies: ["Amazon", "LinkedIn", "Microsoft"],
  },
  {
    title: "Product of Array Except Self",
    slug: "product-of-array-except-self",
    difficulty: "Medium",
    tags: ["Array", "Prefix Sum"],
    companies: ["Amazon", "Facebook", "Microsoft"],
  },
  {
    title: "3Sum",
    slug: "3sum",
    difficulty: "Medium",
    tags: ["Array", "Two Pointers", "Sorting"],
    companies: ["Amazon", "Facebook", "Google"],
  },
  {
    title: "Merge Intervals",
    slug: "merge-intervals",
    difficulty: "Medium",
    tags: ["Array", "Sorting"],
    companies: ["Amazon", "Google", "Microsoft"],
  },
  {
    title: "Longest Palindromic Substring",
    slug: "longest-palindromic-substring",
    difficulty: "Medium",
    tags: ["String", "Dynamic Programming"],
    companies: ["Amazon", "Microsoft"],
  },
  {
    title: "Container With Most Water",
    slug: "container-with-most-water",
    difficulty: "Medium",
    tags: ["Array", "Two Pointers", "Greedy"],
    companies: ["Amazon", "Google", "Facebook"],
  },
  {
    title: "Trapping Rain Water",
    slug: "trapping-rain-water",
    difficulty: "Hard",
    tags: ["Array", "Two Pointers", "Stack", "Dynamic Programming"],
    companies: ["Amazon", "Google", "Microsoft"],
  },
];

/**
 * @route   POST /api/seed/questions/:userId
 * @desc    Add sample questions for a user (development only)
 */
router.post("/questions/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { count = 5 } = req.body; // Number of questions to add

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const questionsToAdd = SAMPLE_QUESTIONS.slice(0, Math.min(count, SAMPLE_QUESTIONS.length));
    const addedQuestions = [];

    for (const sample of questionsToAdd) {
      // Try to fetch full metadata from LeetCode
      let metadata = null;
      try {
        const result = await fetchLeetCodeMetadata(sample.slug);
        if (result.success) {
          metadata = result.data;
        }
      } catch (err) {
        // Use sample data if fetch fails
      }

      // Determine confidence and way of solving randomly for variety
      // More variety: mix of LOW (40%), MEDIUM (40%), HIGH (20%)
      // More variety in way of solving
      const confidenceRand = Math.random();
      let confidenceLevel;
      if (confidenceRand < 0.4) {
        confidenceLevel = "LOW";
      } else if (confidenceRand < 0.8) {
        confidenceLevel = "MEDIUM";
      } else {
        confidenceLevel = "HIGH";
      }
      
      const waysOfSolving = ["SOLVED_SELF", "TOOK_HINTS", "USED_AI", "WATCHED_SOLUTION"];
      const wayOfSolving = waysOfSolving[Math.floor(Math.random() * waysOfSolving.length)];

      // Calculate revision schedule
      const revisionSchedule = calculateNextRevision(
        confidenceLevel,
        wayOfSolving,
        0,
        new Date()
      );

      // Set questions to be due for revision (solved 1 week back, so due now)
      // All questions will be due today or in the past so they show in Today's Plan
      const daysAgo = Math.floor(Math.random() * 5); // 0-4 days overdue
      const nextRevisionDate = new Date();
      nextRevisionDate.setDate(nextRevisionDate.getDate() - daysAgo);
      nextRevisionDate.setHours(0, 0, 0, 0);

      // Create question
      const question = await Question.create({
        title: metadata?.title || sample.title,
        platform: "LeetCode",
        difficulty: metadata?.difficulty || sample.difficulty,
        wayOfSolving: wayOfSolving,
        confidenceLevel: confidenceLevel,
        userId: userId,
        revisionCount: 0,
        lastConfidence: confidenceLevel,
        nextRevisionAt: nextRevisionDate,
        leetcodeId: metadata?.leetcodeId || null,
        slug: metadata?.slug || sample.slug,
        tags: metadata?.tags || sample.tags,
        companies: metadata?.companies || sample.companies,
        lastSolvedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Solved 1 week ago
      });

      addedQuestions.push(question);
    }

    // Update user's question count
    await User.findByIdAndUpdate(userId, {
      $push: { questions: { $each: addedQuestions.map((q) => q._id) } },
      $inc: { totalQuestions: addedQuestions.length },
    });

    res.json({
      message: `Successfully added ${addedQuestions.length} sample questions`,
      questions: addedQuestions,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   DELETE /api/seed/questions/:userId
 * @desc    Clear all questions for a user (development only)
 */
router.delete("/questions/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    // Delete all questions for this user
    const deleteResult = await Question.deleteMany({ userId: userId });

    // Update user's question count
    await User.findByIdAndUpdate(userId, {
      $set: { questions: [], totalQuestions: 0 },
    });

    res.json({
      message: `Successfully deleted ${deleteResult.deletedCount} questions`,
      deletedCount: deleteResult.deletedCount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
