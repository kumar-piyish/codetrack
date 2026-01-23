const mongoose = require("mongoose");

const userSheetProgressSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    sheetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sheet",
      required: true,
    },

    totalQuestions: {
      type: Number,
      default: 0,
    },

    attempted: {
      type: Number,
      default: 0,
    },

    solved: {
      type: Number,
      default: 0,
    },

    highConfidence: {
      type: Number,
      default: 0,
    },

    mediumConfidence: {
      type: Number,
      default: 0,
    },

    lowConfidence: {
      type: Number,
      default: 0,
    },

    questionStatus: [
      {
        sheetQuestionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "SheetQuestion",
        },
        status: {
          type: String,
          enum: ["NOT_STARTED", "ATTEMPTED", "SOLVED"],
          default: "NOT_STARTED",
        },
        confidenceLevel: {
          type: String,
          enum: ["HIGH", "MEDIUM", "LOW"],
        },
        userQuestionId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Question",
        },
        lastAttemptedAt: {
          type: Date,
        },
      },
    ],

    startedAt: {
      type: Date,
      default: Date.now,
    },

    lastUpdatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Compound index for efficient queries
userSheetProgressSchema.index({ userId: 1, sheetId: 1 }, { unique: true });

module.exports = mongoose.model("UserSheetProgress", userSheetProgressSchema);
