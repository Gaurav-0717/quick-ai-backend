# QuickAI Backend

Backend API for QuickAI built using Express.js. It provides authentication, AI-powered content generation, file uploads, and integrations with external services.

## Live API

🌐 Production API:

https://quick-ai-backend-i0o5.onrender.com

## Features

- AI content generation using Google Gemini
- User authentication with Clerk
- Cloudinary image uploads
- REST API architecture
- Environment-based configuration
- Secure API handling

## Tech Stack

### Backend

- Node.js
- Express.js
- PostgreSQL / SQL
- Clerk Authentication
- Cloudinary
- Google Gemini AI

### Deployment

- Render

## Project Structure

```text
server/
├── configs/
│   ├── cloudinary.js
│   └── db.js
│
├── controllers/
│
├── middleware/
│
├── routes/
│   ├── aiRoutes.js
│   ├── userRoutes.js
│   └── uploadRoute.js
│
├── server.js
└── package.json
```

## Environment Variables

Create a `.env` file:

```env
PORT=3000

DATABASE_URL=your_database_url

CLERK_SECRET_KEY=your_clerk_secret_key
CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

GEMINI_API_KEY=your_gemini_api_key
```

## Installation

Clone the repository:

```bash
git clone <your-backend-repository-url>
```

Navigate into the project:

```bash
cd quick-ai-backend
```

Install dependencies:

```bash
npm install
```

Run development server:

```bash
npm run dev
```

Run production server:

```bash
npm start
```

## API Endpoints

### Health Check

```http
GET /
```

Response:

```json
{
  "message": "Server is running"
}
```

### AI Routes

```http
POST /api/ai
```

Used for AI content generation.

### User Routes

```http
GET /api/user
```

User-related operations.

### Upload Routes

```http
POST /api/upload
```

Handles file uploads to Cloudinary.

## Authentication

Authentication is implemented using Clerk.

Protected routes require a valid Clerk session token.

## Cloudinary Integration

Uploads and stores media files securely using Cloudinary.

## Gemini AI Integration

AI generation is powered by Google's Gemini API.

Important:
- Keep Gemini API keys private.
- Never expose API keys in frontend code.
- Store secrets only in Render environment variables.

## Deployment

This backend is deployed on Render.

Production URL:

https://quick-ai-backend-i0o5.onrender.com

## Security Best Practices

- Store secrets in environment variables
- Never commit `.env` files
- Add `.env` to `.gitignore`
- Restrict CORS origins
- Rotate leaked API keys immediately

## Future Improvements

- Request rate limiting
- API usage analytics
- Streaming responses
- Background job processing
- Monitoring and logging

## License

This project is licensed under the MIT License.
