const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
require("dotenv").config();

const authRoutes = require("./routes/auth");
const recordsRoutes = require("./routes/record");
const paymentRoutes = require("./routes/payment");

const app = express();

// Security
app.use(helmet());

// CORS (restrict to your frontend during dev)
app.use(
  cors({
    origin: process.env.FRONTEND_URL?.split(",") || "*",
    credentials: false
  })
);

// Body parsing
app.use(express.json({ limit: "1mb" }));

// Basic rate limiting (tune as needed)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 200, // requests per IP per window
    standardHeaders: true,
    legacyHeaders: false
  })
);

// Health
app.get("/api/health", (_req, res) => res.json({ ok: true, ts: Date.now() }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/records", recordsRoutes);
app.use("/api/payment", paymentRoutes);

// Start
const PORT = Number(process.env.PORT || 5000);
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
