# Noto Server API

This is a Fastify-based API server for the Noto application, implementing Clean Architecture with Dependency Injection.

## Architecture

The project follows Clean Architecture principles with the following layers:

- **Domain**: Core business entities and repository interfaces
- **Application**: Use cases that orchestrate domain logic
- **Infrastructure**: External dependencies (database, etc.)
- **Interface**: API controllers and routes

## Technologies

- **Fastify**: Fast and lightweight web framework
- **TypeScript**: Type-safe development
- **tsyringe**: Dependency injection container
- **AJV**: JSON schema validation
- **Supabase**: Database and authentication

## Project Structure

```
src/
├── application/
│   └── use-cases/          # Business logic use cases
├── domain/
│   ├── Note.ts             # Note entity
│   └── repositories/       # Repository interfaces
├── infrastructure/
│   ├── di/
│   │   └── container.ts    # DI container configuration
│   ├── repositories/       # Repository implementations
│   └── supabase.ts         # Supabase client setup
├── interface/
│   ├── controllers/        # Request handlers
│   └── routes/             # Route definitions
├── plugins/
│   └── auth.ts             # Authentication plugin
├── shared/
│   ├── errors/             # Custom error classes
│   ├── types/              # TypeScript type definitions
│   ├── utils/              # Utility functions
│   └── validation/         # AJV schemas and validators
└── server.ts               # Application entry point
```

## Environment Variables

Make sure to set the following environment variables in your `.env` file:

```env
# Server Configuration
PORT=3000
HOST=0.0.0.0
COOKIE_SECRET=your-secret-key

# Supabase Configuration
SUPABASE_URL=your-supabase-url
SUPABASE_PUBLISHABLE_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## API Endpoints

### Notes API (`/api/notes`)

All endpoints require authentication via Supabase JWT in cookies.

#### Create Note

- **POST** `/api/notes`
- **Body**:
  ```json
  {
    "title": "Optional note title",
    "content": {
      /* TipTap JSON content */
    },
    "pdfId": "optional-pdf-id"
  }
  ```

#### Get All User Notes

- **GET** `/api/notes`
- Returns all notes for the authenticated user

#### Get Note by ID

- **GET** `/api/notes/:id`
- Returns a specific note if owned by the authenticated user

#### Update Note

- **PUT** `/api/notes/:id`
- **Body**:
  ```json
  {
    "title": "Updated title",
    "content": {
      /* Updated content */
    }
  }
  ```

#### Delete Note

- **DELETE** `/api/notes/:id`
- Deletes a note if owned by the authenticated user

## Dependency Injection

The application uses `tsyringe` for dependency injection. All dependencies are registered in `src/infrastructure/di/container.ts`.

### Registered Dependencies

- `SupabaseClient`: Supabase service client
- `INoteRepository`: Note repository implementation
- Use Cases: All CRUD use cases
- `NoteController`: Note controller

The DI container is initialized in `server.ts` before the application starts.

## Validation

Request validation is handled using AJV JSON schemas. Validation schemas are defined in `src/shared/validation/noteSchemas.ts` and applied as Fastify preHandlers in routes.

### Available Validators

- `validateBody(schema)`: Validates request body
- `validateParams(schema)`: Validates route parameters
- `validateQuery(schema)`: Validates query parameters

## Authentication

Authentication is handled by the `authPlugin` which:

1. Checks for Supabase JWT tokens in cookies
2. Verifies the token validity
3. Attaches user information to `request.user`
4. Returns 401 for unauthenticated requests (except public routes)

Public routes (like `/`) are skipped from authentication.

## Development

```bash
# Install dependencies
npm install

# Run development server with hot reload
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## Error Handling

The application uses custom error classes:

- `ServerError`: Base error class
- `DatabaseError`: For database-related errors
- `AuthError`: For authentication errors

All errors are handled by the global error handler in `src/shared/utils/errorHanlder.ts`.

## Notes on Implementation

### Using Fastify Features

- **Plugins**: Routes are modular Fastify plugins
- **Hooks**: `preHandler` hooks for validation and authentication
- **Decorators**: `request.user` is decorated by the auth plugin
- **Type Safety**: Full TypeScript support with Fastify types

### Dependency Injection with tsyringe

- Uses `@injectable()` and `@inject()` decorators
- Constructor-based injection
- Singleton and factory registrations
- Token-based dependency resolution

### AJV Validation

- JSON Schema Type definitions for type safety
- Automatic request validation via preHandlers
- Detailed validation error messages
- Schema reuse across endpoints
