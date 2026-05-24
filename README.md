# Smart Tourism Guide — Backend

REST API built with **Node.js + Express + TypeScript + PostgreSQL (Prisma ORM)**.

## Tech Stack

| Tool | Purpose |
|------|---------|
| Node.js + Express | HTTP server |
| TypeScript | Type safety |
| Prisma ORM | Database access |
| PostgreSQL | Primary database |
| Helmet | HTTP security headers |
| CORS | Cross-origin control |
| express-rate-limit | API abuse prevention |
| dotenv | Environment config |

## Folder Structure

```
backend/
├── prisma/
│   └── schema.prisma        # DB schema — Object, Zone, Language
├── server/
│   ├── index.ts             # Express app entry point
│   ├── routes/              # Route declarations
│   │   ├── objectRoutes.ts  # GET /object/:id, GET /nearby
│   │   ├── aiRoutes.ts      # POST /ai/chat
│   │   └── geofenceRoutes.ts# POST /geofence/check
│   ├── controllers/         # Request handlers
│   │   ├── objectController.ts
│   │   ├── aiController.ts
│   │   └── geofenceController.ts
│   ├── services/            # Business logic
│   │   ├── objectService.ts # DB queries for objects
│   │   ├── aiService.ts     # AI answer logic (Phase 1: predefined)
│   │   ├── geofenceService.ts# Zone proximity checks
│   │   └── audioService.ts  # TTS stub (Phase 2: ElevenLabs/Azure)
│   ├── middleware/
│   │   ├── rateLimiter.ts   # 100 req/min per IP
│   │   └── validate.ts      # Request body validation helper
│   ├── geofencing/
│   │   └── haversine.ts     # Distance calculation utility
│   ├── nfc/
│   │   └── nfcResolver.ts   # Resolve NFC ID → Object
│   ├── audio/
│   │   └── audioManager.ts  # Build CDN audio URLs
│   ├── ai/
│   │   └── aiRouter.ts      # AI provider selector (env-driven)
│   ├── models/
│   │   └── types.ts         # Shared TypeScript interfaces
│   └── config/
│       ├── db.ts            # Prisma client singleton
│       └── constants.ts     # App-wide constants
├── package.json
├── tsconfig.json
└── .env.example
```

## Getting Started

```bash
cd backend
cp .env.example .env          # fill in DATABASE_URL
npm install
npm run db:generate           # generate Prisma client
npm run db:migrate            # run migrations
npm run dev                   # http://localhost:4000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/object/:id` | Get attraction details by ID |
| `GET` | `/api/nearby?lat=&lng=` | Get attractions within 200m |
| `POST` | `/api/ai/chat` | Ask the AI assistant |
| `POST` | `/api/geofence/check` | Get active zones near a coordinate |
| `GET` | `/health` | Server health check |

### POST /api/ai/chat

```json
{ "question": "How old is this tree?", "objectId": "42" }
```

### POST /api/geofence/check

```json
{ "lat": -1.9441, "lng": 30.0619 }
```

## Database Schema

```
Object    — id, name, type, description, imageUrl, audioUrl, latitude, longitude, nfcId
Zone      — id, zoneName, radius (metres), latitude, longitude, triggerAudio
Language  — id, languageName, languageCode
```

Run `npm run db:migrate` after any schema change in `prisma/schema.prisma`.

## AI Phases

| Phase | Provider | Config |
|-------|----------|--------|
| 1 (MVP) | Predefined keyword responses | Default |
| 2 | Mistral / Llama (local) | `AI_PROVIDER=mistral` |
| 3 | OpenAI / Gemini | `AI_PROVIDER=openai` + `OPENAI_API_KEY` |

## Environment Variables

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `PORT` | Server port (default: `4000`) |
| `AI_PROVIDER` | `predefined` \| `openai` \| `gemini` |
| `OPENAI_API_KEY` | OpenAI key (Phase 3) |
| `ELEVENLABS_API_KEY` | ElevenLabs TTS key (Phase 2) |
| `CDN_URL` | Base URL for hosted audio files |

## Deployment

Recommended platforms: **Render**, **Railway**, **DigitalOcean App Platform**  
Database hosting: **Supabase** or **Neon PostgreSQL**
