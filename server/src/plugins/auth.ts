// plugins/auth.ts
import fp from 'fastify-plugin';
import { createUserClient } from '../infrastructure/supabase';
import { User } from '../shared/types/fastify';

export const authPlugin = fp(async (fastify) => {
    fastify.decorateRequest('user', null);

    fastify.addHook('preHandler', async (req, reply) => {
        // Skip auth check for public routes
        if (req.url === '/' ) {
            return;
        }

        const { supabase } = await createUserClient(req);

        // the line under is responsible for checking authentication it verfiy the jwt token from the cookies we have previously used to create the supabase client
        const { data, error } = await supabase.auth.getClaims()

        if (error || !data || !data.claims) {
            reply.status(401).send({ error: 'Not authenticated' });
            return;
        }

        const user: User = {
            id: data.claims.sub,
            email: data.claims.email || undefined,
            phone: data.claims.phone || undefined,
            user_metadata: data.claims['user_metadata'] || undefined,
            role: data.claims.role || ''
        }
        req.user = user
    });
});

