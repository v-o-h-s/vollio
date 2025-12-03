import '@fastify/cookie';



export interface User {
    id: string;
    email?: string;
    phone?: string;
    user_metadata?: Record<string, unknown>;
    role: string;
}


declare module 'fastify' {
    interface FastifyRequest {
        user: User | null,
        cookies: {
            [cookieName: string]: string;
        };
    }
}
