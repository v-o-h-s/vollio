import { createServerClient } from "@supabase/ssr";
import { FastifyRequest } from "fastify";
// this function creates a Supabase client with the user's cookies , it does not verify auth or anything ,just keep this in mind pls
export async function createUserClient(req: FastifyRequest) {
    const supabase = createServerClient(
        process.env.SUPABASE_URL!,
        process.env.SUPABASE_PUBLISHABLE_KEY!,
        {
            cookies: {
                getAll: () => {
                    return Object.entries(req.cookies || {})
                        .filter(([name]) => name.startsWith('sb-'))
                        .map(([name, value]) => ({ name, value: value || '' }));
                },
            },
        }
    );



    return { supabase };
}
