const { google } = require("googleapis");

const SCOPES = ["https://www.googleapis.com/auth/calendar.events"];

const getOAuthClient = () => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const redirectUri = process.env.GOOGLE_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error("Missing Google Calendar OAuth environment variables.");
  }

  return new google.auth.OAuth2(clientId, clientSecret, redirectUri);
};

const encodeState = (payload) =>
  Buffer.from(JSON.stringify(payload)).toString("base64url");

const decodeState = (state) => {
  try {
    const json = Buffer.from(state, "base64url").toString("utf-8");
    return JSON.parse(json);
  } catch (err) {
    return null;
  }
};

const getAuthUrl = (clerkUserId) => {
  const oauth2Client = getOAuthClient();
  const state = encodeState({ clerkUserId });

  return oauth2Client.generateAuthUrl({
    access_type: "offline",
    prompt: "consent",
    scope: SCOPES,
    state,
  });
};

const getCalendarClient = (tokens) => {
  const oauth2Client = getOAuthClient();
  oauth2Client.setCredentials(tokens);
  return {
    oauth2Client,
    calendar: google.calendar({ version: "v3", auth: oauth2Client }),
  };
};

module.exports = {
  getAuthUrl,
  decodeState,
  getOAuthClient,
  getCalendarClient,
};
