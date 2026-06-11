import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import sql from './configs/db.js';
import { clerkMiddleware, requireAuth } from '@clerk/express';
import aiRouter from './routes/aiRoutes.js';
import connectCloudinary from './configs/cloudinary.js';
import userRouter from './routes/userRoutes.js';
import uploadRouter from './routes/uploadRoute.js';

const app = express();

await connectCloudinary();

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

app.get('/', (req, res) => {
  res.send('Server is running');
});

app.use(requireAuth());


app.use('/api/ai', aiRouter);
app.use('/api/user', userRouter);
app.use('/api/upload', uploadRouter);

const PORT = process.env.PORT || 3000;

// Important: don't start a listener when deployed to serverless.
// This file is for local dev only; Vercel uses `api/index.js`.
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

