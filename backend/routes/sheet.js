const express = require("express");
const multer = require("multer");
const Sheet = require("../models/Sheet");
const SheetQuestion = require("../models/SheetQuestion");
const UserSheetProgress = require("../models/UserSheetProgress");
const { parseExcelToSheet } = require("../utils/excelParser");

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", // .xlsx
      "application/vnd.ms-excel", // .xls
      "text/csv", // .csv
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only Excel (.xlsx, .xls) and CSV files are allowed."));
    }
  },
});

/**
 * @route   POST /api/sheet/import
 * @desc    Import sheet from Excel file
 */
router.post("/import", upload.single("file"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const { name, description, type, source, sourceUrl } = req.body;
    const userId = req.body.userId; // Optional: who created it

    if (!name) {
      return res.status(400).json({ error: "Sheet name is required" });
    }

    // Parse Excel file
    const parsed = parseExcelToSheet(
      req.file.buffer,
      name,
      type || "CUSTOM"
    );

    if (parsed.sheets.length === 0) {
      return res.status(400).json({ error: "No valid sheets found in file" });
    }

    const createdSheets = [];
    const createdQuestions = [];

    // Create sheets and questions
    for (let i = 0; i < parsed.sheets.length; i++) {
      const sheetData = parsed.sheets[i];
      const questionsData = parsed.questions[i];

      // Create sheet
      const sheet = await Sheet.create({
        name: i === 0 ? name : `${name} - ${sheetData.name}`,
        description: description || "",
        type: sheetData.type,
        source: source || "",
        sourceUrl: sourceUrl || "",
        createdBy: userId || null,
        isPublic: true,
        totalQuestions: sheetData.totalQuestions,
        topics: sheetData.topics,
        companies: sheetData.companies,
      });

      // Create sheet questions
      const questions = questionsData.questions.map((q) => ({
        ...q,
        sheetId: sheet._id,
      }));

      const insertedQuestions = await SheetQuestion.insertMany(questions);

      // Update sheet with actual count
      await Sheet.findByIdAndUpdate(sheet._id, {
        totalQuestions: insertedQuestions.length,
      });

      createdSheets.push(sheet);
      createdQuestions.push(...insertedQuestions);
    }

    res.status(201).json({
      message: `Successfully imported ${createdSheets.length} sheet(s) with ${createdQuestions.length} questions`,
      sheets: createdSheets,
      questionsCount: createdQuestions.length,
    });
  } catch (err) {
    console.error("Sheet import error:", err);
    res.status(500).json({ error: err.message || "Failed to import sheet" });
  }
});

/**
 * @route   GET /api/sheet
 * @desc    Get all sheets (public or user's)
 */
router.get("/", async (req, res) => {
  try {
    const { type, company, topic, userId } = req.query;

    let query = { isPublic: true };
    if (userId) {
      query.$or = [
        { isPublic: true },
        { createdBy: userId },
      ];
    }

    if (type) {
      query.type = type;
    }

    if (company) {
      query.companies = { $in: [company] };
    }

    if (topic) {
      query.topics = { $in: [topic] };
    }

    const sheets = await Sheet.find(query).sort({ createdAt: -1 });

    res.json(sheets);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   GET /api/sheet/:sheetId
 * @desc    Get sheet details with questions
 */
router.get("/:sheetId", async (req, res) => {
  try {
    const { sheetId } = req.params;
    const { userId } = req.query;

    const sheet = await Sheet.findById(sheetId);
    if (!sheet) {
      return res.status(404).json({ error: "Sheet not found" });
    }

    // Get questions
    const questions = await SheetQuestion.find({ sheetId: sheetId }).sort({ order: 1 });

    // Get user progress if userId provided
    let userProgress = null;
    if (userId) {
      userProgress = await UserSheetProgress.findOne({
        userId: userId,
        sheetId: sheetId,
      });
    }

    res.json({
      sheet,
      questions,
      userProgress,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   POST /api/sheet/:sheetId/start
 * @desc    User starts a sheet (creates progress tracking)
 */
router.post("/:sheetId/start", async (req, res) => {
  try {
    const { sheetId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const sheet = await Sheet.findById(sheetId);
    if (!sheet) {
      return res.status(404).json({ error: "Sheet not found" });
    }

    // Check if progress already exists
    let progress = await UserSheetProgress.findOne({
      userId: userId,
      sheetId: sheetId,
    });

    if (!progress) {
      // Create new progress
      progress = await UserSheetProgress.create({
        userId: userId,
        sheetId: sheetId,
        totalQuestions: sheet.totalQuestions,
      });
    }

    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   POST /api/sheet/:sheetId/add-to-tracker
 * @desc    Add sheet questions to user's question tracker
 */
router.post("/:sheetId/add-to-tracker", async (req, res) => {
  try {
    const { sheetId } = req.params;
    const { userId, questionIds } = req.body; // questionIds: array of SheetQuestion IDs

    if (!userId) {
      return res.status(400).json({ error: "userId is required" });
    }

    const sheet = await Sheet.findById(sheetId);
    if (!sheet) {
      return res.status(404).json({ error: "Sheet not found" });
    }

    // Get sheet questions
    const query = { sheetId: sheetId };
    if (questionIds && questionIds.length > 0) {
      query._id = { $in: questionIds };
    }

    const sheetQuestions = await SheetQuestion.find(query);

    // Return questions data for frontend to add via add-smart endpoint
    res.json({
      message: `Found ${sheetQuestions.length} questions to add`,
      questions: sheetQuestions,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
