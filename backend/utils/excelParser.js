/**
 * Excel Parser Utility
 * 
 * Parses Excel files and converts them to Sheet and SheetQuestion format
 */

const XLSX = require("xlsx");

/**
 * Parse Excel file and extract questions
 * @param {Buffer} fileBuffer - Excel file buffer
 * @param {String} sheetName - Name of the sheet to create
 * @param {String} type - Type of sheet (COMPANY, TOPIC, ROADMAP, CUSTOM)
 * @returns {Object} { sheet: Object, questions: Array }
 */
function parseExcelToSheet(fileBuffer, sheetName, type = "CUSTOM") {
  try {
    // Parse Excel file
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    
    const sheets = [];
    const allQuestions = [];

    // Process each worksheet
    workbook.SheetNames.forEach((worksheetName, index) => {
      const worksheet = workbook.Sheets[worksheetName];
      const data = XLSX.utils.sheet_to_json(worksheet, { defval: null });

      // Determine if this is a company sheet or topic sheet based on name/content
      let sheetType = type;
      let currentSheetName = sheetName || worksheetName;

      // Try to detect type from sheet name
      const nameLower = worksheetName.toLowerCase();
      if (nameLower.includes("company") || nameLower.includes("amazon") || nameLower.includes("google")) {
        sheetType = "COMPANY";
      } else if (nameLower.includes("topic") || nameLower.includes("array") || nameLower.includes("dp")) {
        sheetType = "TOPIC";
      }

      // Extract questions from this sheet
      const questions = data.map((row, rowIndex) => {
        // Common column names to look for
        const title = row["Title"] || row["Question"] || row["Problem"] || row["Name"] || row[0];
        const difficulty = row["Difficulty"] || row["Level"] || row["Diff"];
        const platform = row["Platform"] || row["Source"] || "LeetCode";
        const link = row["Link"] || row["URL"] || row["Problem Link"];
        const topic = row["Topic"] || row["Category"] || row["Tag"];
        const company = row["Company"] || row["Company Tag"];
        const order = row["Order"] || row["#"] || rowIndex + 1;

        // Extract slug from link if it's a LeetCode link
        let slug = null;
        let leetcodeId = null;
        if (link && link.includes("leetcode.com")) {
          const slugMatch = link.match(/leetcode\.com\/problems\/([^\/\?]+)/);
          if (slugMatch) {
            slug = slugMatch[1];
          }
        }

        // Normalize difficulty
        let normalizedDifficulty = null;
        if (difficulty) {
          const diffLower = difficulty.toString().toLowerCase();
          if (diffLower.includes("easy")) {
            normalizedDifficulty = "Easy";
          } else if (diffLower.includes("medium")) {
            normalizedDifficulty = "Medium";
          } else if (diffLower.includes("hard")) {
            normalizedDifficulty = "Hard";
          }
        }

        return {
          title: title?.toString().trim() || `Question ${rowIndex + 1}`,
          platform: platform?.toString().trim() || "LeetCode",
          difficulty: normalizedDifficulty,
          topic: topic?.toString().trim() || null,
          company: company?.toString().trim() || null,
          link: link?.toString().trim() || null,
          slug: slug,
          leetcodeId: leetcodeId,
          order: typeof order === "number" ? order : parseInt(order) || rowIndex + 1,
          tags: topic ? [topic] : [],
        };
      }).filter(q => q.title && q.title !== "Question 0"); // Filter out empty rows

      // Collect unique topics and companies
      const topics = [...new Set(questions.map(q => q.topic).filter(Boolean))];
      const companies = [...new Set(questions.map(q => q.company).filter(Boolean))];

      sheets.push({
        name: currentSheetName || worksheetName,
        type: sheetType,
        totalQuestions: questions.length,
        topics: topics,
        companies: companies,
      });

      allQuestions.push({
        sheetName: currentSheetName || worksheetName,
        questions: questions,
      });
    });

    return {
      sheets: sheets,
      questions: allQuestions,
    };
  } catch (error) {
    throw new Error(`Failed to parse Excel file: ${error.message}`);
  }
}

/**
 * Parse CSV file (alternative format)
 */
function parseCSVToSheet(fileBuffer, sheetName, type = "CUSTOM") {
  try {
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(worksheet, { defval: null });

    const questions = data.map((row, rowIndex) => {
      const title = row["Title"] || row["Question"] || row[0];
      const difficulty = row["Difficulty"] || row["Level"];
      const link = row["Link"] || row["URL"];

      return {
        title: title?.toString().trim() || `Question ${rowIndex + 1}`,
        platform: "LeetCode",
        difficulty: difficulty || null,
        link: link || null,
        order: rowIndex + 1,
      };
    }).filter(q => q.title);

    return {
      sheets: [{ name: sheetName, type: type, totalQuestions: questions.length }],
      questions: [{ sheetName: sheetName, questions: questions }],
    };
  } catch (error) {
    throw new Error(`Failed to parse CSV file: ${error.message}`);
  }
}

module.exports = {
  parseExcelToSheet,
  parseCSVToSheet,
};
