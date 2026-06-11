import express from "express";
import cors from "cors";
import "dotenv/config";

import connectCloudinary from "./configs/cloudinary.js";
import { clerkMiddleware, requireAuth } from "@clerk/express";

import aiRouter from "./routes/aiRoutes.js";
import userRouter from "./routes/userRoutes.js";
import uploadRouter from "./routes/uploadRoute.js";

const app = express();

console.log("BOOT STARTED");

// ======================
// 1. CORS (MUST BE FIRST)
// ======================
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://quick-ai-frontend-eight.vercel.app"
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.options("*", cors()); // IMPORTANT for preflight

// ======================
// 2. BASIC MIDDLEWARE
// ======================
app.use(express.json());
app.use(clerkMiddleware());

// ======================
// 3. PUBLIC ROUTE
// ======================
app.get("/", (req, res) => {
  res.send("Server is running");
});

// ======================
// 4. START SERVER LOGIC
// ======================
const startServer = async () => {
  try {
    console.log("BEFORE CLOUDINARY");
    await connectCloudinary();
    console.log("AFTER CLOUDINARY");

    // ======================
    // 5. PROTECTED ROUTES
    // ======================
    app.use("/api", requireAuth()); // IMPORTANT: apply once for all APIs

    app.use("/api/ai", aiRouter);
    app.use("/api/user", userRouter);
    app.use("/api/upload", uploadRouter);

    // ======================
    // 6. START LISTENING
    // ======================
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Fatal startup error:", err);
    process.exit(1);
  }
};

startServer();