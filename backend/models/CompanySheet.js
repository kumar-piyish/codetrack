const mongoose = require("mongoose");

const companySheetSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
    },
    questions: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true, collection: "companySheets" }
);

module.exports = mongoose.model("CompanySheet", companySheetSchema);
