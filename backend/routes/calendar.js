const express = require("express");
const User = require("../models/User");
const { getTodayPlan } = require("../utils/todayPlan");
const {
  getAuthUrl,
  decodeState,
  getOAuthClient,
  getCalendarClient,
} = require("../utils/googleCalendar");
const { google } = require("googleapis");

const router = express.Router();

const getTimeWindow = (baseDate, timeZone) => {
  const start = new Date(baseDate);
  start.setHours(16, 0, 0, 0);
  const end = new Date(baseDate);
  end.setHours(17, 0, 0, 0);
  return {
    start,
    end,
    timeZone,
  };
};

/**
 * @route   GET /api/calendar/auth-url
 * @desc    Get Google OAuth URL
 */
router.get("/auth-url", async (req, res) => {
  try {
    const { clerkUserId } = req.query;
    if (!clerkUserId) {
      return res.status(400).json({ error: "clerkUserId is required" });
    }

    const authUrl = getAuthUrl(clerkUserId);
    res.json({ authUrl });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   GET /api/calendar/callback
 * @desc    Google OAuth callback
 */
router.get("/callback", async (req, res) => {
  try {
    const { code, state } = req.query;
    if (!code || !state) {
      return res.status(400).json({ error: "Missing code or state" });
    }

    const decoded = decodeState(state);
    if (!decoded?.clerkUserId) {
      return res.status(400).json({ error: "Invalid state" });
    }

    const oauth2Client = getOAuthClient();
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    let calendarEmail = "";
    try {
      const oauth2 = google.oauth2({ version: "v2", auth: oauth2Client });
      const userInfo = await oauth2.userinfo.get();
      calendarEmail = userInfo?.data?.email || "";
    } catch (err) {
      calendarEmail = "";
    }

    const user = await User.findOne({ clerkUserId: decoded.clerkUserId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (calendarEmail && user.email && calendarEmail.toLowerCase() !== user.email.toLowerCase()) {
      return res.status(403).json({
        error: "Google account email must match your CodeTrack account email.",
      });
    }

    user.googleCalendar = {
      connected: true,
      accessToken: tokens.access_token || user.googleCalendar?.accessToken || "",
      refreshToken: tokens.refresh_token || user.googleCalendar?.refreshToken || "",
      expiryDate: tokens.expiry_date || user.googleCalendar?.expiryDate || 0,
      email: user.email || calendarEmail || user.googleCalendar?.email || "",
      lastSyncedAt: user.googleCalendar?.lastSyncedAt || null,
    };
    user.emailNotification = true;

    await user.save();

    const redirectUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/profile?calendar=connected`;
    return res.redirect(redirectUrl);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route   POST /api/calendar/:clerkUserId/sync-today
 * @desc    Sync today's plan to Google Calendar
 */
router.post("/:clerkUserId/sync-today", async (req, res) => {
  try {
    const { clerkUserId } = req.params;
    const user = await User.findOne({ clerkUserId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!user.emailNotification) {
      return res.status(400).json({ error: "Email notifications are disabled." });
    }

    if (!user.googleCalendar?.connected || !user.googleCalendar?.refreshToken) {
      return res.status(400).json({ error: "Google Calendar is not connected." });
    }

    const tokens = {
      access_token: user.googleCalendar.accessToken,
      refresh_token: user.googleCalendar.refreshToken,
      expiry_date: user.googleCalendar.expiryDate,
    };

    const { calendar, oauth2Client } = getCalendarClient(tokens);

    // Ensure access token is fresh
    const refreshed = await oauth2Client.getAccessToken();
    if (refreshed?.token) {
      user.googleCalendar.accessToken = refreshed.token;
    }

    const plan = await getTodayPlan(user._id, new Date());
    const questions = plan.questions || [];

    if (questions.length === 0) {
      return res.json({ message: "No questions due today.", created: 0 });
    }

    const timeZone = process.env.CALENDAR_TIMEZONE || "Asia/Kolkata";
    const { start, end } = getTimeWindow(new Date(), timeZone);

    // Fetch existing events in the window to avoid duplicates
    const existingEvents = await calendar.events.list({
      calendarId: "primary",
      timeMin: start.toISOString(),
      timeMax: end.toISOString(),
      singleEvents: true,
      orderBy: "startTime",
    });

    const existingIds = new Set(
      (existingEvents.data.items || [])
        .map((item) => item.description || "")
        .filter(Boolean)
        .map((desc) => {
          const match = desc.match(/Codetrack Question ID:\s*(\S+)/i);
          return match ? match[1] : null;
        })
        .filter(Boolean)
    );

    let created = 0;
    const baseUrl = process.env.FRONTEND_URL || "http://localhost:5173";

    for (const question of questions) {
      if (existingIds.has(String(question._id))) {
        continue;
      }

      const event = {
        summary: `CodeTrack Revision: ${question.title}`,
        description: [
          `Question: ${question.title}`,
          `Next Revision: ${question.nextRevisionAt || "Today"}`,
          `Codetrack Question ID: ${question._id}`,
          "",
          `Open Today's Plan: ${baseUrl}/today`,
        ].join("\n"),
        start: {
          dateTime: start.toISOString(),
          timeZone,
        },
        end: {
          dateTime: end.toISOString(),
          timeZone,
        },
        location: baseUrl,
        source: {
          title: "CodeTrack",
          url: baseUrl,
        },
      };

      await calendar.events.insert({
        calendarId: "primary",
        requestBody: event,
      });

      created += 1;
    }

    user.googleCalendar.lastSyncedAt = new Date();
    await user.save();

    res.json({ message: "Calendar synced.", created });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
