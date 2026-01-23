const mongoose = require("mongoose");

const sheetSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      default: "",
    },

    type: {
      type: String,
      enum: ["COMPANY", "TOPIC", "ROADMAP", "CUSTOM"],
      required: true,
    },

    source: {
      type: String, // e.g., "Striver SDE Sheet", "Company-wise", "GitHub"
      default: "",
    },

    sourceUrl: {
      type: String, // GitHub URL or source link
      default: "",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    isPublic: {
      type: Boolean,
      default: true,
    },

    totalQuestions: {
      type: Number,
      default: 0,
    },

    topics: [
      {
        type: String,
      },
    ],

    companies: [
      {
        type: String,
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Sheet", sheetSchema);
