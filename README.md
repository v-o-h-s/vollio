# Vollio - Full-Stack Note-Taking Application

A modern, full-stack note-taking application built with Next.js, Fastify, and Supabase.

## Project Structure

```
vollio/
├── backend/          # Fastify API server
│   ├── src/
│   │   ├── server.ts
│   │   ├── infrastructure/
│   │   ├── plugins/
│   │   ├── shared/
│   │   └── utils/
│   ├── package.json
│   └── tsconfig.json
├── frontend/         # Next.js web application
│   ├── app/
│   ├── components/
│   ├── hooks/
│   ├── lib/
│   ├── package.json
│   └── tsconfig.json
├── package.json      # Root workspace configuration
└── .gitignore
```

## Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0 or yarn >= 3.0.0
- Supabase project (for authentication and database)

## Quick Start

### Installation

```bash
# Install all dependencies for both backend and frontend
npm install
```

### Development

Start both the backend and frontend in development mode:

```bash
# Start both services concurrently
npm run dev

# Or start them individually
npm run backend:dev
npm run frontend:dev
```

The application will be available at:
- Frontend: `http://localhost:3001`
- Backend API: `http://localhost:3000` (or configured port)

### Building for Production

```bash
# Build both backend and frontend
npm run build

# Build specific workspace
npm run backend:build
npm run frontend:build
```

### Production Start

```bash
npm start
```

## Configuration

### Environment Variables

#### Backend (`.env`)

```env
NODE_ENV=development
PORT=3000
HOST=localhost
COOKIE_SECRET=your-secret-key
SUPABASE_URL=your-supabase-url
SUPABASE_KEY=your-supabase-key
```

#### Frontend (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## Architecture

### Backend

- **Framework**: Fastify 5.x
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Language**: TypeScript

**Key Features**:
- Cookie-based session management
- Custom logger with pretty printing
- Modular plugin architecture
- Type-safe API endpoints

### Frontend

- **Framework**: Next.js 14+ with App Router
- **UI Library**: Radix UI + Tailwind CSS
- **State Management**: Redux Toolkit
- **Rich Text Editor**: TipTap
- **PDF Support**: PDF.js

**Key Features**:
- Server-side rendering
- API route handling
- Responsive design
- Real-time synchronization

## API Endpoints

### Health Check

```
GET /health
```

### Authentication

- `GET /api/auth/user` - Get current user
- `POST /api/auth/login` - Login
- `POST /api/auth/logout` - Logout

### Notes

- `GET /api/notes` - Get all notes
- `POST /api/notes` - Create note
- `PUT /api/notes/:id` - Update note
- `DELETE /api/notes/:id` - Delete note

## Logging

The backend uses Pino for structured logging with environment-based configuration:

- **Development**: Pretty-printed logs with colors and timestamps
- **Production**: Structured JSON logs

Set `LOG_LEVEL` environment variable to control verbosity: `debug`, `info`, `warn`, `error`.

## Testing

```bash
# Run tests for all workspaces
npm test

# Run tests with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## Troubleshooting

### Port Already in Use

If port 3000 is already in use, set the `PORT` environment variable:

```bash
PORT=3001 npm run dev
```

### Environment Variables Not Loading

Make sure `.env` files exist in both `backend/` and `frontend/` directories.

Backend uses `dotenv` for loading environment variables automatically.

## Contributing

1. Create a feature branch
2. Make your changes
3. Ensure tests pass
4. Submit a pull request

## License

MIT
