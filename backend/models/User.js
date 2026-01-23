const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    clerkUserId: { // Add this
      type: String,
      required: true,
      unique: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
    },

    image: {
      type: String,
      default: "",
    },

    degree: {
      type: String,
      default: "",
    },

    yearOfGraduation: {
      type: Number,
    },

    collegeName: {
      type: String,
      default: "",
    },

    fieldOfStudy: {
      type: String,
      default: "",
    },

    country: {
      type: String,
      default: "",
    },

    socialLinks: {
      linkedin: { type: String, default: "" },
      github: { type: String, default: "" },
      twitter: { type: String, default: "" },
      insta: { type: String, default: "" },
    },

    leetcodeUsername: {
      type: String,
      default: "",
    },

    leetcodeStats: {
      totalSolved: { type: Number, default: 0 },
      easySolved: { type: Number, default: 0 },
      mediumSolved: { type: Number, default: 0 },
      hardSolved: { type: Number, default: 0 },
      acceptanceRate: { type: Number, default: 0 },
      ranking: { type: Number, default: 0 },
      contributionPoints: { type: Number, default: 0 },
      reputation: { type: Number, default: 0 },
    },

    leetcodeSolvedQuestions: [
      {
        questionId: { type: String },
        title: { type: String },
        slug: { type: String },
        difficulty: { type: String },
        solvedAt: { type: Date },
      },
    ],

    leetcodeSubmissionCalendar: {
      type: mongoose.Schema.Types.Mixed, // Object: timestamp -> count
      default: {},
    },

    leetcodeLastSynced: {
      type: Date,
    },

    profileCompleted: {
      type: Boolean,
      default: false,
    },

    currentLevel: {
      type: String,
      default: "intermediate",
    },

    primaryGoal: {
      type: [String],
      default: [],
    },

    preferredCodingLanguage: {
      type: [String],
      default: [],
    },

    targetPlatform: {
      type: [String],
      default: [],
    },

    dailyPractice: {
      type: String,
      default: "",
    },

    emailNotification: {
      type: Boolean,
      default: false,
    },

    salutation: {
      type: String,
      default: "",
    },

    totalQuestions: {
      type: Number,
      default: 0,
    },

    questions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],

    todayQuestions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Question",
      },
    ],

    streak: {
      type: Number,
      default: 0,
    },

    lastActiveDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
