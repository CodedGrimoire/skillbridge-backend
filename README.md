# Skill Gap Analyzer Backend

Express + Prisma backend scaffold for AI-driven resume skill gap analysis.

## Stack
- Node.js / Express
- PostgreSQL + Prisma ORM
- JWT auth (jsonwebtoken) + bcrypt
- File uploads via Multer (PDFs parsed with pdf-parse)
- Validation with Zod
- Groq API integration placeholder for AI recommendations

## Getting Started
1. Install deps
```bash
npm install
```
2. Environment
```bash
cp .env.example .env
# update DATABASE_URL, JWT_SECRET, GROQ_API_KEY, PORT
```
3. Prisma
```bash
npx prisma generate
npx prisma migrate dev --name init
```
4. Run
```bash
npm run dev
```

## API Surface
- POST `/api/auth/register`
- POST `/api/auth/login`
- GET `/api/auth/me`
- GET `/health` overall service check (server, DB, Groq)
- GET `/api/users`
- GET `/api/users/:id`
- POST `/api/resumes/upload` (multipart form, field `file`)
- GET `/api/resumes/:id`
- POST `/api/analysis/run`
- GET `/api/analysis/history`
- GET `/api/roles`
- POST `/api/roles`
- GET `/api/skills`
- POST `/api/skills`

### Health payload
```json
{
  "status": "ok | degraded",
  "timestamp": "ISO-8601",
  "uptimeSeconds": 123.45,
  "services": {
    "server": { "status": "ok" },
    "database": { "status": "ok" },
    "groq": { "status": "ok" }
  }
}
```

## Notes
- Business logic is intentionally light; services under `src/services` contain placeholders for skill extraction, gap analysis, and Groq-powered recommendations.
- Multer currently stores files in memory; adapt to disk/S3 for production.
- Error responses are centralized in `errorMiddleware` for consistency.
