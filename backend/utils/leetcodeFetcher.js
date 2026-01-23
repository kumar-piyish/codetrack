/**
 * LeetCode Metadata Fetcher
 * 
 * Fetches question metadata from LeetCode GraphQL API
 * Supports: LeetCode URL, slug, or title
 * Returns: difficulty, tags, companies, leetcodeId, slug
 */

const axios = require("axios");

const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql/";

/**
 * Extract slug from LeetCode URL
 * Examples:
 * - https://leetcode.com/problems/two-sum/ -> two-sum
 * - https://leetcode.com/problems/two-sum -> two-sum
 * - leetcode.com/problems/two-sum/ -> two-sum
 */
function extractSlugFromUrl(url) {
  if (!url) return null;

  // Remove protocol and domain
  let slug = url.replace(/^https?:\/\//, "").replace(/^www\./, "");
  
  // Extract slug from various URL formats
  const patterns = [
    /leetcode\.com\/problems\/([^\/\?]+)/,
    /problems\/([^\/\?]+)/,
  ];

  for (const pattern of patterns) {
    const match = slug.match(pattern);
    if (match) {
      return match[1].toLowerCase();
    }
  }

  // If it's already a slug (no slashes, just alphanumeric and hyphens)
  if (/^[a-z0-9-]+$/.test(url.toLowerCase())) {
    return url.toLowerCase();
  }

  return null;
}

/**
 * Convert title to slug format
 * Example: "Two Sum" -> "two-sum"
 */
function titleToSlug(title) {
  if (!title) return null;
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * GraphQL query to fetch question details
 */
const QUESTION_QUERY = `
  query questionData($titleSlug: String!) {
    question(titleSlug: $titleSlug) {
      questionId
      questionFrontendId
      title
      titleSlug
      difficulty
      topicTags {
        name
        slug
      }
      companyTags {
        name
        slug
      }
      isPaidOnly
      acRate
      likes
      dislikes
    }
  }
`;

/**
 * Fetch question metadata from LeetCode
 * @param {String} input - LeetCode URL, slug, or title
 * @returns {Object} { success: Boolean, data: Object, error: String }
 */
async function fetchLeetCodeMetadata(input) {
  if (!input || typeof input !== "string") {
    return {
      success: false,
      error: "Invalid input: must be a non-empty string",
    };
  }

  let titleSlug = null;

  // Try to extract slug from URL
  titleSlug = extractSlugFromUrl(input);

  // If not a URL, try as slug directly
  if (!titleSlug && /^[a-z0-9-]+$/.test(input.toLowerCase())) {
    titleSlug = input.toLowerCase();
  }

  // If still no slug, try converting title to slug
  if (!titleSlug) {
    titleSlug = titleToSlug(input);
  }

  if (!titleSlug) {
    return {
      success: false,
      error: "Could not extract valid slug from input",
    };
  }

  try {
    const response = await axios.post(
      LEETCODE_GRAPHQL_URL,
      {
        query: QUESTION_QUERY,
        variables: { titleSlug },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        timeout: 10000, // 10 second timeout
      }
    );

    if (response.data.errors) {
      return {
        success: false,
        error: response.data.errors[0]?.message || "GraphQL error",
      };
    }

    const question = response.data.data?.question;

    if (!question) {
      return {
        success: false,
        error: "Question not found on LeetCode",
      };
    }

    // Extract topic tags
    const tags = question.topicTags?.map((tag) => tag.name) || [];

    // Extract company tags
    const companies = question.companyTags?.map((company) => company.name) || [];

    return {
      success: true,
      data: {
        title: question.title,
        slug: question.titleSlug,
        leetcodeId: question.questionId || question.questionFrontendId,
        difficulty: question.difficulty,
        tags: tags,
        companies: companies,
        isPaidOnly: question.isPaidOnly || false,
        acRate: question.acRate || null,
        likes: question.likes || 0,
        dislikes: question.dislikes || 0,
      },
    };
  } catch (error) {
    // Handle network errors, timeouts, etc.
    if (error.code === "ECONNABORTED") {
      return {
        success: false,
        error: "Request timeout - LeetCode API took too long to respond",
      };
    }

    if (error.response) {
      return {
        success: false,
        error: `LeetCode API error: ${error.response.status} ${error.response.statusText}`,
      };
    }

    return {
      success: false,
      error: error.message || "Failed to fetch from LeetCode API",
    };
  }
}

/**
 * Validate if a string looks like a LeetCode URL or slug
 */
function isLeetCodeInput(input) {
  if (!input) return false;
  const lower = input.toLowerCase();
  return (
    lower.includes("leetcode.com") ||
    lower.includes("leetcode") ||
    /^[a-z0-9-]+$/.test(lower) // slug format
  );
}

module.exports = {
  fetchLeetCodeMetadata,
  extractSlugFromUrl,
  titleToSlug,
  isLeetCodeInput,
};
