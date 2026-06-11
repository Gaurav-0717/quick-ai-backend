import express from 'express';
import cors from 'cors';
import 'dotenv/config';

import connectCloudinary from './configs/cloudinary.js';

import { clerkMiddleware, requireAuth } from '@clerk/express';

import aiRouter from './routes/aiRoutes.js';
import userRouter from './routes/userRoutes.js';
import uploadRouter from './routes/uploadRoute.js';

// ✅ Create app FIRST (this was your main bug)
const app = express();

console.log("BOOT STARTED");

const startServer = async () => {
  try {
    console.log("BEFORE CLOUDINARY");

    await connectCloudinary();

    console.log("AFTER CLOUDINARY");

    // Middlewares
    app.use(cors());
    app.use(express.json());
    app.use(clerkMiddleware());

    // Public route (no auth)
    app.get('/', (req, res) => {
      res.send('Server is running');
    });

    // Protect APIs after this point
    app.use(requireAuth());

    // Routes
    app.use('/api/ai', aiRouter);
    app.use('/api/user', userRouter);
    app.use('/api/upload', uploadRouter);

    // Render port binding
    const PORT = process.env.PORT || 3000;

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });

  } catch (err) {
    console.error("Fatal startup error:", err);
    process.exit(1);
  }
};

startServer();