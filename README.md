<div style="display: flex; align-items: center; gap: 12px;">
  <img src="frontend/public/logo.png" alt="Codyssey Logo" width="45" />
  <h1 style="margin: 0;">Codyssey</h1>
</div>

<p>
  Track. Analyze. Master Code.
</p>

Codyssey is a developer-first platform that helps you systematically track coding problems, measure real understanding, and optimize revision using data-driven insights.

Stop losing solved problems in scattered bookmarks.  
Start coding smarter.

---

<img width="1366" height="640" alt="image" src="https://github.com/user-attachments/assets/127fe77c-a40c-4ea7-a5da-487dc94107ec" />
<img width="1361" height="643" alt="image" src="https://github.com/user-attachments/assets/6540f376-afa0-4775-9b03-eb261d28dda4" />
<img width="1363" height="638" alt="image" src="https://github.com/user-attachments/assets/e884059f-ea12-4f80-822b-135a0368f33c" />
<img width="1366" height="640" alt="image" src="https://github.com/user-attachments/assets/7f6e059d-eee1-4146-b0f7-afa1166dacb7" />

---
## ✨ Features

### 📌 Universal Problem Tracker
Track coding problems from multiple platforms in one unified dashboard:
- LeetCode
- Codeforces
- CodeChef
- GeeksforGeeks
- Any custom platform

### 🏷️ Solution Method Tagging
Tag how you solved each problem to maintain honest learning insights:
- Self-solved
- With hints
- AI-assisted
- Editorial reference

### 📊 Confidence Scoring
Automatic confidence calculation based on:
- Solving method
- Revision frequency
- Time gaps between revisits

Helps identify weak areas and overconfidence.

### 🔁 Smart Revision Alerts
Get intelligent reminders to revisit problems using spaced repetition logic.
- Confidence-based scheduling
- Custom revision cycles
- Email notifications (planned)

### 📈 Progress Analytics
Visualize your coding journey with detailed metrics:
- Topic-wise breakdown
- Time analysis
- Growth tracking

### 🎯 Interview Preparation
Specialized tools to prepare for technical interviews:
- Company-wise tracking
- Pattern recognition
- Mock interview statistics

---

## 🔄 Workflow

**Simple workflow, powerful results**

1. **Solve**  
   Solve problems on any coding platform.

2. **Track & Analyze**  
   Add problems to Codyssey, tag solving method, get instant confidence insights.

3. **Revise Smartly**  
   Receive intelligent reminders to optimize long-term retention.

---

## 🛠️ Tech Stack

### Frontend
- **Vite**
- **React**
- **Tailwind CSS**

### Backend
- **Node.js**
- **Express.js**
- **MongoDB**

### Authentication
- **Google OAuth 2.0 (OAuth2Client)**

---

## 🔐 Authentication & Security
- Secure Google OAuth-based authentication
- User data isolated per account
- Tokens handled securely
- No unnecessary data collection

---

## 📦 Installation & Setup

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local or cloud)
- Google OAuth credentials

### Clone the repository
```bash
git clone https://github.com/your-username/codyssey.git
cd codyssey
```

### Backend setup
```bash
cd backend
npm install
npm run dev
```

### Frontend setup
```bash
cd frontend
npm install
npm run dev
```

### Setup .env-frontend
```bash
VITE_CLERK_PUBLISHABLE_KEY=
VITE_BACKEND_URL=
```

### Setup .env-backend
```bash
GOOGLE_REDIRECT_URI=
FRONTEND_URL=
MONGO_URI=
SMTP_HOST=
SMTP_PORT=
SMTP_SECURE=
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
CONTACT_RECEIVER=
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
CALENDAR_TIMEZONE=
```
