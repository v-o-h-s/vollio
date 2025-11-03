# 🧱 Backend Project Structure (Express + Prisma + Zod)

This structure follows a clean modular architecture for scalable APIs.

```
src/
│
├── app.ts                  # Express app entry point
├── server.ts               # Starts the server
│
├── config/
│   ├── env.ts              # Environment variable handling (dotenv + zod validation)
│   └── prisma.ts           # Prisma client instance
│
├── modules/                # Domain-based feature modules
│   │
│   ├── user/
│   │   ├── user.routes.ts      # Route definitions
│   │   ├── user.controller.ts  # Handles HTTP layer (req/res)
│   │   ├── user.service.ts     # Business logic + Prisma DB access
│   │   └── user.schema.ts      # Zod validation schema
│   │
│   ├── post/
│   │   ├── post.routes.ts
│   │   ├── post.controller.ts
│   │   ├── post.service.ts
│   │   └── post.schema.ts
│   │
│   └── auth/
│       ├── auth.routes.ts
│       ├── auth.controller.ts
│       ├── auth.service.ts
│       └── auth.schema.ts
│
├── middlewares/
│   ├── auth.ts             # JWT or session auth middleware
│   ├── errorHandler.ts     # Global error handling
│   └── validate.ts         # Zod request validation middleware
│
├── utils/
│   ├── logger.ts           # Winston/Pino logger
│   ├── response.ts         # Standardized API responses
│   └── helpers.ts          # General-purpose utilities
│
└── types/
    └── express.d.ts        # Custom Express types (e.g. `req.user`)

```

---

## 🔍 Explanation of Key Files

### `config/env.ts`
Handles environment variables safely.

```ts
import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().url(),
  PORT: z.string().default('3000'),
  JWT_SECRET: z.string(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export const env = envSchema.parse(process.env);
```

---

### `app.ts`
Creates and configures the Express app.

```ts
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';

// Routes
import userRoutes from './modules/user/user.routes';
import postRoutes from './modules/post/post.routes';
import authRoutes from './modules/auth/auth.routes';

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Register routes
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/auth', authRoutes);

// Error handler
app.use(errorHandler);

export default app;
```

---

### `server.ts`
Boots up the server.

```ts
import app from './app';
import { env } from './config/env';

app.listen(env.PORT, () => {
  console.log(`🚀 Server running on port ${env.PORT}`);
});
```

---

### `middlewares/validate.ts`
Generic Zod validator middleware.

```ts
import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';

export const validate =
  (schema: ZodSchema) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err: any) {
      res.status(400).json({ error: err.errors });
    }
  };
```

---

### `modules/user/user.service.ts`
Handles Prisma interaction.

```ts
import { prisma } from '../../config/prisma';

export const UserService = {
  getAll: () => prisma.user.findMany(),
  create: (data: any) => prisma.user.create({ data }),
};
```

---

### `modules/user/user.controller.ts`
Handles request/response.

```ts
import { Request, Response } from 'express';
import { UserService } from './user.service';

export const UserController = {
  async getAll(_req: Request, res: Response) {
    const users = await UserService.getAll();
    res.json(users);
  },

  async create(req: Request, res: Response) {
    const user = await UserService.create(req.body);
    res.status(201).json(user);
  },
};
```

---

### `modules/user/user.routes.ts`
Registers routes.

```ts
import express from 'express';
import { UserController } from './user.controller';
import { validate } from '../../middlewares/validate';
import { CreateUserSchema } from './user.schema';

const router = express.Router();

router.get('/', UserController.getAll);
router.post('/', validate(CreateUserSchema), UserController.create);

export default router;
```

---

### `modules/user/user.schema.ts`
Zod validation for user data.

```ts
import { z } from 'zod';

export const CreateUserSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    email: z.string().email(),
  }),
});
```

---

## 🧠 Philosophy Recap

| Layer | Responsibility |
|--------|----------------|
| **Route** | Define endpoints and middleware |
| **Controller** | Handle HTTP-level logic |
| **Service** | Contain business rules and database operations |
| **Schema** | Validate data with Zod |
| **Middleware** | Reusable logic like auth, validation, logging |
| **Config** | Centralized environment setup |
| **Utils** | Shared helper functions |

---

## 🧩 Benefits
✅ Separation of concerns  
✅ Testable per layer  
✅ Scales to dozens of modules  
✅ Enforces input validation  
✅ Maintains clean boundaries between HTTP and business logic  
