require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");

const dreamRoutes = require("./routes/dream");
const sopRoutes = require("./routes/sop");
const loanRoutes = require("./routes/loan");
const journeyRoutes = require("./routes/journey");
const authRoutes = require("./routes/auth");
const featuresRoutes = require("./routes/features");
const errorHandler = require("./middleware/errorHandler");

const app = express();

app.use(helmet());
const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(",").map(url => url.trim())
  : ["http://localhost:5173", "http://localhost:5174"];
app.use(cors({ origin: allowedOrigins }));
app.use(express.json({ limit: "10mb" }));

app.use("/api", rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

app.use("/api/auth", authRoutes);
// Google OAuth callback alias - Google Console has this URI registered
app.use("/auth", authRoutes);
app.use("/api/dream", dreamRoutes);
app.use("/api/sop", sopRoutes);
app.use("/api/loan", loanRoutes);
app.use("/api/journey", journeyRoutes);
app.use("/api/features", featuresRoutes);

app.get("/health", (req, res) => res.json({ status: "ok", service: "StudyPath AI API" }));

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`StudyPath AI backend running on port ${PORT}`));
