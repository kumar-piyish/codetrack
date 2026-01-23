/**
 * LeetCode Problem of the Day (POTD) Fetcher
 * 
 * Fetches today's LeetCode problem of the day
 */

const axios = require("axios");

const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql/";

/**
 * GraphQL query to fetch daily challenge
 */
const DAILY_CHALLENGE_QUERY = `
  query dailyChallenge {
    activeDailyCodingChallengeQuestion {
      date
      userStatus
      link
      question {
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
        acRate
        likes
        dislikes
      }
    }
  }
`;

/**
 * Fetch today's LeetCode POTD
 * @returns {Object} { success: Boolean, data: Object, error: String }
 */
async function fetchLeetCodePOTD() {
  try {
    const response = await axios.post(
      LEETCODE_GRAPHQL_URL,
      {
        query: DAILY_CHALLENGE_QUERY,
        variables: {},
      },
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
          "Accept": "application/json",
          "Accept-Language": "en-US,en;q=0.9",
        },
        timeout: 15000, // Increased timeout
      }
    );

    if (response.data.errors) {
      return {
        success: false,
        error: response.data.errors[0]?.message || "GraphQL error",
      };
    }

    const dailyChallenge = response.data.data?.activeDailyCodingChallengeQuestion;

    if (!dailyChallenge || !dailyChallenge.question) {
      return {
        success: false,
        error: "No daily challenge available",
      };
    }

    const question = dailyChallenge.question;

    // Extract topic tags
    const tags = question.topicTags?.map((tag) => tag.name) || [];

    // Extract company tags
    const companies = question.companyTags?.map((company) => company.name) || [];

    // Construct proper LeetCode URL
    const leetcodeUrl = dailyChallenge.link 
      ? `https://leetcode.com${dailyChallenge.link}`
      : `https://leetcode.com/problems/${question.titleSlug}/`;

    return {
      success: true,
      data: {
        date: dailyChallenge.date,
        link: leetcodeUrl,
        questionId: question.questionId || question.questionFrontendId,
        title: question.title,
        slug: question.titleSlug,
        difficulty: question.difficulty,
        tags: tags,
        companies: companies,
        acRate: question.acRate || null,
        likes: question.likes || 0,
        dislikes: question.dislikes || 0,
      },
    };
  } catch (error) {
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
      error: error.message || "Failed to fetch LeetCode POTD",
    };
  }
}

module.exports = {
  fetchLeetCodePOTD,
};
