# QuickAI - AI Tools Platform

Full-stack AI app for content generation, image editing, resume review.

## Backend Setup
```bash
cd server
npm install
# Copy .env.example to .env and fill vars
npm run start
```

## Frontend Setup
```bash
cd client
npm install
npm run dev
```

## Deploy
- Backend: Railway/Render (with Neon DB)
- Frontend: Vercel/Netlify (build with vite build)

## Required Env Vars
See .env.example

## DB Schema
CREATE TABLE creations (
  id SERIAL PRIMARY KEY,
  user_id TEXT,
  prompt TEXT,
  content TEXT,
  type TEXT,
  publish BOOLEAN DEFAULT false,
  likes TEXT[] DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);
