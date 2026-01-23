const express = require("express");
const User = require("../models/User");

const router = express.Router();

/**
 * @route   POST /api/user/sync
 * @desc    Create user in DB after Clerk login
 */
router.post("/sync", async (req, res) => {
  try {
    const { clerkUserId, email, username, image } = req.body;

    if (!clerkUserId || !email || !username) {
      return res.status(400).json({ error: "clerkUserId, email, and username are required." });
    }

    let user = await User.findOne({ clerkUserId });

    if (!user) {
      user = await User.create({
        clerkUserId,
        email,
        username,
        image,
      });
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   GET /api/user/:clerkUserId/profile
 */
router.get("/:clerkUserId/profile", async (req, res) => {
  try {
    const user = await User.findOne({
      clerkUserId: req.params.clerkUserId,
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   PUT /api/user/:clerkUserId/profile
 */
router.put("/:clerkUserId/profile", async (req, res) => {
  try {
    const {
      degree,
      fieldOfStudy,
      yearOfGraduation,
      collegeName,
      country,
      username,
      salutation,
      currentLevel,
      primaryGoal,
      preferredCodingLanguage,
      targetPlatform,
      dailyPractice,
      emailNotification,
      socialLinks,
      leetcodeUsername,
    } = req.body;

    if (!degree || !fieldOfStudy || !yearOfGraduation || !collegeName || !country || !username || !salutation) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const user = await User.findOneAndUpdate(
      { clerkUserId: req.params.clerkUserId },
      {
        degree,
        fieldOfStudy,
        yearOfGraduation,
        collegeName,
        country,
        username,
        salutation,
        currentLevel,
        primaryGoal,
        preferredCodingLanguage,
        targetPlatform,
        dailyPractice,
        emailNotification,
        socialLinks,
        leetcodeUsername: leetcodeUsername || "",
        profileCompleted: true,
      },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User not found." });
    }

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   GET /api/user/:clerkUserId/dashboard
 */
router.get("/:clerkUserId/dashboard", async (req, res) => {
  try {
    const user = await User.findOne({
      clerkUserId: req.params.clerkUserId,
    }).populate("questions");

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const questions = user.questions || [];
    const high = questions.filter(q => q.confidenceLevel === "HIGH");
    const medium = questions.filter(q => q.confidenceLevel === "MEDIUM");
    const low = questions.filter(q => q.confidenceLevel === "LOW");

    res.json({
      totalQuestions: user.totalQuestions || 0,
      highConfidence: high.length,
      mediumConfidence: medium.length,
      lowConfidence: low.length,
      streak: user.streak || 0,
      todayQuestions: user.todayQuestions || [],
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   POST /api/user/:clerkUserId/leetcode/sync
 * @desc    Sync LeetCode profile data
 */
router.post("/:clerkUserId/leetcode/sync", async (req, res) => {
  try {
    let { leetcodeUsername } = req.body;

    if (!leetcodeUsername) {
      return res.status(400).json({ error: "LeetCode username is required" });
    }

    // Trim username
    leetcodeUsername = leetcodeUsername.trim();

    const user = await User.findOne({ clerkUserId: req.params.clerkUserId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { fetchLeetCodeUserProfile, fetchLeetCodeSubmissionCalendar } = require("../utils/leetcodeUser");

    // Fetch profile and stats
    const profileResult = await fetchLeetCodeUserProfile(leetcodeUsername);
    if (!profileResult.success) {
      console.error("LeetCode profile fetch failed:", profileResult.error);
      return res.status(400).json({ error: profileResult.error });
    }

    // Fetch submission calendar (optional - don't fail if this fails)
    let submissionCalendar = {};
    let streak = 0;
    let totalActiveDays = 0;
    
    try {
      const calendarResult = await fetchLeetCodeSubmissionCalendar(leetcodeUsername);
      if (calendarResult.success) {
        submissionCalendar = calendarResult.data.submissionCalendar || {};
        streak = calendarResult.data.streak || 0;
        totalActiveDays = calendarResult.data.totalActiveDays || 0;
      } else {
        console.warn("Calendar fetch failed (non-critical):", calendarResult.error);
      }
    } catch (calendarError) {
      console.warn("Calendar fetch error (non-critical):", calendarError.message);
      // Continue without calendar data
    }

    // Update user
    user.leetcodeUsername = leetcodeUsername;
    user.leetcodeStats = profileResult.data;
    user.leetcodeSubmissionCalendar = submissionCalendar;
    user.leetcodeLastSynced = new Date();
    if (streak > 0) {
      user.streak = Math.max(user.streak || 0, streak);
    }

    await user.save();

    res.json({
      message: "LeetCode profile synced successfully",
      stats: profileResult.data,
      calendar: {
        streak,
        totalActiveDays,
        submissionCalendar,
      },
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   GET /api/user/:clerkUserId/leetcode
 * @desc    Get user's LeetCode data
 */
router.get("/:clerkUserId/leetcode", async (req, res) => {
  try {
    const user = await User.findOne({ clerkUserId: req.params.clerkUserId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({
      leetcodeUsername: user.leetcodeUsername || "",
      leetcodeStats: user.leetcodeStats || {},
      leetcodeSubmissionCalendar: user.leetcodeSubmissionCalendar || {},
      leetcodeLastSynced: user.leetcodeLastSynced || null,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
