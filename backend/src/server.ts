// ============================================================================
// IMPORTS
// ============================================================================
import 'dotenv/config';
import fastifyCookie from '@fastify/cookie';
import Fastify from 'fastify';
import type { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { createUserClient } from './infrastructure/supabase';
import { loggerConfig } from './utils/logger';
import { authPlugin } from './plugins/auth';

// ============================================================================
// CONFIGURATION
// ============================================================================
const PORT = Number(process.env.PORT) || 3000;
const HOST = process.env.HOST || '0.0.0.0';

// ============================================================================
// APP INITIALIZATION
// ============================================================================
export const app: FastifyInstance = Fastify({ logger: loggerConfig });

// ============================================================================
// MIDDLEWARE REGISTRATION
// ============================================================================
app.register(fastifyCookie, {
    secret: process.env.COOKIE_SECRET || "dev-secret",
});

// Register auth plugin globally (it will handle public vs protected routes)
app.register(authPlugin);

// ============================================================================
// PUBLIC ROUTES
// ============================================================================
app.get('/', async () => {
    return { ok: true, message: 'Hello from Fastify' };
});

app.get('/health', async () => ({ status: 'ok' }));

// ============================================================================
// PROTECTED ROUTES
// ============================================================================
app.get('/protected', async (req: FastifyRequest, reply: FastifyReply) => {
    if (!req.user) {
        reply.status(401).send({ error: 'Not authenticated' });
        return;
    }

    return { ok: true, message: `Hello, user ${req.user.id}` };
});

// ============================================================================
// SERVER STARTUP
// ============================================================================
async function start(): Promise<void> {
    try {
        await app.listen({ port: PORT, host: HOST });
        app.log.info(`Server listening at http://${HOST}:${PORT}`);
    } catch (err) {
        app.log.error(err);
        process.exit(1);
    }
}

if (require.main === module) {
    start();
}

// ============================================================================
// GRACEFUL SHUTDOWN
// ============================================================================
process.on('SIGINT', async () => {
    app.log.info('Stopping server');
    await app.close();
    process.exit(0);
});