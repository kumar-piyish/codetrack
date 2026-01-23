const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");


dotenv.config();
connectDB();

const app = express();
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.use("/api/user", require("./routes/user"));
app.use("/api/question", require("./routes/question"));
app.use("/api/today", require("./routes/today"));
app.use("/api/sheet", require("./routes/sheet"));
app.use("/api/seed", require("./routes/seed"));
app.use("/api/contact", require("./routes/contact"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
