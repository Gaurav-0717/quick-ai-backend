import express from "express";
import cors from "cors";
import "dotenv/config";

import connectCloudinary from "./configs/cloudinary.js";
import aiRouter from "./routes/aiRoutes.js";
import userRouter from "./routes/userRoutes.js";
import uploadRouter from "./routes/uploadRoute.js";

import { clerkMiddleware, requireAuth } from "@clerk/express";

const app = express();

/* ---------------- INIT (SAFE) ---------------- */
let isConnected = false;

const init = async () => {
  if (!isConnected) {
    await connectCloudinary();
    isConnected = true;
  }
};

await init();

/* ---------------- MIDDLEWARE ---------------- */
app.use(
  cors({
    origin: "https://quick-ai-frontend-delta.vercel.app",
    credentials: true,
  })
);

app.use(express.json());
app.use(clerkMiddleware());

/* ---------------- TEST ROUTE ---------------- */
app.get("/", (req, res) => {
  res.send("Server is running");
});

/* ---------------- PROTECTED ROUTES ---------------- */
app.use(requireAuth());

app.use("/api/ai", aiRouter);
app.use("/api/user", userRouter);
app.use("/api/upload", uploadRouter);

/* ---------------- VERCEL HANDLER ---------------- */
export default function handler(req, res) {
  return app(req, res);
}