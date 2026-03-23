# Vollio - Full-Stack Note-Taking Application

This project was a learning exercise to build an app end-to-end.
I learned a lot from it and aimed to make it production-ready.

## Dictionary

- [Project Structure](#project-structure)
- [What We Built](#what-we-built)
  - [Frontend](#frontend)
    - [Frontend Stack](#frontend-stack)
    - [Frontend Notes](#frontend-notes)
  - [Backend](#backend)
    - [Backend Stack](#backend-stack)
    - [Backend Notes](#backend-notes)
- [Data & Storage](#data--storage)
- [Redis & Rate Limiting](#redis--rate-limiting)
- [Observability & Ops](#observability--ops)
- [DevOps](#devops)
- [Testing](#testing)
- [License](#license)

## Project Structure

```text
vollio/
├── client/             # Next.js web application
│   ├── app/
│   ├── components/
│   ├── features/
│   ├── hooks/
│   ├── lib/
│   ├── public/
│   └── ...
├── server/             # Fastify API server
│   ├── src/
│   │   ├── application/
│   │   ├── domain/
│   │   ├── infrastructure/
│   │   ├── interface/
│   │   ├── plugins/
│   │   ├── shared/
│   │   └── test/
│   └── ...
├── docs/               # Project documentation
├── Dockerfile
├── docker-compose.yml
├── package.json        # Root workspace configuration
├── tsconfig.json
├── AGENTS.md
├── README.md
└── .gitignore
```

## What We Built

### Frontend

#### Frontend Stack

- **Framework**: Next.js 15+ with App Router
- **UI**: Shadcn UI + Tailwind CSS
- **State**: Redux Toolkit + RTK Query
- **Editor**: TipTap with PDF.js integration
- **UX**: Responsive layouts, focus-driven study flows, and client-side
  routing

#### Frontend Notes

I built the app with Next.js and focused on performance and
server-side rendering. I kept the structure clean so features are easy
to add. For shared state, I used context to manage components that
depend on the same data, and I separated logic from UI with hooks. When
hooks need to coordinate, they do so through shared context. For
server communication I used RTK Query and added optimistic updates to
keep the UX smooth.

### Backend

#### Backend Stack

- **Framework**: Fastify 5.x (TypeScript)
- **Architecture**: Clean architecture with plugin-driven APIs
- **DI**: Awilix for dependency injection
- **Auth**: Supabase Auth sessions and cookie-based
  auth
- **API**: Versioned routes under `/api/v1` for core
  resources

#### Backend Notes

The backend is the part I enjoyed most and learned the most from. I
implemented clean architecture to keep the layers separate, and the
Fastify plugin system made the experience smooth. I built rate limiting
from scratch with Redis, integrated AI services, and focused on keeping
the codebase clean and scalable. I also enjoyed setting up DI with
Awilix-based dependency wiring.

### Data & Storage

- **Database**: Supabase Postgres with structured
  entities
- **Storage**: Supabase Storage for files and
  generated assets
- **Migrations**: SQL migrations in
  `server/src/infrastructure/database/supabase/migrations`

### Redis & Rate Limiting

- **Redis**: ioredis for caching and quota tracking
- **Rate Limiting**: Token bucket strategy with Lua
  scripting
- **Quotas**: AI, storage, and document usage
  tracked via services

### Observability & Ops

- **Logging**: Pino with environment-aware formatting
- **Monitoring**: Sentry integration for server and
  client
- **Performance**: Vercel Analytics and Speed
  Insights on the client

### DevOps

- **Frontend**: Deployed on Vercel (free tier) with
  Sentry monitoring.
- **Backend**: Deployed on DigitalOcean (free trial)
  using Docker.
- **Networking**: Docker network connects the backend
  and Redis in the same private network.
- **Monitoring**: Better Stack for uptime and logs,
  plus a Redis client to track Redis state.

### Testing

- **Framework**: Vitest in both client and
  server
- **Coverage**: Unit tests around storage utilities and
  rate limiting

## License

MIT
