const mongoose = require("mongoose");

const sheetQuestionSchema = new mongoose.Schema(
  {
    sheetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Sheet",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    platform: {
      type: String,
      default: "LeetCode",
    },

    difficulty: {
      type: String,
      enum: ["Easy", "Medium", "Hard"],
    },

    topic: {
      type: String,
    },

    company: {
      type: String,
    },

    leetcodeId: {
      type: String,
    },

    slug: {
      type: String,
    },

    link: {
      type: String,
    },

    order: {
      type: Number,
      default: 0,
    },

    tags: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("SheetQuestion", sheetQuestionSchema);
