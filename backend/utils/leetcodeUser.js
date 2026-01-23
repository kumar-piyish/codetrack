/**
 * LeetCode User Data Fetcher
 * 
 * Fetches user's LeetCode profile, solved problems, and submission calendar
 */

const axios = require("axios");

const LEETCODE_GRAPHQL_URL = "https://leetcode.com/graphql/";

/**
 * GraphQL query to fetch user profile
 * Using a more compatible query format
 */
const USER_PROFILE_QUERY = `query userPublicProfile($username: String!) {
  matchedUser(username: $username) {
    username
    profile {
      realName
      userAvatar
      ranking
      reputation
      solutionCount
    }
    submitStats {
      acSubmissionNum {
        difficulty
        count
        submissions
      }
      totalSubmissionNum {
        difficulty
        count
        submissions
      }
    }
  }
}`;

/**
 * GraphQL query to fetch user's solved problems
 */
const USER_SOLVED_PROBLEMS_QUERY = `
  query userProblemsSolved($username: String!) {
    allQuestionsCount {
      difficulty
      count
    }
    matchedUser(username: $username) {
      submitStats {
        acSubmissionNum {
          difficulty
          count
          submissions
        }
      }
    }
  }
`;

/**
 * GraphQL query to fetch submission calendar
 */
const SUBMISSION_CALENDAR_QUERY = `query userProfileCalendar($username: String!, $year: Int) {
  matchedUser(username: $username) {
    userCalendar(year: $year) {
      activeYears
      streak
      totalActiveDays
      dccBadges {
        timestamp
        badge {
          name
          icon
        }
      }
      submissionCalendar
    }
  }
}`;

/**
 * Fetch LeetCode user profile and stats
 */
async function fetchLeetCodeUserProfile(username) {
  try {
    // Trim and validate username
    username = username.trim();
    if (!username) {
      return {
        success: false,
        error: "LeetCode username cannot be empty",
      };
    }

    // Try without operationName first - sometimes it causes 400 errors
    const requestPayload = {
      query: USER_PROFILE_QUERY,
      variables: { username },
    };

    console.log("Fetching LeetCode profile for:", username);
    
    const response = await axios.post(
      LEETCODE_GRAPHQL_URL,
      requestPayload,
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        timeout: 20000,
        validateStatus: function (status) {
          return status < 500; // Don't throw for 4xx errors, we'll handle them
        },
      }
    );

    // Check for HTTP errors first
    if (response.status === 400 || response.status >= 400) {
      const errorData = response.data;
      console.error("LeetCode API HTTP Error:", {
        status: response.status,
        data: errorData,
      });
      
      let errorMessage = "Invalid request to LeetCode API";
      if (errorData?.errors && errorData.errors.length > 0) {
        errorMessage = errorData.errors[0].message || errorMessage;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }

    if (response.data.errors) {
      console.error("LeetCode API errors:", response.data.errors);
      return {
        success: false,
        error: response.data.errors[0]?.message || "User not found",
      };
    }

    const matchedUser = response.data.data?.matchedUser;
    if (!matchedUser) {
      return {
        success: false,
        error: "User not found on LeetCode. Please check the username.",
      };
    }

    const submitStats = matchedUser.submitStats?.acSubmissionNum || [];
    const easyStat = submitStats.find((s) => s.difficulty === "Easy") || { count: 0 };
    const mediumStat = submitStats.find((s) => s.difficulty === "Medium") || { count: 0 };
    const hardStat = submitStats.find((s) => s.difficulty === "Hard") || { count: 0 };
    const totalSolved = easyStat.count + mediumStat.count + hardStat.count;

    return {
      success: true,
      data: {
        username: matchedUser.username,
        ranking: matchedUser.profile?.ranking || 0,
        reputation: matchedUser.profile?.reputation || 0,
        contributionPoints: matchedUser.profile?.solutionCount || 0, // Using solutionCount instead of contributionPoints
        totalSolved: totalSolved,
        easySolved: easyStat.count || 0,
        mediumSolved: mediumStat.count || 0,
        hardSolved: hardStat.count || 0,
        acceptanceRate: 0, // Calculate from total submissions if needed
      },
    };
  } catch (error) {
    // Handle axios errors
    if (error.response) {
      const status = error.response.status;
      const errorData = error.response.data;
      let errorMessage = `LeetCode API error: ${status}`;
      
      console.error("LeetCode API Error Response:", {
        status,
        statusText: error.response.statusText,
        data: errorData,
        headers: error.response.headers,
      });
      
      // Try to get more specific error message
      if (errorData?.errors && errorData.errors.length > 0) {
        errorMessage = errorData.errors[0].message || errorMessage;
      } else if (errorData?.message) {
        errorMessage = errorData.message;
      } else if (typeof errorData === 'string') {
        errorMessage = errorData;
      }
      
      return {
        success: false,
        error: errorMessage,
      };
    }
    
    // Check if response has status 400
    if (error.response && error.response.status === 400) {
      const errorData = error.response.data;
      console.error("400 Bad Request Details:", errorData);
      return {
        success: false,
        error: errorData?.errors?.[0]?.message || errorData?.message || "Invalid request to LeetCode API. Please check the username.",
      };
    }
    
    console.error("LeetCode API Network Error:", error.message);
    return {
      success: false,
      error: error.message || "Failed to fetch LeetCode profile",
    };
  }
}

/**
 * Fetch submission calendar (streak map)
 */
async function fetchLeetCodeSubmissionCalendar(username, year = new Date().getFullYear()) {
  try {
    // Trim username
    username = username.trim();
    if (!username) {
      return {
        success: false,
        error: "LeetCode username cannot be empty",
      };
    }

    const response = await axios.post(
      LEETCODE_GRAPHQL_URL,
      {
        query: SUBMISSION_CALENDAR_QUERY,
        variables: { username, year },
      },
      {
        headers: {
          "Content-Type": "application/json",
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        },
        timeout: 20000,
        validateStatus: function (status) {
          return status < 500;
        },
      }
    );

    if (response.data.errors) {
      console.error("LeetCode Calendar API errors:", response.data.errors);
      return {
        success: false,
        error: response.data.errors[0]?.message || "Failed to fetch calendar",
      };
    }

    const matchedUser = response.data.data?.matchedUser;
    if (!matchedUser || !matchedUser.userCalendar) {
      return {
        success: false,
        error: "Calendar data not available",
      };
    }

    const calendar = matchedUser.userCalendar;
    
    // Parse submission calendar (it's a JSON string)
    let submissionCalendar = {};
    try {
      if (calendar.submissionCalendar) {
        submissionCalendar = JSON.parse(calendar.submissionCalendar);
      }
    } catch (e) {
      // If parsing fails, use empty object
    }

    return {
      success: true,
      data: {
        streak: calendar.streak || 0,
        totalActiveDays: calendar.totalActiveDays || 0,
        activeYears: calendar.activeYears || [],
        submissionCalendar: submissionCalendar, // Map of timestamp -> count
      },
    };
  } catch (error) {
    return {
      success: false,
      error: error.message || "Failed to fetch submission calendar",
    };
  }
}

/**
 * Fetch user's solved problems list (limited - LeetCode API doesn't provide full list easily)
 * Note: This is a simplified version. Full list requires authenticated requests or scraping
 */
async function fetchLeetCodeSolvedProblems(username) {
  // LeetCode's public API doesn't easily provide full solved problems list
  // This would require authenticated requests or web scraping
  // For now, we'll return the stats and let users manually sync questions
  
  const profileResult = await fetchLeetCodeUserProfile(username);
  if (!profileResult.success) {
    return profileResult;
  }

  return {
    success: true,
    data: {
      stats: profileResult.data,
      solvedQuestions: [], // Would need authenticated API or scraping for full list
      message: "Solved questions list requires additional setup. Stats are available.",
    },
  };
}

module.exports = {
  fetchLeetCodeUserProfile,
  fetchLeetCodeSubmissionCalendar,
  fetchLeetCodeSolvedProblems,
};
